// app/admin/blog/page.js - BLOG MANAGEMENT
"use client";
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Plus, Edit, Trash2, Eye, Calendar, Clock } from 'lucide-react';

export default function AdminBlogPage() {
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('ALL'); // ALL, PUBLISHED, DRAFT
  const router = useRouter();

  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001/api';

  useEffect(() => {
    checkAuth();
    loadBlogs();
  }, [filter]);

  function checkAuth() {
    const token = localStorage.getItem('adminToken');
    if (!token) {
      router.push('/institute/login');
    }
  }

  async function loadBlogs() {
    try {
      setLoading(true);
      const token = localStorage.getItem('adminToken');

      const res = await fetch(`${API_URL}/blog?page=1&limit=100`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await res.json();
      let blogList = data.blogs || [];

      // Filter by status
      if (filter === 'PUBLISHED') {
        blogList = blogList.filter(b => b.status === 'PUBLISHED');
      } else if (filter === 'DRAFT') {
        blogList = blogList.filter(b => b.status === 'DRAFT');
      }

      setBlogs(blogList);
    } catch (error) {
      console.error('Load blogs error:', error);
    } finally {
      setLoading(false);
    }
  }

  async function deleteBlog(id) {
    if (!confirm('Are you sure you want to delete this blog post?')) return;

    try {
      const token = localStorage.getItem('adminToken');
      const res = await fetch(`${API_URL}/blog/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (res.ok) {
        alert('Blog deleted successfully');
        loadBlogs();
      } else {
        alert('Failed to delete blog');
      }
    } catch (error) {
      console.error('Delete error:', error);
      alert('Error deleting blog');
    }
  }

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const formatCategory = (cat) => {
    return cat?.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()) || '';
  };

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Blog Posts</h1>
          <p className="text-gray-600 mt-1">Manage your blog content</p>
        </div>
        <Link
          href="/admin/blog/create"
          className="flex items-center gap-2 px-4 py-2 bg-accent text-white rounded-lg hover:bg-accent/90 transition-colors"
        >
          <Plus className="w-4 h-4" />
          New Post
        </Link>
      </div>

      {/* Filters */}
      <div className="flex gap-2 mb-6">
        <button
          onClick={() => setFilter('ALL')}
          className={`px-4 py-2 rounded-lg font-medium transition-colors ${
            filter === 'ALL'
              ? 'bg-accent text-white'
              : 'bg-white text-gray-700 border hover:bg-gray-50'
          }`}
        >
          All Posts
        </button>
        <button
          onClick={() => setFilter('PUBLISHED')}
          className={`px-4 py-2 rounded-lg font-medium transition-colors ${
            filter === 'PUBLISHED'
              ? 'bg-accent text-white'
              : 'bg-white text-gray-700 border hover:bg-gray-50'
          }`}
        >
          Published
        </button>
        <button
          onClick={() => setFilter('DRAFT')}
          className={`px-4 py-2 rounded-lg font-medium transition-colors ${
            filter === 'DRAFT'
              ? 'bg-accent text-white'
              : 'bg-white text-gray-700 border hover:bg-gray-50'
          }`}
        >
          Drafts
        </button>
      </div>

      {/* Blog List */}
      {loading ? (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-accent border-t-transparent mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      ) : blogs.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-lg border">
          <p className="text-gray-600 mb-4">No blog posts yet</p>
          <Link
            href="/admin/blog/create"
            className="inline-flex items-center gap-2 px-4 py-2 bg-accent text-white rounded-lg hover:bg-accent/90"
          >
            <Plus className="w-4 h-4" />
            Create Your First Post
          </Link>
        </div>
      ) : (
        <div className="bg-white rounded-lg border overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Title
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Category
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Views
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {blogs.map((blog) => (
                <tr key={blog._id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      {blog.featuredImage && (
                        <img
                          src={blog.featuredImage}
                          alt={blog.title}
                          className="w-12 h-12 rounded object-cover"
                        />
                      )}
                      <div>
                        <div className="font-medium text-gray-900">{blog.title}</div>
                        <div className="text-sm text-gray-500">/blog/{blog.slug}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="inline-flex px-2 py-1 text-xs font-medium bg-gray-100 text-gray-700 rounded">
                      {formatCategory(blog.category)}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex px-2 py-1 text-xs font-medium rounded ${
                      blog.status === 'PUBLISHED'
                        ? 'bg-green-100 text-green-700'
                        : 'bg-yellow-100 text-yellow-700'
                    }`}>
                      {blog.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">
                    <div className="flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5" />
                      {formatDate(blog.publishedAt || blog.createdAt)}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">
                    <div className="flex items-center gap-1">
                      <Eye className="w-3.5 h-3.5" />
                      {blog.views || 0}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Link
                        href={`/blog/${blog.slug}`}
                        target="_blank"
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded transition-colors"
                        title="View"
                      >
                        <Eye className="w-4 h-4" />
                      </Link>
                      <Link
                        href={`/admin/blog/edit/${blog._id}`}
                        className="p-2 text-gray-600 hover:bg-gray-100 rounded transition-colors"
                        title="Edit"
                      >
                        <Edit className="w-4 h-4" />
                      </Link>
                      <button
                        onClick={() => deleteBlog(blog._id)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded transition-colors"
                        title="Delete"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}