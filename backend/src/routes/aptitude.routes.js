// backend/src/routes/aptitude.routes.js
import express from "express";
import prisma from "../lib/prisma.js";

const router = express.Router();

// GET all topics and subtopics
router.get("/topics", async (req, res) => {
  try {
    const questions = await prisma.aptitudeQuestion.findMany({
      where: { isActive: true },
      select: { topic: true, subtopic: true },
    });

    // Group subtopics by topic
    const topics = {};
    questions.forEach(({ topic, subtopic }) => {
      if (!topics[topic]) topics[topic] = new Set();
      topics[topic].add(subtopic);
    });

    const result = Object.entries(topics).map(([topic, subtopics]) => ({
      topic,
      subtopics: Array.from(subtopics).sort(),
      count: questions.filter(q => q.topic === topic).length,
    }));

    res.json({ success: true, topics: result });
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch topics" });
  }
});

// GET random questions for quiz
// Query params: topic, subtopic, difficulty, limit (default 10)
router.get("/questions", async (req, res) => {
  try {
    const { topic, subtopic, difficulty, limit = 10 } = req.query;

    const where = { isActive: true };
    if (topic) where.topic = topic;
    if (subtopic) where.subtopic = subtopic;
    if (difficulty) where.difficulty = difficulty;

    // Get all matching questions then randomly pick 'limit' number
    const all = await prisma.aptitudeQuestion.findMany({
      where,
      select: {
        id: true,
        question: true,
        optionA: true,
        optionB: true,
        optionC: true,
        optionD: true,
        answer: true,
        explanation: true,
        topic: true,
        subtopic: true,
        difficulty: true,
      },
    });

    // Shuffle and pick
    const shuffled = all.sort(() => Math.random() - 0.5);
    const questions = shuffled.slice(0, parseInt(limit));

    res.json({ success: true, questions, total: all.length });
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch questions" });
  }
});

// GET stats (for leaderboard/admin)
router.get("/stats", async (req, res) => {
  try {
    const total = await prisma.aptitudeQuestion.count({ where: { isActive: true } });
    const byTopic = await prisma.aptitudeQuestion.groupBy({
      by: ["topic"],
      where: { isActive: true },
      _count: { id: true },
    });
    const byDifficulty = await prisma.aptitudeQuestion.groupBy({
      by: ["difficulty"],
      where: { isActive: true },
      _count: { id: true },
    });

    res.json({ success: true, total, byTopic, byDifficulty });
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch stats" });
  }
});

export default router;