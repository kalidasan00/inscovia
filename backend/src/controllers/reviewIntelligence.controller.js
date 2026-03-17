// backend/src/controllers/reviewIntelligence.controller.js
import prisma from "../lib/prisma.js";

const GROQ_API_URL = "https://api.groq.com/openai/v1/chat/completions";
const GROQ_API_KEY = process.env.GROQ_API_KEY;

// ─────────────────────────────────────────
// Call Groq with automatic model fallback
// ─────────────────────────────────────────
async function callGroq(messages, maxTokens = 800) {
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

      if (response.status === 429) {
        console.warn(`⚠️ ${model} rate limited, trying next...`);
        continue;
      }

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
// Detect fake/suspicious reviews (no AI)
// Pure logic — free, always works
// ─────────────────────────────────────────
function detectFakeReviews(reviews) {
  const suspicious = [];
  const flagged = new Set();

  // Rule 1: Multiple 5-star reviews on same day from different emails
  const dateGroups = {};
  reviews.forEach(r => {
    const date = r.createdAt.toISOString().split("T")[0];
    if (!dateGroups[date]) dateGroups[date] = [];
    dateGroups[date].push(r);
  });

  Object.values(dateGroups).forEach(group => {
    const fiveStars = group.filter(r => r.rating === 5);
    if (fiveStars.length >= 3) {
      fiveStars.forEach(r => {
        if (!flagged.has(r.id)) {
          flagged.add(r.id);
          suspicious.push({ id: r.id, reason: "Multiple 5-star reviews same day" });
        }
      });
    }
  });

  // Rule 2: Very short generic comments
  const genericPhrases = [
    "good institute", "best institute", "great institute",
    "very good", "excellent", "nice", "good", "best",
    "highly recommend", "good place", "awesome"
  ];

  reviews.forEach(r => {
    const comment = r.comment.toLowerCase().trim();
    const wordCount = comment.split(" ").length;
    const isGeneric = genericPhrases.some(p => comment === p || comment === p + ".");

    if ((wordCount <= 3 || isGeneric) && !flagged.has(r.id)) {
      flagged.add(r.id);
      suspicious.push({ id: r.id, reason: "Too short or generic comment" });
    }
  });

  // Rule 3: Same email domain with burst of reviews
  const domainGroups = {};
  reviews.forEach(r => {
    const domain = r.userEmail.split("@")[1];
    if (!domainGroups[domain]) domainGroups[domain] = [];
    domainGroups[domain].push(r);
  });

  Object.entries(domainGroups).forEach(([domain, group]) => {
    // Ignore common providers
    const commonDomains = ["gmail.com", "yahoo.com", "hotmail.com", "outlook.com"];
    if (!commonDomains.includes(domain) && group.length >= 3) {
      group.forEach(r => {
        if (!flagged.has(r.id)) {
          flagged.add(r.id);
          suspicious.push({ id: r.id, reason: "Multiple reviews from same email domain" });
        }
      });
    }
  });

  return suspicious;
}

// ─────────────────────────────────────────
// Analyze reviews with Groq AI
// ─────────────────────────────────────────
async function analyzeWithGroq(reviews) {
  // Take max 50 reviews to stay within token limits
  const sample = reviews.slice(0, 50);
  const reviewText = sample
    .map((r, i) => `${i + 1}. [${r.rating}★] "${r.comment}"`)
    .join("\n");

  const text = await callGroq([
    {
      role: "system",
      content: `You are a review analyst for Indian training institutes.
      Analyze student reviews and return valid JSON only. No markdown. No extra text.`
    },
    {
      role: "user",
      content: `Analyze these ${sample.length} student reviews for a training institute:

${reviewText}

Return ONLY this JSON:
{
  "aspects": {
    "faculty": { "score": 0-100, "sentiment": "positive/mixed/negative", "mentions": 0 },
    "placement": { "score": 0-100, "sentiment": "positive/mixed/negative", "mentions": 0 },
    "infrastructure": { "score": 0-100, "sentiment": "positive/mixed/negative", "mentions": 0 },
    "curriculum": { "score": 0-100, "sentiment": "positive/mixed/negative", "mentions": 0 },
    "value_for_money": { "score": 0-100, "sentiment": "positive/mixed/negative", "mentions": 0 },
    "management": { "score": 0-100, "sentiment": "positive/mixed/negative", "mentions": 0 }
  },
  "summary": "2-3 sentence honest summary of what students say",
  "top_positives": ["positive point 1", "positive point 2", "positive point 3"],
  "top_negatives": ["negative point 1", "negative point 2"],
  "recommended_for": "type of student this institute suits best",
  "overall_verdict": "Excellent/Good/Average/Poor"
}`
    }
  ]);

  const clean = text.replace(/```json|```/g, "").trim();
  return JSON.parse(clean);
}

// ─────────────────────────────────────────
// Fallback analysis — no AI needed
// Pure math on ratings
// ─────────────────────────────────────────
function fallbackAnalysis(reviews) {
  const total = reviews.length;
  if (total === 0) return null;

  const avgRating = reviews.reduce((sum, r) => sum + r.rating, 0) / total;
  const fiveStars = reviews.filter(r => r.rating === 5).length;
  const fourStars = reviews.filter(r => r.rating === 4).length;
  const threeStars = reviews.filter(r => r.rating === 3).length;
  const twoStars = reviews.filter(r => r.rating === 2).length;
  const oneStar = reviews.filter(r => r.rating === 1).length;

  const positivePercent = Math.round(((fiveStars + fourStars) / total) * 100);
  const score = Math.round((avgRating / 5) * 100);

  let verdict = "Poor";
  if (avgRating >= 4.5) verdict = "Excellent";
  else if (avgRating >= 3.8) verdict = "Good";
  else if (avgRating >= 3.0) verdict = "Average";

  return {
    aspects: {
      faculty: { score, sentiment: positivePercent > 60 ? "positive" : "mixed", mentions: 0 },
      placement: { score, sentiment: positivePercent > 60 ? "positive" : "mixed", mentions: 0 },
      infrastructure: { score, sentiment: positivePercent > 60 ? "positive" : "mixed", mentions: 0 },
      curriculum: { score, sentiment: positivePercent > 60 ? "positive" : "mixed", mentions: 0 },
      value_for_money: { score, sentiment: positivePercent > 60 ? "positive" : "mixed", mentions: 0 },
      management: { score, sentiment: positivePercent > 60 ? "positive" : "mixed", mentions: 0 }
    },
    summary: `Based on ${total} reviews, this institute has an average rating of ${avgRating.toFixed(1)}/5. ${positivePercent}% of students gave 4 or 5 stars.`,
    top_positives: positivePercent > 60 ? ["Generally well-rated by students"] : [],
    top_negatives: positivePercent < 40 ? ["Several students reported issues"] : [],
    recommended_for: "Students looking for coaching in this area",
    overall_verdict: verdict,
    isFallback: true
  };
}

// ─────────────────────────────────────────
// MAIN: GET /api/review-intelligence/:centerId
// ─────────────────────────────────────────
export const getReviewIntelligence = async (req, res) => {
  try {
    const { centerId } = req.params;

    if (!centerId) {
      return res.status(400).json({ error: "centerId required" });
    }

    // Fetch all reviews for this center
    const reviews = await prisma.review.findMany({
      where: { centerId },
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        userName: true,
        userEmail: true,
        rating: true,
        comment: true,
        createdAt: true,
      }
    });

    if (reviews.length === 0) {
      return res.json({
        centerId,
        totalReviews: 0,
        message: "No reviews yet",
        intelligence: null
      });
    }

    // Always run fake detection (free, no AI)
    const suspiciousReviews = detectFakeReviews(reviews);
    const cleanReviews = reviews.filter(
      r => !suspiciousReviews.find(s => s.id === r.id)
    );

    // Rating distribution
    const ratingDist = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    reviews.forEach(r => { ratingDist[r.rating]++; });

    // Try AI analysis, fall back to math if needed
    let analysis;
    let analysisType = "ai";

    if (GROQ_API_KEY && cleanReviews.length > 0) {
      try {
        analysis = await analyzeWithGroq(cleanReviews);
      } catch (err) {
        console.warn("⚠️ AI analysis failed, using fallback:", err.message);
        analysis = fallbackAnalysis(cleanReviews);
        analysisType = "fallback";
      }
    } else {
      analysis = fallbackAnalysis(cleanReviews);
      analysisType = "fallback";
    }

    res.json({
      centerId,
      totalReviews: reviews.length,
      cleanReviews: cleanReviews.length,
      suspiciousCount: suspiciousReviews.length,
      suspiciousReviews: suspiciousReviews,
      ratingDistribution: ratingDist,
      analysisType,
      intelligence: analysis
    });

  } catch (error) {
    console.error("❌ Review intelligence error:", error);
    res.status(500).json({ error: "Analysis failed. Please try again." });
  }
};

// ─────────────────────────────────────────
// GET /api/review-intelligence/summary/:centerId
// Lightweight version for public pages
// ─────────────────────────────────────────
export const getReviewSummary = async (req, res) => {
  try {
    const { centerId } = req.params;

    const reviews = await prisma.review.findMany({
      where: { centerId },
      select: { rating: true, comment: true, createdAt: true, userEmail: true }
    });

    if (reviews.length === 0) {
      return res.json({ totalReviews: 0, intelligence: null });
    }

    const suspiciousReviews = detectFakeReviews(reviews);
    const cleanReviews = reviews.filter(
      r => !suspiciousReviews.find(s => s.id === r.id)
    );

    let analysis;
    if (GROQ_API_KEY && cleanReviews.length >= 3) {
      try {
        analysis = await analyzeWithGroq(cleanReviews);
      } catch {
        analysis = fallbackAnalysis(cleanReviews);
      }
    } else {
      analysis = fallbackAnalysis(cleanReviews);
    }

    // Return only public-safe fields
    res.json({
      totalReviews: reviews.length,
      suspiciousCount: suspiciousReviews.length,
      intelligence: {
        aspects: analysis?.aspects,
        summary: analysis?.summary,
        top_positives: analysis?.top_positives,
        top_negatives: analysis?.top_negatives,
        overall_verdict: analysis?.overall_verdict,
        recommended_for: analysis?.recommended_for,
      }
    });

  } catch (error) {
    console.error("❌ Review summary error:", error);
    res.status(500).json({ error: "Summary failed." });
  }
};