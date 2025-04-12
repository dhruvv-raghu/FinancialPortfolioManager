import pool from "../../utils/dbconnect";
import { NextResponse } from "next/server";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

export async function POST(req) {
    const { username, password, email } = await req.json();
    
    // Check if the request body has all required fields
    if (!username || !password || !email) {
        return NextResponse.json({ success: false, message: "All fields are required" });
    }

    // Hash the password
    const hash = await bcrypt.hash(password, 10);
    const query = `INSERT INTO users (username, email, password, token_version) VALUES ($1, $2, $3, 1)`;
    const values = [username, email, hash]; // Ensure the order matches the query
    try {
        // Check if a user with the same username or email already exists
        const existingUserQuery = `SELECT * FROM users WHERE username = $1 OR email = $2`;
        //console.log("Here")
        //console.log(process.env.POSTGRES_URL)
        const existingUser = await pool.query(existingUserQuery, [username, email]);

        //console.log("here")
        if (existingUser.rows.length > 0) {
            return NextResponse.json({ success: false, message: "User already exists" });
        }
        //console.log("here")


        // Insert the new user into the database
        const res = await pool.query(query, values);
        
        if (!res) {
            return NextResponse.json({ success: false, message: "Error inserting user into database" });
        }

        // Create JWT token
        const payload = {
            username: username,
            email: email,
            token_version: 1,
        };

        const token = jwt.sign(payload, process.env.JWT_SECRET);

        return NextResponse.json({ success: true, message: "Account created successfully!", token: token });
    } catch (error) {
        console.error('Error during signup:', error); // Log the error for debugging
        return NextResponse.json({ success: false, message: "Error occurred during account creation: " + error.message });
    }
}
