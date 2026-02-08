// backend/src/models/Blog.js
const mongoose = require('mongoose');

const blogSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true,
    maxlength: 200
  },
  slug: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  excerpt: {
    type: String,
    maxlength: 300,
    trim: true
  },
  content: {
    type: String,
    required: true
  },
  featuredImage: {
    type: String,
    default: null
  },
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Institute',
    required: true
  },
  authorName: {
    type: String,
    default: 'Inscovia Team'
  },
  category: {
    type: String,
    enum: ['EXAM_COACHING', 'TECHNOLOGY', 'SKILL_DEVELOPMENT', 'MANAGEMENT', 'CAREER_GUIDANCE', 'STUDY_TIPS', 'INSTITUTE_REVIEWS', 'NEWS', 'GENERAL'],
    default: 'GENERAL'
  },
  tags: [{
    type: String,
    trim: true
  }],
  status: {
    type: String,
    enum: ['DRAFT', 'PUBLISHED', 'ARCHIVED'],
    default: 'DRAFT'
  },
  publishedAt: {
    type: Date,
    default: null
  },
  scheduledFor: {
    type: Date,
    default: null
  },
  views: {
    type: Number,
    default: 0
  },
  likes: {
    type: Number,
    default: 0
  },
  readingTime: {
    type: Number, // in minutes
    default: 5
  },
  metaTitle: {
    type: String,
    maxlength: 60
  },
  metaDescription: {
    type: String,
    maxlength: 160
  },
  metaKeywords: [{
    type: String
  }],
  relatedCenters: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Center'
  }],
  featured: {
    type: Boolean,
    default: false
  },
  allowComments: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Calculate reading time before saving
blogSchema.pre('save', function(next) {
  if (this.content) {
    const wordsPerMinute = 200;
    const wordCount = this.content.split(/\s+/).length;
    this.readingTime = Math.ceil(wordCount / wordsPerMinute);
  }

  // Set published date if status changed to PUBLISHED
  if (this.status === 'PUBLISHED' && !this.publishedAt) {
    this.publishedAt = new Date();
  }

  next();
});

// Indexes for better query performance
blogSchema.index({ slug: 1 });
blogSchema.index({ status: 1, publishedAt: -1 });
blogSchema.index({ category: 1 });
blogSchema.index({ tags: 1 });
blogSchema.index({ featured: 1 });

module.exports = mongoose.model('Blog', blogSchema);