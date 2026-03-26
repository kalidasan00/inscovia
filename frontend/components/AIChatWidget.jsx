// components/AIChatWidget.js - FINAL
"use client";
import { useState, useRef, useEffect } from "react";
import Link from "next/link";
// ✅ Sparkles removed, Bot added
import { X, Send, Loader2, RotateCcw, Bot, Star, AlertCircle } from "lucide-react";

const SUGGESTED_QUESTIONS = [
  "Best JEE coaching in Kerala?",
  "I want to study in Canada",
  "Python course in Kozhikode?",
  "Best MBA coaching near me?",
];

const INITIAL_MESSAGE = {
  role: "assistant",
  content: "Hi! 👋 I'm your AI Course Counsellor.\n\nTell me your **goal** and **location** — I'll find the best institutes for you!"
};

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5001/api";
const MAX_MESSAGES = 20;

export default function AIChatWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([INITIAL_MESSAGE]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [centerCards, setCenterCards] = useState([]);
  const [error, setError] = useState(null);
  const [retryMsg, setRetryMsg] = useState(null);
  const [navbarHeight, setNavbarHeight] = useState(64);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);
  const timeoutRef = useRef(null);

  useEffect(() => {
    if (isOpen) setTimeout(() => inputRef.current?.focus(), 300);
  }, [isOpen]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading, centerCards]);

  useEffect(() => {
    if (!isOpen) return;
    const nav = document.querySelector("nav");
    setNavbarHeight(nav?.offsetHeight || 64);
  }, [isOpen]);

  useEffect(() => {
    return () => { if (timeoutRef.current) clearTimeout(timeoutRef.current); };
  }, []);

  const sendMessage = async (text, isRetry = false) => {
    const userText = text || input.trim();
    if (!userText || loading) return;

    setError(null);
    setRetryMsg(null);
    setInput("");
    setCenterCards([]);

    const updatedMessages = isRetry
      ? messages
      : [...messages, { role: "user", content: userText }];

    if (!isRetry) setMessages(updatedMessages);

    const trimmedMessages = [
      INITIAL_MESSAGE,
      ...updatedMessages.slice(1).slice(-MAX_MESSAGES),
    ];

    setLoading(true);

    timeoutRef.current = setTimeout(() => {
      setLoading(false);
      setError("Request timed out. Please try again.");
      setRetryMsg(userText);
    }, 15000);

    try {
      const res = await fetch(`${API_URL}/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: trimmedMessages }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      setMessages(prev => {
        const updated = [...prev, { role: "assistant", content: data.reply }];
        return [INITIAL_MESSAGE, ...updated.slice(1).slice(-MAX_MESSAGES)];
      });

      if (data.centers?.length > 0) setCenterCards(data.centers);
    } catch (err) {
      if (err.name !== "AbortError") {
        setError("Something went wrong.");
        setRetryMsg(userText);
      }
    } finally {
      clearTimeout(timeoutRef.current);
      setLoading(false);
    }
  };

  const resetChat = () => {
    setMessages([INITIAL_MESSAGE]);
    setCenterCards([]);
    setError(null);
    setInput("");
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    setLoading(false);
  };

  const formatMessage = (text) =>
    text.split("\n").map((line, i, arr) => (
      <span key={i}>
        {line.split(/\*\*(.*?)\*\*/g).map((part, j) =>
          j % 2 === 1 ? <strong key={j} className="font-semibold">{part}</strong> : part
        )}
        {i < arr.length - 1 && <br />}
      </span>
    ));

  const showSuggestions = messages.length === 1 && !loading;
  const userMessageCount = messages.filter(m => m.role === "user").length;
  const remainingMessages = MAX_MESSAGES - userMessageCount;
  const nearLimit = remainingMessages <= 5 && remainingMessages > 0;

  return (
    <>
      {/* ── Floating Button ── */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          aria-label="Open AI Chat"
          className="fixed bottom-20 right-4 md:bottom-8 md:right-8 z-50 w-14 h-14 rounded-full flex items-center justify-center shadow-xl transition-transform duration-200 hover:scale-110 bg-gradient-to-br from-indigo-600 to-purple-600"
        >
          <span className="absolute w-14 h-14 rounded-full animate-ping bg-indigo-500 opacity-20" />
          {/* ✅ Bot icon */}
          <Bot className="relative w-7 h-7 text-white" />
          <span className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-emerald-400 rounded-full border-2 border-white" />
        </button>
      )}

      {isOpen && (
        <>
          {/* ====== MOBILE ====== */}
          <div
            className="md:hidden fixed inset-x-0 z-[60] flex flex-col overflow-hidden"
            style={{
              top: `${navbarHeight}px`,
              height: `calc(100dvh - ${navbarHeight}px)`,
              background: "#0f0f13",
            }}
          >
            <ChatHeader onReset={resetChat} onClose={() => setIsOpen(false)} />
            <div className="flex-1 overflow-y-auto px-3 py-4 space-y-3 overscroll-contain">
              <MessageList
                messages={messages}
                loading={loading}
                error={error}
                retryMsg={retryMsg}
                centerCards={centerCards}
                sendMessage={sendMessage}
                formatMessage={formatMessage}
                setIsOpen={setIsOpen}
                messagesEndRef={messagesEndRef}
              />
            </div>
            {showSuggestions && <SuggestedQuestions onSelect={sendMessage} />}
            {nearLimit && (
              <p className="text-[10px] text-yellow-400/60 text-center pb-1">
                {remainingMessages} messages remaining · Reset to start fresh
              </p>
            )}
            <ChatInput
              inputRef={inputRef}
              input={input}
              setInput={setInput}
              loading={loading}
              onSend={sendMessage}
              mobile
            />
          </div>

          {/* ====== DESKTOP ====== */}
          <div
            className="hidden md:flex fixed right-8 bottom-8 z-50 w-[380px] flex-col rounded-2xl overflow-hidden shadow-2xl"
            style={{
              height: "560px",
              background: "#0f0f13",
              border: "1px solid rgba(255,255,255,0.1)",
            }}
          >
            <ChatHeader onReset={resetChat} onClose={() => setIsOpen(false)} />
            <div className="flex-1 overflow-y-auto px-3 py-4 space-y-3 overscroll-contain">
              <MessageList
                messages={messages}
                loading={loading}
                error={error}
                retryMsg={retryMsg}
                centerCards={centerCards}
                sendMessage={sendMessage}
                formatMessage={formatMessage}
                setIsOpen={setIsOpen}
                messagesEndRef={messagesEndRef}
              />
            </div>
            {showSuggestions && <SuggestedQuestions onSelect={sendMessage} />}
            {nearLimit && (
              <p className="text-[10px] text-yellow-400/60 text-center pb-1">
                {remainingMessages} messages remaining · Reset to start fresh
              </p>
            )}
            <ChatInput
              input={input}
              setInput={setInput}
              loading={loading}
              onSend={sendMessage}
            />
          </div>
        </>
      )}
    </>
  );
}

// ─── Sub-components ───────────────────────────────────

function ChatHeader({ onReset, onClose }) {
  return (
    <div className="flex-shrink-0 flex items-center justify-between px-4 py-3 border-b border-white/10 bg-gradient-to-r from-indigo-600 to-purple-600">
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded-full bg-white/15 flex items-center justify-center">
          {/* ✅ Bot icon in header */}
          <Bot className="w-4 h-4 text-white" />
        </div>
        <div>
          <p className="text-white font-semibold text-sm tracking-tight">AI Course Counsellor</p>
          <div className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse" />
            <span className="text-indigo-200 text-[10px]">Online · Powered by AI</span>
          </div>
        </div>
      </div>
      <div className="flex items-center gap-1">
        <button onClick={onReset}
          className="p-2 hover:bg-white/10 rounded-lg transition-colors"
          title="Reset chat">
          <RotateCcw className="w-4 h-4 text-white/70" />
        </button>
        <button onClick={onClose}
          className="p-2 hover:bg-white/10 rounded-lg transition-colors">
          <X className="w-4 h-4 text-white" />
        </button>
      </div>
    </div>
  );
}

function SuggestedQuestions({ onSelect }) {
  return (
    <div className="flex-shrink-0 px-3 pt-2 pb-1 border-t border-white/10">
      <p className="text-[10px] text-white/30 mb-2">💡 Try asking:</p>
      <div className="grid grid-cols-2 gap-1.5">
        {SUGGESTED_QUESTIONS.map((q, i) => (
          <button key={i} onClick={() => onSelect(q)}
            className="text-left text-[11px] text-indigo-300 bg-white/5 hover:bg-white/10 px-2.5 py-2 rounded-xl border border-white/10 truncate transition-colors">
            {q}
          </button>
        ))}
      </div>
    </div>
  );
}

function ChatInput({ inputRef, input, setInput, loading, onSend, mobile }) {
  return (
    <div
      className="flex-shrink-0 px-3 py-3 border-t border-white/10"
      style={mobile ? { paddingBottom: "max(12px, env(safe-area-inset-bottom))" } : {}}
    >
      <div className="flex gap-2 items-center">
        <input
          ref={inputRef}
          type="text"
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => { if (e.key === "Enter") { e.preventDefault(); onSend(); } }}
          placeholder={mobile ? "Ask about courses..." : "Ask about courses, coaching, study abroad..."}
          disabled={loading}
          className="flex-1 px-4 py-3 rounded-xl text-white placeholder-white/30 focus:outline-none focus:ring-1 focus:ring-indigo-500 disabled:opacity-40"
          style={{
            fontSize: "16px",
            background: "rgba(255,255,255,0.08)",
            border: "1px solid rgba(255,255,255,0.12)",
          }}
        />
        <button
          onClick={() => onSend()}
          disabled={!input.trim() || loading}
          className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 disabled:opacity-30 transition-opacity bg-gradient-to-br from-indigo-600 to-purple-600"
        >
          {loading
            ? <Loader2 className="w-4 h-4 text-white animate-spin" />
            : <Send className="w-4 h-4 text-white" />
          }
        </button>
      </div>
      <p className="text-[9px] text-white/15 text-center mt-2">
        AI may make mistakes · Always verify with institutes
      </p>
    </div>
  );
}

function MessageList({
  messages, loading, error, retryMsg, centerCards,
  sendMessage, formatMessage, setIsOpen, messagesEndRef,
}) {
  // ✅ Bot icon in AI message avatar
  const aiAvatar = (
    <div className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 mt-1 mr-1.5 bg-gradient-to-br from-indigo-600 to-purple-600">
      <Bot className="w-3 h-3 text-white" />
    </div>
  );

  return (
    <>
      {messages.map((msg, i) => (
        <div key={i} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
          {msg.role === "assistant" && aiAvatar}
          <div
            className={`max-w-[82%] px-3.5 py-2.5 rounded-2xl text-sm leading-relaxed ${
              msg.role === "user"
                ? "text-white rounded-tr-sm bg-gradient-to-br from-indigo-600 to-purple-600"
                : "text-gray-100 rounded-tl-sm"
            }`}
            style={
              msg.role !== "user"
                ? { background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.1)" }
                : {}
            }
          >
            {formatMessage(msg.content)}
          </div>
        </div>
      ))}

      {loading && (
        <div className="flex justify-start items-center gap-2">
          {aiAvatar}
          <div
            className="px-4 py-3 rounded-2xl rounded-tl-sm flex items-center gap-1.5"
            style={{ background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.1)" }}
          >
            {[0, 1, 2].map(i => (
              <span key={i} className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce"
                style={{ animationDelay: `${i * 0.15}s` }} />
            ))}
          </div>
        </div>
      )}

      {error && !loading && (
        <div className="flex justify-start">
          <div className="w-6 h-6 rounded-full bg-red-500/20 flex items-center justify-center flex-shrink-0 mt-1 mr-1.5">
            <AlertCircle className="w-3.5 h-3.5 text-red-400" />
          </div>
          <div
            className="px-3.5 py-2.5 rounded-2xl rounded-tl-sm"
            style={{ background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.2)" }}
          >
            <p className="text-sm text-red-400 mb-2">{error}</p>
            <button
              onClick={() => retryMsg && sendMessage(retryMsg, true)}
              className="flex items-center gap-1.5 text-xs font-medium text-red-400 bg-red-500/10 hover:bg-red-500/20 px-2.5 py-1.5 rounded-lg transition-colors"
            >
              <RotateCcw className="w-3 h-3" /> Try again
            </button>
          </div>
        </div>
      )}

      {centerCards.length > 0 && !loading && (
        <div className="space-y-2">
          <p className="text-xs text-white/30 font-medium px-1">📍 Recommended for you:</p>
          {centerCards.map(c => (
            <Link key={c.id} href={`/centers/${c.slug}`}
              onClick={() => setIsOpen(false)}
              className="block rounded-xl p-3 transition-all group hover:border-indigo-500/50"
              style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)" }}
            >
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-white truncate">{c.name}</p>
                  <p className="text-xs text-white/40 mt-0.5">{c.city}, {c.state}</p>
                  {c.primaryCategory === "STUDY_ABROAD" && c.countries?.length > 0 && (
                    <p className="text-xs text-indigo-400 mt-0.5 truncate">
                      {c.countries.slice(0, 3).join(" · ")}
                    </p>
                  )}
                  {c.primaryCategory !== "STUDY_ABROAD" && c.courses?.length > 0 && (
                    <p className="text-xs text-white/30 mt-0.5 truncate">
                      {c.courses.slice(0, 2).join(" · ")}
                    </p>
                  )}
                </div>
                {c.rating > 0 && (
                  <span className="flex items-center gap-0.5 text-xs font-bold text-yellow-400 bg-yellow-400/10 px-2 py-1 rounded-lg flex-shrink-0">
                    <Star className="w-3 h-3 fill-yellow-400" /> {c.rating}
                  </span>
                )}
              </div>
              <p className="text-xs text-indigo-400 font-medium mt-2 group-hover:text-indigo-300 transition-colors">
                View Profile →
              </p>
            </Link>
          ))}
        </div>
      )}

      <div ref={messagesEndRef} />
    </>
  );
}