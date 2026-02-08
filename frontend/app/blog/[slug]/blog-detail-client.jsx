// app/blog/[slug]/blog-detail-client.jsx - BLOG ARTICLE PAGE
"use client";
import { useState, useEffect } from 'react';
import Link from 'next/link';
import Navbar from '../../../components/Navbar';
import Footer from '../../../components/Footer';
import { Calendar, Clock, Eye, Heart, Share2, Tag, ArrowLeft } from 'lucide-react';

export default function BlogDetailClient({ slug }) {
  const [blog, setBlog] = useState(null);
  const [relatedPosts, setRelatedPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [liked, setLiked] = useState(false);

  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001/api';

  useEffect(() => {
    loadBlog();
  }, [slug]);

  async function loadBlog() {
    try {
      setLoading(true);
      const res = await fetch(`${API_URL}/blog/${slug}`);
      const data = await res.json();

      if (data.success) {
        setBlog(data.blog);
        setRelatedPosts(data.relatedPosts || []);
      }
    } catch (error) {
      console.error('Load blog error:', error);
    } finally {
      setLoading(false);
    }
  }

  const handleLike = async () => {
    if (!blog) return;

    try {
      const res = await fetch(`${API_URL}/blog/${blog._id}/like`, {
        method: 'POST'
      });
      const data = await res.json();

      if (data.success) {
        setBlog({ ...blog, likes: data.likes });
        setLiked(true);
      }
    } catch (error) {
      console.error('Like error:', error);
    }
  };

  const handleShare = async () => {
    if (!blog) return;

    const shareData = {
      title: blog.title,
      text: blog.excerpt,
      url: window.location.href
    };

    if (navigator.share) {
      try {
        await navigator.share(shareData);
      } catch (error) {
        console.log('Share cancelled');
      }
    } else {
      // Fallback: Copy to clipboard
      navigator.clipboard.writeText(window.location.href);
      alert('Link copied to clipboard!');
    }
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatCategory = (cat) => {
    return cat?.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()) || '';
  };

  if (loading) {
    return (
      <>
        <Navbar />
        <main className="max-w-4xl mx-auto px-4 py-8">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-3/4 mb-4"></div>
            <div className="h-64 bg-gray-200 rounded mb-6"></div>
            <div className="space-y-3">
              <div className="h-4 bg-gray-200 rounded"></div>
              <div className="h-4 bg-gray-200 rounded"></div>
              <div className="h-4 bg-gray-200 rounded w-5/6"></div>
            </div>
          </div>
        </main>
        <Footer />
      </>
    );
  }

  if (!blog) {
    return (
      <>
        <Navbar />
        <main className="max-w-4xl mx-auto px-4 py-8">
          <div className="text-center py-12">
            <h2 className="text-2xl font-bold mb-4">Blog Post Not Found</h2>
            <Link href="/blog" className="text-accent hover:underline">
              ← Back to Blog
            </Link>
          </div>
        </main>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Navbar />

      {/* Breadcrumb */}
      <nav className="max-w-4xl mx-auto px-4 py-3 text-sm" aria-label="Breadcrumb">
        <ol className="flex items-center gap-2 text-gray-600">
          <li><Link href="/" className="hover:text-accent">Home</Link></li>
          <li>/</li>
          <li><Link href="/blog" className="hover:text-accent">Blog</Link></li>
          <li>/</li>
          <li className="text-gray-900 truncate max-w-[200px]">{blog.title}</li>
        </ol>
      </nav>

      <article className="max-w-4xl mx-auto px-4 py-6">
        {/* Header */}
        <header className="mb-8">
          {/* Category */}
          <span className="inline-block px-3 py-1 bg-accent/10 text-accent rounded-full text-sm font-medium mb-4">
            {formatCategory(blog.category)}
          </span>

          {/* Title */}
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4 leading-tight">
            {blog.title}
          </h1>

          {/* Meta Info */}
          <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600 mb-6">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-accent rounded-full flex items-center justify-center text-white font-medium">
                {blog.authorName?.[0] || 'A'}
              </div>
              <span>{blog.authorName}</span>
            </div>
            <div className="flex items-center gap-1">
              <Calendar className="w-4 h-4" />
              {formatDate(blog.publishedAt)}
            </div>
            <div className="flex items-center gap-1">
              <Clock className="w-4 h-4" />
              {blog.readingTime} min read
            </div>
            <div className="flex items-center gap-1">
              <Eye className="w-4 h-4" />
              {blog.views} views
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-3">
            <button
              onClick={handleLike}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${
                liked
                  ? 'bg-red-50 text-red-600'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <Heart className={`w-4 h-4 ${liked ? 'fill-current' : ''}`} />
              {blog.likes > 0 && <span>{blog.likes}</span>}
            </button>
            <button
              onClick={handleShare}
              className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-medium"
            >
              <Share2 className="w-4 h-4" />
              Share
            </button>
          </div>
        </header>

        {/* Featured Image */}
        {blog.featuredImage && (
          <div className="mb-8 rounded-lg overflow-hidden">
            <img
              src={blog.featuredImage}
              alt={blog.title}
              className="w-full h-auto"
              loading="eager"
            />
          </div>
        )}

        {/* Content */}
        <div
          className="prose prose-lg max-w-none mb-12"
          dangerouslySetInnerHTML={{ __html: blog.content }}
        />

        {/* Tags */}
        {blog.tags && blog.tags.length > 0 && (
          <div className="flex flex-wrap items-center gap-2 mb-8 pb-8 border-b">
            <Tag className="w-4 h-4 text-gray-500" />
            {blog.tags.map((tag, index) => (
              <Link
                key={index}
                href={`/blog?tag=${tag}`}
                className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm hover:bg-gray-200 transition-colors"
              >
                {tag}
              </Link>
            ))}
          </div>
        )}

        {/* Related Centers */}
        {blog.relatedCenters && blog.relatedCenters.length > 0 && (
          <div className="mb-12">
            <h3 className="text-xl font-bold mb-4">Featured Training Centers</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {blog.relatedCenters.map((center) => (
                <Link
                  key={center._id}
                  href={`/centers/${center.slug}`}
                  className="flex gap-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors border"
                >
                  {center.image && (
                    <img
                      src={center.image}
                      alt={center.name}
                      className="w-16 h-16 rounded object-cover flex-shrink-0"
                    />
                  )}
                  <div className="min-w-0">
                    <h4 className="font-medium text-gray-900 truncate">{center.name}</h4>
                    <p className="text-sm text-gray-600">{center.city}, {center.state}</p>
                    {center.rating > 0 && (
                      <div className="flex items-center gap-1 mt-1">
                        <span className="text-yellow-500">★</span>
                        <span className="text-sm font-medium">{center.rating.toFixed(1)}</span>
                      </div>
                    )}
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Related Posts */}
        {relatedPosts.length > 0 && (
          <div>
            <h3 className="text-xl font-bold mb-4">Related Articles</h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {relatedPosts.map((post) => (
                <Link
                  key={post._id}
                  href={`/blog/${post.slug}`}
                  className="group"
                >
                  {post.featuredImage && (
                    <div className="relative h-32 bg-gray-100 rounded-lg overflow-hidden mb-2">
                      <img
                        src={post.featuredImage}
                        alt={post.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                        loading="lazy"
                      />
                    </div>
                  )}
                  <h4 className="font-medium text-gray-900 group-hover:text-accent transition-colors line-clamp-2">
                    {post.title}
                  </h4>
                  <p className="text-sm text-gray-600 mt-1">
                    {formatDate(post.publishedAt)} • {post.readingTime} min
                  </p>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Back to Blog */}
        <div className="mt-12 pt-8 border-t">
          <Link
            href="/blog"
            className="inline-flex items-center gap-2 text-accent hover:text-accent/80 font-medium"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Blog
          </Link>
        </div>
      </article>

      <Footer />
    </>
  );
}