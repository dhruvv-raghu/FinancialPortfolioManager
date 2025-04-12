import yahooFinance from 'yahoo-finance2';
import jwt from 'jsonwebtoken';
import pool from "../../utils/dbconnect"; 

export async function GET(req) {
    const { searchParams } = new URL(req.url);
    const symbol = searchParams.get('symbol');
    // const authHeader = req.headers.get('authorization');

    // Log incoming request details
    console.log('Incoming request for symbol:', symbol);
    // console.log('Authorization header:', authHeader);

    // if (!authHeader || !authHeader.startsWith('Bearer ')) {
    //     return new Response(JSON.stringify({ error: 'Authorization token missing or invalid' }), { status: 401 });
    // }

    // const token = authHeader.split(' ')[1]; 
    // console.log(token)
    try {
        // const decodedToken = jwt.verify(token, process.env.JWT_SECRET);
        // const loggedInUserId = decodedToken.sub; 

        // const userCheck = await pool.query('SELECT id FROM users WHERE id = $1', [loggedInUserId]);
        // if (userCheck.rowCount === 0) {
        //     return new Response(JSON.stringify({ error: 'User not found' }), { status: 404 });
        // }

        if (!symbol) {
            return new Response(JSON.stringify({ error: 'Stock symbol is required' }), { status: 400 });
        }

        // Log the symbol being fetched
        console.log('Fetching stock data for symbol:', symbol);

        // Fetch stock data from Yahoo Finance API
        const result = await yahooFinance.quote(symbol);
        
        // Check if result is valid
        if (!result) {
            throw new Error('No result returned from Yahoo Finance API');
        }

        console.log('Stock data result:', result); // Log the result

        // Construct the stock data object with the required attributes
        const stockData = {
            symbol: result.symbol,
            name: result.longName || result.shortName || symbol,
            price: result.regularMarketPrice,
            change: result.regularMarketChangePercent,
            highestPrice: result.fiftyTwoWeekHigh,  // Highest price over the last year
            lowestPrice: result.fiftyTwoWeekLow,    // Lowest price over the last year
            faceValue: result.priceToBook,          // Placeholder for face value (use appropriate field if available)
            peRatio: result.trailingPE                // PE ratio
        };

        return new Response(JSON.stringify(stockData), { status: 200 });
    } catch (error) {
        console.error('Error occurred:', error); // Log the error for debugging
        if (error.name === 'JsonWebTokenError') {
            return new Response(JSON.stringify({ error: 'Invalid token' }), { status: 403 });
        }
        return new Response(JSON.stringify({ error: 'Failed to fetch stock data' }), { status: 500 });
    }
}


