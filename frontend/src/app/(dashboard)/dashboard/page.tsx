"use client";

import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/hooks/useAuth";
import { getAuthHeader } from "@/lib/auth";
import Link from "next/link";

interface Document {
  id: number;
  filename: string;
  status: string;
  created_at: string;
  page_count: number | null;
}

export default function DashboardPage() {
  const { loading: authLoading, logout } = useAuth(true);
  const [documents, setDocuments] = useState<Document[]>([]);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");

  const fetchDocuments = useCallback(async () => {
    try {
      const res = await fetch("http://localhost:8000/documents/", {
        headers: getAuthHeader(),
      });
      if (res.ok) {
        const data = await res.json();
        setDocuments(data);
      }
    } catch (err) {
      console.error("Failed to fetch documents", err);
    }
  }, []);

  useEffect(() => {
    if (!authLoading) {
      fetchDocuments();
      const interval = setInterval(fetchDocuments, 5000); // Poll every 5 seconds
      return () => clearInterval(interval);
    }
  }, [authLoading, fetchDocuments]);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setError("");
    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch("http://localhost:8000/documents/upload", {
        method: "POST",
        headers: getAuthHeader(),
        body: formData,
      });

      if (!res.ok) throw new Error("Upload failed");
      
      fetchDocuments();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setUploading(false);
    }
  };

  if (authLoading) return null;

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      {/* Navigation */}
      <nav className="border-b border-white/10 bg-card/30 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="text-2xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            RAG PDF
          </div>
          <button
            onClick={logout}
            className="px-4 py-2 rounded-lg bg-white/5 hover:bg-white/10 text-sm font-medium transition-colors border border-white/10"
          >
            Sign Out
          </button>
        </div>
      </nav>

      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 w-full">
        <div className="mb-12">
          <h1 className="text-4xl font-bold mb-4">Your Library</h1>
          <p className="text-muted-foreground text-lg">Upload and manage your PDF knowledge base</p>
        </div>

        {/* Upload Zone */}
        <div className="mb-16">
          <label className="relative group cursor-pointer">
            <input
              type="file"
              accept=".pdf"
              onChange={handleFileUpload}
              className="hidden"
              disabled={uploading}
            />
            <div className="w-full py-16 rounded-3xl border-2 border-dashed border-white/10 bg-card/20 hover:bg-card/40 hover:border-primary/50 transition-all duration-300 flex flex-col items-center justify-center gap-4">
              <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center text-primary group-hover:scale-110 transition-transform duration-300">
                {uploading ? (
                  <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
                ) : (
                  <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                )}
              </div>
              <div className="text-center">
                <p className="text-xl font-semibold mb-1">
                  {uploading ? "Analyzing document..." : "Click or drag PDF to upload"}
                </p>
                <p className="text-muted-foreground">Maximum file size: 10MB</p>
              </div>
            </div>
          </label>
          {error && <p className="mt-4 text-red-500 text-sm text-center">{error}</p>}
        </div>

        {/* Document Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {documents.map((doc) => (
            <div
              key={doc.id}
              className="group p-6 rounded-2xl bg-card/40 border border-white/10 hover:border-primary/30 hover:bg-card/60 transition-all duration-300 flex flex-col justify-between shadow-lg"
            >
              <div>
                <div className="flex items-start justify-between mb-4">
                  <div className="w-10 h-10 rounded-lg bg-accent/10 flex items-center justify-center text-accent">
                    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </div>
                  <div className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
                    doc.status === 'ready' ? 'bg-green-500/10 text-green-500' :
                    doc.status === 'failed' ? 'bg-red-500/10 text-red-500' :
                    'bg-primary/10 text-primary animate-pulse'
                  }`}>
                    {doc.status}
                  </div>
                </div>
                <h3 className="text-lg font-bold mb-1 truncate">{doc.filename}</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  {doc.page_count ? `${doc.page_count} pages` : 'Pending page count'}
                </p>
              </div>
              
              {doc.status === 'ready' && (
                <Link
                  href={`/chat/${doc.id}`}
                  className="w-full py-3 rounded-xl bg-white/5 hover:bg-primary hover:text-white border border-white/10 hover:border-primary transition-all duration-200 text-center font-semibold"
                >
                  Open Chat
                </Link>
              )}
            </div>
          ))}
          {documents.length === 0 && !uploading && (
            <div className="col-span-full py-20 text-center border-2 border-dashed border-white/5 rounded-3xl">
              <p className="text-muted-foreground text-lg italic">Your library is empty. Start by uploading a PDF.</p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
