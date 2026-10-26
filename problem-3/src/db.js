require("dotenv/config");
const { PrismaPg } = require("@prisma/adapter-pg");
const { PrismaClient } = require("@prisma/client");

const connectionString = process.env.DATABASE_URL;
const adapter = new PrismaPg({ connectionString });
const prisma = new PrismaClient({ adapter });

async function verifyConnection() {
  try {
    await prisma.$queryRaw`SELECT 1`;
    console.log("Database connection successful");
  } catch (error) {
    console.error("Database connection failed:", error.message);
  }
}

verifyConnection();

module.exports = prisma;
