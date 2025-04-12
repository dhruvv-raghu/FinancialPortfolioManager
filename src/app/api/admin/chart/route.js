import pool from "@/app/utils/dbconnect"; // Assuming you have set up the pool instance here
import { NextResponse } from "next/server";

export async function GET() {
  try {
    // Query 1: 5 most bought stocks
    const mostBoughtStocksQuery = `
      SELECT 
        symbol, 
        COUNT(*) AS purchase_count 
      FROM order_history
      WHERE type = 'buy'
      GROUP BY symbol
      ORDER BY purchase_count DESC
      LIMIT 5;
    `;

    // Query 2: 5 users with the largest portfolios
    const largestPortfoliosQuery = `
      SELECT 
        user_id, 
        SUM(quantity * value) AS total_portfolio_value 
      FROM holdings
      GROUP BY user_id
      ORDER BY total_portfolio_value DESC
      LIMIT 5;
    `;

    // Execute queries in parallel
    const [mostBoughtStocksResult, largestPortfoliosResult] = await Promise.all([
      pool.query(mostBoughtStocksQuery),
      pool.query(largestPortfoliosQuery),
    ]);

    // Transform the results
    const mostBoughtStocks = mostBoughtStocksResult.rows.map((row) => ({
      symbol: row.symbol,
      purchaseCount: Number(row.purchase_count),
    }));

    const largestPortfolios = largestPortfoliosResult.rows.map((row) => ({
      userId: row.user_id,
      totalPortfolioValue: Number(row.total_portfolio_value),
    }));

    // Construct and return the response
    return NextResponse.json({ mostBoughtStocks, largestPortfolios });
  } catch (error) {
    console.error("Error generating chart data:", error);
    return NextResponse.json(
      { error: "Failed to generate chart data" },
      { status: 500 }
    );
  }
}
