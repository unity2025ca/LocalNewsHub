
import { storage } from "../server/storage";
import { hashPassword } from "../server/auth";

async function createAdmin() {
  try {
    // Check if the user already exists
    const existingUser = await storage.getUserByUsername("admin1");
    
    if (existingUser) {
      console.log("User admin1 already exists!");
      process.exit(0);
    }
    
    // Create a hashed password
    const hashedPassword = await hashPassword("admin1");
    
    // Create the admin user
    const admin = await storage.createUser({
      username: "admin1",
      email: "admin1@example.com",
      password: hashedPassword
    });
    
    // Manually update isAdmin if needed
    if (!admin.isAdmin) {
      await storage.db.update(storage.db.schema.users)
        .set({ isAdmin: true })
        .where(storage.db.schema.users.id.equals(admin.id))
        .execute();
      console.log("Admin privileges granted.");
    }
    
    console.log("Admin user created successfully:", admin);
    process.exit(0);
  } catch (error) {
    console.error("Error creating admin user:", error);
    process.exit(1);
  }
}

createAdmin();
