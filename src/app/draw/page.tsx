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
  const [winners, setWinners] = useState<Participant[]>([]);
  const [showConfetti, setShowConfetti] = useState(false);
  const [winnerCount, setWinnerCount] = useState(1);
  const [currentDrawIndex, setCurrentDrawIndex] = useState(0);

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

  const getEligibleParticipants = () => {
    return participants.filter(p => !winners.some(w => w.number === p.number));
  };

  const startDraw = () => {
    const eligible = getEligibleParticipants();
    if (eligible.length === 0) return;

    setSpinning(true);
    setShowConfetti(false);

    const duration = 3500;
    const intervalTime = 60;
    let elapsed = 0;

    const interval = setInterval(() => {
      elapsed += intervalTime;
      const randomIndex = Math.floor(Math.random() * eligible.length);
      setDisplayNumber(eligible[randomIndex].number);

      if (elapsed > duration * 0.75) {
        clearInterval(interval);
        slowDown(eligible);
      }
    }, intervalTime);

    const slowDown = (pool: Participant[]) => {
      let slowIntervalTime = 100;
      const slowInterval = setInterval(() => {
        slowIntervalTime += 60;
        const randomIndex = Math.floor(Math.random() * pool.length);
        setDisplayNumber(pool[randomIndex].number);

        if (slowIntervalTime > 450) {
          clearInterval(slowInterval);
          const winnerIndex = Math.floor(Math.random() * pool.length);
          const selectedWinner = pool[winnerIndex];
          setDisplayNumber(selectedWinner.number);
          setWinners(prev => [...prev, selectedWinner]);
          setCurrentDrawIndex(prev => prev + 1);
          setSpinning(false);
          setShowConfetti(true);
        }
      }, slowIntervalTime);
    };
  };

  const resetDraw = () => {
    setWinners([]);
    setDisplayNumber(null);
    setShowConfetti(false);
    setCurrentDrawIndex(0);
  };

  const hasMoreDraws = currentDrawIndex < winnerCount && getEligibleParticipants().length > 0;
  const allDrawsComplete = winners.length >= winnerCount || getEligibleParticipants().length === 0;

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 relative overflow-hidden">
      {/* Confetti */}
      {showConfetti && (
        <div className="fixed inset-0 pointer-events-none z-50">
          {Array.from({ length: 40 }).map((_, i) => (
            <div
              key={i}
              className="confetti absolute w-3 h-3"
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

      <div className="w-full max-w-2xl">
        {/* Header */}
        <div className="text-center mb-10">
          <div className="flex justify-center mb-6">
            <img
              src="/logo.svg"
              alt="Hopsworks"
              className="h-16"
            />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Book Raffle Draw</h1>
          <p className="text-sm text-gray-500 mb-1">
            Building Machine Learning Systems
          </p>
          <p className="text-base text-gray-500">
            {participants.length} participant{participants.length !== 1 ? "s" : ""} registered
          </p>
        </div>

        {/* Draw Display */}
        <div className="bg-white rounded-sm border border-gray-300 p-10 mb-8">
          {loading ? (
            <div className="text-center text-base text-gray-500 py-12">Loading participants...</div>
          ) : participants.length === 0 ? (
            <div className="text-center text-base text-gray-500 py-12">No participants yet</div>
          ) : (
            <>
              {/* Winner Count Selector */}
              {winners.length === 0 && !spinning && (
                <div className="mb-8 flex items-center justify-center gap-4">
                  <label className="text-sm font-bold text-gray-900">Number of winners:</label>
                  <select
                    value={winnerCount}
                    onChange={(e) => setWinnerCount(Number(e.target.value))}
                    className="px-4 py-2 border border-gray-300 rounded-sm text-base focus:outline-none focus:border-primary"
                  >
                    {[1, 2, 3, 4, 5].map(n => (
                      <option key={n} value={n}>{n}</option>
                    ))}
                  </select>
                </div>
              )}

              {/* Number Display */}
              <div
                className={`rounded-sm p-12 mb-8 text-center transition-all ${
                  winners.length > 0 && !spinning ? "winner-animation bg-primary-lightest" : "bg-gray-100"
                } ${spinning ? "scale-[1.02]" : ""}`}
              >
                <span
                  className={`text-7xl font-mono font-bold transition-colors ${
                    winners.length > 0 && !spinning ? "text-primary" : "text-gray-900"
                  }`}
                >
                  {displayNumber !== null
                    ? `#${String(displayNumber).padStart(3, "0")}`
                    : "# ???"}
                </span>
              </div>

              {/* Winners List */}
              {winners.length > 0 && (
                <div className="text-center mb-8">
                  <p className="text-base font-bold text-primary mb-4">
                    {winners.length === 1 ? "Winner" : `Winners (${winners.length}/${winnerCount})`}
                  </p>
                  <div className="space-y-2">
                    {winners.map((w, i) => (
                      <p key={w.number} className="text-xl font-bold text-gray-900">
                        #{String(w.number).padStart(3, "0")} — {w.name}
                      </p>
                    ))}
                  </div>
                </div>
              )}

              {/* Actions */}
              <div className="flex justify-center gap-4">
                {!spinning && winners.length === 0 && (
                  <button
                    onClick={startDraw}
                    className="bg-primary text-white font-bold text-base py-3 px-10 rounded-sm border border-primary hover:bg-primary-hover hover:border-primary-hover transition-all"
                  >
                    Start Draw
                  </button>
                )}

                {!spinning && hasMoreDraws && winners.length > 0 && (
                  <button
                    onClick={startDraw}
                    className="bg-primary text-white font-bold text-base py-3 px-10 rounded-sm border border-primary hover:bg-primary-hover hover:border-primary-hover transition-all"
                  >
                    Draw Next Winner ({currentDrawIndex + 1}/{winnerCount})
                  </button>
                )}

                {!spinning && allDrawsComplete && winners.length > 0 && (
                  <button
                    onClick={resetDraw}
                    className="bg-white text-primary font-bold text-base py-3 px-10 rounded-sm border-2 border-primary hover:bg-primary-lightest transition-all"
                  >
                    Reset
                  </button>
                )}

                {spinning && (
                  <span className="text-lg font-bold text-gray-500 animate-pulse py-3">
                    Drawing...
                  </span>
                )}
              </div>
            </>
          )}
        </div>

        {/* Participants List */}
        <div className="bg-white rounded-sm border border-gray-300 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200 bg-gray-100">
            <h2 className="text-base font-bold text-gray-900">Participants</h2>
          </div>
          <div className="p-6 max-h-64 overflow-y-auto">
            {participants.length === 0 ? (
              <p className="text-base text-gray-500">No participants yet</p>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {participants.map((p) => (
                  <div
                    key={p.number}
                    className={`text-sm p-3 rounded-sm transition-colors ${
                      winners.some(w => w.number === p.number)
                        ? "bg-primary text-white font-bold"
                        : "bg-gray-100 text-gray-900"
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
          className="w-full mt-4 text-sm text-gray-500 hover:text-primary transition-colors py-2"
        >
          ↻ Refresh participants
        </button>
      </div>
    </div>
  );
}
