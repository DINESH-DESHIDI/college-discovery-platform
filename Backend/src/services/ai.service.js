// src/services/ai.service.js
// Gemini-powered personalized college recommendations and college insights services.

const prisma = require("../config/prisma");

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

const fetchWithRetry = async (url, options, retries = 3, delay = 2000) => {
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
      console.warn(`Gemini call failed with error: ${err.message}. Retrying in ${delay}ms... (Attempt ${i + 1}/${retries})`);
      await new Promise(resolve => setTimeout(resolve, delay));
      delay *= 2;
    }
  }
  throw new Error("Gemini call failed after maximum retries");
};


const calculateProbability = (uRank, cRank) => {
  if (!cRank) return 0;
  const exponent = (uRank - cRank) / (cRank * 0.15);
  const prob = Math.round(100 / (1 + Math.exp(exponent)));
  return Math.min(99, Math.max(1, prob));
};

/**
 * AI-powered personalized college recommendations.
 * 1. Queries local EAMCET DB candidates based on constraints.
 * 2. Invokes Gemini to analyze, select, and provide custom reasons.
 */
const getPersonalizedRecommendations = async ({ rank, category, gender, location, branchPreference }) => {
  const userRank = Math.max(1, parseInt(rank, 10) || 1);
  const cat = (category || "OC").toUpperCase().replace(/\s+/g, "_");
  const gen = (gender || "BOYS").toUpperCase();

  // Resolve branch ID if preference provided
  let branchId = undefined;
  if (branchPreference && branchPreference !== "All") {
    const branchRec = await prisma.branch.findFirst({
      where: {
        OR: [
          { code: { equals: branchPreference, mode: "insensitive" } },
          { name: { contains: branchPreference, mode: "insensitive" } }
        ]
      },
      select: { id: true }
    });
    if (branchRec) branchId = branchRec.id;
  }

  // Find candidate cutoffs
  const cutoffs = await prisma.cutoff.findMany({
    where: {
      year: 2025,
      category: cat,
      gender: gen,
      branchId,
      closingRank: { gte: Math.round(userRank * 0.7) },
      college: location && location !== "All" ? {
        place: { contains: location, mode: "insensitive" }
      } : undefined
    },
    include: {
      college: {
        select: {
          id: true,
          instCode: true,
          instituteName: true,
          place: true,
          collegeType: true,
          affiliatedTo: true
        }
      },
      branch: { select: { code: true, name: true } }
    },
    orderBy: { closingRank: "asc" },
    take: 15
  });

  // Build candidates summary for Gemini
  let candidatesText = "";
  if (cutoffs.length > 0) {
    candidatesText = cutoffs.map((c, i) => {
      const prob = calculateProbability(userRank, c.closingRank);
      return `${i+1}. College: ${c.college.instituteName} (${c.college.instCode})\n` +
             `   Place: ${c.college.place || "N/A"}\n` +
             `   Type: ${c.college.collegeType || "N/A"}\n` +
             `   Affiliation: ${c.college.affiliatedTo || "N/A"}\n` +
             `   Branch: ${c.branch.code} (${c.branch.name})\n` +
             `   2025 Closing Rank: ${c.closingRank}\n` +
             `   Admission Probability: ${prob}%\n`;
    }).join("\n");
  } else {
    // Fetch a general top college list to keep context useful
    const topColleges = await prisma.college.findMany({
      include: {
        cutoffs: {
          where: { year: 2025, category: "OC", gender: "BOYS" },
          take: 2,
          include: { branch: { select: { code: true, name: true } } }
        }
      },
      orderBy: { cutoffs: { _count: "desc" } },
      take: 6
    });

    candidatesText = "No direct cutoff matches. Here are some of our popular partner colleges:\n" +
      topColleges.map((c, i) => {
        const branches = c.cutoffs.map(cu => `${cu.branch.code} (Closing Rank ${cu.closingRank})`).join(", ");
        return `${i+1}. College: ${c.instituteName} (${c.instCode})\n` +
               `   Place: ${c.place || "N/A"}\n` +
               `   Offered Ranks: ${branches || "N/A"}\n`;
      }).join("\n");
  }

  // Construct Gemini call
  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${GEMINI_API_KEY}`;
  
  const prompt = `You are a professional EAMCET College Counsellor.
Recommend the top 5 college options for a student with the following profile:
- EAMCET Rank: ${userRank}
- Reservation Category: ${cat}
- Gender: ${gen}
- Preferred Location: ${location || "Any"}
- Preferred Branch: ${branchPreference || "Any"}

Here are candidate options retrieved from our local database:
${candidatesText}

Based on this data, return the top recommended colleges. Format your response strictly in structured Markdown with these sections:
1. **Executive Summary**: A brief, warm greeting explaining the student's admission chances.
2. **Top Recommended Colleges**: List up to 5 recommendations. For each, include:
   - College Name and Code
   - Recommended Branch
   - Estimated Admission Probability (%)
   - **Personalized Fit Reasons**: Why is this a good fit for the student (location, branch, college status, or placement)?
3. **Counseling Advice**: 2-3 specific tips for the choice filling phase.`;

  try {
    const response = await fetchWithRetry(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: { maxOutputTokens: 800, temperature: 0.3 }
      })
    });

    if (!response.ok) {
      throw new Error(`Gemini call failed with status ${response.status}`);
    }

    const data = await response.json();
    const recommendationText = data.candidates?.[0]?.content?.parts?.[0]?.text || "Unable to generate recommendations.";
    return {
      recommendations: recommendationText,
      candidateCount: cutoffs.length,
      category: cat,
      gender: gen,
      rank: userRank
    };
  } catch (err) {
    console.error("Failed to fetch recommendations from Gemini:", err);
    throw err;
  }
};

/**
 * Get structured AI-powered insights for a specific college.
 */
const getCollegeAIInsights = async (collegeIdOrCode) => {
  // Query college and cutoffs
  const college = await prisma.college.findFirst({
    where: {
      OR: [{ id: collegeIdOrCode }, { instCode: collegeIdOrCode }]
    },
    include: {
      cutoffs: {
        where: { year: 2025, category: "OC", gender: "BOYS" },
        include: { branch: { select: { code: true, name: true } } },
        orderBy: { closingRank: "asc" },
        take: 10
      }
    }
  });

  if (!college) {
    const err = new Error("College not found.");
    err.statusCode = 404;
    throw err;
  }

  // Format cutoffs text for context
  const cutoffsSummary = college.cutoffs.map(c => 
    `- ${c.branch.code} (${c.branch.name}): Closing Rank ${c.closingRank}`
  ).join("\n");

  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${GEMINI_API_KEY}`;
  
  const prompt = `You are a university profile specialist and EAMCET advisor.
Generate structured, detailed insights for the following college:
- College Name: ${college.instituteName}
- Code: ${college.instCode}
- Location: ${college.place || "N/A"}
- Type: ${college.collegeType || "N/A"}
- Affiliated University: ${college.affiliatedTo || "N/A"}

Here are EAMCET 2025 OC Boys closing ranks for reference:
${cutoffsSummary || "No cutoffs available."}

Generate structured insights. Avoid generic descriptions. Organize into these 5 headings:
1. **Overview**: A concise description of the college, its prestige, and community.
2. **Key Strengths**: 3-4 bullet points highlighting academic standards, faculty, or campus environment.
3. **Placements**: An estimate of standard EAMCET placements, recruiters, and placement rates.
4. **Popular Branches**: Highlight which branches are highly competitive based on their closing ranks.
5. **Student Perspective**: A short paragraph simulating student feedback regarding hostel, campus life, and peer culture.`;

  try {
    const response = await fetchWithRetry(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: { maxOutputTokens: 700, temperature: 0.2 }
      })
    });

    if (!response.ok) {
      throw new Error(`Gemini call failed: ${response.statusText}`);
    }

    const data = await response.json();
    return {
      collegeId: college.id,
      collegeName: college.instituteName,
      insights: data.candidates?.[0]?.content?.parts?.[0]?.text || "Unable to generate insights."
    };
  } catch (err) {
    console.error("Failed to generate college insights:", err);
    throw err;
  }
};

module.exports = {
  getPersonalizedRecommendations,
  getCollegeAIInsights
};
