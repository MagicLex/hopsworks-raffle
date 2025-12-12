"use client";

import { useState } from "react";

const SCRIPT_URL = process.env.NEXT_PUBLIC_GOOGLE_SCRIPT_URL || "";

export default function Home() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [ticketNumber, setTicketNumber] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim()) return;

    setLoading(true);
    setError("");

    try {
      await fetch(SCRIPT_URL, {
        method: "POST",
        mode: "no-cors",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "register", name: name.trim(), email: email.trim() }),
      });

      const verifyResponse = await fetch(`${SCRIPT_URL}?action=getByEmail&email=${encodeURIComponent(email.trim())}`);
      const data = await verifyResponse.json();

      if (data.success && data.participant) {
        setTicketNumber(data.participant.number);
      } else if (data.error) {
        setError(data.error);
      } else {
        setError("Something went wrong. Please try again.");
      }
    } catch {
      setError("Failed to register. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="mb-8">
          <div className="mb-6">
            <img
              src="/logo.svg"
              alt="Hopsworks"
              className="h-8"
            />
          </div>

          {/* Book Cover */}
          <div className="mb-6">
            <img
              src="https://cdn.prod.website-files.com/5f6353590bb01cacbcecfbac/6913334f3a2eda409ff69e75_Book%20final%20visual.png"
              alt="Building Machine Learning Systems"
              className="w-full"
            />
          </div>

          <h1 className="text-2xl font-bold text-gray-900 mb-2">Book Raffle</h1>
          <p className="text-sm text-gray-500 mb-1">
            Win a copy of <span className="font-semibold">Building Machine Learning Systems</span>
          </p>
          <p className="text-xs text-gray-400">
            Batch, Real-Time, and LLM Systems — by Jim Dowling
          </p>
        </div>

        {ticketNumber !== null ? (
          <div className="bg-white rounded-sm border border-gray-300 p-8">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <span className="text-lg font-bold text-gray-900">You&apos;re in!</span>
            </div>

            <p className="text-base text-gray-500 mb-4">Your ticket number:</p>
            <div className="bg-primary-lightest rounded-sm p-6 mb-6">
              <span className="text-5xl font-mono font-bold text-primary">
                #{String(ticketNumber).padStart(3, "0")}
              </span>
            </div>
            <p className="text-sm text-gray-500">
              Keep this number handy for the draw.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="bg-white rounded-sm border border-gray-300 p-8">
            <div className="mb-6">
              <label htmlFor="name" className="block text-sm font-bold text-gray-900 mb-2">
                Full Name
              </label>
              <input
                type="text"
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Jean Dupont"
                className="w-full px-4 py-3 text-base border border-gray-300 rounded-sm focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-colors"
                required
              />
            </div>

            <div className="mb-8">
              <label htmlFor="email" className="block text-sm font-bold text-gray-900 mb-2">
                Email
              </label>
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="jean@example.com"
                className="w-full px-4 py-3 text-base border border-gray-300 rounded-sm focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-colors"
                required
              />
            </div>

            {error && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-sm text-error text-sm">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading || !name.trim() || !email.trim()}
              className="w-full bg-primary text-white font-bold text-base py-3 px-6 rounded-sm border border-primary hover:bg-primary-hover hover:border-primary-hover transition-all disabled:bg-gray-400 disabled:border-gray-400 disabled:cursor-not-allowed"
            >
              {loading ? "Registering..." : "Get My Ticket"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
