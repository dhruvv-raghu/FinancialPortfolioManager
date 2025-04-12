import pool from '@/app/utils/dbconnect';
import jwt from 'jsonwebtoken';
import yahooFinance from 'yahoo-finance2';

export async function GET(req) {
    try {
        const authHeader = req.headers.get('authorization');
        const token = authHeader && authHeader.split(' ')[1];

        if (!token) {
            return new Response(JSON.stringify({ error: 'Authorization token missing' }), { status: 401 });
        }

        const decodedToken = jwt.verify(token, process.env.JWT_SECRET);
        const username = decodedToken.username;

        // Get user ID from username
        const curr = await pool.query('SELECT user_id FROM users WHERE username = $1', [username]);
        if (curr.rowCount === 0) {
            return new Response(JSON.stringify({ error: 'User not found' }), { status: 404 });
        }
        const userId = curr.rows[0].user_id;

        // Get the list of stocks in the user's holdings
        const holdingsResult = await pool.query(
            'SELECT symbol, quantity FROM holdings WHERE user_id = $1',
            [userId]
        );
        
        if (holdingsResult.rowCount === 0) {
            return new Response(JSON.stringify({ error: 'No holdings found' }), { status: 404 });
        }

        const holdings = holdingsResult.rows;

        // Fetch current prices for each stock in the user's holdings
        const pricePromises = holdings.map((holding) =>
            yahooFinance.quote({ symbol: holding.symbol, modules: ['price'] })
        );

        const marketData = await Promise.all(pricePromises);

        // Calculate total portfolio value
        let totalPortfolioValue = 0;

        holdings.forEach((holding, index) => {
            const currentPrice = marketData[index].price.regularMarketPrice;
            totalPortfolioValue += currentPrice * holding.quantity;
        });

        // Return the calculated portfolio value
        return new Response(
            JSON.stringify({ totalPortfolioValue }),
            { status: 200 }
        );
    } catch (error) {
        console.error('Error fetching total portfolio value:', error);
        return new Response(
            JSON.stringify({ error: 'Error fetching total portfolio value' }),
            { status: 500 }
        );
    }
}
