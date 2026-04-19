"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { isAuthenticated } from "@/lib/auth";

export default function LandingPage() {
  const [auth, setAuth] = useState(false);

  useEffect(() => {
    setAuth(isAuthenticated());
  }, []);

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col items-center justify-center p-6 relative overflow-hidden">
      {/* Background Glows */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-[500px] bg-primary/20 rounded-full blur-[120px] opacity-50" />
      </div>

      <main className="max-w-4xl w-full text-center relative z-10">
        <div className="inline-block px-4 py-1.5 mb-6 rounded-full bg-white/5 border border-white/10 text-primary text-sm font-bold tracking-widest uppercase animate-fade-in">
          Next-Gen AI Document Assistant
        </div>
        
        <h1 className="text-6xl md:text-8xl font-bold tracking-tighter mb-8 bg-gradient-to-b from-white to-white/40 bg-clip-text text-transparent">
          Unlock the secrets <br /> inside your PDFs.
        </h1>
        
        <p className="text-xl md:text-2xl text-muted-foreground mb-12 max-w-2xl mx-auto leading-relaxed">
          The fastest way to search, summarize, and chat with your documents using <b>Groq</b> and <b>LanceDB</b>.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
          <Link
            href={auth ? "/dashboard" : "/login"}
            className="px-10 py-5 rounded-2xl bg-primary text-white font-bold text-xl hover:bg-primary/90 transition-all hover:scale-105 shadow-xl shadow-primary/20"
          >
            {auth ? "Go to Dashboard" : "Start Chatting Free"}
          </Link>
          
           {!auth && (
            <Link
              href="/signup"
              className="px-10 py-5 rounded-2xl bg-white/5 border border-white/10 text-white font-bold text-xl hover:bg-white/10 transition-all"
            >
              Sign Up
            </Link>
          )}
        </div>

        <div className="mt-24 grid grid-cols-1 md:grid-cols-3 gap-8 text-left">
          {[
            { title: "Lightning Fast", desc: "Powered by Groq's Llama-3 for near-instant answers." },
            { title: "Vector Powered", desc: "Semantic search via LanceDB finds the exact context." },
            { title: "Secure & Ownership", desc: "Your documents are private and managed by you." }
          ].map((item, i) => (
            <div key={i} className="p-6 rounded-2xl bg-card/30 border border-white/5 backdrop-blur-sm">
              <h3 className="font-bold text-lg mb-2 text-primary">{item.title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{item.desc}</p>
            </div>
          ))}
        </div>
      </main>

      <footer className="absolute bottom-8 text-muted-foreground text-sm opacity-50">
        &copy; 2026 RAG PDF Assistant. Built with passion.
      </footer>
    </div>
  );
}
