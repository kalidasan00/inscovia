"use client";
import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { X, Send, Bot, Loader2, RotateCcw } from "lucide-react";

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

export default function AIChatWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([INITIAL_MESSAGE]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [centerCards, setCenterCards] = useState([]);
  const [error, setError] = useState(null);
  const [retryMsg, setRetryMsg] = useState(null);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);
  const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5001/api";

  useEffect(() => {
    if (isOpen) setTimeout(() => inputRef.current?.focus(), 300);
  }, [isOpen]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  const sendMessage = async (text, isRetry = false) => {
    const userText = text || input.trim();
    if (!userText || loading) return;
    setError(null);
    setRetryMsg(null);
    const newMessages = isRetry ? messages : [...messages, { role: "user", content: userText }];
    if (!isRetry) setMessages(newMessages);
    setInput("");
    setLoading(true);
    setCenterCards([]);
    try {
      const res = await fetch(`${API_URL}/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: newMessages })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setMessages(prev => [...prev, { role: "assistant", content: data.reply }]);
      if (data.centers?.length > 0) setCenterCards(data.centers);
    } catch {
      setError("Something went wrong.");
      setRetryMsg(userText);
    } finally {
      setLoading(false);
    }
  };

  const formatMessage = (text) =>
    text.split("\n").map((line, i) => (
      <span key={i}>
        {line.split(/\*\*(.*?)\*\*/g).map((part, j) =>
          j % 2 === 1 ? <strong key={j}>{part}</strong> : part
        )}
        {i < text.split("\n").length - 1 && <br />}
      </span>
    ));

  return (
    <>
      {/* Floating Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-20 right-4 md:bottom-8 md:right-8 z-50 w-14 h-14 bg-gradient-to-br from-blue-600 to-indigo-600 text-white rounded-full shadow-xl hover:scale-105 transition-transform flex items-center justify-center">
          <Bot className="w-6 h-6" />
          <span className="absolute -top-0.5 -right-0.5 w-3.5 h-3.5 bg-green-400 rounded-full border-2 border-white animate-pulse" />
        </button>
      )}

      {/* Chat Panel */}
      {isOpen && (
        <>
          {/*
            KEY FIX: On mobile we use a sheet from bottom.
            We do NOT use height/min-height — instead we use top+bottom
            so when keyboard opens, the panel shrinks naturally between
            top anchor and the keyboard top edge.
          */}

          {/* Mobile: bottom sheet anchored to top of screen */}
          <div className="md:hidden fixed inset-x-0 bottom-0 z-[60] flex flex-col bg-white"
            style={{ top: "56px" }}> {/* 56px = navbar height */}

            {/* Header */}
            <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-4 py-3 flex items-center justify-between flex-shrink-0">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center flex-shrink-0">
                  <Bot className="w-4 h-4 text-white" />
                </div>
                <div>
                  <p className="text-white font-semibold text-sm">AI Course Counsellor</p>
                  <div className="flex items-center gap-1">
                    <span className="w-1.5 h-1.5 bg-green-400 rounded-full" />
                    <span className="text-blue-200 text-[10px]">Online</span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-1">
                <button onClick={() => { setMessages([INITIAL_MESSAGE]); setCenterCards([]); setError(null); setInput(""); }}
                  className="p-2 hover:bg-white/20 rounded-lg transition-colors">
                  <RotateCcw className="w-4 h-4 text-white/80" />
                </button>
                <button onClick={() => setIsOpen(false)}
                  className="p-2 hover:bg-white/20 rounded-lg transition-colors">
                  <X className="w-4 h-4 text-white" />
                </button>
              </div>
            </div>

            {/* Messages - flex-1 fills remaining space */}
            <div className="flex-1 overflow-y-auto px-3 py-3 space-y-3 bg-gray-50 overscroll-contain">
              <MessageList
                messages={messages} loading={loading} error={error} retryMsg={retryMsg}
                centerCards={centerCards} sendMessage={sendMessage}
                formatMessage={formatMessage} setIsOpen={setIsOpen}
                messagesEndRef={messagesEndRef}
              />
            </div>

            {/* Suggested */}
            {messages.length === 1 && !loading && (
              <div className="px-3 pt-2 pb-1 bg-white border-t flex-shrink-0">
                <p className="text-[10px] text-gray-400 mb-1.5">💡 Try asking:</p>
                <div className="grid grid-cols-2 gap-1.5">
                  {SUGGESTED_QUESTIONS.map((q, i) => (
                    <button key={i} onClick={() => sendMessage(q)}
                      className="text-left text-[10px] text-blue-600 bg-blue-50 px-2 py-1.5 rounded-lg border border-blue-100 truncate">
                      {q}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Input - always visible above keyboard */}
            <div className="px-3 py-2 bg-white border-t flex-shrink-0"
              style={{ paddingBottom: "calc(0.5rem + env(safe-area-inset-bottom))" }}>
              <div className="flex gap-2 items-center">
                <input
                  ref={inputRef}
                  type="text"
                  value={input}
                  onChange={e => setInput(e.target.value)}
                  onKeyDown={e => { if (e.key === "Enter") { e.preventDefault(); sendMessage(); } }}
                  placeholder="Ask about courses..."
                  disabled={loading}
                  className="flex-1 px-3 py-2.5 border border-gray-200 rounded-xl bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
                  style={{ fontSize: "16px" }} // prevents iOS zoom
                />
                <button onClick={() => sendMessage()} disabled={!input.trim() || loading}
                  className="w-10 h-10 bg-blue-600 text-white rounded-xl flex items-center justify-center disabled:opacity-40 flex-shrink-0">
                  {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                </button>
              </div>
            </div>

          </div>

          {/* Desktop: floating window */}
          <div className="hidden md:flex fixed bottom-8 right-8 z-50 w-96 flex-col bg-white rounded-2xl shadow-2xl border overflow-hidden"
            style={{ height: "540px" }}>

            {/* Header */}
            <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-4 py-3 flex items-center justify-between flex-shrink-0">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
                  <Bot className="w-4 h-4 text-white" />
                </div>
                <div>
                  <p className="text-white font-semibold text-sm">AI Course Counsellor</p>
                  <div className="flex items-center gap-1">
                    <span className="w-1.5 h-1.5 bg-green-400 rounded-full" />
                    <span className="text-blue-200 text-[10px]">Online</span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-1">
                <button onClick={() => { setMessages([INITIAL_MESSAGE]); setCenterCards([]); setError(null); setInput(""); }}
                  className="p-1.5 hover:bg-white/20 rounded-lg transition-colors">
                  <RotateCcw className="w-3.5 h-3.5 text-white/80" />
                </button>
                <button onClick={() => setIsOpen(false)}
                  className="p-1.5 hover:bg-white/20 rounded-lg transition-colors">
                  <X className="w-4 h-4 text-white" />
                </button>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto px-3 py-3 space-y-3 bg-gray-50 overscroll-contain">
              <MessageList
                messages={messages} loading={loading} error={error} retryMsg={retryMsg}
                centerCards={centerCards} sendMessage={sendMessage}
                formatMessage={formatMessage} setIsOpen={setIsOpen}
                messagesEndRef={messagesEndRef}
              />
            </div>

            {/* Suggested */}
            {messages.length === 1 && !loading && (
              <div className="px-3 pt-2 pb-1 bg-white border-t flex-shrink-0">
                <p className="text-[10px] text-gray-400 mb-1.5">💡 Try asking:</p>
                <div className="grid grid-cols-2 gap-1.5">
                  {SUGGESTED_QUESTIONS.map((q, i) => (
                    <button key={i} onClick={() => sendMessage(q)}
                      className="text-left text-[10px] text-blue-600 bg-blue-50 px-2 py-1.5 rounded-lg border border-blue-100 truncate">
                      {q}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Input */}
            <div className="px-3 py-2.5 bg-white border-t flex-shrink-0">
              <div className="flex gap-2 items-center">
                <input
                  type="text"
                  value={input}
                  onChange={e => setInput(e.target.value)}
                  onKeyDown={e => { if (e.key === "Enter") { e.preventDefault(); sendMessage(); } }}
                  placeholder="Ask about courses, coaching, study abroad..."
                  disabled={loading}
                  className="flex-1 px-3 py-2 border border-gray-200 rounded-xl text-sm bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
                />
                <button onClick={() => sendMessage()} disabled={!input.trim() || loading}
                  className="w-9 h-9 bg-blue-600 text-white rounded-xl flex items-center justify-center disabled:opacity-40 flex-shrink-0">
                  {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                </button>
              </div>
              <p className="text-[9px] text-gray-300 mt-1 text-center">AI may make mistakes · Always verify with institutes</p>
            </div>
          </div>
        </>
      )}
    </>
  );
}

// Extracted message list to avoid duplication
function MessageList({ messages, loading, error, retryMsg, centerCards, sendMessage, formatMessage, setIsOpen, messagesEndRef }) {
  return (
    <>
      {messages.map((msg, i) => (
        <div key={i} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
          {msg.role === "assistant" && (
            <div className="w-6 h-6 bg-indigo-100 rounded-full flex items-center justify-center flex-shrink-0 mt-1 mr-1.5">
              <Bot className="w-3.5 h-3.5 text-indigo-600" />
            </div>
          )}
          <div className={`max-w-[82%] px-3 py-2 rounded-2xl text-sm leading-relaxed ${
            msg.role === "user"
              ? "bg-blue-600 text-white rounded-tr-sm"
              : "bg-white text-gray-800 shadow-sm border rounded-tl-sm"
          }`}>
            {formatMessage(msg.content)}
          </div>
        </div>
      ))}

      {loading && (
        <div className="flex justify-start">
          <div className="w-6 h-6 bg-indigo-100 rounded-full flex items-center justify-center flex-shrink-0 mt-1 mr-1.5">
            <Bot className="w-3.5 h-3.5 text-indigo-600" />
          </div>
          <div className="bg-white border shadow-sm px-3 py-2 rounded-2xl rounded-tl-sm flex items-center gap-2">
            <Loader2 className="w-3.5 h-3.5 animate-spin text-indigo-500" />
            <span className="text-sm text-gray-500">Finding best options...</span>
          </div>
        </div>
      )}

      {error && !loading && (
        <div className="flex justify-start">
          <div className="w-6 h-6 bg-red-100 rounded-full flex items-center justify-center flex-shrink-0 mt-1 mr-1.5">
            <Bot className="w-3.5 h-3.5 text-red-500" />
          </div>
          <div className="bg-red-50 border border-red-100 px-3 py-2 rounded-2xl rounded-tl-sm">
            <p className="text-sm text-red-600 mb-2">{error}</p>
            <button onClick={() => retryMsg && sendMessage(retryMsg, true)}
              className="flex items-center gap-1 text-xs font-medium text-red-600 bg-red-100 px-2.5 py-1.5 rounded-lg">
              <RotateCcw className="w-3 h-3" /> Try again
            </button>
          </div>
        </div>
      )}

      {centerCards.length > 0 && !loading && (
        <div className="space-y-2">
          <p className="text-xs text-gray-400 font-medium px-1">📍 Recommended for you:</p>
          {centerCards.map((c) => (
            <Link key={c.id} href={`/centers/${c.slug}`} onClick={() => setIsOpen(false)}
              className="block bg-white border rounded-xl p-3 hover:shadow-md hover:border-blue-200 transition-all">
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-gray-900 truncate">{c.name}</p>
                  <p className="text-xs text-gray-500">{c.city}, {c.state}</p>
                  {c.primaryCategory === "STUDY_ABROAD" && c.countries?.length > 0 && (
                    <p className="text-xs text-blue-600 mt-0.5 truncate">{c.countries.slice(0, 3).join(" · ")}</p>
                  )}
                  {c.primaryCategory !== "STUDY_ABROAD" && c.courses?.length > 0 && (
                    <p className="text-xs text-gray-400 mt-0.5 truncate">{c.courses.slice(0, 2).join(" · ")}</p>
                  )}
                </div>
                {c.rating > 0 && (
                  <span className="text-xs font-semibold text-yellow-600 bg-yellow-50 px-1.5 py-0.5 rounded flex-shrink-0">
                    ★ {c.rating}
                  </span>
                )}
              </div>
              <span className="text-xs text-blue-600 font-medium mt-1.5 block">View Profile →</span>
            </Link>
          ))}
        </div>
      )}

      <div ref={messagesEndRef} />
    </>
  );
}