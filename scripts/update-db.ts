
import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import * as schema from "../shared/schema";

async function updateDatabase() {
  if (!process.env.DATABASE_URL) {
    console.error("DATABASE_URL environment variable is required");
    process.exit(1);
  }

  try {
    const sql = neon(process.env.DATABASE_URL);
    
    // Add email column to users table if it doesn't exist
    await sql`
      ALTER TABLE users 
      ADD COLUMN IF NOT EXISTS email TEXT UNIQUE DEFAULT '';
    `;
    
    // Update existing users to have a default email based on their username
    await sql`
      UPDATE users 
      SET email = username || '@example.com' 
      WHERE email = '' OR email IS NULL;
    `;
    
    console.log("Database updated successfully");
    process.exit(0);
  } catch (error) {
    console.error("Failed to update database:", error);
    process.exit(1);
  }
}

updateDatabase();
