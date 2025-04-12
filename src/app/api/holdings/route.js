import jwt from 'jsonwebtoken';
import pool from '../../utils/dbconnect'; // Database connection
import { NextResponse } from 'next/server';
import yahooFinance from 'yahoo-finance2'; // Ensure you import Yahoo Finance API

// GET Method: Fetch user's holdings
export async function GET(req) {
    const authHeader = req.headers.get('authorization');
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        return new Response(JSON.stringify({ error: 'Authorization token missing' }), { status: 401 });
    }

    try {
        const decodedToken = jwt.verify(token, process.env.JWT_SECRET);
        const username = decodedToken.username;

        // Get user ID
        const curr = await pool.query('SELECT user_id FROM users WHERE username = $1', [username]);
        if (curr.rowCount === 0) {
            return new Response(JSON.stringify({ error: 'User not found' }), { status: 404 });
        }

        // Fetch holdings
        const result = await pool.query('SELECT symbol, name, quantity FROM holdings WHERE user_id = $1', [curr.rows[0].user_id]);

        // Fetch stock data for each symbol in the holdings
        const stockDataPromises = result.rows.map(async (row) => {
            const stockData = await yahooFinance.quote(row.symbol); // Fetch stock data
            return {
                symbol: row.symbol,
                name: row.name || stockData.longName || 'Unknown',
                quantity: row.quantity,
                price_change: stockData.regularMarketChangePercent || 0, // Use DB value or Yahoo Finance percentage change
                currentPrice: stockData.regularMarketPrice || 0,
                change: stockData.regularMarketChangePercent || 0, // Percentage change
            };
        });

        const stockData = await Promise.all(stockDataPromises);

        return new Response(JSON.stringify({ data: stockData }), { status: 200 });
    } catch (error) {
        console.error('Error fetching holdings data:', error);
        return new Response(JSON.stringify({ error: 'Failed to fetch holdings data' }), { status: 500 });
    }
}

// POST Method: Add stock to holdings
export async function POST(req) {
    const authHeader = req.headers.get('authorization');
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        return new Response(JSON.stringify({ error: 'Authorization token missing' }), { status: 401 });
    }

    try {
        const decodedToken = jwt.verify(token, process.env.JWT_SECRET);
        const username = decodedToken.username;
        const { symbol, quantity } = await req.json();

        // Input validation for quantity
        if (!quantity || quantity <= 0) {
            return new Response(JSON.stringify({ error: 'Quantity must be a positive integer' }), { status: 400 });
        }

        const curr = await pool.query('SELECT user_id FROM users WHERE username = $1', [username]);
        if (curr.rowCount === 0) {
            return new Response(JSON.stringify({ error: 'User not found' }), { status: 404 });
        }

        const userId = curr.rows[0].user_id;

        // Fetch stock data from Yahoo Finance API
        const stockData = await yahooFinance.quote(symbol);

        if (!stockData) {
            return new Response(JSON.stringify({ error: 'Invalid stock symbol' }), { status: 400 });
        }

        const name = stockData.longName || stockData.shortName || 'Unknown Stock';
        const price_change = stockData.regularMarketChangePercent || 0; // Percentage change
        const price = stockData.regularMarketPrice || 0;
        const value = price * quantity;

        // Check if stock already exists in holdings
        const holdingExists = await pool.query(
            'SELECT quantity FROM holdings WHERE user_id = $1 AND symbol = $2',
            [userId, symbol]
        );

        if (holdingExists.rowCount > 0) {
            // If it exists, update quantity, price_change, and value
            const newQuantity = holdingExists.rows[0].quantity + quantity;
            const newValue = newQuantity * price;
            await pool.query(
                'UPDATE holdings SET quantity = $1, value = $2 WHERE user_id = $3 AND symbol = $4',
                [newQuantity, newValue, userId, symbol]
            );
        } else {
            // Insert new holding with price, price_change, and value
            await pool.query(
                'INSERT INTO holdings (user_id, symbol, name, quantity, value) VALUES ($1, $2, $3, $4, $5, $6)',
                [userId, symbol, name, quantity, value]
            );
        }

        return new Response(JSON.stringify({ message: 'Stock added or updated in holdings' }), { status: 201 });
    } catch (error) {
        console.error('Error adding stock to holdings:', error);
        return new Response(JSON.stringify({ error: 'Error adding stock to holdings' }), { status: 500 });
    }
}
