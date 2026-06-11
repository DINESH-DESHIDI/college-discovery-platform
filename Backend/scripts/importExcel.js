const XLSX = require("xlsx");
const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

const YEAR = 2025;

const CATEGORIES = [
  ["OC", "BOYS"],
  ["OC", "GIRLS"],
  ["BC_A", "BOYS"],
  ["BC_A", "GIRLS"],
  ["BC_B", "BOYS"],
  ["BC_B", "GIRLS"],
  ["BC_C", "BOYS"],
  ["BC_C", "GIRLS"],
  ["BC_D", "BOYS"],
  ["BC_D", "GIRLS"],
  ["BC_E", "BOYS"],
  ["BC_E", "GIRLS"],
  ["SC_I", "BOYS"],
  ["SC_I", "GIRLS"],
  ["SC_II", "BOYS"],
  ["SC_II", "GIRLS"],
  ["SC_III", "BOYS"],
  ["SC_III", "GIRLS"],
  ["ST", "BOYS"],
  ["ST", "GIRLS"],
  ["EWS", "BOYS"],
  ["EWS", "GIRLS"],
];

async function main() {
  console.log("=================================");
  console.log("Starting Import...");
  console.log("=================================");

  const workbook = XLSX.readFile("./data/cutoffs.xlsx");

  const rows = XLSX.utils.sheet_to_json(
    workbook.Sheets[workbook.SheetNames[0]]
  );

  console.log(`Rows Found: ${rows.length}`);

  // =====================
  // Colleges
  // =====================

  const collegeMap = new Map();

  for (const row of rows) {
    const instCode = String(row["Inst Code"] || "").trim();

    if (!instCode) continue;

    if (!collegeMap.has(instCode)) {
      collegeMap.set(instCode, {
        instCode,
        instituteName: String(
          row["Institute Name"] || ""
        ).trim(),
        place: row["Place"]?.toString() || null,
        districtCode: row["Dist Code"]?.toString() || null,
        collegeType: row["College Type"]?.toString() || null,
        affiliatedTo: row["Affiliated To"]?.toString() || null,
      });
    }
  }

  console.log(
    `Creating ${collegeMap.size} unique colleges...`
  );

  await prisma.college.createMany({
    data: [...collegeMap.values()],
    skipDuplicates: true,
  });

  // =====================
  // Branches
  // =====================

  const branchMap = new Map();

  for (const row of rows) {
    const code = String(row["Branch Code"] || "").trim();

    if (!code) continue;

    if (!branchMap.has(code)) {
      branchMap.set(code, {
        code,
        name: String(
          row["Branch Name"] || code
        ).trim(),
      });
    }
  }

  console.log(
    `Creating ${branchMap.size} unique branches...`
  );

  await prisma.branch.createMany({
    data: [...branchMap.values()],
    skipDuplicates: true,
  });

  // =====================
  // Fetch IDs
  // =====================

  const colleges = await prisma.college.findMany({
    select: {
      id: true,
      instCode: true,
    },
  });

  const branches = await prisma.branch.findMany({
    select: {
      id: true,
      code: true,
    },
  });

  const collegeIds = {};
  const branchIds = {};

  colleges.forEach((c) => {
    collegeIds[c.instCode] = c.id;
  });

  branches.forEach((b) => {
    branchIds[b.code] = b.id;
  });

  // =====================
  // Build Cutoffs
  // =====================

  const cutoffs = [];

  for (const row of rows) {
    const instCode = String(
      row["Inst Code"] || ""
    ).trim();

    const branchCode = String(
      row["Branch Code"] || ""
    ).trim();

    const collegeId = collegeIds[instCode];
    const branchId = branchIds[branchCode];

    if (!collegeId || !branchId) continue;

    for (const [category, gender] of CATEGORIES) {
      const value = row[`${category} ${gender}`];

      if (
        value === undefined ||
        value === null ||
        value === "" ||
        value === "-" ||
        value === "NA"
      ) {
        continue;
      }

      const rank = Number(value);

      if (!Number.isFinite(rank) || rank <= 0) {
        continue;
      }

      cutoffs.push({
        collegeId,
        branchId,
        category,
        gender,
        year: YEAR,
        closingRank: rank,
      });
    }
  }

  console.log(
    `Prepared ${cutoffs.length} cutoff records`
  );

  // =====================
  // Insert Cutoffs
  // =====================

  const chunkSize = 250;

  for (let i = 0; i < cutoffs.length; i += chunkSize) {
    const chunk = cutoffs.slice(i, i + chunkSize);

    await prisma.cutoff.createMany({
      data: chunk,
      skipDuplicates: true,
    });

    console.log(
      `Inserted ${Math.min(
        i + chunkSize,
        cutoffs.length
      )}/${cutoffs.length}`
    );
  }

  // =====================
  // Final Counts
  // =====================

  const collegeCount =
    await prisma.college.count();

  const branchCount =
    await prisma.branch.count();

  const cutoffCount =
    await prisma.cutoff.count();

  console.log("\n=================================");
  console.log("IMPORT COMPLETED");
  console.log("=================================");
  console.log("Colleges :", collegeCount);
  console.log("Branches :", branchCount);
  console.log("Cutoffs  :", cutoffCount);
  console.log("=================================");
}

main()
  .catch((err) => {
    console.error("IMPORT FAILED");
    console.error(err);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });