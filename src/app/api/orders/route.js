import { NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import pool from '../../utils/dbconnect';
import yahooFinance from 'yahoo-finance2';

// Fetch order history for the logged-in user
export async function GET(req) {
    const authHeader = req.headers.get('authorization');
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        return new Response(JSON.stringify({ error: 'Authorization token missing' }), { status: 401 });
    }

    try {
        const decodedToken = jwt.verify(token, process.env.JWT_SECRET);
        const username = decodedToken.username;

        // Fetch user ID from the database
        const curr = await pool.query('SELECT user_id FROM users WHERE username = $1', [username]);
        
        // Fetch orders for the user from order_history table
        const result = await pool.query(
            'SELECT symbol, quantity, type AS type, date_of_order FROM order_history WHERE user_id = $1',
            [curr.rows[0].user_id]
        );
        

        // Fetch stock data from Yahoo Finance API for each symbol in the orders
        const orderDataPromises = result.rows.map(async (row) => {
            const stockData = await yahooFinance.quote(row.symbol);
            return {
                symbol: row.symbol,
                price: stockData.regularMarketPrice, // Current price of the stock
                quantity: row.quantity,
                type: row.type, // buy/sell
                date_of_order: row.date_of_order, // Date and time of the order
                ...stockData
            };
        });

        const orderData = await Promise.all(orderDataPromises);

        return NextResponse.json({ data: orderData, status: 200 });
    } catch (error) {
        console.error('Error fetching order history:', error);
        return new Response(JSON.stringify({ error: 'Internal server error' }), { status: 500 });
    }
}

// Place a new order for buying or selling stocks
// Place a new order for buying or selling stocks
export async function POST(req) {
  const authHeader = req.headers.get('authorization');
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
      return new Response(JSON.stringify({ error: 'Authorization token missing' }), { status: 401 });
  }

  try {
      const decodedToken = jwt.verify(token, process.env.JWT_SECRET);
      const username = decodedToken.username;
      const { symbol, quantity, order_type } = await req.json(); // Expecting { symbol, quantity, order_type }

      // Validation for order type and quantity
      if (!['buy', 'sell'].includes(order_type.toLowerCase())) {
          return new Response(JSON.stringify({ error: 'Invalid order type' }), { status: 400 });
      }

      if (quantity <= 0) {
          return new Response(JSON.stringify({ error: 'Quantity must be greater than zero' }), { status: 400 });
      }

      // Fetch stock data from Yahoo Finance API to ensure the stock exists
      const stockData = await yahooFinance.quote(symbol);
      if (!stockData) {
          return new Response(JSON.stringify({ error: 'Invalid stock symbol' }), { status: 400 });
      }

      // Define the price from stockData
      const price = stockData.regularMarketPrice;

      // Fetch user ID from the database
      const curr = await pool.query('SELECT user_id FROM users WHERE username = $1', [username]);

      // Insert order into the order_history table
      await pool.query(
          'INSERT INTO order_history (user_id, symbol, quantity, type, date_of_order, price) VALUES ($1, $2, $3, $4, $5, $6)',
          [curr.rows[0].user_id, symbol.toUpperCase(), quantity, order_type.toLowerCase(), new Date(), price]
      );

      // Fetch updated holdings for the user
      const updatedHoldings = await pool.query(
          'SELECT symbol, name, quantity, value FROM holdings WHERE user_id = $1',
          [curr.rows[0].user_id]
      );

      return new Response(JSON.stringify({
          order: {
              symbol: symbol.toUpperCase(),
              price: price, // Return the stock price
              quantity: quantity,
              orderType: order_type,
              createdAt: new Date(), // Current date and time
          },
          updatedHoldings: updatedHoldings.rows
      }), { status: 201 });
  } catch (error) {
      console.error('Error placing order:', error);
      return new Response(JSON.stringify({ error: 'Internal server error' }), { status: 500 });
  }
}

