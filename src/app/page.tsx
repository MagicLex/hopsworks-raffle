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

      // With no-cors, we can't read the response, so we do a GET to verify
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
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-3">
            <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
              <rect width="28" height="28" rx="4" fill="#1eb182"/>
              <path d="M8 14h12M14 8v12" stroke="white" strokeWidth="2.5" strokeLinecap="round"/>
            </svg>
            <span className="text-lg font-bold text-black">Hopsworks</span>
          </div>
          <h1 className="text-2xl font-bold text-black mb-1">Book Raffle</h1>
          <p className="text-sm text-gray">
            Enter for a chance to win the O&apos;Reilly MLOps book
          </p>
        </div>

        {ticketNumber !== null ? (
          /* Success State */
          <div className="bg-white rounded-sm border border-gray-lighter p-5">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-5 h-5 bg-primary rounded-full flex items-center justify-center">
                <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <span className="text-sm font-bold text-black">You&apos;re in!</span>
            </div>

            <p className="text-sm text-gray mb-3">Your ticket number:</p>
            <div className="bg-primary-lightest rounded-sm p-4 mb-4">
              <span className="text-3xl font-mono font-bold text-primary">
                #{String(ticketNumber).padStart(3, "0")}
              </span>
            </div>
            <p className="text-xs text-gray">
              Keep this number handy for the draw.
            </p>
          </div>
        ) : (
          /* Registration Form */
          <form onSubmit={handleSubmit} className="bg-white rounded-sm border border-gray-lighter p-5">
            <div className="mb-4">
              <label htmlFor="name" className="block text-sm font-bold text-black mb-1">
                Full Name
              </label>
              <input
                type="text"
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Jean Dupont"
                className="w-full px-3 py-2 text-sm border border-gray-lighter rounded-sm focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-colors"
                required
              />
            </div>

            <div className="mb-5">
              <label htmlFor="email" className="block text-sm font-bold text-black mb-1">
                Email
              </label>
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="jean@example.com"
                className="w-full px-3 py-2 text-sm border border-gray-lighter rounded-sm focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-colors"
                required
              />
            </div>

            {error && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-sm text-error text-sm">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading || !name.trim() || !email.trim()}
              className="w-full bg-primary text-white font-bold text-sm py-2 px-4 rounded-sm border border-primary hover:bg-primary-hover hover:border-primary-hover transition-all disabled:bg-gray-light disabled:border-gray-light disabled:cursor-not-allowed"
            >
              {loading ? "Registering..." : "Get My Ticket"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
