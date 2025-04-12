import { NextResponse } from 'next/server';
import yahooFinance from 'yahoo-finance2';
import pool from '@/app/utils/dbconnect';

// List of common American stock symbols
const commonStocks = [
  'AAPL', 'MSFT', 'AMZN', 'GOOGL', 'FB', 'TSLA', 'BRK-B', 'JNJ', 'JPM', 'V', 'PG', 'UNH', 'MA', 'HD', 'DIS',
  'BAC', 'ADBE', 'CRM', 'CMCSA', 'XOM', 'NFLX', 'VZ', 'CSCO', 'PEP', 'INTC', 'ABT', 'KO', 'MRK', 'NVDA', 'WMT',
  'T', 'PFE', 'NKE', 'TMO', 'ORCL', 'CVX', 'ABBV', 'MCD', 'ACN', 'DHR', 'COST', 'UNP', 'LLY', 'AVGO', 'WFC',
  'BMY', 'TXN', 'NEE', 'LIN', 'PM', 'QCOM', 'AMD', 'UPS', 'HON', 'AMGN', 'IBM', 'RTX', 'CAT', 'GS', 'LOW'
];

export async function POST(req) {
  try {
    // Fetch stock data from Yahoo Finance API for each symbol
    const stockDataPromises = commonStocks.map(async (symbol) => {
      try {
        const stockData = await yahooFinance.quote(symbol);
        return {
          stock_symbol: stockData.symbol,
          stock_name: stockData.longName || stockData.shortName || symbol,
          price: stockData.regularMarketPrice,
          change: stockData.regularMarketChangePercent,
          highest_price: stockData.fiftyTwoWeekHigh,
          lowest_price: stockData.fiftyTwoWeekLow,
          face_value: stockData.priceToBook,
          pe_ratio: stockData.trailingPE,
        };
      } catch (error) {
        console.error(`Error fetching data for ${symbol}:`, error);
        return null;
      }
    });

    const stocksData = await Promise.all(stockDataPromises);
    const validStocksData = stocksData.filter(stock => stock !== null);

    // Insert the fetched data into the stocks table
    const insertPromises = validStocksData.map(async (stock) => {
      const query = `
        INSERT INTO stocks (stock_symbol, stock_name, price, change, highest_price, lowest_price, face_value, pe_ratio)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
        ON CONFLICT (stock_symbol) DO UPDATE SET
          stock_name = EXCLUDED.stock_name,
          price = EXCLUDED.price,
          change = EXCLUDED.change,
          highest_price = EXCLUDED.highest_price,
          lowest_price = EXCLUDED.lowest_price,
          face_value = EXCLUDED.face_value,
          pe_ratio = EXCLUDED.pe_ratio
      `;
      const values = [
        stock.stock_symbol,
        stock.stock_name,
        stock.price,
        stock.change,
        stock.highest_price,
        stock.lowest_price,
        stock.face_value,
        stock.pe_ratio
      ];

      try {
        await pool.query(query, values);
        return stock.stock_symbol;
      } catch (error) {
        console.error(`Error inserting data for ${stock.stock_symbol}:`, error);
        return null;
      }
    });

    const insertedStocks = await Promise.all(insertPromises);
    const successfulInserts = insertedStocks.filter(symbol => symbol !== null);

    return NextResponse.json({
      message: `Successfully updated data for ${successfulInserts.length} stocks`,
      updatedStocks: successfulInserts
    }, { status: 200 });

  } catch (error) {
    console.error('Error in route handler:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

