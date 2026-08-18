// backend/src/controllers/typing.controller.js
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// A small bank of practice passages, grouped by difficulty.
// Kept in-code (not DB) since these rarely change and don't need admin editing.
const PASSAGES = {
  EASY: [
    "The sun was shining and the birds were singing in the trees. It was a perfect day to go for a walk in the park with friends.",
    "She opened the door and smiled. The room was full of light and the smell of fresh coffee filled the air around her.",
    "Learning something new every day keeps your mind sharp. Reading books, solving puzzles, and practicing skills all help you grow.",
  ],
  MEDIUM: [
    "Consistency matters more than intensity when building a new habit. Small, repeated actions compound over time into meaningful results, even when progress feels invisible day to day.",
    "The quick brown fox jumps over the lazy dog, a sentence often used to test typewriters and keyboards because it contains every letter of the alphabet at least once.",
    "Effective communication requires more than just speaking clearly. It involves listening carefully, understanding context, and responding in a way that respects the other person's perspective.",
  ],
  HARD: [
    "Quantum mechanics describes the behavior of particles at subatomic scales, where classical intuitions about position and momentum break down and probability governs the outcome of every measurement.",
    "The juxtaposition of bureaucratic inefficiency alongside technological innovation creates a peculiar paradox in rapidly industrializing economies, where infrastructure often outpaces institutional capacity to regulate it.",
    "Encryption algorithms rely on mathematical problems that are computationally infeasible to reverse without a key, ensuring that intercepted data remains unreadable to unauthorized third parties.",
  ],
};

// GET /api/typing/text?difficulty=MEDIUM
export const getPassage = async (req, res) => {
  try {
    const difficulty = (req.query.difficulty || "MEDIUM").toUpperCase();
    const pool = PASSAGES[difficulty] || PASSAGES.MEDIUM;
    const text = pool[Math.floor(Math.random() * pool.length)];
    res.json({ success: true, text, difficulty });
  } catch (error) {
    console.error("getPassage error:", error);
    res.status(500).json({ success: false, error: "Failed to fetch passage" });
  }
};

// POST /api/typing/submit
// body: { name, userId?, wpm, accuracy, duration, difficulty, errors }
export const submitResult = async (req, res) => {
  try {
    const { name, userId, wpm, accuracy, duration, difficulty, errors } = req.body;

    if (!name || typeof name !== "string" || !name.trim()) {
      return res.status(400).json({ success: false, error: "Name is required" });
    }
    if (!Number.isFinite(wpm) || wpm < 0 || wpm > 400) {
      return res.status(400).json({ success: false, error: "Invalid wpm" });
    }
    if (!Number.isFinite(accuracy) || accuracy < 0 || accuracy > 100) {
      return res.status(400).json({ success: false, error: "Invalid accuracy" });
    }
    if (![15, 30, 60].includes(duration)) {
      return res.status(400).json({ success: false, error: "Invalid duration" });
    }

    const result = await prisma.typingTestResult.create({
      data: {
        name: name.trim().slice(0, 40),
        userId: userId || null,
        wpm: Math.round(wpm),
        accuracy: Math.round(accuracy * 10) / 10,
        duration,
        difficulty: ["EASY", "MEDIUM", "HARD"].includes(difficulty) ? difficulty : "MEDIUM",
        errors: Number.isFinite(errors) ? errors : 0,
      },
    });

    res.json({ success: true, result });
  } catch (error) {
    console.error("submitResult error:", error);
    res.status(500).json({ success: false, error: "Failed to save result" });
  }
};

// GET /api/typing/leaderboard?duration=30&difficulty=MEDIUM&limit=10&scope=week
// scope: "all" (default) | "week"
export const getLeaderboard = async (req, res) => {
  try {
    const { duration, difficulty, limit, scope } = req.query;

    const where = {};
    if (duration && [15, 30, 60].includes(Number(duration))) where.duration = Number(duration);
    if (difficulty && ["EASY", "MEDIUM", "HARD"].includes(difficulty.toUpperCase())) {
      where.difficulty = difficulty.toUpperCase();
    }
    if (scope === "week") {
      const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
      where.createdAt = { gte: weekAgo };
    }

    const take = Math.min(Math.max(Number(limit) || 10, 1), 50);

    const leaderboard = await prisma.typingTestResult.findMany({
      where,
      orderBy: [{ wpm: "desc" }, { accuracy: "desc" }],
      take,
      select: {
        id: true,
        name: true,
        wpm: true,
        accuracy: true,
        duration: true,
        difficulty: true,
        userId: true,
        createdAt: true,
      },
    });

    res.json({ success: true, leaderboard });
  } catch (error) {
    console.error("getLeaderboard error:", error);
    res.status(500).json({ success: false, error: "Failed to fetch leaderboard" });
  }
};

// GET /api/typing/history?userId=xxx&limit=30
// Returns a logged-in user's past results, oldest first, for the progress graph.
export const getHistory = async (req, res) => {
  try {
    const { userId, limit } = req.query;

    if (!userId) {
      return res.status(400).json({ success: false, error: "userId is required" });
    }

    const take = Math.min(Math.max(Number(limit) || 30, 1), 100);

    const history = await prisma.typingTestResult.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      take,
      select: {
        id: true,
        wpm: true,
        accuracy: true,
        duration: true,
        difficulty: true,
        createdAt: true,
      },
    });

    // Return oldest → newest so the graph reads left-to-right chronologically
    const ordered = history.reverse();

    const best = ordered.reduce(
      (acc, r) => (r.wpm > (acc?.wpm ?? -1) ? r : acc),
      null
    );

    res.json({ success: true, history: ordered, best, totalTests: ordered.length });
  } catch (error) {
    console.error("getHistory error:", error);
    res.status(500).json({ success: false, error: "Failed to fetch history" });
  }
};