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

    const duration = 3500;
    const intervalTime = 60;
    let elapsed = 0;

    const interval = setInterval(() => {
      elapsed += intervalTime;
      const randomIndex = Math.floor(Math.random() * participants.length);
      setDisplayNumber(participants[randomIndex].number);

      if (elapsed > duration * 0.75) {
        clearInterval(interval);
        slowDown();
      }
    }, intervalTime);

    const slowDown = () => {
      let slowIntervalTime = 100;
      const slowInterval = setInterval(() => {
        slowIntervalTime += 60;
        const randomIndex = Math.floor(Math.random() * participants.length);
        setDisplayNumber(participants[randomIndex].number);

        if (slowIntervalTime > 450) {
          clearInterval(slowInterval);
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
        <div className="fixed inset-0 pointer-events-none z-50">
          {Array.from({ length: 40 }).map((_, i) => (
            <div
              key={i}
              className="confetti absolute w-2 h-2"
              style={{
                left: `${Math.random() * 100}%`,
                top: `-10px`,
                backgroundColor: ["#1eb182", "#65D3AF", "#FFD700", "#EB5757", "#9B51E0"][
                  Math.floor(Math.random() * 5)
                ],
                animationDelay: `${Math.random() * 1.5}s`,
              }}
            />
          ))}
        </div>
      )}

      <div className="w-full max-w-xl">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 mb-3">
            <svg width="32" height="32" viewBox="0 0 28 28" fill="none">
              <rect width="28" height="28" rx="4" fill="#1eb182"/>
              <path d="M8 14h12M14 8v12" stroke="white" strokeWidth="2.5" strokeLinecap="round"/>
            </svg>
            <span className="text-xl font-bold text-black">Hopsworks</span>
          </div>
          <h1 className="text-2xl font-bold text-black mb-1">Book Raffle Draw</h1>
          <p className="text-sm text-gray">
            {participants.length} participant{participants.length !== 1 ? "s" : ""} registered
          </p>
        </div>

        {/* Draw Display */}
        <div className="bg-white rounded-sm border border-gray-lighter p-6 mb-6">
          {loading ? (
            <div className="text-center text-sm text-gray py-8">Loading participants...</div>
          ) : participants.length === 0 ? (
            <div className="text-center text-sm text-gray py-8">No participants yet</div>
          ) : (
            <>
              {/* Number Display */}
              <div
                className={`bg-gray-lightest rounded-sm p-8 mb-6 text-center transition-transform ${
                  spinning ? "scale-[1.02]" : ""
                } ${winner ? "winner-animation bg-primary-lightest" : ""}`}
              >
                <span
                  className={`text-6xl font-mono font-bold transition-colors ${
                    winner ? "text-primary" : "text-black"
                  }`}
                >
                  {displayNumber !== null
                    ? `#${String(displayNumber).padStart(3, "0")}`
                    : "# ???"}
                </span>
              </div>

              {/* Winner Name */}
              {winner && (
                <div className="text-center mb-6">
                  <p className="text-sm font-bold text-primary mb-1">Winner</p>
                  <p className="text-xl font-bold text-black">{winner.name}</p>
                </div>
              )}

              {/* Actions */}
              <div className="flex justify-center gap-3">
                {!spinning && !winner && (
                  <button
                    onClick={startDraw}
                    className="bg-primary text-white font-bold text-sm py-2 px-6 rounded-sm border border-primary hover:bg-primary-hover hover:border-primary-hover transition-all"
                  >
                    Start Draw
                  </button>
                )}

                {winner && (
                  <button
                    onClick={resetDraw}
                    className="bg-white text-primary font-bold text-sm py-2 px-6 rounded-sm border border-primary hover:bg-primary-lightest transition-all"
                  >
                    Draw Again
                  </button>
                )}

                {spinning && (
                  <span className="text-sm font-bold text-gray animate-pulse py-2">
                    Drawing...
                  </span>
                )}
              </div>
            </>
          )}
        </div>

        {/* Participants List */}
        <div className="bg-white rounded-sm border border-gray-lighter">
          <div className="px-5 py-3 border-b border-gray-lighter">
            <h2 className="text-sm font-bold text-black">Participants</h2>
          </div>
          <div className="p-5 max-h-48 overflow-y-auto">
            {participants.length === 0 ? (
              <p className="text-sm text-gray">No participants yet</p>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {participants.map((p) => (
                  <div
                    key={p.number}
                    className={`text-xs p-2 rounded-sm transition-colors ${
                      winner?.number === p.number
                        ? "bg-primary text-white font-bold"
                        : "bg-gray-lightest text-black"
                    }`}
                  >
                    <span className="font-mono">#{String(p.number).padStart(3, "0")}</span>{" "}
                    <span className="truncate">{p.name}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Refresh */}
        <button
          onClick={fetchParticipants}
          className="w-full mt-3 text-xs text-gray hover:text-primary transition-colors"
        >
          ↻ Refresh participants
        </button>
      </div>
    </div>
  );
}
