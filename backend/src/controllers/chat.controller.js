// backend/src/controllers/chat.controller.js
import prisma from "../lib/prisma.js";

const GROQ_API_URL = "https://api.groq.com/openai/v1/chat/completions";
const GROQ_API_KEY = process.env.GROQ_API_KEY;

// Max messages sent to Groq (saves tokens + cost)
const MAX_HISTORY = 10;

const getRelevantCenters = async (message) => {
  const msg = message.toLowerCase();

  let categoryFilter = [];

  if (msg.includes("study abroad") || msg.includes("abroad") || msg.includes("usa") ||
      msg.includes("uk") || msg.includes("canada") || msg.includes("australia") ||
      msg.includes("visa") || msg.includes("overseas") || msg.includes("foreign university")) {
    categoryFilter.push("STUDY_ABROAD");
  }
  if (msg.includes("coding") || msg.includes("software") || msg.includes("programming") ||
      msg.includes("python") || msg.includes("java") || msg.includes("web") ||
      msg.includes("it") || msg.includes("technology") || msg.includes("computer") ||
      msg.includes("cyber") || msg.includes("ai") || msg.includes("ml") ||
      msg.includes("data science")) {
    categoryFilter.push("IT_TECHNOLOGY");
  }
  if (msg.includes("jee") || msg.includes("neet") || msg.includes("upsc") ||
      msg.includes("psc") || msg.includes("competitive") || msg.includes("entrance") ||
      msg.includes("exam") || msg.includes("ssc") || msg.includes("bank") ||
      msg.includes("coaching")) {
    categoryFilter.push("EXAM_COACHING");
  }
  if (msg.includes("english") || msg.includes("language") || msg.includes("spoken") ||
      msg.includes("communication") || msg.includes("ielts") || msg.includes("toefl") ||
      msg.includes("french") || msg.includes("german") || msg.includes("arabic") ||
      msg.includes("hindi") || msg.includes("spanish")) {
    categoryFilter.push("LANGUAGES");
  }
  if (msg.includes("mba") || msg.includes("management") || msg.includes("business") ||
      msg.includes("marketing") || msg.includes("finance") || msg.includes("hr")) {
    categoryFilter.push("MANAGEMENT");
  }
  if (msg.includes("design") || msg.includes("graphic") || msg.includes("ui") ||
      msg.includes("ux") || msg.includes("creative") || msg.includes("art") ||
      msg.includes("photoshop") || msg.includes("illustration") || msg.includes("animation")) {
    categoryFilter.push("DESIGN_CREATIVE");
  }
  if (msg.includes("skill") || msg.includes("vocational") || msg.includes("trade") ||
      msg.includes("digital marketing") || msg.includes("seo") || msg.includes("social media") ||
      msg.includes("google ads") || msg.includes("ca") || msg.includes("tally") ||
      msg.includes("accountan")) {
    categoryFilter.push("SKILL_DEVELOPMENT");
  }
  if (msg.includes("school") || msg.includes("tuition") || msg.includes("class 10") ||
      msg.includes("class 12") || msg.includes("cbse") || msg.includes("icse") ||
      msg.includes("state board") || msg.includes("primary") || msg.includes("secondary")) {
    categoryFilter.push("SCHOOL_TUITION");
  }

  // Detect location
  let locationFilter = null;
  const locationKeywords = [
    "kozhikode", "calicut", "kochi", "cochin", "trivandrum", "thiruvananthapuram",
    "thrissur", "malappuram", "kannur", "kollam", "palakkad", "kottayam", "alappuzha",
    "bangalore", "chennai", "mumbai", "delhi", "hyderabad", "pune", "kolkata",
    "kerala", "karnataka", "tamilnadu", "tamil nadu", "maharashtra"
  ];

  for (const loc of locationKeywords) {
    if (msg.includes(loc)) { locationFilter = loc; break; }
  }

  const whereClause = {};

  if (categoryFilter.length > 0) {
    whereClause.OR = [
      { primaryCategory: { in: categoryFilter } },
      { secondaryCategories: { hasSome: categoryFilter } }
    ];
  }

  if (locationFilter) {
    whereClause.AND = [{
      OR: [
        { city: { contains: locationFilter, mode: "insensitive" } },
        { state: { contains: locationFilter, mode: "insensitive" } },
        { district: { contains: locationFilter, mode: "insensitive" } },
      ]
    }];
  }

  const centers = await prisma.center.findMany({
    where: whereClause,
    take: 8,
    orderBy: { rating: "desc" },
    select: {
      id: true, slug: true, name: true,
      primaryCategory: true, secondaryCategories: true,
      city: true, state: true, rating: true,
      teachingMode: true, description: true,
      courses: true, countries: true, services: true,
      successRate: true, studentsPlaced: true, phone: true,
    }
  });

  return { centers, locationFilter, categoryFilter };
};

const formatCentersForContext = (centers) => {
  if (!centers.length) return "No specific centers found in the database for this query.";

  return centers.map((c, i) => {
    const base = `${i + 1}. ${c.name} (${c.city}, ${c.state})
   - Category: ${c.primaryCategory}${c.secondaryCategories?.length ? ` + ${c.secondaryCategories.join(", ")}` : ""}
   - Rating: ${c.rating > 0 ? c.rating + "/5" : "Not rated yet"}
   - Mode: ${c.teachingMode}
   - Slug: ${c.slug}`;

    if (c.primaryCategory === "STUDY_ABROAD") {
      return `${base}
   - Countries: ${c.countries?.join(", ") || "Not specified"}
   - Services: ${c.services?.slice(0, 4).join(", ") || "Not specified"}
   - Success Rate: ${c.successRate || "Not specified"}
   - Students Placed: ${c.studentsPlaced || "Not specified"}`;
    }

    return `${base}
   - Courses: ${c.courses?.slice(0, 4).join(", ") || "Not specified"}`;
  }).join("\n\n");
};

const SYSTEM_PROMPT = `You are an AI Course Counsellor for Inscovia, an Indian education platform listing coaching centers, training institutes, and study abroad consultants.

Your job:
1. Understand the student's goal, background, and location
2. Recommend the most suitable institutes from the provided database
3. Give honest, practical advice
4. Keep responses concise and mobile-friendly (short paragraphs, under 200 words)
5. Always mention specific institute names from the database
6. Use simple English

When recommending institutes:
- Always refer to them by name
- Mention why they're a good fit
- Include their city/location
- Format as a short list

If student mentions study abroad:
- Ask about target country, budget, current qualification if not provided
- Recommend relevant consultants from the database

If no relevant centers found:
- Give general advice
- Suggest browsing the centers directory

Never make up institute names. Only use names from the database provided.`;

export const chat = async (req, res) => {
  try {
    const { messages } = req.body;

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return res.status(400).json({ error: "Messages are required" });
    }

    if (!GROQ_API_KEY) {
      return res.status(500).json({ error: "AI service not configured. Add GROQ_API_KEY to .env" });
    }

    const lastUserMessage = messages.filter(m => m.role === "user").pop();
    if (!lastUserMessage) {
      return res.status(400).json({ error: "No user message found" });
    }

    // Fetch relevant centers based on last user message
    const { centers: relevantCenters, locationFilter, categoryFilter } = await getRelevantCenters(lastUserMessage.content);
    const centersContext = formatCentersForContext(relevantCenters);

    // ✅ Log chat search to analytics (silent — never breaks chat)
    prisma.searchLog.create({
      data: {
        query: lastUserMessage.content.substring(0, 200).toLowerCase(),
        city: locationFilter || null,
        category: categoryFilter?.[0] || null,
        source: "chat"
      }
    }).catch(() => {});

    const systemWithContext = `${SYSTEM_PROMPT}

---
RELEVANT INSTITUTES FROM DATABASE:
${centersContext}
---

Only recommend institutes listed above. Reference them by name.`;

    // Trim message history to last MAX_HISTORY messages to save tokens
    const trimmedMessages = messages.slice(-MAX_HISTORY);

    const response = await fetch(GROQ_API_URL, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${GROQ_API_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "llama-3.3-70b-versatile",
        max_tokens: 500,
        temperature: 0.7,
        messages: [
          { role: "system", content: systemWithContext },
          ...trimmedMessages.map(m => ({ role: m.role, content: m.content }))
        ]
      })
    });

    if (!response.ok) {
      const err = await response.json();
      console.error("Groq API error:", err);
      return res.status(500).json({ error: "AI service error" });
    }

    const data = await response.json();
    const reply = data.choices?.[0]?.message?.content || "Sorry, I couldn't process that.";

    res.json({
      reply,
      centers: relevantCenters.slice(0, 3)
    });

  } catch (error) {
    console.error("❌ Chat error:", error);
    res.status(500).json({ error: "Chat failed. Please try again." });
  }
};