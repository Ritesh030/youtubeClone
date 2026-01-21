import express from "express"
import cors from "cors"
import cookieParser from "cookie-parser"
import { CORS_ORIGIN } from "./constants.js"

const app = express()


// Enable CORS (Cross-Origin Resource Sharing)
// This controls which frontend domains are allowed to access this backend
app.use(cors({
  // Only allow requests from the URL stored in the environment variable
  // Example: http://localhost:3000 or https://myfrontend.com
  origin: process.env.CORS_ORIGIN,

  // Allow cookies, authorization headers, and credentials to be sent
  // Required for login sessions and JWT stored in cookies
  credentials: true
}));

// Tell Express to accept incoming JSON request bodies
// and reject anything larger than 16KB for security
app.use(express.json({ limit: "16kb" })); 

// Tell Express to accept URL-encoded form data
// extended:true allows nested objects in form data
// limit prevents large payload attacks
app.use(express.urlencoded({ extended: true, limit: "16kb" }));

// Serve static files from the "public" folder
// Files inside "public" become accessible directly via URL
// Example: public/logo.png → http://server.com/logo.png
app.use(express.static("public"));

// Parse cookies sent by the client
// Makes cookies available in req.cookies
app.use(cookieParser());