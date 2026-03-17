// backend/src/controllers/search.controller.js
import prisma from "../lib/prisma.js";

const GROQ_API_URL = "https://api.groq.com/openai/v1/chat/completions";
const GROQ_API_KEY = process.env.GROQ_API_KEY;

async function extractIntentWithGroq(query) {
  const response = await fetch(GROQ_API_URL, {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${GROQ_API_KEY}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      model: "llama-3.3-70b-versatile",
      max_tokens: 200,
      temperature: 0.1,
      messages: [
        {
          role: "system",
          content: `You are a search intent extractor for an Indian training institute platform. Always respond in valid JSON only. No extra text. No markdown.`
        },
        {
          role: "user",
          content: `Extract search intent from this query: "${query}"

Return ONLY this JSON:
{
  "course": "course name or null",
  "city": "city name or null",
  "budget_max": number or null,
  "skill_level": "beginner or intermediate or advanced or null",
  "category": "IT_TECHNOLOGY or EXAM_COACHING or LANGUAGES or MANAGEMENT or DESIGN_CREATIVE or SKILL_DEVELOPMENT or SCHOOL_TUITION or STUDY_ABROAD or null",
  "keywords": ["keyword1", "keyword2"]
}`
        }
      ]
    })
  });

  if (!response.ok) {
    const err = await response.json();
    throw { status: response.status, message: err?.error?.message || "Groq error" };
  }

  const data = await response.json();
  const text = data.choices?.[0]?.message?.content || "";
  const clean = text.replace(/```json|```/g, "").trim();
  return JSON.parse(clean);
}

async function keywordSearch(query) {
  const q = query.toLowerCase().trim();

  const locationKeywords = [
    "kozhikode", "calicut", "kochi", "cochin", "trivandrum", "thiruvananthapuram",
    "thrissur", "malappuram", "kannur", "kollam", "palakkad", "kottayam", "alappuzha",
    "bangalore", "chennai", "mumbai", "delhi", "hyderabad", "pune", "kolkata"
  ];
  let city = null;
  for (const loc of locationKeywords) {
    if (q.includes(loc)) { city = loc; break; }
  }

  const whereClause = {
    OR: [
      { name: { contains: query, mode: "insensitive" } },
      { description: { contains: query, mode: "insensitive" } },
      { courses: { hasSome: [query] } },
    ]
  };

  if (city) {
    whereClause.AND = [{
      OR: [
        { city: { contains: city, mode: "insensitive" } },
        { state: { contains: city, mode: "insensitive" } },
      ]
    }];
  }

  const results = await prisma.center.findMany({
    where: whereClause,
    take: 10,
    orderBy: { rating: "desc" },
    select: {
      id: true, slug: true, name: true,
      primaryCategory: true, city: true, state: true,
      rating: true, courses: true, teachingMode: true,
      description: true,
    }
  });

  return { results, intent: null, searchType: "keyword" };
}

async function aiSearch(intent, originalQuery) {
  const whereClause = {};
  const conditions = [];

  if (intent.category) {
    conditions.push({
      OR: [
        { primaryCategory: intent.category },
        { secondaryCategories: { has: intent.category } }
      ]
    });
  }

  if (intent.city) {
    conditions.push({
      OR: [
        { city: { contains: intent.city, mode: "insensitive" } },
        { state: { contains: intent.city, mode: "insensitive" } },
        { district: { contains: intent.city, mode: "insensitive" } },
      ]
    });
  }

  if (intent.course || intent.keywords?.length > 0) {
    const searchTerms = [
      ...(intent.course ? [intent.course] : []),
      ...(intent.keywords || [])
    ];
    conditions.push({
      OR: searchTerms.flatMap(term => [
        { name: { contains: term, mode: "insensitive" } },
        { description: { contains: term, mode: "insensitive" } },
        { courses: { hasSome: [term] } },
      ])
    });
  }

  // ✅ budget_max removed — no fee field in Center schema

  if (conditions.length > 0) {
    whereClause.AND = conditions;
  }

  const results = await prisma.center.findMany({
    where: Object.keys(whereClause).length > 0 ? whereClause : {
      OR: [
        { name: { contains: originalQuery, mode: "insensitive" } },
        { description: { contains: originalQuery, mode: "insensitive" } },
      ]
    },
    take: 12,
    orderBy: { rating: "desc" },
    select: {
      id: true, slug: true, name: true,
      primaryCategory: true, city: true, state: true,
      rating: true, courses: true, teachingMode: true,
      description: true,
    }
  });

  return { results, intent, searchType: "ai" };
}

export const search = async (req, res) => {
  try {
    const { query } = req.body;

    if (!query || query.trim().length < 2) {
      return res.status(400).json({ error: "Query too short" });
    }

    const trimmedQuery = query.trim();

    if (GROQ_API_KEY) {
      try {
        let intent;
        try {
          intent = await extractIntentWithGroq(trimmedQuery);
        } catch (primaryErr) {
          if (primaryErr.status === 429) {
            console.warn("⚠️ Primary Groq model rate limited, trying fallback model...");
            const fallbackResponse = await fetch(GROQ_API_URL, {
              method: "POST",
              headers: {
                "Authorization": `Bearer ${GROQ_API_KEY}`,
                "Content-Type": "application/json"
              },
              body: JSON.stringify({
                model: "llama-3.1-8b-instant",
                max_tokens: 200,
                temperature: 0.1,
                messages: [
                  { role: "system", content: "Extract search intent. Return valid JSON only." },
                  {
                    role: "user",
                    content: `Query: "${trimmedQuery}"
Return ONLY: {"course":null,"city":null,"budget_max":null,"skill_level":null,"category":null,"keywords":[]}`
                  }
                ]
              })
            });
            if (!fallbackResponse.ok) throw { status: 429 };
            const fallbackData = await fallbackResponse.json();
            const text = fallbackData.choices?.[0]?.message?.content || "{}";
            intent = JSON.parse(text.replace(/```json|```/g, "").trim());
          } else {
            throw primaryErr;
          }
        }

        const searchResult = await aiSearch(intent, trimmedQuery);
        return res.json(searchResult);

      } catch (groqErr) {
        console.warn("⚠️ Groq unavailable, falling back to keyword search:", groqErr.message || groqErr);
        const fallbackResult = await keywordSearch(trimmedQuery);
        return res.json(fallbackResult);
      }
    }

    const fallbackResult = await keywordSearch(trimmedQuery);
    return res.json(fallbackResult);

  } catch (error) {
    console.error("❌ Search error:", error);
    res.status(500).json({ error: "Search failed. Please try again." });
  }
};