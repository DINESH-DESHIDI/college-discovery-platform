const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

async function main() {
  const college = await prisma.college.findFirst({
    include: {
      cutoffs: true,
    },
  });

  console.log(college.instituteName);
  console.log("Cutoffs:", college.cutoffs.length);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());