const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

async function main() {
  console.log("Deleting all data...");

  await prisma.cutoff.deleteMany({});
  await prisma.branch.deleteMany({});
  await prisma.college.deleteMany({});

  console.log("Database cleared.");
}

main()
  .catch(console.error)
  .finally(async () => {
    await prisma.$disconnect();
  });