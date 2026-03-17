"use client";
import { useState, useEffect } from "react";
import { Sparkles, AlertTriangle, ThumbsUp, ThumbsDown, Star, ShieldCheck } from "lucide-react";

const ASPECT_LABELS = {
  faculty: { label: "Faculty", emoji: "👨‍🏫" },
  placement: { label: "Placement", emoji: "💼" },
  infrastructure: { label: "Infrastructure", emoji: "🏢" },
  curriculum: { label: "Curriculum", emoji: "📚" },
  value_for_money: { label: "Value for Money", emoji: "💰" },
  management: { label: "Management", emoji: "🤝" },
};

const VERDICT_COLORS = {
  Excellent: "text-emerald-600 bg-emerald-50 border-emerald-200",
  Good: "text-blue-600 bg-blue-50 border-blue-200",
  Average: "text-yellow-600 bg-yellow-50 border-yellow-200",
  Poor: "text-red-600 bg-red-50 border-red-200",
};

const SENTIMENT_COLOR = {
  positive: "bg-emerald-500",
  mixed: "bg-yellow-400",
  negative: "bg-red-500",
};

export default function ReviewIntelligenceCard({ centerId }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5001/api";

  useEffect(() => {
    if (!centerId) return;
    fetchIntelligence();
  }, [centerId]);

  const fetchIntelligence = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${API_URL}/review-intelligence/summary/${centerId}`);
      const json = await res.json();
      if (!res.ok) throw new Error(json.error);
      setData(json);
    } catch (err) {
      setError("Could not load review analysis.");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="rounded-2xl border border-gray-100 p-5 bg-white animate-pulse">
        <div className="h-4 bg-gray-100 rounded w-40 mb-4" />
        <div className="space-y-3">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-3 bg-gray-100 rounded w-full" />
          ))}
        </div>
      </div>
    );
  }

  if (error || !data || data.totalReviews === 0) return null;

  const { intelligence, totalReviews, suspiciousCount } = data;
  if (!intelligence) return null;

  const verdictStyle = VERDICT_COLORS[intelligence.overall_verdict] || VERDICT_COLORS.Average;

  return (
    <div className="rounded-2xl border border-gray-100 bg-white overflow-hidden shadow-sm">
      {/* Header */}
      <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-accent/10 flex items-center justify-center">
            <Sparkles className="w-4 h-4 text-accent" />
          </div>
          <span className="text-sm font-semibold text-gray-800">AI Review Analysis</span>
        </div>
        <div className="flex items-center gap-2">
          {suspiciousCount > 0 && (
            <span className="flex items-center gap-1 text-xs text-orange-600 bg-orange-50 border border-orange-200 px-2 py-1 rounded-full">
              <AlertTriangle className="w-3 h-3" />
              {suspiciousCount} filtered
            </span>
          )}
          <span className={`text-xs font-semibold px-2.5 py-1 rounded-full border ${verdictStyle}`}>
            {intelligence.overall_verdict}
          </span>
        </div>
      </div>

      <div className="p-5 space-y-5">
        {/* AI Summary */}
        {intelligence.summary && (
          <p className="text-sm text-gray-600 leading-relaxed border-l-2 border-accent pl-3">
            {intelligence.summary}
          </p>
        )}

        {/* Aspect Scores */}
        {intelligence.aspects && (
          <div className="space-y-2.5">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
              What students say about
            </p>
            {Object.entries(intelligence.aspects).map(([key, val]) => {
              const aspect = ASPECT_LABELS[key];
              if (!aspect || val.mentions === 0 && val.score === 0) return null;
              return (
                <div key={key} className="flex items-center gap-3">
                  <span className="text-base w-6 text-center">{aspect.emoji}</span>
                  <span className="text-xs text-gray-600 w-28 flex-shrink-0">
                    {aspect.label}
                  </span>
                  <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-700 ${SENTIMENT_COLOR[val.sentiment] || "bg-gray-300"}`}
                      style={{ width: `${val.score}%` }}
                    />
                  </div>
                  <span className="text-xs font-medium text-gray-700 w-10 text-right">
                    {val.score}%
                  </span>
                </div>
              );
            })}
          </div>
        )}

        {/* Positives & Negatives */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {intelligence.top_positives?.length > 0 && (
            <div className="bg-emerald-50 rounded-xl p-3 space-y-1.5">
              <div className="flex items-center gap-1.5 mb-2">
                <ThumbsUp className="w-3.5 h-3.5 text-emerald-600" />
                <span className="text-xs font-semibold text-emerald-700">Students love</span>
              </div>
              {intelligence.top_positives.slice(0, 3).map((p, i) => (
                <p key={i} className="text-xs text-emerald-700 flex items-start gap-1.5">
                  <span className="mt-0.5 flex-shrink-0">✓</span> {p}
                </p>
              ))}
            </div>
          )}

          {intelligence.top_negatives?.length > 0 && (
            <div className="bg-red-50 rounded-xl p-3 space-y-1.5">
              <div className="flex items-center gap-1.5 mb-2">
                <ThumbsDown className="w-3.5 h-3.5 text-red-500" />
                <span className="text-xs font-semibold text-red-600">Concerns raised</span>
              </div>
              {intelligence.top_negatives.slice(0, 3).map((n, i) => (
                <p key={i} className="text-xs text-red-600 flex items-start gap-1.5">
                  <span className="mt-0.5 flex-shrink-0">✗</span> {n}
                </p>
              ))}
            </div>
          )}
        </div>

        {/* Recommended for */}
        {intelligence.recommended_for && (
          <div className="flex items-start gap-2 bg-blue-50 rounded-xl px-3 py-2.5">
            <Star className="w-4 h-4 text-blue-500 flex-shrink-0 mt-0.5" />
            <p className="text-xs text-blue-700">
              <span className="font-semibold">Best for: </span>
              {intelligence.recommended_for}
            </p>
          </div>
        )}

        {/* Footer */}
        <div className="flex items-center justify-between pt-1">
          <p className="text-[10px] text-gray-400 flex items-center gap-1">
            <ShieldCheck className="w-3 h-3" />
            Analysed {totalReviews} reviews · AI powered
          </p>
          {suspiciousCount > 0 && (
            <p className="text-[10px] text-orange-500">
              {suspiciousCount} suspicious filtered
            </p>
          )}
        </div>
      </div>
    </div>
  );
}