"use client";
import { useState, useEffect, useRef, useCallback } from "react";
import Link from "next/link";
import { Keyboard, Zap, Clock, RotateCcw, Share2, Trophy, ArrowRight, Target, Flame } from "lucide-react";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5001/api";

const DIFFICULTY_CONFIG = {
  EASY: { label: "Easy", color: "text-green-600 bg-green-50 border-green-200" },
  MEDIUM: { label: "Medium", color: "text-yellow-600 bg-yellow-50 border-yellow-200" },
  HARD: { label: "Hard", color: "text-red-600 bg-red-50 border-red-200" },
};

function getSavedName() {
  if (typeof window === "undefined") return "";
  return localStorage.getItem("inscovia_typing_name") || "";
}

function saveName(name) {
  if (typeof window === "undefined") return;
  localStorage.setItem("inscovia_typing_name", name);
}

function getUserId() {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem("inscovia_user");
    return raw ? JSON.parse(raw)?.id || null : null;
  } catch {
    return null;
  }
}

export default function TypingTestPage() {
  const [screen, setScreen] = useState("home"); // home | typing | result
  const [duration, setDuration] = useState(30);
  const [difficulty, setDifficulty] = useState("MEDIUM");
  const [text, setText] = useState("");
  const [input, setInput] = useState("");
  const [timeLeft, setTimeLeft] = useState(30);
  const [started, setStarted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [finalStats, setFinalStats] = useState(null);
  const [name, setName] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [leaderboard, setLeaderboard] = useState([]);
  const [leaderboardLoading, setLeaderboardLoading] = useState(false);

  const inputRef = useRef(null);
  const startTimeRef = useRef(null);

  useEffect(() => {
    setName(getSavedName());
  }, []);

  // Timer
  useEffect(() => {
    if (!started || timeLeft <= 0) {
      if (started && timeLeft <= 0) finishTest();
      return;
    }
    const t = setTimeout(() => setTimeLeft((s) => s - 1), 1000);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [timeLeft, started]);

  const fetchPassage = async (diff) => {
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/typing/text?difficulty=${diff}`);
      const data = await res.json();
      if (data.success) setText(data.text);
    } catch (err) {
      console.error("Failed to fetch passage", err);
      setText(
        "The quick brown fox jumps over the lazy dog while practicing typing speed and accuracy every single day."
      );
    }
    setLoading(false);
  };

  const startTest = async () => {
    await fetchPassage(difficulty);
    setInput("");
    setTimeLeft(duration);
    setStarted(false);
    setFinalStats(null);
    setSubmitted(false);
    setScreen("typing");
    setTimeout(() => inputRef.current?.focus(), 100);
  };

  const handleChange = (e) => {
    const value = e.target.value;
    if (!started) {
      setStarted(true);
      startTimeRef.current = Date.now();
    }
    if (value.length <= text.length) setInput(value);
    if (value.length >= text.length) finishTest(value);
  };

  const finishTest = useCallback(
    (finalInput) => {
      const typed = finalInput !== undefined ? finalInput : input;
      const elapsedSeconds = startTimeRef.current
        ? Math.max((Date.now() - startTimeRef.current) / 1000, 1)
        : duration - timeLeft || 1;

      let correct = 0;
      let errors = 0;
      for (let i = 0; i < typed.length; i++) {
        if (typed[i] === text[i]) correct++;
        else errors++;
      }

      const wpm = Math.round(correct / 5 / (elapsedSeconds / 60));
      const accuracy = typed.length > 0 ? Math.round((correct / typed.length) * 1000) / 10 : 0;

      setStarted(false);
      setFinalStats({ wpm: Math.max(wpm, 0), accuracy, errors, charsTyped: typed.length });
      setScreen("result");
      fetchLeaderboard();
    },
    [input, text, duration, timeLeft]
  );

  const submitScore = async () => {
    if (!name.trim() || !finalStats) return;
    saveName(name.trim());
    try {
      await fetch(`${API_URL}/typing/submit`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          userId: getUserId(),
          wpm: finalStats.wpm,
          accuracy: finalStats.accuracy,
          duration,
          difficulty,
          errors: finalStats.errors,
        }),
      });
      setSubmitted(true);
      fetchLeaderboard();
    } catch (err) {
      console.error("Failed to submit score", err);
    }
  };

  const fetchLeaderboard = async () => {
    setLeaderboardLoading(true);
    try {
      const res = await fetch(`${API_URL}/typing/leaderboard?duration=${duration}&difficulty=${difficulty}&limit=10`);
      const data = await res.json();
      if (data.success) setLeaderboard(data.leaderboard);
    } catch (err) {
      console.error("Failed to fetch leaderboard", err);
    }
    setLeaderboardLoading(false);
  };

  const shareScore = () => {
    if (!finalStats) return;
    const text = `⌨️ I typed at ${finalStats.wpm} WPM with ${finalStats.accuracy}% accuracy on Inscovia's Typing Test!\nTry it: https://inscovia.com/typing-test`;
    if (navigator.share) {
      navigator.share({ title: "My Typing Score", text });
    } else {
      navigator.clipboard.writeText(text);
      alert("Score copied! Share it on WhatsApp 🚀");
    }
  };

  const restart = () => {
    setScreen("home");
    setStarted(false);
    setInput("");
    setFinalStats(null);
  };

  // ─── HOME SCREEN ───
  if (screen === "home") {
    return (
      <div className="min-h-screen bg-gray-50 pb-24">
        <div className="bg-white border-b sticky top-0 z-10">
          <div className="max-w-2xl mx-auto px-4 py-4 flex items-center gap-2">
            <Keyboard className="w-5 h-5 text-blue-600" />
            <div>
              <h1 className="text-lg font-bold text-gray-900">Typing Test</h1>
              <p className="text-xs text-gray-500">Check your speed and accuracy</p>
            </div>
          </div>
        </div>

        <div className="max-w-2xl mx-auto px-4 py-6 space-y-6">
          <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl p-5 text-white">
            <p className="text-blue-200 text-xs font-medium mb-1">SPEED CHALLENGE</p>
            <h2 className="text-xl font-bold mb-1">How fast can you type?</h2>
            <p className="text-blue-200 text-sm">Pick a duration and difficulty, then go.</p>
          </div>

          <div>
            <h3 className="text-sm font-bold text-gray-700 mb-3">Duration</h3>
            <div className="grid grid-cols-3 gap-3">
              {[15, 30, 60].map((d) => (
                <button
                  key={d}
                  onClick={() => setDuration(d)}
                  className={`py-3 rounded-xl border-2 font-semibold text-sm transition-all ${
                    duration === d ? "bg-blue-50 border-blue-400 text-blue-700" : "bg-white border-gray-200 text-gray-600"
                  }`}
                >
                  {d}s
                </button>
              ))}
            </div>
          </div>

          <div>
            <h3 className="text-sm font-bold text-gray-700 mb-3">Difficulty</h3>
            <div className="grid grid-cols-3 gap-3">
              {["EASY", "MEDIUM", "HARD"].map((d) => (
                <button
                  key={d}
                  onClick={() => setDifficulty(d)}
                  className={`py-3 rounded-xl border-2 font-semibold text-sm transition-all ${
                    difficulty === d ? DIFFICULTY_CONFIG[d].color + " border-2" : "bg-white border-gray-200 text-gray-600"
                  }`}
                >
                  {DIFFICULTY_CONFIG[d].label}
                </button>
              ))}
            </div>
          </div>

          <button
            onClick={startTest}
            disabled={loading}
            className="w-full py-3.5 rounded-xl font-bold text-white flex items-center justify-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 shadow-lg"
          >
            {loading ? "Loading..." : <>Start Typing Test <Zap className="w-4 h-4" /></>}
          </button>

          <Link
            href={`/centers?category=IT_TECHNOLOGY`}
            className="block bg-indigo-50 border border-indigo-200 rounded-xl p-4 text-center"
          >
            <p className="text-sm font-semibold text-indigo-800">Want to type faster professionally?</p>
            <p className="text-xs text-indigo-600 mt-0.5">Find typing & computer courses near you →</p>
          </Link>
        </div>
      </div>
    );
  }

  // ─── TYPING SCREEN ───
  if (screen === "typing") {
    const timerColor = timeLeft <= 5 ? "text-red-600" : timeLeft <= 10 ? "text-yellow-600" : "text-green-600";
    const timerBg = timeLeft <= 5 ? "bg-red-50" : timeLeft <= 10 ? "bg-yellow-50" : "bg-green-50";
    const progress = ((duration - timeLeft) / duration) * 100;

    return (
      <div className="min-h-screen bg-gray-50 pb-24">
        <div className="bg-white border-b sticky top-0 z-10">
          <div className="max-w-2xl mx-auto px-4 py-3">
            <div className="flex items-center justify-between mb-2">
              <span className={`text-xs px-2 py-0.5 rounded-full border font-medium ${DIFFICULTY_CONFIG[difficulty].color}`}>
                {DIFFICULTY_CONFIG[difficulty].label}
              </span>
              <div className={`flex items-center gap-1 px-2.5 py-1 rounded-full ${timerBg}`}>
                <Clock className={`w-3.5 h-3.5 ${timerColor}`} />
                <span className={`text-sm font-bold ${timerColor}`}>{timeLeft}s</span>
              </div>
            </div>
            <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
              <div className="h-full bg-blue-500 rounded-full transition-all duration-300" style={{ width: `${progress}%` }} />
            </div>
          </div>
        </div>

        <div className="max-w-2xl mx-auto px-4 py-6 space-y-4">
          <div className="bg-white rounded-2xl border p-5 shadow-sm text-lg leading-relaxed font-mono">
            {text.split("").map((char, i) => {
              let style = "text-gray-400";
              if (i < input.length) {
                style = input[i] === char ? "text-green-600 bg-green-50" : "text-red-600 bg-red-100";
              } else if (i === input.length) {
                style = "text-gray-900 bg-blue-100 animate-pulse";
              }
              return (
                <span key={i} className={style}>
                  {char}
                </span>
              );
            })}
          </div>

          <textarea
            ref={inputRef}
            value={input}
            onChange={handleChange}
            disabled={timeLeft <= 0}
            rows={3}
            placeholder="Start typing here..."
            className="w-full p-4 rounded-xl border-2 border-gray-200 focus:border-blue-400 focus:outline-none font-mono text-base resize-none"
          />

          <p className="text-center text-xs text-gray-400">Timer starts as soon as you type your first letter</p>
        </div>
      </div>
    );
  }

  // ─── RESULT SCREEN ───
  if (screen === "result" && finalStats) {
    const { wpm, accuracy } = finalStats;
    const emoji = wpm >= 70 ? "🏆" : wpm >= 45 ? "👍" : wpm >= 25 ? "💪" : "📚";
    const message = wpm >= 70 ? "Blazing fast!" : wpm >= 45 ? "Nice speed!" : wpm >= 25 ? "Keep practicing!" : "Don't give up!";

    return (
      <div className="min-h-screen bg-gray-50 pb-24">
        <div className="max-w-2xl mx-auto px-4 py-6 space-y-4">
          <div className="bg-gradient-to-br from-blue-500 to-indigo-500 rounded-2xl p-6 text-white text-center">
            <div className="text-5xl mb-2">{emoji}</div>
            <h2 className="text-2xl font-bold">{message}</h2>
            <div className="text-6xl font-black my-3">
              {wpm}
              <span className="text-2xl font-normal"> WPM</span>
            </div>
            <p className="text-white/80 text-sm">{accuracy}% accuracy</p>
          </div>

          {!submitted ? (
            <div className="bg-white rounded-xl border p-4 space-y-3">
              <p className="text-sm font-bold text-gray-700">Save your score to the leaderboard</p>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                maxLength={40}
                placeholder="Enter your name"
                className="w-full p-2.5 rounded-lg border border-gray-200 text-sm focus:border-blue-400 focus:outline-none"
              />
              <button
                onClick={submitScore}
                disabled={!name.trim()}
                className="w-full py-2.5 bg-blue-600 disabled:bg-gray-300 text-white rounded-lg font-semibold text-sm flex items-center justify-center gap-2"
              >
                <Trophy className="w-4 h-4" /> Submit Score
              </button>
            </div>
          ) : (
            <div className="bg-green-50 border border-green-200 rounded-xl p-3 text-center text-sm text-green-700 font-medium">
              ✅ Score submitted to the leaderboard!
            </div>
          )}

          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={shareScore}
              className="flex items-center justify-center gap-2 bg-green-600 text-white py-3 rounded-xl font-semibold text-sm"
            >
              <Share2 className="w-4 h-4" /> Share Score
            </button>
            <button
              onClick={startTest}
              className="flex items-center justify-center gap-2 bg-blue-600 text-white py-3 rounded-xl font-semibold text-sm"
            >
              <RotateCcw className="w-4 h-4" /> Try Again
            </button>
          </div>

          <div className="bg-white rounded-xl border overflow-hidden">
            <div className="px-4 py-3 border-b bg-gray-50 flex items-center gap-2">
              <Trophy className="w-4 h-4 text-yellow-500" />
              <p className="text-sm font-bold text-gray-700">
                Leaderboard — {duration}s / {DIFFICULTY_CONFIG[difficulty].label}
              </p>
            </div>
            <div className="divide-y max-h-80 overflow-y-auto">
              {leaderboardLoading && <p className="px-4 py-3 text-xs text-gray-400">Loading...</p>}
              {!leaderboardLoading && leaderboard.length === 0 && (
                <p className="px-4 py-3 text-xs text-gray-400">No scores yet — be the first!</p>
              )}
              {leaderboard.map((entry, i) => (
                <div key={entry.id} className="px-4 py-2.5 flex items-center gap-3">
                  <span
                    className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 ${
                      i === 0 ? "bg-yellow-100 text-yellow-700" : i === 1 ? "bg-gray-100 text-gray-600" : i === 2 ? "bg-orange-100 text-orange-700" : "bg-gray-50 text-gray-400"
                    }`}
                  >
                    {i + 1}
                  </span>
                  <span className="text-sm font-medium text-gray-800 flex-1 truncate">{entry.name}</span>
                  <span className="text-sm font-bold text-blue-600">{entry.wpm} WPM</span>
                  <span className="text-xs text-gray-400">{entry.accuracy}%</span>
                </div>
              ))}
            </div>
          </div>

          <button onClick={restart} className="w-full py-3 border-2 border-gray-200 rounded-xl text-gray-600 font-semibold text-sm">
            ← Back to Setup
          </button>
        </div>
      </div>
    );
  }

  return null;
}