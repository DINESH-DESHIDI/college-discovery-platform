// src/services/assistant.service.js
// AI assistant using real College/Branch/Cutoff schema.
// Falls back to rule-based answers if OpenAI key is not set.

const prisma = require("../config/prisma");

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
const OPENAI_MODEL   = process.env.OPENAI_MODEL || "gpt-3.5-turbo";

/**
 * Build context text from real DB data for the AI prompt.
 * Uses instituteName, place, collegeType, affiliatedTo, and top cutoff ranks.
 */
const buildCollegeContext = async () => {
  const colleges = await prisma.college.findMany({
    include: {
      _count: { select: { cutoffs: true } },
      cutoffs: {
        where: { year: 2025, category: "OC", gender: "BOYS" },
        orderBy: { closingRank: "asc" },
        take: 3,
        include: { branch: { select: { name: true } } },
      },
    },
    orderBy: { cutoffs: { _count: "desc" } },
    take: 20,
  });

  return colleges
    .map((college) => {
      const topCutoffs = college.cutoffs
        .map((c) => `${c.branch.name}: rank ${c.closingRank}`)
        .join(", ");
      return [
        `College: ${college.instituteName}`,
        `Place: ${college.place || "N/A"}`,
        `Type: ${college.collegeType || "N/A"}`,
        `Affiliated To: ${college.affiliatedTo || "N/A"}`,
        `Cutoffs available: ${college._count.cutoffs}`,
        topCutoffs ? `Top OC cutoffs: ${topCutoffs}` : "",
      ]
        .filter(Boolean)
        .join("\n");
    })
    .join("\n\n");
};

const askOpenAI = async (question, context) => {
  if (!OPENAI_API_KEY) return null;

  const prompt = `You are a college admission assistant for Andhra Pradesh and Telangana EAMCET counselling.
Answer only from the context below. If the question is outside this data, say you don't have enough information.

Context:
${context}

User question: ${question}

Answer in simple, accurate language without fabricating details.`;

  const response = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${OPENAI_API_KEY}`,
    },
    body: JSON.stringify({
      model: OPENAI_MODEL,
      messages: [
        { role: "system", content: "You are a helpful EAMCET college recommendation assistant." },
        { role: "user",   content: prompt },
      ],
      max_tokens: 400,
      temperature: 0.3,
    }),
  });

  if (!response.ok) throw new Error(`OpenAI request failed: ${response.statusText}`);

  const data = await response.json();
  return data.choices?.[0]?.message?.content?.trim() || null;
};

const answerQuestion = async (question) => {
  const context      = await buildCollegeContext();
  const openAIAnswer = await askOpenAI(question, context);

  if (openAIAnswer) {
    return { answer: openAIAnswer, source: "openai" };
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
