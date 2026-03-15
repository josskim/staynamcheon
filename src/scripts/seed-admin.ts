import prisma from "../lib/db";

async function createInitialAdmin() {
  const adminId = "admin";
  const password = "staynamcheon!@"; // 초기 비밀번호

  try {
    const existingAdmin = await prisma.stayAdmin.findUnique({
      where: { adminId },
    });

    if (existingAdmin) {
      console.log("Admin already exists.");
      return;
    }

    await prisma.stayAdmin.create({
      data: {
        adminId,
        password, // In production, use bcrypt/argon2 to hash passwords
        name: "Administrator",
      },
    });

    console.log("Initial admin created successfully.");
  } catch (error) {
    console.error("Error creating initial admin:", error);
  }
}

createInitialAdmin();
