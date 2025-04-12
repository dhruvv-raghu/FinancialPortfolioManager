// app/api/admin/financials/route.ts
import { NextResponse } from 'next/server';
import pool from "@/app/utils/dbconnect";

export async function GET() {
  try {
    const queries = {
      totalTransactionValue: `
        SELECT SUM(quantity * price) as total_value
        FROM order_history;
      `,
      todayTransactionValue: `
        SELECT SUM(quantity * price) as today_value
        FROM order_history
        WHERE date_of_order >= CURRENT_DATE;
      `,
      topTraders: `
        SELECT u.username, COUNT(oh.order_id) as trade_count
        FROM users u
        JOIN order_history oh ON u.user_id = oh.user_id
        WHERE oh.date_of_order >= CURRENT_DATE - INTERVAL '30 days'
        GROUP BY u.user_id, u.username
        ORDER BY trade_count DESC
        LIMIT 5;
      `,
      mostTradedStocks: `
        SELECT symbol, COUNT(*) as trade_count
        FROM order_history
        WHERE date_of_order >= CURRENT_DATE - INTERVAL '30 days'
        GROUP BY symbol
        ORDER BY trade_count DESC
        LIMIT 5;
      `,
      recentTransactions: `
        SELECT oh.symbol, oh.quantity, oh.price, oh.type, u.username
        FROM order_history oh
        JOIN users u ON oh.user_id = u.user_id
        ORDER BY oh.date_of_order DESC
        LIMIT 10;
      `
    };

    const results = await Promise.all(
      Object.entries(queries).map(async ([key, query]) => {
        const { rows } = await pool.query(query);
        return { [key]: rows };
      })
    );

    const data = Object.assign({}, ...results);

    return NextResponse.json(data);
  } catch (error) {
    console.error("Error fetching financial data:", error);
    return NextResponse.json({ error: "Failed to fetch financial data" }, { status: 500 });
  }
}
