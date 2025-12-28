// backend/src/routes/reviews.routes.js
import express from 'express';
import { PrismaClient } from '@prisma/client';

const router = express.Router();
const prisma = new PrismaClient();

// GET /api/reviews/center/:id - Get all reviews for a center
router.get('/center/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const reviews = await prisma.review.findMany({
      where: {
        centerId: id
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    res.json({ reviews });
  } catch (error) {
    console.error('Error fetching reviews:', error);
    res.status(500).json({ error: 'Failed to fetch reviews' });
  }
});

// POST /api/reviews/center/:id - Add a new review
router.post('/center/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { userName, userEmail, rating, comment } = req.body;

    // Validation
    if (!userName || userName.trim().length < 2) {
      return res.status(400).json({ error: 'Name must be at least 2 characters' });
    }

    if (!userEmail || !userEmail.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
      return res.status(400).json({ error: 'Please provide a valid email' });
    }

    if (!rating || rating < 1 || rating > 5) {
      return res.status(400).json({ error: 'Rating must be between 1 and 5' });
    }

    if (!comment || comment.trim().length < 10) {
      return res.status(400).json({ error: 'Review must be at least 10 characters' });
    }

    // Check if center exists
    const center = await prisma.center.findUnique({
      where: { id }
    });

    if (!center) {
      return res.status(404).json({ error: 'Center not found' });
    }

    // Check if user already reviewed this center
    const existingReview = await prisma.review.findUnique({
      where: {
        userEmail_centerId: {
          userEmail: userEmail.toLowerCase().trim(),
          centerId: id
        }
      }
    });

    if (existingReview) {
      return res.status(400).json({ error: 'You have already reviewed this center' });
    }

    // Create review
    const review = await prisma.review.create({
      data: {
        userName: userName.trim(),
        userEmail: userEmail.toLowerCase().trim(),
        rating: parseInt(rating),
        comment: comment.trim(),
        centerId: id
      }
    });

    // Calculate new average rating
    const allReviews = await prisma.review.findMany({
      where: { centerId: id },
      select: { rating: true }
    });

    const avgRating = allReviews.reduce((sum, r) => sum + r.rating, 0) / allReviews.length;

    // Update center rating
    await prisma.center.update({
      where: { id },
      data: {
        rating: parseFloat(avgRating.toFixed(2))
      }
    });

    res.status(201).json({
      review,
      message: 'Review submitted successfully'
    });

  } catch (error) {
    console.error('Error creating review:', error);
    res.status(500).json({ error: 'Failed to submit review' });
  }
});

// GET /api/reviews/center/:id/stats - Get review statistics
router.get('/center/:id/stats', async (req, res) => {
  try {
    const { id } = req.params;

    const reviews = await prisma.review.findMany({
      where: { centerId: id },
      select: { rating: true }
    });

    if (reviews.length === 0) {
      return res.json({
        averageRating: 0,
        totalReviews: 0,
        ratingDistribution: {
          5: 0,
          4: 0,
          3: 0,
          2: 0,
          1: 0
        }
      });
    }

    const avgRating = reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length;

    const distribution = {
      5: reviews.filter(r => r.rating === 5).length,
      4: reviews.filter(r => r.rating === 4).length,
      3: reviews.filter(r => r.rating === 3).length,
      2: reviews.filter(r => r.rating === 2).length,
      1: reviews.filter(r => r.rating === 1).length
    };

    res.json({
      averageRating: parseFloat(avgRating.toFixed(2)),
      totalReviews: reviews.length,
      ratingDistribution: distribution
    });

  } catch (error) {
    console.error('Error fetching review stats:', error);
    res.status(500).json({ error: 'Failed to fetch statistics' });
  }
});

export default router;