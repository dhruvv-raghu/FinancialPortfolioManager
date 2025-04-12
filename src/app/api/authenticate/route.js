import pool from "../../utils/dbconnect";
import { NextResponse } from "next/server";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

export async function POST(req) {
    //console.log("iN POST")
    const { email, password } = await req.json();
    const query = `SELECT * FROM users WHERE email = $1`;
    const values = [email];
    
    try {
        //console.log("iN TRY")
        const res = await pool.query(query, values);
        //console.log("iN QUERY")
        // If user is not found
        if (res.rowCount === 0) {
            return NextResponse.json({ success: false, message: "User Not Found" });
        }
       //console.log("iN COMPARE")
        const match = await bcrypt.compare(password, res.rows[0].password);
        //console.log("aFTER COMPARE")
        if (!match) {
            return NextResponse.json({ success: false, message: "Wrong Password" });
        }

        // If password matches, create the JWT payload dynamically
        const payload = {
            username: res.rows[0].username, // Username or email of the user
            email: res.rows[0].email ,
            token_version: 1     
        };

        // Sign the token with an expiration time, here we don't have an expiration time
        const token = jwt.sign(payload, process.env.JWT_SECRET);
        
        // Respond with the token
        return NextResponse.json({ success: true, message: "Success", token: token });
    } catch (error) {
        return NextResponse.json({ success: false, message: "Error" });
    }
}
