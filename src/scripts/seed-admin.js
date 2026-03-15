const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

async function createInitialAdmin() {
  const adminId = "stay";
  const password = "hare4828"; // 요청하신 비밀번호

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
        password,
        name: "Administrator",
      },
    });

    console.log("Initial admin created successfully.");
  } catch (error) {
    console.error("Error creating initial admin:", error);
  } finally {
    await prisma.$disconnect();
  }
}

createInitialAdmin();
