"use client";

import { useState, useEffect, useCallback } from "react";

const SCRIPT_URL = process.env.NEXT_PUBLIC_GOOGLE_SCRIPT_URL || "";

interface Participant {
  number: number;
  name: string;
  email: string;
}

export default function DrawPage() {
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [loading, setLoading] = useState(true);
  const [spinning, setSpinning] = useState(false);
  const [displayNumber, setDisplayNumber] = useState<number | null>(null);
  const [winner, setWinner] = useState<Participant | null>(null);
  const [showConfetti, setShowConfetti] = useState(false);

  const fetchParticipants = useCallback(async () => {
    try {
      const response = await fetch(`${SCRIPT_URL}?action=list`);
      const data = await response.json();
      if (data.success) {
        setParticipants(data.participants || []);
      }
    } catch (error) {
      console.error("Failed to fetch participants:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchParticipants();
  }, [fetchParticipants]);

  const startDraw = () => {
    if (participants.length === 0) return;

    setWinner(null);
    setSpinning(true);
    setShowConfetti(false);

    // Random number cycling animation
    const duration = 4000;
    const intervalTime = 50;
    let elapsed = 0;

    const interval = setInterval(() => {
      elapsed += intervalTime;
      const randomIndex = Math.floor(Math.random() * participants.length);
      setDisplayNumber(participants[randomIndex].number);

      // Slow down towards the end
      if (elapsed > duration * 0.8) {
        clearInterval(interval);
        slowDown();
      }
    }, intervalTime);

    const slowDown = () => {
      let slowIntervalTime = 100;
      const slowInterval = setInterval(() => {
        slowIntervalTime += 50;
        const randomIndex = Math.floor(Math.random() * participants.length);
        setDisplayNumber(participants[randomIndex].number);

        if (slowIntervalTime > 500) {
          clearInterval(slowInterval);
          // Final selection
          const winnerIndex = Math.floor(Math.random() * participants.length);
          const selectedWinner = participants[winnerIndex];
          setDisplayNumber(selectedWinner.number);
          setWinner(selectedWinner);
          setSpinning(false);
          setShowConfetti(true);
        }
      }, slowIntervalTime);
    };
  };

  const resetDraw = () => {
    setWinner(null);
    setDisplayNumber(null);
    setShowConfetti(false);
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 relative overflow-hidden">
      {/* Confetti */}
      {showConfetti && (
        <div className="fixed inset-0 pointer-events-none">
          {Array.from({ length: 50 }).map((_, i) => (
            <div
              key={i}
              className="confetti-piece absolute w-3 h-3 rounded-sm"
              style={{
                left: `${Math.random() * 100}%`,
                top: `-20px`,
                backgroundColor: ["#1EB182", "#65D3AF", "#FFD700", "#FF6B6B", "#4ECDC4"][
                  Math.floor(Math.random() * 5)
                ],
                animationDelay: `${Math.random() * 2}s`,
                transform: `rotate(${Math.random() * 360}deg)`,
              }}
            />
          ))}
        </div>
      )}

      <div className="w-full max-w-2xl text-center">
        {/* Header */}
        <div className="mb-12">
          <div className="inline-flex items-center gap-2 mb-4">
            <svg width="48" height="48" viewBox="0 0 40 40" fill="none">
              <rect width="40" height="40" rx="8" fill="#1EB182"/>
              <path d="M12 20h16M20 12v16" stroke="white" strokeWidth="3" strokeLinecap="round"/>
            </svg>
            <span className="text-3xl font-bold text-gray-dark">Hopsworks</span>
          </div>
          <h1 className="text-4xl font-bold text-gray-dark mb-2">Book Raffle Draw</h1>
          <p className="text-gray-medium text-lg">
            {participants.length} participants registered
          </p>
        </div>

        {/* Draw Display */}
        <div className="bg-white rounded-2xl border border-gray-light p-12 mb-8 shadow-lg">
          {loading ? (
            <div className="text-gray-medium">Loading participants...</div>
          ) : participants.length === 0 ? (
            <div className="text-gray-medium">No participants yet</div>
          ) : (
            <>
              <div
                className={`bg-hops-lightest rounded-xl p-8 mb-8 transition-all ${
                  spinning ? "scale-105" : ""
                } ${winner ? "winner-animation" : ""}`}
              >
                <span
                  className={`text-8xl font-mono font-bold ${
                    winner ? "text-hops" : "text-gray-dark"
                  }`}
                >
                  {displayNumber !== null
                    ? `#${String(displayNumber).padStart(3, "0")}`
                    : "???"}
                </span>
              </div>

              {winner && (
                <div className="mb-8 animate-fade-in">
                  <p className="text-2xl font-bold text-hops mb-2">Winner!</p>
                  <p className="text-3xl font-bold text-gray-dark">{winner.name}</p>
                </div>
              )}

              <div className="flex gap-4 justify-center">
                {!spinning && !winner && (
                  <button
                    onClick={startDraw}
                    className="bg-hops text-white font-bold text-xl py-4 px-12 rounded-xl hover:bg-hops-light transition-all transform hover:scale-105"
                  >
                    Start Draw
                  </button>
                )}

                {winner && (
                  <button
                    onClick={resetDraw}
                    className="bg-white text-hops font-bold text-xl py-4 px-12 rounded-xl border-2 border-hops hover:bg-hops-lightest transition-all"
                  >
                    Draw Again
                  </button>
                )}

                {spinning && (
                  <div className="text-2xl font-bold text-gray-medium animate-pulse">
                    Drawing...
                  </div>
                )}
              </div>
            </>
          )}
        </div>

        {/* Participants List */}
        <div className="bg-white rounded-lg border border-gray-light p-6">
          <h2 className="text-lg font-bold text-gray-dark mb-4">Participants</h2>
          <div className="max-h-48 overflow-y-auto">
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {participants.map((p) => (
                <div
                  key={p.number}
                  className={`text-sm p-2 rounded ${
                    winner?.number === p.number
                      ? "bg-hops text-white font-bold"
                      : "bg-gray-lightest text-gray-dark"
                  }`}
                >
                  <span className="font-mono">#{String(p.number).padStart(3, "0")}</span>{" "}
                  {p.name}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Refresh Button */}
        <button
          onClick={fetchParticipants}
          className="mt-4 text-sm text-gray-medium hover:text-hops transition-colors"
        >
          Refresh participants
        </button>
      </div>
    </div>
  );
}
