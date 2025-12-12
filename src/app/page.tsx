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
      const response = await fetch(SCRIPT_URL, {
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
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 mb-4">
            <svg width="40" height="40" viewBox="0 0 40 40" fill="none">
              <rect width="40" height="40" rx="8" fill="#1EB182"/>
              <path d="M12 20h16M20 12v16" stroke="white" strokeWidth="3" strokeLinecap="round"/>
            </svg>
            <span className="text-2xl font-bold text-gray-dark">Hopsworks</span>
          </div>
          <h1 className="text-3xl font-bold text-gray-dark mb-2">Book Raffle</h1>
          <p className="text-gray-medium">
            Enter for a chance to win the O&apos;Reilly MLOps book!
          </p>
        </div>

        {ticketNumber !== null ? (
          /* Success State */
          <div className="bg-white rounded-lg border border-gray-light p-8 text-center">
            <div className="w-16 h-16 bg-hops-lightest rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-hops" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h2 className="text-xl font-bold text-gray-dark mb-2">You&apos;re in!</h2>
            <p className="text-gray-medium mb-6">Your ticket number is:</p>
            <div className="bg-hops-lightest rounded-lg p-6 mb-6">
              <span className="text-5xl font-mono font-bold text-hops">
                #{String(ticketNumber).padStart(3, "0")}
              </span>
            </div>
            <p className="text-sm text-gray-medium">
              Keep this number handy for the draw!
            </p>
          </div>
        ) : (
          /* Registration Form */
          <form onSubmit={handleSubmit} className="bg-white rounded-lg border border-gray-light p-8">
            <div className="mb-4">
              <label htmlFor="name" className="block text-sm font-semibold text-gray-dark mb-2">
                Full Name
              </label>
              <input
                type="text"
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Jean Dupont"
                className="w-full px-4 py-3 border border-gray-light rounded-lg focus:outline-none focus:border-hops transition-colors"
                required
              />
            </div>
            <div className="mb-6">
              <label htmlFor="email" className="block text-sm font-semibold text-gray-dark mb-2">
                Email
              </label>
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="jean@example.com"
                className="w-full px-4 py-3 border border-gray-light rounded-lg focus:outline-none focus:border-hops transition-colors"
                required
              />
            </div>

            {error && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading || !name.trim() || !email.trim()}
              className="w-full bg-hops text-white font-semibold py-3 px-6 rounded-lg hover:bg-hops-light transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "Registering..." : "Get My Ticket"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
