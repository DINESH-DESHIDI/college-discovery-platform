// src/services/assistant.service.js
// AI assistant using real College/Branch/Cutoff schema.
// Falls back to rule-based answers if Gemini key is not set.

const prisma = require("../config/prisma");

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

const fetchWithRetry = async (url, options, retries = 3, delay = 1000) => {
  for (let i = 0; i < retries; i++) {
    try {
      const response = await fetch(url, options);
      if (response.ok) return response;
      if (response.status === 429 || response.status === 503 || response.status === 500) {
        console.warn(`Gemini call returned ${response.status}. Retrying in ${delay}ms... (Attempt ${i + 1}/${retries})`);
        await new Promise(resolve => setTimeout(resolve, delay));
        delay *= 2;
        continue;
      }
      return response;
    } catch (err) {
      if (i === retries - 1) throw err;
      console.warn(`Gemini call failed: ${err.message}. Retrying in ${delay}ms... (Attempt ${i + 1}/${retries})`);
      await new Promise(resolve => setTimeout(resolve, delay));
      delay *= 2;
    }
  }
  throw new Error("Gemini call failed after maximum retries");
};


/**
 * Build dynamic token-efficient context text from real DB data based on keywords in the question.
 */
const buildCollegeContext = async (question) => {
  const lower = (question || "").toLowerCase();
  const where = {};
  
  // Keyword matching for branch code
  let targetBranchCode = "";
  if (lower.includes("cse") || lower.includes("computer science")) targetBranchCode = "CSE";
  else if (lower.includes("ece") || lower.includes("electronics")) targetBranchCode = "ECE";
  else if (lower.includes("eee") || lower.includes("electrical")) targetBranchCode = "EEE";
  else if (lower.includes("mec") || lower.includes("mechanical")) targetBranchCode = "MEC";
  else if (lower.includes("civ") || lower.includes("civil")) targetBranchCode = "CIV";
  else if (lower.includes("it") || lower.includes("information technology")) targetBranchCode = "INF";

  // Keyword matching for place/college
  let targetPlace = "";
  if (lower.includes("hyderabad") || lower.includes("hyd")) targetPlace = "hyderabad";
  else if (lower.includes("ghatkesar")) targetPlace = "ghatkesar";
  else if (lower.includes("uppal")) targetPlace = "uppal";

  // Search filter
  const orFilters = [];
  if (targetPlace) {
    orFilters.push({ place: { contains: targetPlace, mode: "insensitive" } });
  }

  // Find college names mentioned in the question
  const collegeWords = ["ace", "anurag", "mahaveer", "aurora", "abdul", "annamacharya"];
  for (const word of collegeWords) {
    if (lower.includes(word)) {
      orFilters.push({ instituteName: { contains: word, mode: "insensitive" } });
    }
  }

  if (orFilters.length > 0) {
    where.OR = orFilters;
  }

  // Find relevant branch ID if branch matches
  let targetBranchId = "";
  if (targetBranchCode) {
    const branchRecord = await prisma.branch.findFirst({
      where: { code: { contains: targetBranchCode, mode: "insensitive" } },
      select: { id: true },
    });
    if (branchRecord) targetBranchId = branchRecord.id;
  }

  // Query database
  const colleges = await prisma.college.findMany({
    where,
    include: {
      _count: { select: { cutoffs: true } },
      cutoffs: {
        where: {
          year: 2025,
          category: "OC",
          gender: "BOYS",
          branchId: targetBranchId || undefined,
        },
        orderBy: { closingRank: "asc" },
        take: 3,
        include: { branch: { select: { name: true, code: true } } },
      },
    },
    orderBy: { cutoffs: { _count: "desc" } },
    take: 8,
  });

  if (colleges.length === 0) {
    // Return a default list of top colleges
    const defaultColleges = await prisma.college.findMany({
      include: {
        _count: { select: { cutoffs: true } },
        cutoffs: {
          where: { year: 2025, category: "OC", gender: "BOYS" },
          orderBy: { closingRank: "asc" },
          take: 2,
          include: { branch: { select: { name: true, code: true } } },
        },
      },
      orderBy: { cutoffs: { _count: "desc" } },
      take: 5,
    });
    colleges.push(...defaultColleges);
  }

  return colleges
    .map((college) => {
      const topCutoffs = college.cutoffs
        .map((c) => `${c.branch.code} (${c.branch.name}): closing rank ${c.closingRank}`)
        .join(", ");
      return [
        `College: ${college.instituteName}`,
        `Code: ${college.instCode}`,
        `Place: ${college.place || "N/A"}`,
        `Type: ${college.collegeType || "N/A"}`,
        `Affiliation: ${college.affiliatedTo || "N/A"}`,
        topCutoffs ? `Top OC closing ranks: ${topCutoffs}` : "",
      ]
        .filter(Boolean)
        .join("\n");
    })
    .join("\n\n");
};

const askGemini = async (question, context) => {
  if (!GEMINI_API_KEY) return null;

  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${GEMINI_API_KEY}`;
  
  const prompt = `You are a helpful EAMCET college admission assistant for Andhra Pradesh and Telangana counselling.
You must answer the student's question based on the local database context provided below. Do not fabricate details.
If the database context does not contain enough information, provide a generic helpful response based on general admission rules, but mention that it is a general advice.

Context:
${context}

User question: ${question}

Answer in clean, helpful markdown, using bullet points for readability. Keep the answer concise.`;

  try {
    const response = await fetchWithRetry(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              {
                text: prompt
              }
            ]
          }
        ],
        generationConfig: {
          maxOutputTokens: 500,
          temperature: 0.2
        }
      })
    });

    if (!response.ok) {
      console.error(`Gemini call failed: ${response.statusText}`);
      return null;
    }

    const data = await response.json();
    return data.candidates?.[0]?.content?.parts?.[0]?.text?.trim() || null;
  } catch (err) {
    console.error("Gemini API Error:", err);
    return null;
  }
};

const answerQuestion = async (question) => {
  const context = await buildCollegeContext(question);
  const geminiAnswer = await askGemini(question, context);

  if (geminiAnswer) {
    return { answer: geminiAnswer, source: "gemini" };
  }

  // ── Local rule-based fallback ──
  const lower = question.toLowerCase();

  if (lower.includes("cse") || lower.includes("computer science")) {
    return {
      answer:
        "For Computer Science (CSE), look for colleges with a low OC closing rank in our database. " +
        "Use the College Predictor to find eligible CSE seats based on your EAMCET rank and category.",
      source: "local",
    };
  }

  if (lower.includes("ece") || lower.includes("electronics")) {
    return {
      answer:
        "ECE (Electronics & Communication) is available at many colleges. " +
        "Enter your rank and select BC/OC category in the Predictor to see eligible colleges.",
      source: "local",
    };
  }

  if (lower.includes("rank") || lower.includes("cutoff")) {
    return {
      answer:
        "Closing ranks vary by college, branch, category, and gender. " +
        "Use the College Predictor on this platform — enter your EAMCET rank, category (OC/BC_A/BC_B/SC/ST/EWS), and gender to see eligible colleges.",
      source: "local",
    };
  }

  return {
    answer:
      "I can help with EAMCET college recommendations. Please ask about a specific branch like CSE or ECE, " +
      "or use the College Predictor to enter your rank and find matching colleges.",
    source: "fallback",
  };
};

module.exports = { answerQuestion };
