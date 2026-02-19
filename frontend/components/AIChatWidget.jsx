"use client";
import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { X, Send, Bot, Loader2, RotateCcw, Minimize2 } from "lucide-react";

const SUGGESTED_QUESTIONS = [
  "I want to crack JEE, which coaching should I join?",
  "Best IELTS coaching in Kozhikode?",
  "I want to study in Canada, what should I do?",
  "Suggest a good Python course near me",
];

const INITIAL_MESSAGE = {
  role: "assistant",
  content: "Hi! 👋 I'm your AI Course Counsellor. Tell me your **goal** and **location** and I'll recommend the best institutes for you!\n\nWhat are you looking for?"
};

export default function AIChatWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
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
    if (isOpen && !isMinimized) {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isOpen, isMinimized]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading, centerCards]);

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
      if (!res.ok) throw new Error(data.error || "Failed");
      setMessages(prev => [...prev, { role: "assistant", content: data.reply }]);
      if (data.centers?.length > 0) setCenterCards(data.centers);
    } catch (err) {
      setError("Couldn't get a response.");
      setRetryMsg(userText);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const handleClearChat = () => {
    setMessages([INITIAL_MESSAGE]);
    setCenterCards([]);
    setError(null);
    setRetryMsg(null);
    setInput("");
  };

  const formatMessage = (text) => {
    return text.split("\n").map((line, i) => (
      <span key={i}>
        {line.split(/\*\*(.*?)\*\*/g).map((part, j) =>
          j % 2 === 1 ? <strong key={j}>{part}</strong> : part
        )}
        {i < text.split("\n").length - 1 && <br />}
      </span>
    ));
  };

  const ChatContent = () => (
    <>
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-4 py-3 flex items-center justify-between flex-shrink-0">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
            <Bot className="w-4 h-4 text-white" />
          </div>
          <div>
            <p className="text-white font-semibold text-sm">AI Course Counsellor</p>
            <div className="flex items-center gap-1">
              <span className="w-1.5 h-1.5 bg-green-400 rounded-full"></span>
              <span className="text-blue-200 text-[10px]">Online · Powered by Llama AI</span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-1">
          <button onClick={handleClearChat} title="Clear chat"
            className="p-1.5 hover:bg-white/20 rounded-lg transition-colors">
            <RotateCcw className="w-3.5 h-3.5 text-white/80" />
          </button>
          <button onClick={() => setIsMinimized(true)} title="Minimize"
            className="p-1.5 hover:bg-white/20 rounded-lg transition-colors">
            <Minimize2 className="w-3.5 h-3.5 text-white/80" />
          </button>
          <button onClick={() => setIsOpen(false)} title="Close"
            className="p-1.5 hover:bg-white/20 rounded-lg transition-colors">
            <X className="w-4 h-4 text-white" />
          </button>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-3 space-y-3 bg-gray-50 overscroll-contain">
        {messages.map((msg, i) => (
          <div key={i} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
            {msg.role === "assistant" && (
              <div className="w-6 h-6 bg-indigo-100 rounded-full flex items-center justify-center flex-shrink-0 mt-1 mr-1.5">
                <Bot className="w-3.5 h-3.5 text-indigo-600" />
              </div>
            )}
            <div className={`max-w-[82%] px-3 py-2 rounded-2xl text-xs leading-relaxed ${
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
            <div className="bg-white border shadow-sm px-3 py-2 rounded-2xl rounded-tl-sm flex items-center gap-1.5">
              <Loader2 className="w-3 h-3 animate-spin text-indigo-500" />
              <span className="text-xs text-gray-500">Finding best options...</span>
            </div>
          </div>
        )}

        {error && !loading && (
          <div className="flex justify-start">
            <div className="w-6 h-6 bg-red-100 rounded-full flex items-center justify-center flex-shrink-0 mt-1 mr-1.5">
              <Bot className="w-3.5 h-3.5 text-red-500" />
            </div>
            <div className="bg-red-50 border border-red-100 px-3 py-2 rounded-2xl rounded-tl-sm">
              <p className="text-xs text-red-600 mb-1.5">{error}</p>
              <button onClick={() => retryMsg && sendMessage(retryMsg, true)}
                className="flex items-center gap-1 text-[10px] font-medium text-red-600 bg-red-100 px-2 py-1 rounded-lg hover:bg-red-200 transition-colors">
                <RotateCcw className="w-3 h-3" /> Try again
              </button>
            </div>
          </div>
        )}

        {centerCards.length > 0 && !loading && (
          <div className="space-y-2">
            <p className="text-[10px] text-gray-400 font-medium px-1">📍 Recommended for you:</p>
            {centerCards.map((c) => (
              <Link key={c.id} href={`/centers/${c.slug}`} onClick={() => setIsOpen(false)}
                className="block bg-white border rounded-xl p-2.5 hover:shadow-md hover:border-blue-200 transition-all">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <p className="text-xs font-semibold text-gray-900 truncate">{c.name}</p>
                    <p className="text-[10px] text-gray-500">{c.city}, {c.state}</p>
                    {c.primaryCategory === "STUDY_ABROAD" && c.countries?.length > 0 && (
                      <p className="text-[10px] text-blue-600 mt-0.5 truncate">{c.countries.slice(0, 3).join(" · ")}</p>
                    )}
                    {c.primaryCategory !== "STUDY_ABROAD" && c.courses?.length > 0 && (
                      <p className="text-[10px] text-gray-400 mt-0.5 truncate">{c.courses.slice(0, 2).join(" · ")}</p>
                    )}
                  </div>
                  {c.rating > 0 && (
                    <span className="text-[10px] font-semibold text-yellow-600 bg-yellow-50 px-1.5 py-0.5 rounded flex-shrink-0">
                      ★ {c.rating}
                    </span>
                  )}
                </div>
                <span className="text-[10px] text-accent font-medium mt-1.5 block">View Profile →</span>
              </Link>
            ))}
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Suggested questions */}
      {messages.length === 1 && !loading && (
        <div className="px-3 py-2 border-t bg-white flex-shrink-0">
          <p className="text-[10px] text-gray-400 mb-1.5">💡 Try asking:</p>
          <div className="flex flex-col gap-1">
            {SUGGESTED_QUESTIONS.slice(0, 2).map((q, i) => (
              <button key={i} onClick={() => sendMessage(q)}
                className="text-left text-[10px] text-blue-600 bg-blue-50 px-2.5 py-1.5 rounded-lg hover:bg-blue-100 transition-colors truncate border border-blue-100">
                {q}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Input */}
      <div className="px-3 py-2.5 border-t bg-white flex-shrink-0">
        <div className="flex gap-2 items-end">
          <textarea
            ref={inputRef}
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask about courses, coaching, study abroad..."
            rows={1}
            disabled={loading}
            className="flex-1 px-3 py-2 border border-gray-200 rounded-xl resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-50 disabled:opacity-50"
            style={{ maxHeight: "60px", fontSize: "16px" }}
          />
          <button onClick={() => sendMessage()} disabled={!input.trim() || loading}
            className="w-8 h-8 bg-blue-600 text-white rounded-xl flex items-center justify-center hover:bg-blue-700 transition-colors disabled:opacity-40 disabled:cursor-not-allowed flex-shrink-0">
            {loading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
          </button>
        </div>
        <p className="text-[9px] text-gray-300 mt-1 text-center">AI may make mistakes · Always verify with institutes</p>
      </div>
    </>
  );

  return (
    <>
      {/* Floating Button */}
      {!isOpen && (
        <button onClick={() => { setIsOpen(true); setIsMinimized(false); }}
          className="fixed bottom-20 right-4 md:bottom-6 md:right-6 z-50 w-14 h-14 bg-gradient-to-br from-blue-600 to-indigo-600 text-white rounded-full shadow-lg hover:shadow-xl hover:scale-105 transition-all flex items-center justify-center"
          aria-label="Open AI Counsellor">
          <Bot className="w-6 h-6" />
          <span className="absolute top-0 right-0 w-3.5 h-3.5 bg-green-400 rounded-full border-2 border-white animate-pulse"></span>
        </button>
      )}

      {/* Minimized bar */}
      {isOpen && isMinimized && (
        <button onClick={() => setIsMinimized(false)}
          className="fixed bottom-20 right-3 md:bottom-6 md:right-6 z-50 flex items-center gap-2.5 px-4 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-full shadow-lg hover:shadow-xl transition-all">
          <Bot className="w-4 h-4" />
          <span className="text-sm font-medium">AI Counsellor</span>
          <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
        </button>
      )}

      {isOpen && !isMinimized && (
        <>
          {/* ✅ MOBILE: fullscreen so keyboard doesn't cause resize issues */}
          {/* z-[60] ensures it sits ABOVE the bottom nav (z-50) */}
          <div className="md:hidden fixed inset-0 z-[60] bg-white flex flex-col">
            <ChatContent />
          </div>

          {/* ✅ DESKTOP: floating window */}
          <div className="hidden md:flex fixed bottom-6 right-6 z-50 w-96 bg-white rounded-2xl shadow-2xl border flex-col overflow-hidden"
            style={{ height: "520px" }}>
            <ChatContent />
          </div>
        </>
      )}
    </>
  );
}