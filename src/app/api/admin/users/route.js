// app/api/admin/users/route.ts
import { NextResponse } from 'next/server';
import pool from "@/app/utils/dbconnect";

export async function GET() {
  try {
    const queries = {
      totalUsers: `SELECT COUNT(*) FROM users;`,
      newUsersToday: `
        SELECT COUNT(*) 
        FROM users 
        WHERE created_at >= CURRENT_DATE;
      `,
      activeUsers: `
        SELECT COUNT(DISTINCT user_id) 
        FROM order_history 
        WHERE date_of_order >= CURRENT_DATE - INTERVAL '7 days';
      `,
      topWatchlisters: `
        SELECT u.username, COUNT(w.id) as watchlist_count
        FROM users u
        JOIN watchlist w ON u.user_id = w.user_id
        GROUP BY u.user_id, u.username
        ORDER BY watchlist_count DESC
        LIMIT 5;
      `,
      recentUsers: `
        SELECT username, email, created_at
        FROM users
        ORDER BY created_at DESC
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
    console.error("Error fetching user data:", error);
    return NextResponse.json({ error: "Failed to fetch user data" }, { status: 500 });
  }
}
