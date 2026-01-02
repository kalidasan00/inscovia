// backend/src/routes/user-reviews.routes.js
import express from "express";
import { PrismaClient } from "@prisma/client";

const router = express.Router();
const prisma = new PrismaClient();

// ===== GET USER'S REVIEWS =====
router.get("/user/:email", async (req, res) => {
  try {
    const { email } = req.params;

    const reviews = await prisma.review.findMany({
      where: {
        userEmail: email.toLowerCase()
      },
      include: {
        center: {
          select: {
            id: true,
            name: true,
            logo: true,
            image: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    res.json({ reviews });
  } catch (error) {
    console.error("Get user reviews error:", error);
    res.status(500).json({ error: "Failed to load reviews" });
  }
});

// ===== UPDATE REVIEW =====
router.put("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { rating, comment } = req.body;

    // Validation
    if (!rating || rating < 1 || rating > 5) {
      return res.status(400).json({ error: "Rating must be between 1 and 5" });
    }

    if (!comment || comment.trim().length < 10) {
      return res.status(400).json({ error: "Comment must be at least 10 characters" });
    }

    if (comment.length > 500) {
      return res.status(400).json({ error: "Comment must be less than 500 characters" });
    }

    // Update review
    const updatedReview = await prisma.review.update({
      where: { id },
      data: {
        rating,
        comment: comment.trim()
      }
    });

    // Recalculate center's average rating
    const allReviews = await prisma.review.findMany({
      where: { centerId: updatedReview.centerId }
    });

    const avgRating = allReviews.reduce((sum, r) => sum + r.rating, 0) / allReviews.length;

    await prisma.center.update({
      where: { id: updatedReview.centerId },
      data: { rating: avgRating }
    });

    res.json({
      review: updatedReview,
      message: "Review updated successfully"
    });
  } catch (error) {
    console.error("Update review error:", error);
    res.status(500).json({ error: "Failed to update review" });
  }
});

// ===== DELETE REVIEW =====
router.delete("/:id", async (req, res) => {
  try {
    const { id } = req.params;

    // Get review to find centerId
    const review = await prisma.review.findUnique({
      where: { id }
    });

    if (!review) {
      return res.status(404).json({ error: "Review not found" });
    }

    // Delete review
    await prisma.review.delete({
      where: { id }
    });

    // Recalculate center's average rating
    const remainingReviews = await prisma.review.findMany({
      where: { centerId: review.centerId }
    });

    if (remainingReviews.length > 0) {
      const avgRating = remainingReviews.reduce((sum, r) => sum + r.rating, 0) / remainingReviews.length;
      await prisma.center.update({
        where: { id: review.centerId },
        data: { rating: avgRating }
      });
    } else {
      // No reviews left, reset to 0
      await prisma.center.update({
        where: { id: review.centerId },
        data: { rating: 0 }
      });
    }

    res.json({ message: "Review deleted successfully" });
  } catch (error) {
    console.error("Delete review error:", error);
    res.status(500).json({ error: "Failed to delete review" });
  }
});

export default router;