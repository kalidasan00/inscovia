"use client";
import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import {
  Calculator, Brain, BookOpen, Clock, RotateCcw, Share2, CheckCircle2,
  XCircle, ArrowRight, Flame, ChevronRight, Trophy,
} from "lucide-react";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5001/api";

const TOPIC_CONFIG = {
  Quantitative: { icon: Calculator, desc: "Numbers, percentages, profit & loss" },
  Logical: { icon: Brain, desc: "Reasoning, patterns, puzzles" },
  Verbal: { icon: BookOpen, desc: "English, vocabulary, grammar" },
};

const DIFFICULTY_LABELS = { EASY: "Easy", MEDIUM: "Medium", HARD: "Hard" };

// ─── localStorage helpers ───

function getStreak() {
  if (typeof window === "undefined") return { count: 0, lastDate: null };
  try {
    return JSON.parse(localStorage.getItem("inscovia_streak") || '{"count":0,"lastDate":null}');
  } catch {
    return { count: 0, lastDate: null };
  }
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
  try {
    return parseInt(localStorage.getItem(`best_${key}`) || "0");
  } catch {
    return 0;
  }
}
function saveBestScore(key, score) {
  if (typeof window === "undefined") return;
  if (score > getBestScore(key)) localStorage.setItem(`best_${key}`, score.toString());
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
  const [answers, setAnswers] = useState([]);
  const [timeLeft, setTimeLeft] = useState(30);
  const [timerActive, setTimerActive] = useState(false);
  const [loading, setLoading] = useState(false);
  const [quizError, setQuizError] = useState(null);
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
    const t = setTimeout(() => setTimeLeft((t) => t - 1), 1000);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
    setQuizError(null);
    try {
      const params = new URLSearchParams({ limit: questionCount });
      if (selectedTopic) params.append("topic", selectedTopic);
      if (selectedSubtopic !== "All") params.append("subtopic", selectedSubtopic);
      if (selectedDifficulty !== "All") params.append("difficulty", selectedDifficulty);

      const url = `${API_URL}/aptitude/questions?${params}`;
      console.log("[Practice] Fetching:", url);

      const res = await fetch(url);
      const data = await res.json();
      console.log("[Practice] Response:", res.status, data);

      if (data.success && data.questions && data.questions.length > 0) {
        setQuestions(data.questions);
        setCurrentQ(0);
        setAnswers([]);
        setSelected(null);
        setShowExplanation(false);
        setTimeLeft(30);
        setTimerActive(true);
        setScreen("quiz");
      } else if (data.success && (!data.questions || data.questions.length === 0)) {
        setQuizError(
          `No questions found for this combination${selectedTopic ? ` (${selectedTopic}${selectedSubtopic !== "All" ? " / " + selectedSubtopic : ""}${selectedDifficulty !== "All" ? " / " + selectedDifficulty : ""})` : ""}. Try a different topic, subtopic, or difficulty.`
        );
      } else {
        setQuizError(data.error || "The server returned an unexpected response. Check the console for details.");
      }
    } catch (err) {
      console.error("[Practice] Failed to fetch questions:", err);
      setQuizError("Couldn't reach the server. Check your connection and try again.");
    }
    setLoading(false);
  };

  const handleAnswer = useCallback(
    (option) => {
      if (selected !== null) return;
      setTimerActive(false);
      setSelected(option);
      setShowExplanation(true);

      const q = questions[currentQ];
      const correct = option === q.answer;
      setAnswers((prev) => [...prev, { question: q.question, selected: option, correct: q.answer, isCorrect: correct }]);
    },
    [selected, questions, currentQ]
  );

  const nextQuestion = () => {
    if (currentQ + 1 >= questions.length) {
      // Quiz done. `answers` already includes this last question (handleAnswer
      // pushed it before the Next button rendered) — don't double-count it here.
      const finalScore = answers.filter((a) => a.isCorrect).length;
      const key = `${selectedTopic || "all"}_${selectedSubtopic}`;
      saveBestScore(key, finalScore);
      setStreak(updateStreak());
      setScreen("result");
    } else {
      setCurrentQ((q) => q + 1);
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
    const finalScore = answers.filter((a) => a.isCorrect).length;
    const text = `I scored ${finalScore}/${questions.length} on ${selectedTopic || "Mixed"} Aptitude on Inscovia!\n${streak} day streak\nTry it: https://inscovia.com/practice`;
    if (navigator.share) navigator.share({ title: "My Aptitude Score", text });
    else {
      navigator.clipboard.writeText(text);
      alert("Score copied!");
    }
  };

  const currentQuestion = questions[currentQ];
  const finalScore = answers.filter((a) => a.isCorrect).length;
  const subtopics = selectedTopic ? topics.find((t) => t.topic === selectedTopic)?.subtopics || [] : [];

  // ─── HOME ───
  if (screen === "home") {
    return (
      <div className="min-h-screen bg-[#fafafa]">
        <div className="max-w-xl mx-auto px-6 pt-16 pb-24">
          <div className="flex items-center justify-between mb-10">
            <div>
              <p className="text-xs font-medium text-gray-400 tracking-widest uppercase mb-1">Practice Zone</p>
              <h1 className="text-2xl font-semibold text-gray-900">sharpen your skills</h1>
            </div>
            {streak > 0 && (
              <div className="flex items-center gap-1.5 bg-white border border-gray-200 px-3 py-1.5 rounded-full">
                <Flame className="w-3.5 h-3.5 text-orange-400" />
                <span className="text-xs font-medium text-gray-600">{streak} day streak</span>
              </div>
            )}
          </div>

          {quizError && (
            <div className="mb-6 text-sm text-red-600 bg-red-50 border border-red-100 rounded-xl px-4 py-3">
              {quizError}
            </div>
          )}

          {/* Quick start */}
          <button
            onClick={() => {
              setSelectedTopic(null);
              setQuestionCount(10);
              startQuiz();
            }}
            disabled={loading}
            className="w-full mb-8 flex items-center justify-between px-5 py-4 bg-gray-900 text-white rounded-2xl hover:bg-gray-700 transition-colors disabled:opacity-70"
          >
            <div className="text-left">
              <p className="text-sm font-medium">Quick start — mixed topics</p>
              <p className="text-xs text-gray-400 mt-0.5">10 questions · 30 sec each</p>
            </div>
            {loading ? <span className="text-xs">loading...</span> : <ArrowRight className="w-4 h-4 flex-shrink-0" />}
          </button>

          {/* Topics */}
          <p className="text-xs font-medium text-gray-500 mb-3">choose a topic</p>
          <div className="space-y-2 mb-8">
            {Object.entries(TOPIC_CONFIG).map(([topic, config]) => {
              const Icon = config.icon;
              const topicData = topics.find((t) => t.topic === topic);
              const isSelected = selectedTopic === topic;
              return (
                <button
                  key={topic}
                  onClick={() => setSelectedTopic(isSelected ? null : topic)}
                  className={`w-full text-left p-4 rounded-2xl border transition-colors ${
                    isSelected ? "bg-white border-gray-900" : "bg-white border-gray-200 hover:border-gray-300"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-gray-50 flex items-center justify-center flex-shrink-0">
                        <Icon className="w-4 h-4 text-gray-700" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900">{topic}</p>
                        <p className="text-xs text-gray-400">{config.desc}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      {topicData && <span className="text-xs text-gray-300">{topicData.count} Qs</span>}
                      <ChevronRight className={`w-4 h-4 text-gray-300 transition-transform ${isSelected ? "rotate-90" : ""}`} />
                    </div>
                  </div>

                  {isSelected && subtopics.length > 0 && (
                    <div className="mt-3 pt-3 border-t border-gray-100">
                      <div className="flex flex-wrap gap-1.5">
                        {["All", ...subtopics].map((sub) => (
                          <button
                            key={sub}
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedSubtopic(sub);
                            }}
                            className={`text-xs px-2.5 py-1 rounded-full border transition-colors ${
                              selectedSubtopic === sub
                                ? "bg-gray-900 text-white border-gray-900"
                                : "bg-white border-gray-200 text-gray-500"
                            }`}
                          >
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

          {/* Difficulty + count */}
          <div className="grid grid-cols-2 gap-6 mb-8">
            <div>
              <p className="text-xs font-medium text-gray-500 mb-2">difficulty</p>
              <div className="flex flex-wrap gap-1.5">
                {["All", "EASY", "MEDIUM", "HARD"].map((d) => (
                  <button
                    key={d}
                    onClick={() => setSelectedDifficulty(d)}
                    className={`text-xs px-3 py-1.5 rounded-full border transition-colors ${
                      selectedDifficulty === d ? "bg-gray-900 text-white border-gray-900" : "bg-white border-gray-200 text-gray-500"
                    }`}
                  >
                    {d === "All" ? "All" : DIFFICULTY_LABELS[d]}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <p className="text-xs font-medium text-gray-500 mb-2">questions</p>
              <div className="flex flex-wrap gap-1.5">
                {[5, 10, 15, 20].map((n) => (
                  <button
                    key={n}
                    onClick={() => setQuestionCount(n)}
                    className={`text-xs px-3 py-1.5 rounded-full border transition-colors ${
                      questionCount === n ? "bg-gray-900 text-white border-gray-900" : "bg-white border-gray-200 text-gray-500"
                    }`}
                  >
                    {n}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {selectedTopic && (
            <button
              onClick={startQuiz}
              disabled={loading}
              className="w-full py-3.5 rounded-full font-medium text-white bg-gray-900 hover:bg-gray-700 transition-colors flex items-center justify-center gap-2 disabled:opacity-70"
            >
              {loading ? "loading..." : <>start {selectedTopic.toLowerCase()} quiz <ArrowRight className="w-4 h-4" /></>}
            </button>
          )}

          {topics.length > 0 && (
            <div className="mt-8 pt-8 border-t border-gray-200">
              <p className="text-xs font-medium text-gray-500 mb-3">question bank</p>
              <div className="grid grid-cols-3 gap-3 text-center">
                {topics.map((t) => (
                  <div key={t.topic}>
                    <p className="text-lg font-semibold text-gray-900">{t.count}</p>
                    <p className="text-xs text-gray-400">{t.topic}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  // ─── QUIZ ───
  if (screen === "quiz" && currentQuestion) {
    const progress = (currentQ / questions.length) * 100;
    const timerColor = timeLeft <= 10 ? "text-red-500" : "text-gray-400";
    const options = [
      { key: "A", value: currentQuestion.optionA },
      { key: "B", value: currentQuestion.optionB },
      { key: "C", value: currentQuestion.optionC },
      { key: "D", value: currentQuestion.optionD },
    ];

    return (
      <div className="min-h-screen bg-[#fafafa]">
        <div className="bg-white border-b border-gray-100 sticky top-0 z-10">
          <div className="max-w-xl mx-auto px-6 py-3">
            <div className="flex items-center justify-between mb-2 text-xs">
              <span className="text-gray-400">
                {currentQ + 1} / {questions.length}
              </span>
              <div className="flex items-center gap-3">
                <span className="text-gray-400">score {finalScore}/{currentQ}</span>
                <span className={`flex items-center gap-1 font-mono font-medium ${timerColor}`}>
                  <Clock className="w-3 h-3" /> {timeLeft}s
                </span>
              </div>
            </div>
            <div className="h-1 bg-gray-100 rounded-full overflow-hidden">
              <div className="h-full bg-gray-900 rounded-full transition-all duration-300" style={{ width: `${progress}%` }} />
            </div>
          </div>
        </div>

        <div className="max-w-xl mx-auto px-6 py-8 space-y-4">
          <div className="flex items-center gap-2">
            <span className="text-xs px-2 py-0.5 rounded-full border border-gray-200 text-gray-500 font-medium">
              {DIFFICULTY_LABELS[currentQuestion.difficulty] || currentQuestion.difficulty}
            </span>
            <span className="text-xs text-gray-300">{currentQuestion.subtopic}</span>
          </div>

          <p className="text-base font-medium text-gray-900 leading-relaxed">{currentQuestion.question}</p>

          <div className="space-y-2 pt-2">
            {options.map(({ key, value }) => {
              let style = "bg-white border-gray-200 text-gray-700 hover:border-gray-400";
              if (selected !== null) {
                if (key === currentQuestion.answer) style = "bg-green-50 border-green-300 text-green-800";
                else if (key === selected) style = "bg-red-50 border-red-300 text-red-700";
                else style = "bg-white border-gray-100 text-gray-300";
              }
              return (
                <button
                  key={key}
                  onClick={() => handleAnswer(key)}
                  disabled={selected !== null}
                  className={`w-full text-left px-4 py-3 rounded-xl border transition-colors flex items-center gap-3 ${style}`}
                >
                  <span className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium bg-gray-50 flex-shrink-0">
                    {key}
                  </span>
                  <span className="text-sm flex-1">{value}</span>
                  {selected !== null && key === currentQuestion.answer && <CheckCircle2 className="w-4 h-4 text-green-500 flex-shrink-0" />}
                  {selected !== null && key === selected && selected !== currentQuestion.answer && (
                    <XCircle className="w-4 h-4 text-red-400 flex-shrink-0" />
                  )}
                </button>
              );
            })}
          </div>

          {showExplanation && (
            <div className="bg-white border border-gray-200 rounded-xl p-4">
              <p className="text-xs font-medium text-gray-500 mb-1">explanation</p>
              <p className="text-sm text-gray-600 leading-relaxed">{currentQuestion.explanation}</p>
            </div>
          )}

          {selected !== null && (
            <button
              onClick={nextQuestion}
              className="w-full py-3 bg-gray-900 text-white rounded-full font-medium text-sm flex items-center justify-center gap-2 hover:bg-gray-700 transition-colors"
            >
              {currentQ + 1 >= questions.length ? "see results" : "next question"}
              <ArrowRight className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    );
  }

  // ─── RESULT ───
  if (screen === "result") {
    const percentage = Math.round((finalScore / questions.length) * 100);
    const message =
      percentage >= 80 ? "Excellent!" : percentage >= 60 ? "Good job!" : percentage >= 40 ? "Keep practicing!" : "Don't give up!";

    return (
      <div className="min-h-screen bg-[#fafafa] px-6 py-16">
        <div className="max-w-xl mx-auto text-center">
          <p className="text-xs font-medium text-gray-400 tracking-widest uppercase mb-4">Result</p>
          <p className="text-lg font-medium text-gray-900 mb-2">{message}</p>
          <div className="text-6xl font-semibold text-gray-900 mb-1">
            {finalScore}
            <span className="text-2xl font-normal text-gray-300">/{questions.length}</span>
          </div>
          <p className="text-sm text-gray-400">{percentage}% correct</p>

          {streak > 0 && (
            <div className="inline-flex items-center gap-1.5 mt-4 bg-white border border-gray-200 rounded-full px-3 py-1.5">
              <Flame className="w-3.5 h-3.5 text-orange-400" />
              <span className="text-xs font-medium text-gray-600">{streak} day streak</span>
            </div>
          )}

          <div className="flex items-center justify-center gap-3 mt-8">
            <button
              onClick={shareScore}
              className="flex items-center gap-1.5 px-4 py-2 border border-gray-200 rounded-full text-sm text-gray-700 hover:bg-white transition-colors"
            >
              <Share2 className="w-3.5 h-3.5" /> share
            </button>
            <button
              onClick={startQuiz}
              className="flex items-center gap-1.5 px-4 py-2 border border-gray-200 rounded-full text-sm text-gray-700 hover:bg-white transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5" /> try again
            </button>
          </div>

          <div className="mt-10 text-left">
            <p className="text-xs font-medium text-gray-500 mb-3">answer review</p>
            <div className="bg-white rounded-2xl border border-gray-200 divide-y divide-gray-100 max-h-80 overflow-y-auto">
              {answers.map((a, i) => (
                <div key={i} className="px-4 py-3 flex items-start gap-3">
                  <div className="mt-0.5 flex-shrink-0">
                    {a.isCorrect ? <CheckCircle2 className="w-4 h-4 text-green-500" /> : <XCircle className="w-4 h-4 text-red-400" />}
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs text-gray-700 line-clamp-2">{a.question}</p>
                    {!a.isCorrect && <p className="text-xs text-green-600 mt-0.5">Correct: {a.correct}</p>}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <Link
            href={`/centers?category=${selectedTopic === "Quantitative" || selectedTopic === "Logical" ? "COMPETITIVE_EXAMS" : "LANGUAGE_TRAINING"}`}
            className="mt-8 block bg-white border border-gray-200 rounded-2xl p-4 text-center"
          >
            <p className="text-sm font-medium text-gray-900">want to improve faster?</p>
            <p className="text-xs text-gray-400 mt-0.5">find the best coaching centers near you →</p>
          </Link>

          <button onClick={restartQuiz} className="mt-6 text-xs text-gray-400 hover:text-gray-600">
            ← back to topics
          </button>
        </div>
      </div>
    );
  }

  return null;
}