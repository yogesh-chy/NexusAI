"use client";

import { useState, useEffect, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { getAuthHeader, getToken } from "@/lib/auth";
import Link from "next/link";

interface Message {
  role: "user" | "assistant";
  content: string;
}

interface DocumentInfo {
  id: number;
  filename: string;
  page_count: number;
  status: string;
}

export default function ChatPage() {
  const { id } = useParams();
  const router = useRouter();
  const { loading: authLoading } = useAuth(true);
  
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [docInfo, setDocInfo] = useState<DocumentInfo | null>(null);
  const [isTyping, setIsTyping] = useState(false);
  
  const scrollRef = useRef<HTMLDivElement>(null);

  // Fetch document details
  useEffect(() => {
    if (!authLoading) {
      fetch(`http://localhost:8000/documents/${id}`, {
        headers: getAuthHeader(),
      })
        .then((res) => res.json())
        .then(setDocInfo)
        .catch(() => router.push("/dashboard"));
    }
  }, [id, authLoading, router]);

  // Scroll to bottom on new messages
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isTyping]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isTyping) return;

    const userMessage = input.trim();
    setInput("");
    setMessages((prev) => [...prev, { role: "user", content: userMessage }]);
    setIsTyping(true);

    let assistantContent = "";
    setMessages((prev) => [...prev, { role: "assistant", content: "" }]);

    try {
      const response = await fetch("http://localhost:8000/chat/ask", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...getAuthHeader(),
        },
        body: JSON.stringify({
          doc_id: Number(id),
          question: userMessage,
        }),
      });

      if (!response.body) throw new Error("No response stream");

      const reader = response.body.getReader();
      const decoder = new TextDecoder();

      while (true) {
        const { value, done } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value);
        const lines = chunk.split("\n");

        for (const line of lines) {
          if (line.startsWith("data: ")) {
            try {
              const data = JSON.parse(line.slice(6));
              if (data.type === "token") {
                assistantContent += data.content;
                setMessages((prev) => {
                  const newMessages = [...prev];
                  newMessages[newMessages.length - 1].content = assistantContent;
                  return newMessages;
                });
              }
            } catch (err) {
              // Ignore partial JSON
            }
          }
        }
      }
    } catch (err) {
      console.error("Chat error:", err);
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: "Sorry, I encountered an error processing your request." },
      ]);
    } finally {
      setIsTyping(false);
    }
  };

  if (authLoading || !docInfo) return null;

  return (
    <div className="flex h-screen bg-background overflow-hidden font-sans">
      {/* Minimal Sidebar */}
      <aside className="w-80 border-r border-white/10 bg-card/20 backdrop-blur-3xl flex flex-col">
        <div className="p-6 border-b border-white/10">
          <Link href="/dashboard" className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-8 group">
            <svg className="w-5 h-5 group-hover:-translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back to Library
          </Link>
          
          <div className="space-y-4">
            <div className="p-4 rounded-xl bg-primary/5 border border-primary/20">
              <div className="text-xs font-bold text-primary uppercase tracking-widest mb-1">Active Document</div>
              <h2 className="font-bold text-lg truncate" title={docInfo.filename}>{docInfo.filename}</h2>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 rounded-xl bg-white/5 border border-white/10">
                <div className="text-[10px] font-bold text-muted-foreground uppercase opacity-60">Pages</div>
                <div className="text-lg font-bold">{docInfo.page_count}</div>
              </div>
              <div className="p-4 rounded-xl bg-white/5 border border-white/10">
                <div className="text-[10px] font-bold text-muted-foreground uppercase opacity-60">Vectors</div>
                <div className="text-lg font-bold">LanceDB</div>
              </div>
            </div>
          </div>
        </div>
        
        <div className="flex-1 p-6 overflow-y-auto">
          <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-4">Tips</h3>
          <ul className="text-sm text-muted-foreground space-y-4 italic">
            <li>• Ask specific questions about dates or names.</li>
            <li>• Request summaries of specific sections.</li>
            <li>• Use Groq for lightning-fast analysis.</li>
          </ul>
        </div>
      </aside>

      {/* Main Chat Area */}
      <main className="flex-1 flex flex-col relative">
        <header className="h-16 border-b border-white/10 bg-card/30 backdrop-blur-md flex items-center px-8 justify-between">
          <div className="flex items-center gap-3">
            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
            <span className="text-sm font-medium">Chatbot Online</span>
          </div>
          <div className="text-xs text-muted-foreground">Powered by Groq Llama-3</div>
        </header>

        {/* Messages */}
        <div 
          ref={scrollRef}
          className="flex-1 overflow-y-auto p-8 space-y-8 no-scrollbar"
        >
          {messages.length === 0 && (
            <div className="h-full flex flex-col items-center justify-center text-center max-w-md mx-auto">
              <div className="w-20 h-20 rounded-3xl bg-primary/10 flex items-center justify-center text-primary mb-6">
                <svg className="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                </svg>
              </div>
              <h2 className="text-2xl font-bold mb-2">Start a conversation</h2>
              <p className="text-muted-foreground italic">Ask anything about "{docInfo.filename}". I'll use the document context to provide an accurate answer.</p>
            </div>
          )}

          {messages.map((msg, i) => (
            <div 
              key={i} 
              className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
            >
              <div className={`max-w-[80%] p-4 rounded-2xl ${
                msg.role === "user" 
                  ? "bg-primary text-white shadow-lg shadow-primary/20" 
                  : "bg-card/80 backdrop-blur-md border border-white/10 text-foreground"
              }`}>
                <div className="whitespace-pre-wrap leading-relaxed">{msg.content}</div>
                {msg.role === "assistant" && !msg.content && isTyping && (
                  <div className="flex gap-1 py-1">
                    <div className="w-2 h-2 rounded-full bg-muted-foreground/40 animate-bounce" />
                    <div className="w-2 h-2 rounded-full bg-muted-foreground/40 animate-bounce [animation-delay:0.2s]" />
                    <div className="w-2 h-2 rounded-full bg-muted-foreground/40 animate-bounce [animation-delay:0.4s]" />
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Input Area */}
        <div className="p-8">
          <form 
            onSubmit={handleSubmit}
            className="max-w-4xl mx-auto relative group"
          >
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask a question..."
              className="w-full h-16 pl-6 pr-20 rounded-2xl bg-card border border-white/10 focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all duration-300 shadow-2xl"
              disabled={isTyping}
            />
            <button
              type="submit"
              disabled={isTyping || !input.trim()}
              className="absolute right-3 top-3 w-10 h-10 rounded-xl bg-primary text-white flex items-center justify-center hover:bg-primary/90 transition-all duration-200 disabled:opacity-50"
            >
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
              </svg>
            </button>
          </form>
        </div>
      </main>
    </div>
  );
}
