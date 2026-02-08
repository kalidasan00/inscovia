// app/admin/blog/create/page.js - CREATE BLOG POST
"use client";
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Save, Eye, Upload, X } from 'lucide-react';
import Link from 'next/link';

export default function CreateBlogPage() {
  const [formData, setFormData] = useState({
    title: '',
    slug: '',
    excerpt: '',
    content: '',
    category: 'GENERAL',
    tags: '',
    status: 'DRAFT',
    featuredImage: '',
    metaTitle: '',
    metaDescription: '',
  });
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const router = useRouter();

  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001/api';

  useEffect(() => {
    // Check auth
    const token = localStorage.getItem('adminToken');
    if (!token) {
      router.push('/institute/login');
    }
  }, [router]);

  // Auto-generate slug from title
  useEffect(() => {
    if (formData.title && !formData.slug) {
      const slug = formData.title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '');
      setFormData(prev => ({ ...prev, slug }));
    }
  }, [formData.title]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Create FormData
    const uploadData = new FormData();
    uploadData.append('image', file);

    setUploading(true);

    try {
      const token = localStorage.getItem('adminToken');

      // Upload to your backend (you'll need an upload endpoint)
      const res = await fetch(`${API_URL}/upload`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: uploadData
      });

      const data = await res.json();

      if (data.success) {
        setFormData(prev => ({ ...prev, featuredImage: data.url }));
      } else {
        alert('Upload failed');
      }
    } catch (error) {
      console.error('Upload error:', error);
      alert('Upload error');
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const token = localStorage.getItem('adminToken');

      // Prepare data
      const blogData = {
        ...formData,
        tags: formData.tags.split(',').map(t => t.trim()).filter(Boolean),
        metaTitle: formData.metaTitle || formData.title,
        metaDescription: formData.metaDescription || formData.excerpt,
      };

      const res = await fetch(`${API_URL}/blog`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(blogData)
      });

      const data = await res.json();

      if (data.success) {
        alert('Blog post created successfully!');
        router.push('/admin/blog');
      } else {
        alert(data.error || 'Failed to create blog post');
      }
    } catch (error) {
      console.error('Create blog error:', error);
      alert('Error creating blog post');
    } finally {
      setLoading(false);
    }
  };

  const handlePreview = () => {
    // Save to localStorage for preview
    localStorage.setItem('blogPreview', JSON.stringify(formData));
    window.open('/admin/blog/preview', '_blank');
  };

  return (
    <div className="p-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Link
            href="/admin/blog"
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Create Blog Post</h1>
            <p className="text-gray-600 text-sm mt-1">Write and publish your content</p>
          </div>
        </div>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={handlePreview}
            className="flex items-center gap-2 px-4 py-2 bg-white border rounded-lg hover:bg-gray-50 transition-colors"
          >
            <Eye className="w-4 h-4" />
            Preview
          </button>
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="flex items-center gap-2 px-4 py-2 bg-accent text-white rounded-lg hover:bg-accent/90 transition-colors disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            {loading ? 'Saving...' : 'Publish'}
          </button>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Title */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Title *
          </label>
          <input
            type="text"
            name="title"
            value={formData.title}
            onChange={handleChange}
            required
            className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-accent focus:border-transparent"
            placeholder="Enter post title"
          />
        </div>

        {/* Slug */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            URL Slug *
          </label>
          <div className="flex items-center gap-2">
            <span className="text-gray-500 text-sm">inscovia.com/blog/</span>
            <input
              type="text"
              name="slug"
              value={formData.slug}
              onChange={handleChange}
              required
              className="flex-1 px-4 py-2 border rounded-lg focus:ring-2 focus:ring-accent focus:border-transparent"
              placeholder="post-url-slug"
            />
          </div>
        </div>

        {/* Excerpt */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Excerpt
          </label>
          <textarea
            name="excerpt"
            value={formData.excerpt}
            onChange={handleChange}
            rows={3}
            className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-accent focus:border-transparent"
            placeholder="Brief description (shown in blog list)"
            maxLength={300}
          />
          <p className="text-xs text-gray-500 mt-1">{formData.excerpt.length}/300 characters</p>
        </div>

        {/* Content */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Content *
          </label>
          <textarea
            name="content"
            value={formData.content}
            onChange={handleChange}
            required
            rows={15}
            className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-accent focus:border-transparent font-mono text-sm"
            placeholder="Write your content here (HTML supported)"
          />
          <p className="text-xs text-gray-500 mt-1">
            Tip: You can use HTML tags like &lt;h2&gt;, &lt;p&gt;, &lt;strong&gt;, &lt;ul&gt;, etc.
          </p>
        </div>

        {/* Featured Image */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Featured Image
          </label>
          {formData.featuredImage ? (
            <div className="relative w-full h-48 bg-gray-100 rounded-lg overflow-hidden">
              <img
                src={formData.featuredImage}
                alt="Featured"
                className="w-full h-full object-cover"
              />
              <button
                type="button"
                onClick={() => setFormData(prev => ({ ...prev, featuredImage: '' }))}
                className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <div className="relative">
              <input
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden"
                id="imageUpload"
              />
              <label
                htmlFor="imageUpload"
                className="flex flex-col items-center justify-center w-full h-48 border-2 border-dashed rounded-lg cursor-pointer hover:bg-gray-50 transition-colors"
              >
                {uploading ? (
                  <div className="animate-spin rounded-full h-8 w-8 border-4 border-accent border-t-transparent"></div>
                ) : (
                  <>
                    <Upload className="w-8 h-8 text-gray-400 mb-2" />
                    <p className="text-sm text-gray-600">Click to upload image</p>
                    <p className="text-xs text-gray-500 mt-1">PNG, JPG up to 5MB</p>
                  </>
                )}
              </label>
            </div>
          )}
          <p className="text-xs text-gray-500 mt-2">
            Or paste image URL:
          </p>
          <input
            type="url"
            name="featuredImage"
            value={formData.featuredImage}
            onChange={handleChange}
            className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-accent focus:border-transparent mt-1"
            placeholder="https://example.com/image.jpg"
          />
        </div>

        <div className="grid grid-cols-2 gap-6">
          {/* Category */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Category *
            </label>
            <select
              name="category"
              value={formData.category}
              onChange={handleChange}
              required
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-accent focus:border-transparent"
            >
              <option value="GENERAL">General</option>
              <option value="EXAM_COACHING">Exam Coaching</option>
              <option value="TECHNOLOGY">Technology</option>
              <option value="SKILL_DEVELOPMENT">Skill Development</option>
              <option value="MANAGEMENT">Management</option>
              <option value="CAREER_GUIDANCE">Career Guidance</option>
              <option value="STUDY_TIPS">Study Tips</option>
              <option value="INSTITUTE_REVIEWS">Institute Reviews</option>
              <option value="NEWS">News</option>
            </select>
          </div>

          {/* Status */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Status *
            </label>
            <select
              name="status"
              value={formData.status}
              onChange={handleChange}
              required
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-accent focus:border-transparent"
            >
              <option value="DRAFT">Draft</option>
              <option value="PUBLISHED">Published</option>
            </select>
          </div>
        </div>

        {/* Tags */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Tags
          </label>
          <input
            type="text"
            name="tags"
            value={formData.tags}
            onChange={handleChange}
            className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-accent focus:border-transparent"
            placeholder="NEET, Kochi, Coaching (comma-separated)"
          />
        </div>

        {/* SEO Section */}
        <div className="border-t pt-6">
          <h3 className="text-lg font-semibold mb-4">SEO Settings</h3>

          <div className="space-y-4">
            {/* Meta Title */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Meta Title
              </label>
              <input
                type="text"
                name="metaTitle"
                value={formData.metaTitle}
                onChange={handleChange}
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-accent focus:border-transparent"
                placeholder="Leave blank to use post title"
                maxLength={60}
              />
              <p className="text-xs text-gray-500 mt-1">{formData.metaTitle.length}/60 characters</p>
            </div>

            {/* Meta Description */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Meta Description
              </label>
              <textarea
                name="metaDescription"
                value={formData.metaDescription}
                onChange={handleChange}
                rows={3}
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-accent focus:border-transparent"
                placeholder="Leave blank to use excerpt"
                maxLength={160}
              />
              <p className="text-xs text-gray-500 mt-1">{formData.metaDescription.length}/160 characters</p>
            </div>
          </div>
        </div>

        {/* Submit Button */}
        <div className="flex justify-end gap-3 pt-6 border-t">
          <Link
            href="/admin/blog"
            className="px-6 py-2 border rounded-lg hover:bg-gray-50 transition-colors"
          >
            Cancel
          </Link>
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-2 bg-accent text-white rounded-lg hover:bg-accent/90 transition-colors disabled:opacity-50"
          >
            {loading ? 'Creating...' : 'Create Post'}
          </button>
        </div>
      </form>
    </div>
  );
}