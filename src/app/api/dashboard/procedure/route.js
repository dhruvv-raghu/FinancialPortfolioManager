import pool from "@/app/utils/dbconnect";

export async function GET(req) {
  try {
    // Query to fetch the most bought stock
    const mostBoughtQuery = `
      SELECT symbol, SUM(quantity) AS total_bought_quantity
      FROM order_history
      WHERE type = 'buy'
      GROUP BY symbol
      ORDER BY total_bought_quantity DESC
      LIMIT 1;
    `;
    const mostBoughtResult = await pool.query(mostBoughtQuery);

    // Query to fetch the most sold stock
    const mostSoldQuery = `
      SELECT symbol, SUM(quantity) AS total_sold_quantity
      FROM order_history
      WHERE type = 'sell'
      GROUP BY symbol
      ORDER BY total_sold_quantity DESC
      LIMIT 1;
    `;
    const mostSoldResult = await pool.query(mostSoldQuery);

    // Prepare the response data
    const mostBoughtStock = mostBoughtResult.rows[0] || { symbol: "N/A", total_bought_quantity: 0 };
    const mostSoldStock = mostSoldResult.rows[0] || { symbol: "N/A", total_sold_quantity: 0 };

    return new Response(
      JSON.stringify({
        mostBoughtStock,
        mostSoldStock,
      }),
      { status: 200 }
    );
  } catch (error) {
    console.error("Error fetching most bought and sold stocks:", error);
    return new Response(JSON.stringify({ error: "Failed to fetch data" }), { status: 500 });
  }
}
