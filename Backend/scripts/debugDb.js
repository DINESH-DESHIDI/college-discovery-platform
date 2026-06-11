const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

async function main() {
  console.log(
    "Colleges:",
    await prisma.college.count()
  );

  console.log(
    "Branches:",
    await prisma.branch.count()
  );

  console.log(
    "Cutoffs:",
    await prisma.cutoff.count()
  );

  const lastColleges = await prisma.college.findMany({
    take: 10,
    orderBy: {
      instituteName: "asc",
    },
  });

  console.log(lastColleges);
}

main()
  .finally(async () => {
    await prisma.$disconnect();
  });