----CREATING THE TRIGGER FUNCTION

CREATE OR REPLACE FUNCTION update_holdings_on_order()
RETURNS TRIGGER AS $$
BEGIN
    -- Check if the order is a "buy"
    IF NEW.type = 'buy' THEN
        -- Check if the stock already exists in holdings
        PERFORM 1 FROM holdings WHERE user_id = NEW.user_id AND symbol = NEW.symbol;
        IF FOUND THEN
            -- If it exists, update the quantity and value
            UPDATE holdings
            SET quantity = quantity + NEW.quantity,
                value = (quantity + NEW.quantity) * NEW.price -- Correct value calculation here
            WHERE user_id = NEW.user_id AND symbol = NEW.symbol;
        ELSE
            -- If it doesn't exist, insert a new row
            INSERT INTO holdings (user_id, symbol, name, quantity, value)
            VALUES (NEW.user_id, NEW.symbol, NEW.name, NEW.quantity, NEW.quantity * NEW.price);
        END IF;

    -- Check if the order is a "sell"
    ELSIF NEW.type = 'sell' THEN
        -- Update the existing stock quantity and value in holdings
        UPDATE holdings
        SET quantity = quantity - NEW.quantity,
            value = (quantity - NEW.quantity) * NEW.price -- Correct value calculation here
        WHERE user_id = NEW.user_id AND symbol = NEW.symbol;

        -- Optionally, delete the row if quantity drops to 0
        DELETE FROM holdings
        WHERE user_id = NEW.user_id AND symbol = NEW.symbol AND quantity <= 0;
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;


----CREATING THE TRIGGER
CREATE TRIGGER order_cascade_trigger
AFTER INSERT ON order_history
FOR EACH ROW
EXECUTE FUNCTION update_holdings_on_order();




----CREATING THE ORDERS TABLE

CREATE TABLE order_history (
    order_id SERIAL PRIMARY KEY,
    user_id INT REFERENCES users(user_id) ON DELETE CASCADE, -- Foreign key from users table
    symbol VARCHAR(10) NOT NULL,
    quantity INT CHECK (quantity > 0), -- No negative or zero quantity in orders
    type VARCHAR(4) CHECK (type IN ('buy', 'sell')), -- Constraint for buy/sell type
    date_of_order TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);


----CREATING THE HOLDINGS TABLE

CREATE TABLE holdings (
    user_id INT REFERENCES users(user_id) ON DELETE CASCADE, -- Foreign key from users table
    symbol VARCHAR(10) NOT NULL,
    name VARCHAR(100),
    quantity INT CHECK (quantity >= 0), -- No negative quantities
    price_change DECIMAL(5, 2), -- Percentage change in price
    value DECIMAL(12, 2), -- Total value of the holding

    PRIMARY KEY (user_id, symbol) -- Composite primary key for uniqueness per user and stock
);

CREATE OR REPLACE PROCEDURE get_most_bought_sold_stocks(user_id INT)
LANGUAGE plpgsql
AS $$
DECLARE
    most_bought RECORD;
    most_sold RECORD;
BEGIN
    -- Find the stock with the highest total quantity bought by the user
    SELECT symbol, SUM(quantity) AS total_bought_quantity
    INTO most_bought
    FROM order_history
    WHERE user_id = user_id AND type = 'BUY'
    GROUP BY symbol
    ORDER BY total_bought_quantity DESC
    LIMIT 1;

    -- Find the stock with the highest total quantity sold by the user
    SELECT symbol, SUM(quantity) AS total_sold_quantity
    INTO most_sold
    FROM order_history
    WHERE user_id = user_id AND type = 'SELL'
    GROUP BY symbol
    ORDER BY total_sold_quantity DESC
    LIMIT 1;

    -- Return the results
    RETURN QUERY SELECT
        most_bought.symbol AS most_bought_stock,
        most_bought.total_bought_quantity AS most_bought_quantity,
        most_sold.symbol AS most_sold_stock,
        most_sold.total_sold_quantity AS most_sold_quantity;
END;
$$;

CREATE OR REPLACE PROCEDURE get_most_bought_stocks()
LANGUAGE plpgsql
AS $$
BEGIN
    -- Query to find the 5 most bought stocks
    RETURN QUERY
    SELECT 
        symbol, 
        COUNT(*) AS purchase_count 
    FROM order_history
    WHERE type = 'buy'
    GROUP BY symbol
    ORDER BY purchase_count DESC
    LIMIT 5;
END;
$$;

CREATE OR REPLACE PROCEDURE get_largest_portfolios()
LANGUAGE plpgsql
AS $$
BEGIN
    -- Query to find the 5 users with the largest portfolios
    RETURN QUERY
    SELECT 
        user_id, 
        SUM(quantity * value) AS total_portfolio_value 
    FROM holdings
    GROUP BY user_id
    ORDER BY total_portfolio_value DESC
    LIMIT 5;
END;
$$;

SELECT * 
FROM users
ORDER BY ctid DESC
LIMIT 1;

SELECT 
    user_id, 
    symbol, 
    quantity, 
    type, 
    date_of_order, 
    price, 
    (price * quantity) AS transaction_value
FROM order_history
WHERE (price * quantity) > 20000
ORDER BY date_of_order DESC
LIMIT 1;

SELECT 
    u.username, 
    h.user_id, 
    SUM(h.quantity * h.value) AS portfolio_value
FROM holdings h
JOIN users u ON h.user_id = u.user_id
GROUP BY h.user_id, u.username
ORDER BY portfolio_value DESC
LIMIT 1;

SELECT COUNT(DISTINCT user_id) AS users_with_holdings 
FROM holdings;

WITH 
-- CTE for the last entry in the users table
last_user AS (
    SELECT * 
    FROM users
    ORDER BY ctid DESC
    LIMIT 1
),
-- CTE for the last largest transaction (above 20,000)
last_largest_transaction AS (
    SELECT 
        user_id, 
        symbol, 
        quantity, 
        type, 
        date_of_order, 
        price, 
        (price * quantity) AS transaction_value
    FROM order_history
    WHERE (price * quantity) > 20000
    ORDER BY date_of_order DESC
    LIMIT 1
),
-- CTE for the biggest portfolio value and corresponding username
biggest_portfolio AS (
    SELECT 
        u.username, 
        h.user_id, 
        SUM(h.quantity * h.value) AS portfolio_value
    FROM holdings h
    JOIN users u ON h.user_id = u.user_id
    GROUP BY h.user_id, u.username
    ORDER BY portfolio_value DESC
    LIMIT 1
),
-- CTE for the total number of users
total_users AS (
    SELECT COUNT(*) AS total_users 
    FROM users
),
-- CTE for the number of users with holdings
users_with_holdings AS (
    SELECT COUNT(DISTINCT user_id) AS users_with_holdings 
    FROM holdings
),
-- CTE for the total value of transactions by all users
total_transactions_value AS (
    SELECT COALESCE(SUM(price * quantity), 0) AS total_transactions_value 
    FROM order_history
)
-- Final SELECT combining all the data
SELECT 
    (SELECT json_agg(row_to_json(last_user)) FROM last_user) AS last_user,
    (SELECT row_to_json(last_largest_transaction) FROM last_largest_transaction) AS last_largest_transaction,
    (SELECT row_to_json(biggest_portfolio) FROM biggest_portfolio) AS biggest_portfolio,
    (SELECT total_users FROM total_users) AS total_users,
    (SELECT users_with_holdings FROM users_with_holdings) AS users_with_holdings,
    (SELECT total_transactions_value FROM total_transactions_value) AS total_transactions_value;

-- Query 1: Total Transaction Value
SELECT SUM(quantity * price) AS total_value
FROM order_history;

-- Query 2: Today's Transaction Value
SELECT SUM(quantity * price) AS today_value
FROM order_history
WHERE date_of_order >= CURRENT_DATE;

-- Query 3: Top Traders (Last 30 Days)
SELECT 
    u.username, 
    COUNT(oh.order_id) AS trade_count
FROM users u
JOIN order_history oh ON u.user_id = oh.user_id
WHERE oh.date_of_order >= CURRENT_DATE - INTERVAL '30 days'
GROUP BY u.user_id, u.username
ORDER BY trade_count DESC
LIMIT 5;

-- Query 4: Most Traded Stocks (Last 30 Days)
SELECT 
    symbol, 
    COUNT(*) AS trade_count
FROM order_history
WHERE date_of_order >= CURRENT_DATE - INTERVAL '30 days'
GROUP BY symbol
ORDER BY trade_count DESC
LIMIT 5;

-- Query 5: Recent Transactions
SELECT 
    oh.symbol, 
    oh.quantity, 
    oh.price, 
    oh.type, 
    u.username
FROM order_history oh
JOIN users u ON oh.user_id = u.user_id
ORDER BY oh.date_of_order DESC
LIMIT 10;

-- Query 6: Total Users
SELECT COUNT(*) 
FROM users;

-- Query 7: New Users Today
SELECT COUNT(*) 
FROM users 
WHERE created_at >= CURRENT_DATE;

-- Query 8: Active Users (Last 7 Days)
SELECT COUNT(DISTINCT user_id) 
FROM order_history 
WHERE date_of_order >= CURRENT_DATE - INTERVAL '7 days';

-- Query 9: Top Watchlisters
SELECT 
    u.username, 
    COUNT(w.id) AS watchlist_count
FROM users u
JOIN watchlist w ON u.user_id = w.user_id
GROUP BY u.user_id, u.username
ORDER BY watchlist_count DESC
LIMIT 5;

-- Query 10: Recent Users
SELECT 
    username, 
    email, 
    created_at
FROM users
ORDER BY created_at DESC
LIMIT 10;

