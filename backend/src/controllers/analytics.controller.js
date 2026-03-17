// backend/src/controllers/analytics.controller.js
import prisma from "../lib/prisma.js";

const GROQ_API_URL = "https://api.groq.com/openai/v1/chat/completions";
const GROQ_API_KEY = process.env.GROQ_API_KEY;

// ─────────────────────────────────────────
// Helper: Call Groq with fallback
// ─────────────────────────────────────────
async function callGroq(messages, maxTokens = 500) {
  const models = ["llama-3.3-70b-versatile", "llama-3.1-8b-instant"];
  for (const model of models) {
    try {
      const response = await fetch(GROQ_API_URL, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${GROQ_API_KEY}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ model, max_tokens: maxTokens, temperature: 0.1, messages })
      });
      if (response.status === 429) continue;
      if (!response.ok) throw new Error(`Groq error: ${response.status}`);
      const data = await response.json();
      return data.choices?.[0]?.message?.content || "";
    } catch (err) {
      if (err.message?.includes("429")) continue;
      throw err;
    }
  }
  throw new Error("All Groq models rate limited");
}

// ─────────────────────────────────────────
// POST /api/analytics/log-search
// Log what user searched
// ─────────────────────────────────────────
export const logSearch = async (req, res) => {
  try {
    const { query, city, category, source = "browse" } = req.body;
    if (!query || query.trim().length < 2) {
      return res.status(400).json({ error: "Query too short" });
    }

    await prisma.searchLog.create({
      data: {
        query: query.trim().toLowerCase(),
        city: city?.trim().toLowerCase() || null,
        category: category || null,
        source
      }
    });

    res.json({ success: true });
  } catch (error) {
    // Silent fail — don't break user experience
    res.json({ success: false });
  }
};

// ─────────────────────────────────────────
// POST /api/analytics/log-view
// Log which center was viewed
// ─────────────────────────────────────────
export const logView = async (req, res) => {
  try {
    const { centerId, centerName, city, category } = req.body;
    if (!centerId) return res.status(400).json({ error: "centerId required" });

    await prisma.centerView.create({
      data: {
        centerId,
        centerName: centerName || "",
        city: city?.toLowerCase() || null,
        category: category || null
      }
    });

    res.json({ success: true });
  } catch (error) {
    res.json({ success: false });
  }
};

// ─────────────────────────────────────────
// GET /api/analytics/trending
// Get trending courses/searches
// ─────────────────────────────────────────
export const getTrending = async (req, res) => {
  try {
    const { city, days = 30 } = req.query;
    const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

    // Build where clause
    const whereClause = { createdAt: { gte: since } };
    if (city) whereClause.city = { contains: city.toLowerCase() };

    // ── Get top searched queries ──
    const searchLogs = await prisma.searchLog.findMany({
      where: whereClause,
      select: { query: true, city: true, category: true, createdAt: true }
    });

    // ── Get top viewed centers ──
    const centerViews = await prisma.centerView.findMany({
      where: whereClause,
      select: { centerId: true, centerName: true, city: true, category: true }
    });

    // ── Count query frequencies ──
    const queryCount = {};
    searchLogs.forEach(log => {
      const key = log.query;
      queryCount[key] = (queryCount[key] || 0) + 1;
    });

    // ── Count city frequencies ──
    const cityCount = {};
    searchLogs.forEach(log => {
      if (log.city) {
        cityCount[log.city] = (cityCount[log.city] || 0) + 1;
      }
    });

    // ── Count category frequencies ──
    const categoryCount = {};
    searchLogs.forEach(log => {
      if (log.category) {
        categoryCount[log.category] = (categoryCount[log.category] || 0) + 1;
      }
    });

    // ── Count center view frequencies ──
    const centerCount = {};
    centerViews.forEach(view => {
      const key = view.centerId;
      if (!centerCount[key]) {
        centerCount[key] = { name: view.centerName, city: view.city, count: 0 };
      }
      centerCount[key].count++;
    });

    // ── Sort and top N ──
    const topQueries = Object.entries(queryCount)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([query, count]) => ({ query, count }));

    const topCities = Object.entries(cityCount)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([city, count]) => ({ city, count }));

    const topCategories = Object.entries(categoryCount)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 8)
      .map(([category, count]) => ({ category, count }));

    const topCenters = Object.entries(centerCount)
      .sort((a, b) => b[1].count - a[1].count)
      .slice(0, 5)
      .map(([id, data]) => ({ id, ...data }));

    // ── Calculate week-over-week growth ──
    const lastWeek = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const prevWeek = new Date(Date.now() - 14 * 24 * 60 * 60 * 1000);

    const thisWeekSearches = searchLogs.filter(l => l.createdAt >= lastWeek).length;
    const lastWeekSearches = searchLogs.filter(
      l => l.createdAt >= prevWeek && l.createdAt < lastWeek
    ).length;

    const growth = lastWeekSearches > 0
      ? Math.round(((thisWeekSearches - lastWeekSearches) / lastWeekSearches) * 100)
      : 0;

    // ── Try AI insights if enough data ──
    let aiInsights = null;
    if (GROQ_API_KEY && topQueries.length >= 3) {
      try {
        const queryList = topQueries.slice(0, 10).map(q => `"${q.query}" (${q.count} times)`).join(", ");
        const text = await callGroq([
          {
            role: "system",
            content: "You are an EdTech market analyst for India. Return valid JSON only. No markdown."
          },
          {
            role: "user",
            content: `These are top searches on an Indian training institute platform in the last ${days} days:
${queryList}

Return ONLY this JSON:
{
  "trending_insight": "one sentence about what students are looking for",
  "hot_skill": "single most in-demand skill",
  "opportunity": "one sentence about a market gap institutes should fill",
  "prediction": "one sentence prediction for next month"
}`
          }
        ], 300);

        const clean = text.replace(/```json|```/g, "").trim();
        aiInsights = JSON.parse(clean);
      } catch {
        // Silent fail
      }
    }

    res.json({
      period: `Last ${days} days`,
      totalSearches: searchLogs.length,
      totalViews: centerViews.length,
      weeklyGrowth: growth,
      topQueries,
      topCities,
      topCategories,
      topCenters,
      aiInsights
    });

  } catch (error) {
    console.error("❌ Trending error:", error);
    res.status(500).json({ error: "Could not fetch trending data" });
  }
};

// ─────────────────────────────────────────
// GET /api/analytics/trending/city/:city
// City-specific trends
// ─────────────────────────────────────────
export const getTrendingByCity = async (req, res) => {
  try {
    const { city } = req.params;
    const since = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

    const searches = await prisma.searchLog.findMany({
      where: {
        city: { contains: city.toLowerCase() },
        createdAt: { gte: since }
      },
      select: { query: true, category: true }
    });

    const queryCount = {};
    searches.forEach(s => {
      queryCount[s.query] = (queryCount[s.query] || 0) + 1;
    });

    const trending = Object.entries(queryCount)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 8)
      .map(([query, count]) => ({ query, count }));

    res.json({ city, totalSearches: searches.length, trending });

  } catch (error) {
    res.status(500).json({ error: "Could not fetch city trends" });
  }
};