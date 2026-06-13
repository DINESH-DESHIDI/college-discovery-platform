import { formatINR, safe } from "./src/utils/format.js";
import { colleges, getCollegeById } from "./src/data/colleges.js";
import { cn } from "./src/utils/cn.js";

let testsPassed = 0;
let testsFailed = 0;

function assert(condition, message) {
  if (condition) {
    console.log(`✅ PASS: ${message}`);
    testsPassed++;
  } else {
    console.error(`❌ FAIL: ${message}`);
    testsFailed++;
  }
}

console.log("=== Running Core Logic Unit Tests ===\n");

// 1. Test formatINR
try {
  assert(formatINR(1200000) === "₹12.00 L", "formatINR(1200000) matches Lakhs");
  assert(formatINR(25000000) === "₹2.50 Cr", "formatINR(25000000) matches Crores");
  assert(formatINR(85000) === "₹85K", "formatINR(85000) matches Thousands");
  assert(formatINR(450) === "₹450", "formatINR(450) matches base amount");
  assert(formatINR(null) === "—", "formatINR(null) handles null values");
  assert(formatINR(undefined) === "—", "formatINR(undefined) handles undefined values");
} catch (e) {
  console.error("Error in formatINR tests:", e);
  testsFailed++;
}

// 2. Test safe fallback
try {
  assert(safe("value", "fallback") === "value", "safe() resolves value if present");
  assert(safe(null, "fallback") === "fallback", "safe() resolves fallback if value is null");
  assert(
    safe(undefined, "fallback") === "fallback",
    "safe() resolves fallback if value is undefined",
  );
} catch (e) {
  console.error("Error in safe tests:", e);
  testsFailed++;
}

// 3. Test colleges database & selector
try {
  assert(colleges.length === 12, "colleges database contains 12 colleges");
  const iitB = getCollegeById("iit-bombay");
  assert(iitB !== undefined, "getCollegeById resolves IIT Bombay");
  assert(iitB.shortName === "IITB", "IIT Bombay shortName is IITB");
  assert(iitB.rating === 4.8, "IIT Bombay rating is 4.8");
  assert(iitB.placement.placementRate === 94, "IIT Bombay placement rate is 94%");

  const none = getCollegeById("invalid-id");
  assert(none === undefined, "getCollegeById returns undefined for invalid IDs");
} catch (e) {
  console.error("Error in colleges database tests:", e);
  testsFailed++;
}

// 4. Test cn class merger
try {
  assert(cn("cls1", "cls2") === "cls1 cls2", "cn merges basic classes");
  assert(cn("cls1", false && "cls2", "cls3") === "cls1 cls3", "cn filters boolean falses");
  assert(
    cn("p-4 bg-red-500", "p-6") === "bg-red-500 p-6",
    "cn merges tailwind padding override correctly",
  );
} catch (e) {
  console.error("Error in cn class merger tests:", e);
  testsFailed++;
}

// 5. Test Filters Matcher logic parity
try {
  // Replicating filter logic from Colleges.jsx to ensure search behaves identically
  const filterColleges = (filters) => {
    const q = (filters.q || "").trim().toLowerCase();
    return colleges.filter((c) => {
      if (q && !`${c.name} ${c.shortName} ${c.location}`.toLowerCase().includes(q)) return false;
      if (filters.location !== "All" && c.state !== filters.location) return false;
      if (filters.type !== "All" && c.type !== filters.type) return false;
      if (filters.minRating > 0 && c.rating < filters.minRating) return false;
      if (c.feesMin > filters.maxFees) return false;
      if (filters.category !== "All" && !c.courses.some((co) => co.category === filters.category))
        return false;
      return true;
    });
  };

  const mumbaiMatches = filterColleges({
    q: "Mumbai",
    location: "All",
    type: "All",
    minRating: 0,
    maxFees: 3000000,
    category: "All",
  });
  assert(
    mumbaiMatches.length === 1 && mumbaiMatches[0].id === "iit-bombay",
    "Filter matches Mumbai to IIT Bombay",
  );

  const highRatedGov = filterColleges({
    q: "",
    location: "All",
    type: "Government",
    minRating: 4.8,
    maxFees: 3000000,
    category: "All",
  });
  // Should match IIT Bombay (4.8), IIM Ahmedabad (4.9), AIIMS Delhi (4.9)
  assert(highRatedGov.length === 3, "Filter matches 3 high-rated government institutions");

  const lowFeesOnly = filterColleges({
    q: "",
    location: "All",
    type: "All",
    minRating: 0,
    maxFees: 100000,
    category: "All",
  });
  // DU (30k) and AIIMS (6k)
  assert(lowFeesOnly.length === 2, "Filter matches 2 low-fee institutions under 1L");
} catch (e) {
  console.error("Error in filter matcher parity tests:", e);
  testsFailed++;
}

console.log(`\n=== Test Results: ${testsPassed} Passed, ${testsFailed} Failed ===`);
if (testsFailed > 0) {
  process.exit(1);
} else {
  console.log("🎉 All core tests completed successfully!");
}
