// backend/src/routes/aptitude.routes.js
import express from "express";
import prisma from "../lib/prisma.js";

const router = express.Router();

// ─── PUBLIC ROUTES ───────────────────────────────────────────

// GET all topics and subtopics
router.get("/topics", async (req, res) => {
  try {
    const questions = await prisma.aptitudeQuestion.findMany({
      where: { isActive: true },
      select: { topic: true, subtopic: true },
    });

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
router.get("/questions", async (req, res) => {
  try {
    const { topic, subtopic, difficulty, limit = 10 } = req.query;

    const where = { isActive: true };
    if (topic) where.topic = topic;
    if (subtopic) where.subtopic = subtopic;
    if (difficulty) where.difficulty = difficulty;

    const all = await prisma.aptitudeQuestion.findMany({
      where,
      select: {
        id: true, question: true, optionA: true, optionB: true,
        optionC: true, optionD: true, answer: true, explanation: true,
        topic: true, subtopic: true, difficulty: true,
      },
    });

    const shuffled = all.sort(() => Math.random() - 0.5);
    const questions = shuffled.slice(0, parseInt(limit));
    res.json({ success: true, questions, total: all.length });
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch questions" });
  }
});

// GET stats
router.get("/stats", async (req, res) => {
  try {
    const total = await prisma.aptitudeQuestion.count({ where: { isActive: true } });
    const byTopic = await prisma.aptitudeQuestion.groupBy({
      by: ["topic"], where: { isActive: true }, _count: { id: true },
    });
    const byDifficulty = await prisma.aptitudeQuestion.groupBy({
      by: ["difficulty"], where: { isActive: true }, _count: { id: true },
    });
    res.json({ success: true, total, byTopic, byDifficulty });
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch stats" });
  }
});

// ─── ADMIN ROUTES ─────────────────────────────────────────────

// GET all questions with filters + pagination (admin)
router.get("/admin/questions", async (req, res) => {
  try {
    const { topic, subtopic, difficulty, search, page = 1, limit = 20 } = req.query;

    const where = {};
    if (topic) where.topic = topic;
    if (subtopic) where.subtopic = subtopic;
    if (difficulty) where.difficulty = difficulty;
    if (search) where.question = { contains: search, mode: "insensitive" };

    const total = await prisma.aptitudeQuestion.count({ where });
    const questions = await prisma.aptitudeQuestion.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (parseInt(page) - 1) * parseInt(limit),
      take: parseInt(limit),
    });

    res.json({
      success: true, questions, total,
      page: parseInt(page),
      totalPages: Math.ceil(total / parseInt(limit)),
    });
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch questions" });
  }
});

// GET single question (admin)
router.get("/admin/questions/:id", async (req, res) => {
  try {
    const question = await prisma.aptitudeQuestion.findUnique({ where: { id: req.params.id } });
    if (!question) return res.status(404).json({ error: "Question not found" });
    res.json({ success: true, question });
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch question" });
  }
});

// POST create new question (admin)
router.post("/admin/questions", async (req, res) => {
  try {
    const { question, optionA, optionB, optionC, optionD, answer, explanation, topic, subtopic, difficulty } = req.body;

    if (!question || !optionA || !optionB || !optionC || !optionD || !answer || !topic || !subtopic) {
      return res.status(400).json({ error: "All fields are required" });
    }
    if (!["A", "B", "C", "D"].includes(answer)) {
      return res.status(400).json({ error: "Answer must be A, B, C, or D" });
    }

    const created = await prisma.aptitudeQuestion.create({
      data: {
        question, optionA, optionB, optionC, optionD,
        answer, explanation: explanation || "",
        topic, subtopic, difficulty: difficulty || "EASY", isActive: true,
      },
    });

    res.json({ success: true, question: created });
  } catch (err) {
    res.status(500).json({ error: "Failed to create question" });
  }
});

// PUT update question (admin)
router.put("/admin/questions/:id", async (req, res) => {
  try {
    const { question, optionA, optionB, optionC, optionD, answer, explanation, topic, subtopic, difficulty, isActive } = req.body;

    const updated = await prisma.aptitudeQuestion.update({
      where: { id: req.params.id },
      data: {
        ...(question !== undefined && { question }),
        ...(optionA !== undefined && { optionA }),
        ...(optionB !== undefined && { optionB }),
        ...(optionC !== undefined && { optionC }),
        ...(optionD !== undefined && { optionD }),
        ...(answer !== undefined && { answer }),
        ...(explanation !== undefined && { explanation }),
        ...(topic !== undefined && { topic }),
        ...(subtopic !== undefined && { subtopic }),
        ...(difficulty !== undefined && { difficulty }),
        ...(isActive !== undefined && { isActive }),
      },
    });

    res.json({ success: true, question: updated });
  } catch (err) {
    res.status(500).json({ error: "Failed to update question" });
  }
});

// DELETE question (admin)
router.delete("/admin/questions/:id", async (req, res) => {
  try {
    await prisma.aptitudeQuestion.delete({ where: { id: req.params.id } });
    res.json({ success: true, message: "Question deleted" });
  } catch (err) {
    res.status(500).json({ error: "Failed to delete question" });
  }
});

// PATCH toggle active/inactive (admin)
router.patch("/admin/questions/:id/toggle", async (req, res) => {
  try {
    const q = await prisma.aptitudeQuestion.findUnique({ where: { id: req.params.id } });
    if (!q) return res.status(404).json({ error: "Not found" });

    const updated = await prisma.aptitudeQuestion.update({
      where: { id: req.params.id },
      data: { isActive: !q.isActive },
    });
    res.json({ success: true, question: updated });
  } catch (err) {
    res.status(500).json({ error: "Failed to toggle question" });
  }
});

export default router;