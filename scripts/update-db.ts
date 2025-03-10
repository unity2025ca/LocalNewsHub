
import { neon } from "@neondatabase/serverless";

async function updateDatabase() {
  if (!process.env.DATABASE_URL) {
    console.error("DATABASE_URL environment variable is required");
    process.exit(1);
  }

  try {
    const sql = neon(process.env.DATABASE_URL);
    
    console.log("Checking if email column exists...");
    
    // First check if email column exists
    const columnCheck = await sql`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'users' AND column_name = 'email';
    `;
    
    if (columnCheck.length === 0) {
      console.log("Adding email column to users table...");
      
      // Add email column if it doesn't exist
      await sql`
        ALTER TABLE users 
        ADD COLUMN email TEXT;
      `;
      
      console.log("Making email column unique...");
      
      // Make it unique (but first update existing rows)
      await sql`
        UPDATE users 
        SET email = username || '@example.com' 
        WHERE email IS NULL;
      `;
      
      await sql`
        ALTER TABLE users 
        ALTER COLUMN email SET NOT NULL;
      `;
      
      await sql`
        ALTER TABLE users 
        ADD CONSTRAINT users_email_unique UNIQUE (email);
      `;
    } else {
      console.log("Email column already exists.");
    }
    
    // Check if expiration_hours column exists
    console.log("Checking if expiration_hours column exists...");
    const expirationHoursCheck = await sql`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'notifications' AND column_name = 'expiration_hours';
    `;
    
    if (expirationHoursCheck.length === 0) {
      console.log("Adding expiration_hours column to notifications table...");
      
      // Add expiration_hours column if it doesn't exist
      await sql`
        ALTER TABLE notifications 
        ADD COLUMN expiration_hours INTEGER;
      `;
    } else {
      console.log("expiration_hours column already exists.");
    }
    
    console.log("Database updated successfully");
    process.exit(0);
  } catch (error) {
    console.error("Failed to update database:", error);
    process.exit(1);
  }
}

updateDatabase();
