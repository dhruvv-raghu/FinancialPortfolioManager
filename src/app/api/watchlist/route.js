import jwt from 'jsonwebtoken';
import pool from '../../utils/dbconnect'; // Assuming dbconnect file for DB connection
import { NextResponse } from 'next/server';
import yahooFinance from 'yahoo-finance2'; // Add Yahoo Finance API

// Fetch user's watchlist and include stock data from Yahoo Finance API
export async function GET(req) {
    const authHeader = req.headers.get('authorization');
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        return new Response(JSON.stringify({ error: 'Authorization token missing' }), { status: 401 });
    }

    try {
        const decodedToken = jwt.verify(token, process.env.JWT_SECRET);
        const username = decodedToken.username;

        // Query the user_id based on username
        const curr = await pool.query('SELECT user_id FROM users WHERE username = $1', [username]);
        const result = await pool.query('SELECT symbol FROM watchlist WHERE user_id = $1', [curr.rows[0].user_id]);

        // Fetch stock data from Yahoo Finance API for each symbol in the watchlist
        const stockDataPromises = result.rows.map(async (row) => {
            const stockData = await yahooFinance.quote(row.symbol);
            return {
                symbol: stockData.symbol,
                name: stockData.longName || stockData.shortName || row.symbol,
                price: stockData.regularMarketPrice,
                change: stockData.regularMarketChangePercent,
                highestPrice: stockData.fiftyTwoWeekHigh,
                lowestPrice: stockData.fiftyTwoWeekLow,
                faceValue: stockData.priceToBook,
                peRatio: stockData.trailingPE,
            };
        });
        const stockData = await Promise.all(stockDataPromises);

        return NextResponse.json({ data: stockData, status: 200 });

    } catch (error) {
        console.error('Error fetching stock data:', error);
        return new Response(JSON.stringify({ error: 'Internal server error' }), { status: 500 });
    }
}


export async function POST(req) {
  const authHeader = req.headers.get('authorization');
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
      return new Response(JSON.stringify({ error: 'Authorization token missing' }), { status: 401 });
  }

  try {
      const decodedToken = jwt.verify(token, process.env.JWT_SECRET);
      const username = decodedToken.username;
      const { symbol } = await req.json();

       // Fetch stock data from Yahoo Finance API to ensure the stock exists
       const stockData = await yahooFinance.quote(symbol);
       if (!stockData) {
           return new Response(JSON.stringify({ error: 'Invalid stock symbol' }), { status: 400 });
       }
       const curr = await pool.query('SELECT user_id FROM users WHERE username = $1', [username]);
       await pool.query(
           'INSERT INTO watchlist (user_id, symbol, price, change) VALUES ($1, $2, $3, $4)',
           [curr.rows[0].user_id, symbol, stockData.regularMarketPrice, stockData.regularMarketChangePercent]
       );

       return new Response(JSON.stringify({
        symbol: stockData.symbol,
        name: stockData.longName || stockData.shortName || symbol, // Stock name
        price: stockData.regularMarketPrice,
        change: stockData.regularMarketChangePercent,
        // highestPrice: stockData.fiftyTwoWeekHigh, // Highest price over the last year
        // lowestPrice: stockData.fiftyTwoWeekLow,   // Lowest price over the last year
        // faceValue: stockData.priceToBook,         // Placeholder for face value (replace if needed)
        // peRatio: stockData.trailingPE,            // PE ratio
    }), { status: 201 });
} catch (error) {
  return new Response(JSON.stringify({ error: error.message }), { status: 500 });
    }
}

export async function DELETE(req) {
  const authHeader = req.headers.get('authorization');
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
      return new Response(JSON.stringify({ error: 'Authorization token missing' }), { status: 401 });
  }

  try {
      const decodedToken = jwt.verify(token, process.env.JWT_SECRET);
      const username = decodedToken.username;
        // Extract the symbol from query parameters
        const { searchParams } = new URL(req.url);
        const symbol = searchParams.get('symbol');
        if (!symbol) {
            return new Response(JSON.stringify({ error: 'Stock symbol is required' }), { status: 400 });
        }
        const curr = await pool.query('SELECT user_id FROM users WHERE username = $1', [username]);
        if (curr.rowCount === 0) {
            return new Response(JSON.stringify({ error: 'User not found' }), { status: 404 });
        }
        const result = await pool.query(
          'DELETE FROM watchlist WHERE user_id = $1 AND symbol = $2',
          [curr.rows[0].user_id, symbol]
        );

        if (result.rowCount === 0) {
            return new Response(JSON.stringify({ error: 'Stock not found in watchlist' }), { status: 404 });
        }

        return new Response(JSON.stringify({ message: 'Stock removed' }), { status: 200 });
    } catch (error) {
      console.error('Error removing stock:', error);
        return new Response(JSON.stringify({ error: 'Internal server error' }), { status: 500 });
    }
}

