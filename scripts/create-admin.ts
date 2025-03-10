
import { storage } from "../server/storage";
import { hashPassword } from "../server/auth";

async function createAdmin() {
  try {
    // تحقق إذا كان المستخدم موجودًا بالفعل
    const existingUser = await storage.getUserByUsername("admin1");
    
    if (existingUser) {
      console.log("المستخدم admin1 موجود بالفعل!");
      process.exit(0);
    }
    
    // إنشاء كلمة مرور مشفرة
    const hashedPassword = await hashPassword("admin1");
    
    // إنشاء المستخدم المدير
    const admin = await storage.createUser({
      username: "admin1",
      email: "admin1@example.com",
      password: hashedPassword,
      isAdmin: true
    });
    
    console.log("تم إنشاء المستخدم المدير بنجاح:", admin);
    process.exit(0);
  } catch (error) {
    console.error("حدث خطأ أثناء إنشاء المستخدم المدير:", error);
    process.exit(1);
  }
}

// تأكد من أن قاعدة البيانات متصلة
if (storage.db) {
  createAdmin();
} else {
  console.error("لم يتم تهيئة الاتصال بقاعدة البيانات");
  process.exit(1);
}
