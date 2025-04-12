// app/api/admin/alerts/route.ts
import { NextResponse } from 'next/server';
import pool from "@/app/utils/dbconnect";

export async function GET() {
  try {
    const queries = {
      largeTransactions: `
        SELECT oh.order_id, u.username, oh.symbol, oh.quantity, oh.price, oh.type, oh.date_of_order
        FROM order_history oh
        JOIN users u ON oh.user_id = u.user_id
        WHERE oh.quantity * oh.price > 10000
        ORDER BY oh.date_of_order DESC
        LIMIT 5;
      `,
      newUsers: `
        SELECT user_id, username, email, created_at
        FROM users
        WHERE created_at >= CURRENT_DATE - INTERVAL '1 day'
        ORDER BY created_at DESC
        LIMIT 5;
      `,
      unusualActivity: `
        SELECT u.username, COUNT(*) as login_count
        FROM users u
        JOIN user_logins ul ON u.user_id = ul.user_id
        WHERE ul.login_time >= CURRENT_DATE - INTERVAL '1 day'
        GROUP BY u.user_id, u.username
        HAVING COUNT(*) > 10
        ORDER BY login_count DESC
        LIMIT 5;
      `,
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
    console.error("Error fetching alert data:", error);
    return NextResponse.json({ error: "Failed to fetch alert data" }, { status: 500 });
  }
}
