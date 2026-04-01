import { useState } from "react";

export function AffordanceFirst() {
  const [name, setName] = useState("Duck");
  const [room, setRoom] = useState("duck-game");
  const [hoverStart, setHoverStart] = useState(false);

  return (
    <div className="w-full h-screen flex items-center justify-center bg-gray-800">
      <div
        className="relative overflow-hidden rounded-2xl"
        style={{ width: 460, height: 460, background: "#7B56F5" }}
      >
        <div className="absolute top-3 right-4 text-[10px] font-mono" style={{ color: "#6ee7b7" }}>● online</div>

        {/* Title — compact, unambiguous */}
        <div className="absolute top-6 left-0 right-0 text-center">
          <h1 className="text-white font-['Bangers'] text-5xl drop-shadow" style={{ letterSpacing: 3 }}>
            The Duck Game
          </h1>
        </div>

        {/* Inputs — clearly labeled, visually distinct, obviously editable */}
        <div className="absolute left-4 right-4 top-24 flex flex-col gap-2">
          <label className="flex flex-col gap-0.5">
            <span className="text-white/80 text-[11px] font-mono font-bold uppercase tracking-widest pl-1">
              Your Name
            </span>
            <div className="flex items-center bg-white/10 border-2 border-white/40 rounded-xl px-3 py-2 gap-2 focus-within:border-white transition-colors">
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none" className="shrink-0">
                <circle cx="7" cy="5" r="3" stroke="white" strokeWidth="1.5" opacity="0.7"/>
                <path d="M2 12c0-2.76 2.24-5 5-5s5 2.24 5 5" stroke="white" strokeWidth="1.5" opacity="0.7"/>
              </svg>
              <input
                value={name}
                onChange={e => setName(e.target.value)}
                className="bg-transparent text-white font-mono text-sm outline-none w-full placeholder-white/40"
                placeholder="Enter name…"
                spellCheck={false}
              />
              <span className="text-white/30 text-[10px] font-mono shrink-0">✎</span>
            </div>
          </label>
          <label className="flex flex-col gap-0.5">
            <span className="text-white/80 text-[11px] font-mono font-bold uppercase tracking-widest pl-1">
              Room
            </span>
            <div className="flex items-center bg-white/10 border-2 border-white/40 rounded-xl px-3 py-2 gap-2 focus-within:border-white transition-colors">
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none" className="shrink-0">
                <rect x="1" y="3" width="12" height="9" rx="2" stroke="white" strokeWidth="1.5" opacity="0.7"/>
                <path d="M4 3V2a3 3 0 0 1 6 0v1" stroke="white" strokeWidth="1.5" opacity="0.7"/>
              </svg>
              <input
                value={room}
                onChange={e => setRoom(e.target.value)}
                className="bg-transparent text-white font-mono text-sm outline-none w-full placeholder-white/40"
                placeholder="Enter room…"
                spellCheck={false}
              />
              <span className="text-white/30 text-[10px] font-mono shrink-0">✎</span>
            </div>
          </label>
        </div>

        {/* Primary CTA — unmistakably a button, large target */}
        <div className="absolute left-4 right-4" style={{ bottom: 72 }}>
          <button
            onMouseEnter={() => setHoverStart(true)}
            onMouseLeave={() => setHoverStart(false)}
            className="w-full rounded-2xl py-4 font-mono font-bold text-lg shadow-2xl transition-all duration-150 select-none cursor-pointer"
            style={{
              background: hoverStart
                ? "linear-gradient(135deg,#fff 0%,#e8e8ff 100%)"
                : "linear-gradient(135deg,#f0f0ff 0%,#d8d0ff 100%)",
              color: "#4820c0",
              transform: hoverStart ? "translateY(-2px) scale(1.02)" : "none",
              boxShadow: hoverStart ? "0 8px 28px rgba(0,0,0,0.4)" : "0 4px 16px rgba(0,0,0,0.3)",
              letterSpacing: 1.5
            }}
          >
            ▶ &nbsp; START GAME
          </button>
        </div>

        {/* Danger zone — clearly separated, lower weight */}
        <div className="absolute bottom-0 left-0 right-0 flex justify-center pb-3">
          <button className="text-red-300/60 text-[10px] font-mono underline underline-offset-2 cursor-pointer hover:text-red-300/90 transition-colors">
            Reset progress
          </button>
        </div>

        {/* Chat affordance — labelled, not just an icon */}
        <div className="absolute bottom-3 right-4 flex items-center gap-1 bg-black/30 rounded-lg px-2 py-1 cursor-pointer hover:bg-black/50 transition-colors">
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
            <rect x="1" y="1" width="10" height="7" rx="2" stroke="white" strokeWidth="1.2" strokeOpacity="0.7"/>
            <path d="M3 9l1.5 2L6 9" stroke="white" strokeWidth="1.2" strokeOpacity="0.7"/>
          </svg>
          <span className="text-white/60 text-[9px] font-mono">Chat</span>
        </div>

        <div className="absolute bottom-3 left-3 text-[8px] font-mono text-white/20">
          Affordance: labelled inputs · large target · hover feedback
        </div>
      </div>
    </div>
  );
}
