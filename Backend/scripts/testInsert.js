const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

async function main() {

  const college = await prisma.college.create({
    data: {
      instCode: "TEST123",
      instituteName: "TEST COLLEGE"
    }
  });

  console.log(college);
}

main()
  .catch(console.error)
  .finally(async () => {
    await prisma.$disconnect();
  });