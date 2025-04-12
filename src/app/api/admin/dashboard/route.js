import pool from "@/app/utils/dbconnect";

export async function GET(req) {
  try {
    // Query 1: Last entry in the users table
    const lastUserQuery = `
      SELECT * FROM users
      ORDER BY ctid DESC
      LIMIT 1;
    `;
    const lastUserResult = await pool.query(lastUserQuery);

    // Query 2: Last largest transaction (above 20,000)
    const lastLargestTransactionQuery = `
      SELECT user_id, symbol, quantity, type, date_of_order, price, (price * quantity) AS transaction_value
      FROM order_history
      WHERE (price * quantity) > 20000
      ORDER BY date_of_order DESC
      LIMIT 1;
    `;
    const lastLargestTransactionResult = await pool.query(lastLargestTransactionQuery);

    // Query 3: Biggest portfolio value and corresponding username
    const biggestPortfolioQuery = `
      SELECT u.username, h.user_id, SUM(h.quantity * h.value) AS portfolio_value
      FROM holdings h
      JOIN users u ON h.user_id = u.user_id
      GROUP BY h.user_id, u.username
      ORDER BY portfolio_value DESC
      LIMIT 1;
    `;
    const biggestPortfolioResult = await pool.query(biggestPortfolioQuery);

    // Query 4: Total number of users
    const totalUsersQuery = `
      SELECT COUNT(*) AS total_users FROM users;
    `;
    const totalUsersResult = await pool.query(totalUsersQuery);

    // Query 5: Number of users with holdings
    const usersWithHoldingsQuery = `
      SELECT COUNT(DISTINCT user_id) AS users_with_holdings FROM holdings;
    `;
    const usersWithHoldingsResult = await pool.query(usersWithHoldingsQuery);

    // Query 6: Total value of transactions by all users
    const totalTransactionsValueQuery = `
      SELECT COALESCE(SUM(price * quantity), 0) AS total_transactions_value FROM order_history;
    `;
    const totalTransactionsValueResult = await pool.query(totalTransactionsValueQuery);

    // Construct response
    const response = {
      lastUser: lastUserResult.rows[0] || null,
      lastLargestTransaction: lastLargestTransactionResult.rows[0] || null,
      biggestPortfolio: biggestPortfolioResult.rows[0] || null,
      totalUsers: totalUsersResult.rows[0]?.total_users || 0,
      usersWithHoldings: usersWithHoldingsResult.rows[0]?.users_with_holdings || 0,
      totalTransactionsValue: totalTransactionsValueResult.rows[0]?.total_transactions_value || 0,
    };

    return new Response(JSON.stringify(response), { status: 200 });
  } catch (error) {
    console.error("Error fetching data:", error);
    return new Response(JSON.stringify({ message: "Internal Server Error" }), { status: 500 });
  }
}
