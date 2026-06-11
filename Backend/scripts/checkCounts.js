const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

async function main() {
  console.log("DATABASE_URL:");
  console.log(process.env.DATABASE_URL);

  console.log("Colleges :", await prisma.college.count());
  console.log("Branches :", await prisma.branch.count());
  console.log("Cutoffs  :", await prisma.cutoff.count());
}

main()
  .catch(console.error)
  .finally(async () => {
    await prisma.$disconnect();
  });