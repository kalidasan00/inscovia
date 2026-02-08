// backend/src/routes/blog.routes.js
const express = require('express');
const router = express.Router();
const Blog = require('../models/Blog');
const { authenticateInstitute } = require('../middleware/auth');

// GET /api/blog - Get all published blogs (public)
router.get('/', async (req, res) => {
  try {
    const {
      category,
      tag,
      search,
      page = 1,
      limit = 10,
      featured,
      sort = '-publishedAt'
    } = req.query;

    const query = { status: 'PUBLISHED' };

    // Filters
    if (category) query.category = category;
    if (tag) query.tags = tag;
    if (featured !== undefined) query.featured = featured === 'true';
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { excerpt: { $regex: search, $options: 'i' } },
        { content: { $regex: search, $options: 'i' } }
      ];
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const [blogs, total] = await Promise.all([
      Blog.find(query)
        .select('title slug excerpt featuredImage category tags publishedAt views readingTime authorName')
        .sort(sort)
        .skip(skip)
        .limit(parseInt(limit))
        .lean(),
      Blog.countDocuments(query)
    ]);

    res.json({
      success: true,
      blogs,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    console.error('Get blogs error:', error);
    res.status(500).json({ error: 'Failed to fetch blogs' });
  }
});

// GET /api/blog/featured - Get featured blogs
router.get('/featured', async (req, res) => {
  try {
    const blogs = await Blog.find({
      status: 'PUBLISHED',
      featured: true
    })
      .select('title slug excerpt featuredImage category tags publishedAt authorName')
      .sort('-publishedAt')
      .limit(6)
      .lean();

    res.json({ success: true, blogs });
  } catch (error) {
    console.error('Get featured blogs error:', error);
    res.status(500).json({ error: 'Failed to fetch featured blogs' });
  }
});

// GET /api/blog/categories - Get all categories with count
router.get('/categories', async (req, res) => {
  try {
    const categories = await Blog.aggregate([
      { $match: { status: 'PUBLISHED' } },
      { $group: { _id: '$category', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);

    res.json({
      success: true,
      categories: categories.map(c => ({ name: c._id, count: c.count }))
    });
  } catch (error) {
    console.error('Get categories error:', error);
    res.status(500).json({ error: 'Failed to fetch categories' });
  }
});

// GET /api/blog/tags - Get all tags with count
router.get('/tags', async (req, res) => {
  try {
    const tags = await Blog.aggregate([
      { $match: { status: 'PUBLISHED' } },
      { $unwind: '$tags' },
      { $group: { _id: '$tags', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 50 }
    ]);

    res.json({
      success: true,
      tags: tags.map(t => ({ name: t._id, count: t.count }))
    });
  } catch (error) {
    console.error('Get tags error:', error);
    res.status(500).json({ error: 'Failed to fetch tags' });
  }
});

// GET /api/blog/:slug - Get single blog by slug
router.get('/:slug', async (req, res) => {
  try {
    const blog = await Blog.findOne({
      slug: req.params.slug,
      status: 'PUBLISHED'
    })
      .populate('relatedCenters', 'name slug city state rating image')
      .lean();

    if (!blog) {
      return res.status(404).json({ error: 'Blog not found' });
    }

    // Increment views
    await Blog.updateOne({ _id: blog._id }, { $inc: { views: 1 } });

    // Get related posts (same category, exclude current)
    const relatedPosts = await Blog.find({
      _id: { $ne: blog._id },
      category: blog.category,
      status: 'PUBLISHED'
    })
      .select('title slug excerpt featuredImage publishedAt readingTime')
      .sort('-publishedAt')
      .limit(3)
      .lean();

    res.json({
      success: true,
      blog,
      relatedPosts
    });
  } catch (error) {
    console.error('Get blog error:', error);
    res.status(500).json({ error: 'Failed to fetch blog' });
  }
});

// POST /api/blog - Create new blog (protected - admin only)
router.post('/', authenticateInstitute, async (req, res) => {
  try {
    const {
      title,
      slug,
      excerpt,
      content,
      featuredImage,
      category,
      tags,
      status,
      metaTitle,
      metaDescription,
      metaKeywords,
      relatedCenters,
      featured,
      scheduledFor
    } = req.body;

    // Generate slug if not provided
    const blogSlug = slug || title.toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');

    // Check if slug exists
    const existingBlog = await Blog.findOne({ slug: blogSlug });
    if (existingBlog) {
      return res.status(400).json({ error: 'Slug already exists' });
    }

    const blog = new Blog({
      title,
      slug: blogSlug,
      excerpt,
      content,
      featuredImage,
      category,
      tags,
      status,
      author: req.institute._id,
      authorName: req.institute.instituteName || 'Inscovia Team',
      metaTitle: metaTitle || title,
      metaDescription: metaDescription || excerpt,
      metaKeywords,
      relatedCenters,
      featured: featured || false,
      scheduledFor
    });

    await blog.save();

    res.status(201).json({
      success: true,
      message: 'Blog created successfully',
      blog
    });
  } catch (error) {
    console.error('Create blog error:', error);
    res.status(500).json({ error: 'Failed to create blog' });
  }
});

// PUT /api/blog/:id - Update blog (protected - admin only)
router.put('/:id', authenticateInstitute, async (req, res) => {
  try {
    const blog = await Blog.findByIdAndUpdate(
      req.params.id,
      {
        ...req.body,
        updatedAt: Date.now()
      },
      { new: true, runValidators: true }
    );

    if (!blog) {
      return res.status(404).json({ error: 'Blog not found' });
    }

    res.json({
      success: true,
      message: 'Blog updated successfully',
      blog
    });
  } catch (error) {
    console.error('Update blog error:', error);
    res.status(500).json({ error: 'Failed to update blog' });
  }
});

// DELETE /api/blog/:id - Delete blog (protected - admin only)
router.delete('/:id', authenticateInstitute, async (req, res) => {
  try {
    const blog = await Blog.findByIdAndDelete(req.params.id);

    if (!blog) {
      return res.status(404).json({ error: 'Blog not found' });
    }

    res.json({
      success: true,
      message: 'Blog deleted successfully'
    });
  } catch (error) {
    console.error('Delete blog error:', error);
    res.status(500).json({ error: 'Failed to delete blog' });
  }
});

// POST /api/blog/:id/like - Like a blog post
router.post('/:id/like', async (req, res) => {
  try {
    const blog = await Blog.findByIdAndUpdate(
      req.params.id,
      { $inc: { likes: 1 } },
      { new: true }
    ).select('likes');

    if (!blog) {
      return res.status(404).json({ error: 'Blog not found' });
    }

    res.json({
      success: true,
      likes: blog.likes
    });
  } catch (error) {
    console.error('Like blog error:', error);
    res.status(500).json({ error: 'Failed to like blog' });
  }
});

module.exports = router;