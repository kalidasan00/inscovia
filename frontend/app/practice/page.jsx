"use client";
import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { Trophy, Zap, Clock, ChevronRight, RotateCcw, Share2, BookOpen, Brain, MessageSquare, CheckCircle, XCircle, ArrowRight, Flame, Star } from "lucide-react";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5001/api";

const TOPIC_CONFIG = {
  Quantitative: {
    icon: "🔢",
    color: "from-blue-500 to-cyan-500",
    bg: "bg-blue-50",
    border: "border-blue-200",
    text: "text-blue-700",
    desc: "Numbers, percentages, profit & loss"
  },
  Logical: {
    icon: "🧠",
    color: "from-purple-500 to-violet-500",
    bg: "bg-purple-50",
    border: "border-purple-200",
    text: "text-purple-700",
    desc: "Reasoning, patterns, puzzles"
  },
  Verbal: {
    icon: "📝",
    color: "from-emerald-500 to-green-500",
    bg: "bg-emerald-50",
    border: "border-emerald-200",
    text: "text-emerald-700",
    desc: "English, vocabulary, grammar"
  }
};

const DIFFICULTY_CONFIG = {
  EASY: { label: "Easy", color: "text-green-600 bg-green-50 border-green-200" },
  MEDIUM: { label: "Medium", color: "text-yellow-600 bg-yellow-50 border-yellow-200" },
  HARD: { label: "Hard", color: "text-red-600 bg-red-50 border-red-200" },
};

// Get streak from localStorage
function getStreak() {
  if (typeof window === "undefined") return { count: 0, lastDate: null };
  try {
    return JSON.parse(localStorage.getItem("inscovia_streak") || '{"count":0,"lastDate":null}');
  } catch { return { count: 0, lastDate: null }; }
}

function updateStreak() {
  const today = new Date().toDateString();
  const streak = getStreak();
  if (streak.lastDate === today) return streak.count;
  const yesterday = new Date(Date.now() - 86400000).toDateString();
  const newCount = streak.lastDate === yesterday ? streak.count + 1 : 1;
  localStorage.setItem("inscovia_streak", JSON.stringify({ count: newCount, lastDate: today }));
  return newCount;
}

function getBestScore(key) {
  if (typeof window === "undefined") return 0;
  try { return parseInt(localStorage.getItem(`best_${key}`) || "0"); }
  catch { return 0; }
}

function saveBestScore(key, score) {
  if (typeof window === "undefined") return;
  const best = getBestScore(key);
  if (score > best) localStorage.setItem(`best_${key}`, score.toString());
}

export default function PracticePage() {
  const [screen, setScreen] = useState("home"); // home | quiz | result
  const [topics, setTopics] = useState([]);
  const [selectedTopic, setSelectedTopic] = useState(null);
  const [selectedSubtopic, setSelectedSubtopic] = useState("All");
  const [selectedDifficulty, setSelectedDifficulty] = useState("All");
  const [questions, setQuestions] = useState([]);
  const [currentQ, setCurrentQ] = useState(0);
  const [selected, setSelected] = useState(null);
  const [showExplanation, setShowExplanation] = useState(false);
  const [score, setScore] = useState(0);
  const [answers, setAnswers] = useState([]);
  const [timeLeft, setTimeLeft] = useState(30);
  const [timerActive, setTimerActive] = useState(false);
  const [loading, setLoading] = useState(false);
  const [streak, setStreak] = useState(0);
  const [questionCount, setQuestionCount] = useState(10);

  useEffect(() => {
    setStreak(getStreak().count);
    fetchTopics();
  }, []);

  // Timer
  useEffect(() => {
    if (!timerActive || timeLeft <= 0) {
      if (timeLeft <= 0 && timerActive) handleAnswer(null); // auto-skip
      return;
    }
    const t = setTimeout(() => setTimeLeft(t => t - 1), 1000);
    return () => clearTimeout(t);
  }, [timeLeft, timerActive]);

  const fetchTopics = async () => {
    try {
      const res = await fetch(`${API_URL}/aptitude/topics`);
      const data = await res.json();
      if (data.success) setTopics(data.topics);
    } catch (err) {
      console.error("Failed to fetch topics", err);
    }
  };

  const startQuiz = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ limit: questionCount });
      if (selectedTopic) params.append("topic", selectedTopic);
      if (selectedSubtopic !== "All") params.append("subtopic", selectedSubtopic);
      if (selectedDifficulty !== "All") params.append("difficulty", selectedDifficulty);

      const res = await fetch(`${API_URL}/aptitude/questions?${params}`);
      const data = await res.json();

      if (data.success && data.questions.length > 0) {
        setQuestions(data.questions);
        setCurrentQ(0);
        setScore(0);
        setAnswers([]);
        setSelected(null);
        setShowExplanation(false);
        setTimeLeft(30);
        setTimerActive(true);
        setScreen("quiz");
      }
    } catch (err) {
      console.error("Failed to fetch questions", err);
    }
    setLoading(false);
  };

  const handleAnswer = useCallback((option) => {
    if (selected !== null) return;
    setTimerActive(false);
    setSelected(option);
    setShowExplanation(true);

    const q = questions[currentQ];
    const correct = option === q.answer;
    if (correct) setScore(s => s + 1);
    setAnswers(prev => [...prev, { question: q.question, selected: option, correct: q.answer, isCorrect: correct }]);
  }, [selected, questions, currentQ]);

  const nextQuestion = () => {
    if (currentQ + 1 >= questions.length) {
      // Quiz done
      const finalScore = answers.filter(a => a.isCorrect).length + (selected === questions[currentQ]?.answer ? 1 : 0);
      const key = `${selectedTopic || "all"}_${selectedSubtopic}`;
      saveBestScore(key, finalScore);
      const newStreak = updateStreak();
      setStreak(newStreak);
      setScreen("result");
    } else {
      setCurrentQ(q => q + 1);
      setSelected(null);
      setShowExplanation(false);
      setTimeLeft(30);
      setTimerActive(true);
    }
  };

  const restartQuiz = () => {
    setScreen("home");
    setSelectedTopic(null);
    setSelectedSubtopic("All");
    setSelectedDifficulty("All");
  };

  const shareScore = () => {
    const finalScore = answers.filter(a => a.isCorrect).length;
    const text = `🎯 I scored ${finalScore}/${questions.length} on ${selectedTopic || "Mixed"} Aptitude on Inscovia!\n🔥 ${streak} day streak\nTry it: https://inscovia.com/practice`;
    if (navigator.share) {
      navigator.share({ title: "My Aptitude Score", text });
    } else {
      navigator.clipboard.writeText(text);
      alert("Score copied! Share it on WhatsApp 🚀");
    }
  };

  const currentQuestion = questions[currentQ];
  const finalScore = answers.filter(a => a.isCorrect).length;
  const subtopics = selectedTopic ? (topics.find(t => t.topic === selectedTopic)?.subtopics || []) : [];

  // ─── HOME SCREEN ───
  if (screen === "home") {
    return (
      <div className="min-h-screen bg-gray-50 pb-24">
        {/* Header */}
        <div className="bg-white border-b sticky top-0 z-10">
          <div className="max-w-2xl mx-auto px-4 py-4 flex items-center justify-between">
            <div>
              <h1 className="text-lg font-bold text-gray-900">Practice Zone</h1>
              <p className="text-xs text-gray-500">Sharpen your skills daily</p>
            </div>
            {streak > 0 && (
              <div className="flex items-center gap-1.5 bg-orange-50 border border-orange-200 px-3 py-1.5 rounded-full">
                <Flame className="w-4 h-4 text-orange-500" />
                <span className="text-sm font-bold text-orange-600">{streak} day streak</span>
              </div>
            )}
          </div>
        </div>

        <div className="max-w-2xl mx-auto px-4 py-6 space-y-6">

          {/* Quick start banner */}
          <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl p-5 text-white">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-blue-200 text-xs font-medium mb-1">DAILY CHALLENGE</p>
                <h2 className="text-xl font-bold mb-1">Ready to practice?</h2>
                <p className="text-blue-200 text-sm">10 questions · 30 sec each · Instant feedback</p>
              </div>
              <div className="text-4xl">🎯</div>
            </div>
            <button
              onClick={() => { setSelectedTopic(null); setQuestionCount(10); startQuiz(); }}
              disabled={loading}
              className="mt-4 w-full bg-white text-blue-600 font-bold py-2.5 rounded-xl flex items-center justify-center gap-2 hover:bg-blue-50 transition-colors">
              {loading ? "Loading..." : <>Quick Start — Mixed Topics <ArrowRight className="w-4 h-4" /></>}
            </button>
          </div>

          {/* Topic cards */}
          <div>
            <h3 className="text-sm font-bold text-gray-700 mb-3">Choose a Topic</h3>
            <div className="grid gap-3">
              {Object.entries(TOPIC_CONFIG).map(([topic, config]) => {
                const topicData = topics.find(t => t.topic === topic);
                return (
                  <button key={topic}
                    onClick={() => setSelectedTopic(selectedTopic === topic ? null : topic)}
                    className={`w-full text-left p-4 rounded-xl border-2 transition-all ${
                      selectedTopic === topic
                        ? `${config.bg} ${config.border}`
                        : "bg-white border-gray-200 hover:border-gray-300"
                    }`}>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <span className="text-2xl">{config.icon}</span>
                        <div>
                          <p className={`font-semibold text-sm ${selectedTopic === topic ? config.text : "text-gray-900"}`}>{topic}</p>
                          <p className="text-xs text-gray-500">{config.desc}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {topicData && <span className="text-xs text-gray-400">{topicData.count} Qs</span>}
                        <ChevronRight className={`w-4 h-4 transition-transform ${selectedTopic === topic ? "rotate-90 " + config.text : "text-gray-400"}`} />
                      </div>
                    </div>

                    {/* Subtopics */}
                    {selectedTopic === topic && subtopics.length > 0 && (
                      <div className="mt-3 pt-3 border-t border-gray-200">
                        <p className="text-xs text-gray-500 mb-2">Select subtopic:</p>
                        <div className="flex flex-wrap gap-1.5">
                          {["All", ...subtopics].map(sub => (
                            <button key={sub}
                              onClick={(e) => { e.stopPropagation(); setSelectedSubtopic(sub); }}
                              className={`text-xs px-2.5 py-1 rounded-lg border transition-colors ${
                                selectedSubtopic === sub
                                  ? `${config.bg} ${config.border} ${config.text} font-medium`
                                  : "bg-white border-gray-200 text-gray-600"
                              }`}>
                              {sub}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Difficulty + Count */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <p className="text-xs font-bold text-gray-700 mb-2">Difficulty</p>
              <div className="flex flex-col gap-1.5">
                {["All", "EASY", "MEDIUM", "HARD"].map(d => (
                  <button key={d}
                    onClick={() => setSelectedDifficulty(d)}
                    className={`text-xs px-3 py-1.5 rounded-lg border transition-colors text-left ${
                      selectedDifficulty === d
                        ? "bg-gray-900 text-white border-gray-900"
                        : "bg-white border-gray-200 text-gray-600"
                    }`}>
                    {d === "All" ? "All Levels" : DIFFICULTY_CONFIG[d].label}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <p className="text-xs font-bold text-gray-700 mb-2">Questions</p>
              <div className="flex flex-col gap-1.5">
                {[5, 10, 15, 20].map(n => (
                  <button key={n}
                    onClick={() => setQuestionCount(n)}
                    className={`text-xs px-3 py-1.5 rounded-lg border transition-colors text-left ${
                      questionCount === n
                        ? "bg-gray-900 text-white border-gray-900"
                        : "bg-white border-gray-200 text-gray-600"
                    }`}>
                    {n} Questions
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Start button */}
          {selectedTopic && (
            <button onClick={startQuiz} disabled={loading}
              className={`w-full py-3.5 rounded-xl font-bold text-white flex items-center justify-center gap-2 bg-gradient-to-r ${TOPIC_CONFIG[selectedTopic].color} shadow-lg`}>
              {loading ? "Loading..." : <>Start {selectedTopic} Quiz <Zap className="w-4 h-4" /></>}
            </button>
          )}

          {/* Stats */}
          {topics.length > 0 && (
            <div className="bg-white rounded-xl border p-4">
              <p className="text-xs font-bold text-gray-700 mb-3">📊 Question Bank</p>
              <div className="grid grid-cols-3 gap-3 text-center">
                {topics.map(t => (
                  <div key={t.topic}>
                    <p className="text-lg font-bold text-gray-900">{t.count}</p>
                    <p className="text-xs text-gray-500">{t.topic}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  // ─── QUIZ SCREEN ───
  if (screen === "quiz" && currentQuestion) {
    const progress = ((currentQ) / questions.length) * 100;
    const timerColor = timeLeft <= 10 ? "text-red-600" : timeLeft <= 20 ? "text-yellow-600" : "text-green-600";
    const timerBg = timeLeft <= 10 ? "bg-red-50" : timeLeft <= 20 ? "bg-yellow-50" : "bg-green-50";
    const options = [
      { key: "A", value: currentQuestion.optionA },
      { key: "B", value: currentQuestion.optionB },
      { key: "C", value: currentQuestion.optionC },
      { key: "D", value: currentQuestion.optionD },
    ];

    return (
      <div className="min-h-screen bg-gray-50 pb-24">
        {/* Top bar */}
        <div className="bg-white border-b sticky top-0 z-10">
          <div className="max-w-2xl mx-auto px-4 py-3">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-medium text-gray-500">
                Question {currentQ + 1} of {questions.length}
              </span>
              <div className="flex items-center gap-3">
                <span className="text-xs font-medium text-blue-600">Score: {score}/{currentQ}</span>
                <div className={`flex items-center gap-1 px-2.5 py-1 rounded-full ${timerBg}`}>
                  <Clock className={`w-3.5 h-3.5 ${timerColor}`} />
                  <span className={`text-sm font-bold ${timerColor}`}>{timeLeft}s</span>
                </div>
              </div>
            </div>
            {/* Progress bar */}
            <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
              <div className="h-full bg-blue-500 rounded-full transition-all duration-300"
                style={{ width: `${progress}%` }} />
            </div>
          </div>
        </div>

        <div className="max-w-2xl mx-auto px-4 py-5 space-y-4">
          {/* Difficulty badge */}
          <div className="flex items-center gap-2">
            <span className={`text-xs px-2 py-0.5 rounded-full border font-medium ${DIFFICULTY_CONFIG[currentQuestion.difficulty]?.color}`}>
              {currentQuestion.difficulty}
            </span>
            <span className="text-xs text-gray-400">{currentQuestion.subtopic}</span>
          </div>

          {/* Question */}
          <div className="bg-white rounded-2xl border p-5 shadow-sm">
            <p className="text-base font-semibold text-gray-900 leading-relaxed">
              {currentQuestion.question}
            </p>
          </div>

          {/* Options */}
          <div className="space-y-2.5">
            {options.map(({ key, value }) => {
              let style = "bg-white border-gray-200 text-gray-800 hover:border-blue-400 hover:bg-blue-50";
              if (selected !== null) {
                if (key === currentQuestion.answer) style = "bg-green-50 border-green-400 text-green-800";
                else if (key === selected && selected !== currentQuestion.answer) style = "bg-red-50 border-red-400 text-red-800";
                else style = "bg-white border-gray-200 text-gray-400";
              }
              return (
                <button key={key}
                  onClick={() => handleAnswer(key)}
                  disabled={selected !== null}
                  className={`w-full text-left p-3.5 rounded-xl border-2 transition-all flex items-center gap-3 ${style}`}>
                  <span className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 ${
                    selected !== null && key === currentQuestion.answer ? "bg-green-500 text-white" :
                    selected !== null && key === selected ? "bg-red-500 text-white" :
                    "bg-gray-100 text-gray-600"
                  }`}>{key}</span>
                  <span className="text-sm">{value}</span>
                  {selected !== null && key === currentQuestion.answer && (
                    <CheckCircle className="w-5 h-5 text-green-500 ml-auto flex-shrink-0" />
                  )}
                  {selected !== null && key === selected && selected !== currentQuestion.answer && (
                    <XCircle className="w-5 h-5 text-red-500 ml-auto flex-shrink-0" />
                  )}
                </button>
              );
            })}
          </div>

          {/* Explanation */}
          {showExplanation && (
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
              <p className="text-xs font-bold text-amber-700 mb-1">💡 Explanation</p>
              <p className="text-sm text-amber-800">{currentQuestion.explanation}</p>
            </div>
          )}

          {/* Next button */}
          {selected !== null && (
            <button onClick={nextQuestion}
              className="w-full py-3.5 bg-blue-600 text-white rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-blue-700 transition-colors">
              {currentQ + 1 >= questions.length ? "See Results 🎉" : "Next Question"}
              <ArrowRight className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    );
  }

  // ─── RESULT SCREEN ───
  if (screen === "result") {
    const percentage = Math.round((finalScore / questions.length) * 100);
    const emoji = percentage >= 80 ? "🏆" : percentage >= 60 ? "👍" : percentage >= 40 ? "💪" : "📚";
    const message = percentage >= 80 ? "Excellent!" : percentage >= 60 ? "Good job!" : percentage >= 40 ? "Keep practicing!" : "Don't give up!";
    const bgColor = percentage >= 80 ? "from-yellow-400 to-orange-400" : percentage >= 60 ? "from-green-400 to-emerald-400" : "from-blue-400 to-indigo-400";

    return (
      <div className="min-h-screen bg-gray-50 pb-24">
        <div className="max-w-2xl mx-auto px-4 py-6 space-y-4">
          {/* Score card */}
          <div className={`bg-gradient-to-br ${bgColor} rounded-2xl p-6 text-white text-center`}>
            <div className="text-5xl mb-2">{emoji}</div>
            <h2 className="text-2xl font-bold">{message}</h2>
            <div className="text-6xl font-black my-3">{finalScore}<span className="text-3xl font-normal">/{questions.length}</span></div>
            <p className="text-white/80 text-sm">{percentage}% correct</p>
            {streak > 0 && (
              <div className="mt-3 flex items-center justify-center gap-1.5 bg-white/20 rounded-full px-3 py-1.5">
                <Flame className="w-4 h-4" />
                <span className="text-sm font-bold">{streak} day streak! 🔥</span>
              </div>
            )}
          </div>

          {/* Action buttons */}
          <div className="grid grid-cols-2 gap-3">
            <button onClick={shareScore}
              className="flex items-center justify-center gap-2 bg-green-600 text-white py-3 rounded-xl font-semibold text-sm">
              <Share2 className="w-4 h-4" /> Share Score
            </button>
            <button onClick={startQuiz}
              className="flex items-center justify-center gap-2 bg-blue-600 text-white py-3 rounded-xl font-semibold text-sm">
              <RotateCcw className="w-4 h-4" /> Try Again
            </button>
          </div>

          {/* Answer review */}
          <div className="bg-white rounded-xl border overflow-hidden">
            <div className="px-4 py-3 border-b bg-gray-50">
              <p className="text-sm font-bold text-gray-700">Answer Review</p>
            </div>
            <div className="divide-y max-h-80 overflow-y-auto">
              {answers.map((a, i) => (
                <div key={i} className="px-4 py-3 flex items-start gap-3">
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 ${a.isCorrect ? "bg-green-100" : "bg-red-100"}`}>
                    {a.isCorrect
                      ? <CheckCircle className="w-4 h-4 text-green-600" />
                      : <XCircle className="w-4 h-4 text-red-600" />}
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs text-gray-700 line-clamp-2">{a.question}</p>
                    {!a.isCorrect && (
                      <p className="text-xs text-green-600 mt-0.5">Correct: {a.correct}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Find coaching CTA */}
          <Link href={`/centers?category=${selectedTopic === "Quantitative" || selectedTopic === "Logical" ? "COMPETITIVE_EXAMS" : "LANGUAGE_TRAINING"}`}
            className="block bg-indigo-50 border border-indigo-200 rounded-xl p-4 text-center">
            <p className="text-sm font-semibold text-indigo-800">Want to improve faster?</p>
            <p className="text-xs text-indigo-600 mt-0.5">Find the best coaching centers near you →</p>
          </Link>

          <button onClick={restartQuiz}
            className="w-full py-3 border-2 border-gray-200 rounded-xl text-gray-600 font-semibold text-sm">
            ← Back to Topics
          </button>
        </div>
      </div>
    );
  }

  return null;
}