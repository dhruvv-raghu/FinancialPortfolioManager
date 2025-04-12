import pg from 'pg';

const { Pool } = pg;

const pool = new Pool({
  connectionString: process.env.POSTGRES_URL,
})


// Test the connection
pool.connect()
    .then(() => console.log("Connected to the database!"))
    .catch(err => console.error("Connection error", err.stack));

export default pool;