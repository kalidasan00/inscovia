"use client";
import { useState, useEffect, useRef, useCallback } from "react";
import Link from "next/link";
import dynamic from "next/dynamic";
import {
  Zap, RotateCcw, Share2, Trophy, Lock, TrendingUp, Target, AlertCircle, RefreshCw,
} from "lucide-react";

// recharts is only needed for logged-in users with history — code-split it out
// so guests (and first-time visitors) don't pay for that bundle.
const ProgressChart = dynamic(() => import("./ProgressChart"), {
  ssr: false,
  loading: () => <div className="h-32 flex items-center justify-center text-xs text-gray-400">loading chart…</div>,
});

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5001/api";
const GUEST_ATTEMPT_KEY = "inscovia_typing_guest_used";
const FALLBACK_TEXT =
  "The quick brown fox jumps over the lazy dog while practicing typing speed and accuracy every single day.";

// ─── localStorage helpers ───

function getSavedName() {
  if (typeof window === "undefined") return "";
  return localStorage.getItem("inscovia_typing_name") || "";
}
function saveName(name) {
  if (typeof window === "undefined") return;
  localStorage.setItem("inscovia_typing_name", name);
}
// Matches the auth pattern used in Navbar.jsx: userData (JSON) + userLoggedIn flag
function getCurrentUser() {
  if (typeof window === "undefined") return null;
  try {
    if (localStorage.getItem("userLoggedIn") !== "true") return null;
    const raw = localStorage.getItem("userData");
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}
function hasUsedGuestAttempt() {
  if (typeof window === "undefined") return false;
  return localStorage.getItem(GUEST_ATTEMPT_KEY) === "true";
}
function markGuestAttemptUsed() {
  if (typeof window === "undefined") return;
  localStorage.setItem(GUEST_ATTEMPT_KEY, "true");
}

export default function TypingTestPage() {
  const [screen, setScreen] = useState("home"); // home | typing | result | locked
  const [duration, setDuration] = useState(30);
  const [difficulty, setDifficulty] = useState("MEDIUM");
  const [text, setText] = useState("");
  const [input, setInput] = useState("");
  const [timeLeft, setTimeLeft] = useState(30);
  const [started, setStarted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [passageError, setPassageError] = useState(false);
  const [liveWpm, setLiveWpm] = useState(0);
  const [finalStats, setFinalStats] = useState(null);
  const [name, setName] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [submitError, setSubmitError] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [leaderboard, setLeaderboard] = useState([]);
  const [leaderboardLoading, setLeaderboardLoading] = useState(false);
  const [leaderboardError, setLeaderboardError] = useState(false);
  const [leaderboardScope, setLeaderboardScope] = useState("all");
  const [history, setHistory] = useState([]);
  const [historyBest, setHistoryBest] = useState(null);
  const [user, setUser] = useState(null);

  const inputRef = useRef(null);
  const startTimeRef = useRef(null);
  const finishedRef = useRef(false); // guards against double-finish races
  const abortRefs = useRef({}); // named AbortControllers per in-flight request

  const isLoggedIn = !!user?.id;

  // Keep `user` fresh: re-read on mount, on tab focus, and on cross-tab storage
  // changes (e.g. user logs in on another tab, or via the /user-menu redirect).
  useEffect(() => {
    const sync = () => setUser(getCurrentUser());
    sync();
    window.addEventListener("focus", sync);
    window.addEventListener("storage", sync);
    return () => {
      window.removeEventListener("focus", sync);
      window.removeEventListener("storage", sync);
    };
  }, []);

  useEffect(() => {
    setName(user?.name || getSavedName());
    if (isLoggedIn) fetchHistory(user.id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isLoggedIn]);

  // Cleanup any in-flight requests on unmount
  useEffect(() => {
    return () => {
      Object.values(abortRefs.current).forEach((c) => c?.abort());
    };
  }, []);

  // ─── Timer: elapsed-time based (Date.now diff) instead of a naive
  // decrementing counter, so backgrounded/throttled tabs don't drift. ───
  useEffect(() => {
    if (!started) return;
    const tick = () => {
      const elapsed = (Date.now() - startTimeRef.current) / 1000;
      const remaining = Math.max(duration - Math.floor(elapsed), 0);
      setTimeLeft(remaining);
      let correct = 0;
      for (let i = 0; i < input.length; i++) if (input[i] === text[i]) correct++;
      setLiveWpm(elapsed > 0 ? Math.round(correct / 5 / (elapsed / 60)) : 0);
      if (remaining <= 0) finishTest();
    };
    const interval = setInterval(tick, 250);
    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [started, input]);

  const withAbort = (key) => {
    abortRefs.current[key]?.abort();
    const controller = new AbortController();
    abortRefs.current[key] = controller;
    return controller;
  };

  const fetchPassage = async (diff) => {
    setLoading(true);
    setPassageError(false);
    const controller = withAbort("passage");
    try {
      const res = await fetch(`${API_URL}/typing/text?difficulty=${diff}`, { signal: controller.signal });
      const data = await res.json();
      if (data.success) setText(data.text);
      else throw new Error("Bad response");
    } catch (err) {
      if (err.name === "AbortError") return;
      console.error("Failed to fetch passage", err);
      setText(FALLBACK_TEXT);
      setPassageError(true);
    } finally {
      setLoading(false);
    }
  };

  const fetchHistory = async (userId) => {
    const controller = withAbort("history");
    try {
      const res = await fetch(`${API_URL}/typing/history?userId=${userId}&limit=30`, { signal: controller.signal });
      const data = await res.json();
      if (data.success) {
        setHistory(
          data.history.map((h) => ({
            ...h,
            date: new Date(h.createdAt).toLocaleDateString(undefined, { month: "short", day: "numeric" }),
          }))
        );
        setHistoryBest(data.best);
      }
    } catch (err) {
      if (err.name === "AbortError") return;
      console.error("Failed to fetch history", err);
    }
  };

  const startTest = async () => {
    // Guest gate: only 1 free attempt ever (soft client-side gate — the
    // real limit should also be enforced server-side on /typing/submit).
    if (!isLoggedIn && hasUsedGuestAttempt()) {
      setScreen("locked");
      return;
    }
    finishedRef.current = false;
    await fetchPassage(difficulty);
    setInput("");
    setTimeLeft(duration);
    setStarted(false);
    setLiveWpm(0);
    setFinalStats(null);
    setSubmitted(false);
    setSubmitError(false);
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
      if (finishedRef.current) return; // prevent double-finish from timer + handleChange racing
      finishedRef.current = true;

      const typed = finalInput !== undefined ? finalInput : input;
      const elapsedSeconds = startTimeRef.current
        ? Math.max((Date.now() - startTimeRef.current) / 1000, 1)
        : duration - timeLeft || 1;

      let correct = 0, errors = 0;
      for (let i = 0; i < typed.length; i++) {
        if (typed[i] === text[i]) correct++; else errors++;
      }
      const wpm = Math.round(correct / 5 / (elapsedSeconds / 60));
      const accuracy = typed.length > 0 ? Math.round((correct / typed.length) * 1000) / 10 : 0;

      setStarted(false);
      setFinalStats({ wpm: Math.max(wpm, 0), accuracy, errors, charsTyped: typed.length });
      if (!isLoggedIn) markGuestAttemptUsed();
      setScreen("result");
      fetchLeaderboard(leaderboardScope);
    },
    [input, text, duration, timeLeft, isLoggedIn, leaderboardScope]
  );

  const submitScore = async () => {
    if (!name.trim() || !finalStats || submitting) return;
    saveName(name.trim());
    setSubmitError(false);
    setSubmitting(true);
    try {
      const res = await fetch(`${API_URL}/typing/submit`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          userId: user?.id || null,
          wpm: finalStats.wpm,
          accuracy: finalStats.accuracy,
          duration, difficulty,
          errors: finalStats.errors,
        }),
      });
      if (!res.ok) throw new Error("Submit failed");
      setSubmitted(true);
      fetchLeaderboard(leaderboardScope);
      if (isLoggedIn) fetchHistory(user.id);
    } catch (err) {
      console.error("Failed to submit score", err);
      setSubmitError(true);
    } finally {
      setSubmitting(false);
    }
  };

  // Auto-submit as soon as we land on the result screen, provided we
  // already know the person's name (logged-in user, or a guest who's
  // submitted a name before). Guests submitting for the very first time
  // still see a one-time name prompt below.
  useEffect(() => {
    if (screen === "result" && finalStats && name.trim() && !submitted && !submitError && !submitting) {
      submitScore();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [screen, finalStats]);

  const fetchLeaderboard = async (scope = "all") => {
    setLeaderboardLoading(true);
    setLeaderboardError(false);
    const controller = withAbort("leaderboard");
    try {
      const res = await fetch(
        `${API_URL}/typing/leaderboard?duration=${duration}&difficulty=${difficulty}&limit=10&scope=${scope}`,
        { signal: controller.signal }
      );
      const data = await res.json();
      if (data.success) setLeaderboard(data.leaderboard);
      else throw new Error("Bad response");
    } catch (err) {
      if (err.name === "AbortError") return;
      console.error("Failed to fetch leaderboard", err);
      setLeaderboardError(true);
    } finally {
      setLeaderboardLoading(false);
    }
  };

  const changeLeaderboardScope = (scope) => {
    setLeaderboardScope(scope);
    fetchLeaderboard(scope);
  };

  const shareScore = () => {
    if (!finalStats) return;
    const origin = typeof window !== "undefined" ? window.location.origin : "https://inscovia.com";
    const shareText = `⌨️ I typed at ${finalStats.wpm} WPM with ${finalStats.accuracy}% accuracy on Inscovia's Typing Test!\nTry it: ${origin}/typing-test`;
    if (navigator.share) {
      navigator.share({ title: "My Typing Score", text: shareText }).catch(() => {});
    } else {
      navigator.clipboard.writeText(shareText);
      alert("Copied to clipboard!");
    }
  };

  const restart = () => {
    setScreen("home");
    setStarted(false);
    setInput("");
    setFinalStats(null);
  };

  const focusInput = () => inputRef.current?.focus();

  // ─── LOCKED ───
  if (screen === "locked") {
    return (
      <div className="min-h-screen bg-[#fafafa] flex items-center justify-center px-4">
        <div className="text-center max-w-sm space-y-4">
          <Lock className="w-8 h-8 text-gray-300 mx-auto" />
          <h2 className="text-lg font-medium text-gray-900">You've used your free test</h2>
          <p className="text-sm text-gray-400">Sign in for unlimited tests and progress tracking.</p>
          <Link href="/user-menu" className="inline-block px-5 py-2 bg-gray-900 text-white rounded-full text-sm font-medium hover:bg-gray-700 transition-colors">
            Sign in
          </Link>
          <button onClick={() => setScreen("home")} className="block mx-auto text-xs text-gray-400 hover:text-gray-600">
            ← back
          </button>
        </div>
      </div>
    );
  }

  // ─── HOME ───
  if (screen === "home") {
    return (
      <div className="min-h-screen bg-[#fafafa]">
        <div className="max-w-xl mx-auto px-6 pt-16 pb-24 flex flex-col items-center text-center">
          <p className="text-xs font-medium text-gray-400 tracking-widest uppercase mb-2">Typing Test</p>
          <h1 className="text-3xl font-semibold text-gray-900 mb-1">how fast do you type?</h1>
          <p className="text-sm text-gray-400 mb-10">
            {isLoggedIn ? "unlimited tests · progress tracked" : "1 free test as a guest"}
          </p>

          {!isLoggedIn && hasUsedGuestAttempt() && (
            <div className="w-full mb-6 text-sm text-amber-700 bg-amber-50 rounded-lg px-4 py-2.5 flex items-center justify-between">
              <span>Free test used</span>
              <Link href="/user-menu" className="font-medium underline">sign in</Link>
            </div>
          )}

          {isLoggedIn && history.length > 0 && (
            <div className="w-full mb-8 text-left">
              <div className="flex items-center gap-2 mb-2">
                <TrendingUp className="w-3.5 h-3.5 text-gray-400" />
                <p className="text-xs font-medium text-gray-500">your progress</p>
                {historyBest && <span className="ml-auto text-xs text-gray-400">best <b className="text-gray-700">{historyBest.wpm}</b> wpm</span>}
              </div>
              <ProgressChart history={history} />
            </div>
          )}

          {/* Duration pills */}
          <div className="flex items-center gap-1 bg-white border border-gray-200 rounded-full p-1 mb-3">
            {[15, 30, 60].map((d) => (
              <button key={d} onClick={() => setDuration(d)}
                className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
                  duration === d ? "bg-gray-900 text-white" : "text-gray-500 hover:text-gray-900"
                }`}>
                {d}s
              </button>
            ))}
          </div>

          {/* Difficulty pills */}
          <div className="flex items-center gap-1 bg-white border border-gray-200 rounded-full p-1 mb-10">
            {["EASY", "MEDIUM", "HARD"].map((d) => (
              <button key={d} onClick={() => setDifficulty(d)}
                className={`px-4 py-1.5 rounded-full text-sm font-medium capitalize transition-colors ${
                  difficulty === d ? "bg-gray-900 text-white" : "text-gray-500 hover:text-gray-900"
                }`}>
                {d.toLowerCase()}
              </button>
            ))}
          </div>

          <button onClick={startTest} disabled={loading}
            className="flex items-center gap-2 px-8 py-3 bg-gray-900 text-white rounded-full font-medium text-sm hover:bg-gray-700 transition-colors disabled:opacity-70">
            {loading ? "loading..." : <>start test <Zap className="w-4 h-4" /></>}
          </button>

          <Link href="/centers?category=IT_TECHNOLOGY" className="mt-12 text-xs text-gray-400 hover:text-gray-600 flex items-center gap-1.5">
            <Target className="w-3 h-3" /> want to type faster? find typing courses near you →
          </Link>
        </div>
      </div>
    );
  }

  // ─── TYPING ───
  if (screen === "typing") {
    const timerColor = timeLeft <= 5 ? "text-red-500" : "text-gray-400";

    return (
      <div className="min-h-screen bg-[#fafafa] flex flex-col items-center justify-center px-6" onClick={focusInput}>
        <div className="w-full max-w-2xl">
          {passageError && (
            <div className="flex items-center gap-2 text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2 mb-4">
              <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
              Couldn't load a fresh passage — using a default one instead.
            </div>
          )}

          <div className="flex items-center justify-between mb-6 text-sm">
            <span className={`font-mono font-medium ${timerColor}`} aria-live="polite">{timeLeft}</span>
            <span className="font-mono text-gray-400">{started ? `${liveWpm} wpm` : "start typing..."}</span>
          </div>

          <div className="relative text-2xl leading-relaxed font-mono select-none tracking-wide" aria-live="off">
            {text.split("").map((char, i) => {
              let style = "text-gray-300";
              if (i < input.length) style = input[i] === char ? "text-gray-900" : "text-red-400 bg-red-50";
              else if (i === input.length) style = "text-gray-900 border-l-2 border-gray-900 animate-pulse";
              return <span key={i} className={style}>{char}</span>;
            })}
          </div>

          {/* Off-screen live region so screen readers hear progress without
              re-announcing every character span above. */}
          <p className="sr-only" aria-live="polite">
            {input.length} of {text.length} characters typed, {timeLeft} seconds remaining.
          </p>

          <label htmlFor="typing-input" className="sr-only">Typing input</label>
          <textarea
            id="typing-input"
            ref={inputRef}
            value={input}
            onChange={handleChange}
            disabled={timeLeft <= 0}
            className="absolute opacity-0 pointer-events-none"
            autoFocus
          />

          <p className="mt-8 text-center text-xs text-gray-300">click anywhere and start typing</p>
        </div>
      </div>
    );
  }

  // ─── RESULT ───
  if (screen === "result" && finalStats) {
    const { wpm, accuracy } = finalStats;
    const guestLocked = !isLoggedIn && hasUsedGuestAttempt();

    return (
      <div className="min-h-screen bg-[#fafafa] px-6 py-16">
        <div className="max-w-xl mx-auto text-center">
          <p className="text-xs font-medium text-gray-400 tracking-widest uppercase mb-4">Result</p>
          <div className="flex items-end justify-center gap-10 mb-2">
            <div>
              <p className="text-6xl font-semibold text-gray-900 leading-none">{wpm}</p>
              <p className="text-xs text-gray-400 mt-1">wpm</p>
            </div>
            <div>
              <p className="text-6xl font-semibold text-gray-300 leading-none">{accuracy}%</p>
              <p className="text-xs text-gray-400 mt-1">accuracy</p>
            </div>
          </div>

          {!name.trim() && !submitted ? (
            // First-ever guest submission: we don't have a name yet, so ask once.
            // It's saved to localStorage and every test after this auto-submits.
            <div className="max-w-xs mx-auto mt-8 space-y-2.5">
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                maxLength={40}
                placeholder="your name"
                className="w-full text-center px-4 py-2.5 rounded-full border border-gray-200 text-sm focus:outline-none focus:border-gray-400"
              />
              <button
                onClick={submitScore}
                disabled={!name.trim() || submitting}
                className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-gray-900 disabled:bg-gray-200 text-white rounded-full text-sm font-medium"
              >
                <Trophy className="w-3.5 h-3.5" /> {submitting ? "saving..." : "save to leaderboard"}
              </button>
            </div>
          ) : submitted ? (
            <p className="mt-8 text-sm text-green-600">✓ saved to leaderboard</p>
          ) : submitting ? (
            <p className="mt-8 text-sm text-gray-400 flex items-center justify-center gap-2">
              <RefreshCw className="w-3.5 h-3.5 animate-spin" /> submitting...
            </p>
          ) : null}

          {submitError && (
            <div className="max-w-xs mx-auto mt-4 flex items-center justify-between gap-2 text-xs text-red-600 bg-red-50 border border-red-100 rounded-lg px-3 py-2">
              <span className="flex items-center gap-1.5">
                <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" /> couldn't submit
              </span>
              <button onClick={submitScore} className="font-semibold underline flex-shrink-0">retry</button>
            </div>
          )}

          {guestLocked && (
            <div className="max-w-xs mx-auto mt-6 bg-white border border-gray-200 rounded-2xl p-4 text-center">
              <p className="text-sm font-medium text-gray-900">that was your free test 🎉</p>
              <p className="text-xs text-gray-400 mt-1 mb-3">sign in for unlimited tests + progress graph</p>
              <Link href="/user-menu" className="inline-block px-4 py-1.5 bg-gray-900 text-white rounded-full text-xs font-medium">
                sign in
              </Link>
            </div>
          )}

          <div className="flex items-center justify-center gap-3 mt-8">
            <button onClick={startTest} disabled={guestLocked}
              className="flex items-center gap-1.5 px-4 py-2 border border-gray-200 disabled:opacity-40 rounded-full text-sm text-gray-700 hover:bg-white transition-colors">
              <RotateCcw className="w-3.5 h-3.5" /> try again
            </button>
            <button onClick={shareScore}
              className="flex items-center gap-1.5 px-4 py-2 border border-gray-200 rounded-full text-sm text-gray-700 hover:bg-white transition-colors">
              <Share2 className="w-3.5 h-3.5" /> share
            </button>
          </div>

          {/* Leaderboard */}
          <div className="mt-14 text-left">
            <div className="flex items-center justify-between mb-3">
              <p className="text-xs font-medium text-gray-500 flex items-center gap-1.5">
                <Trophy className="w-3.5 h-3.5 text-gray-400" /> leaderboard · {duration}s / {difficulty.toLowerCase()}
              </p>
              <div className="flex items-center gap-1 bg-white border border-gray-200 rounded-full p-0.5">
                {[{ key: "all", label: "all-time" }, { key: "week", label: "week" }].map((opt) => (
                  <button key={opt.key} onClick={() => changeLeaderboardScope(opt.key)}
                    className={`px-2.5 py-1 rounded-full text-[11px] font-medium transition-colors ${
                      leaderboardScope === opt.key ? "bg-gray-900 text-white" : "text-gray-400"
                    }`}>
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>
            <div className="bg-white rounded-2xl border border-gray-200 divide-y divide-gray-100 overflow-hidden">
              {leaderboardLoading && <p className="px-4 py-3 text-xs text-gray-400">loading...</p>}
              {!leaderboardLoading && leaderboardError && (
                <div className="px-4 py-3 flex items-center justify-between gap-2">
                  <span className="text-xs text-red-600 flex items-center gap-1.5">
                    <AlertCircle className="w-3.5 h-3.5" /> couldn't load leaderboard
                  </span>
                  <button onClick={() => fetchLeaderboard(leaderboardScope)} className="text-xs font-semibold text-gray-900 flex items-center gap-1">
                    <RefreshCw className="w-3 h-3" /> retry
                  </button>
                </div>
              )}
              {!leaderboardLoading && !leaderboardError && leaderboard.length === 0 && (
                <p className="px-4 py-3 text-xs text-gray-400">no scores yet — be the first</p>
              )}
              {leaderboard.map((entry, i) => (
                <div key={entry.id} className="px-4 py-2.5 flex items-center gap-3 text-sm">
                  <span className="w-5 text-xs text-gray-300 font-mono">{i + 1}</span>
                  <span className="flex-1 truncate text-gray-800 flex items-center gap-1.5">
                    {entry.name}
                    {entry.userId && <span className="text-[9px] px-1.5 py-0.5 bg-gray-100 text-gray-500 rounded-full font-semibold">verified</span>}
                  </span>
                  <span className="font-mono font-medium text-gray-900">{entry.wpm}</span>
                  <span className="text-xs text-gray-400 w-10 text-right">{entry.accuracy}%</span>
                </div>
              ))}
            </div>
          </div>

          <button onClick={restart} className="mt-8 text-xs text-gray-400 hover:text-gray-600">
            ← back to setup
          </button>
        </div>
      </div>
    );
  }

  return null;
}