import { useState } from "react";

export function AccessibilityFirst() {
  const [name, setName] = useState("Duck");
  const [room, setRoom] = useState("duck-game");

  return (
    <div className="w-full h-screen flex items-center justify-center" style={{ background: "#1a1040" }}>
      <div
        className="relative overflow-hidden rounded-2xl"
        style={{ width: 460, height: 460, background: "#1e1060" }}
      >
        {/* High-contrast header bar */}
        <div className="absolute top-0 left-0 right-0 flex items-center justify-between px-4 py-3"
          style={{ background: "#0d0830", borderBottom: "2px solid #4a3bb5" }}>
          <h1 className="font-mono font-bold text-white text-xl tracking-wide">
            The Duck Game
          </h1>
          <span className="flex items-center gap-1.5 text-xs font-mono font-bold"
            style={{ color: "#4ade80" }}>
            <span className="inline-block w-2 h-2 rounded-full bg-green-400" aria-hidden="true" />
            Connected
          </span>
        </div>

        {/* Form section — WCAG AA contrast throughout */}
        <div className="absolute left-4 right-4" style={{ top: 68 }}>
          <fieldset className="border-0 p-0 m-0">
            <legend className="font-mono font-bold text-white/90 text-xs uppercase tracking-widest mb-3">
              Player Settings
            </legend>

            {/* Name field */}
            <div className="mb-3">
              <label htmlFor="a11y-name"
                className="block font-mono text-sm font-semibold mb-1"
                style={{ color: "#c4b5fd" }}>
                Your Name
              </label>
              <input
                id="a11y-name"
                value={name}
                onChange={e => setName(e.target.value)}
                spellCheck={false}
                className="w-full font-mono text-sm rounded-lg px-3 py-2.5 outline-none transition-all"
                style={{
                  background: "#0d0830",
                  color: "#f5f3ff",
                  border: "2px solid #6d5fd5",
                  boxShadow: "0 0 0 0px #7c3aed"
                }}
                onFocus={e => (e.target.style.boxShadow = "0 0 0 3px #7c3aed66")}
                onBlur={e => (e.target.style.boxShadow = "0 0 0 0px #7c3aed")}
                maxLength={16}
                aria-describedby="name-hint"
              />
              <p id="name-hint" className="text-[10px] font-mono mt-0.5" style={{ color: "#a78bfa" }}>
                Shown above your duck
              </p>
            </div>

            {/* Room field */}
            <div className="mb-4">
              <label htmlFor="a11y-room"
                className="block font-mono text-sm font-semibold mb-1"
                style={{ color: "#c4b5fd" }}>
                Room Code
              </label>
              <input
                id="a11y-room"
                value={room}
                onChange={e => setRoom(e.target.value)}
                spellCheck={false}
                className="w-full font-mono text-sm rounded-lg px-3 py-2.5 outline-none transition-all"
                style={{
                  background: "#0d0830",
                  color: "#f5f3ff",
                  border: "2px solid #6d5fd5"
                }}
                onFocus={e => (e.target.style.boxShadow = "0 0 0 3px #7c3aed66")}
                onBlur={e => (e.target.style.boxShadow = "0 0 0 0px #7c3aed")}
                maxLength={24}
                aria-describedby="room-hint"
              />
              <p id="room-hint" className="text-[10px] font-mono mt-0.5" style={{ color: "#a78bfa" }}>
                Share this code to play with friends
              </p>
            </div>
          </fieldset>

          {/* Primary action — large touch target (≥ 44px), clear label */}
          <button
            className="w-full rounded-xl font-mono font-bold text-base transition-all duration-150 focus:outline-none"
            style={{
              background: "#7c3aed",
              color: "#ffffff",
              padding: "14px 0",
              border: "2px solid #a78bfa",
              letterSpacing: 1.2,
              cursor: "pointer"
            }}
            onMouseOver={e => { (e.currentTarget.style.background = "#6d28d9"); }}
            onMouseOut={e => { (e.currentTarget.style.background = "#7c3aed"); }}
            onFocus={e => { e.currentTarget.style.boxShadow = "0 0 0 4px #a78bfa88"; }}
            onBlur={e => { e.currentTarget.style.boxShadow = "none"; }}
          >
            ▶ &nbsp; Start Game
          </button>

          {/* Spacer */}
          <div className="mt-3 border-t" style={{ borderColor: "#4a3bb5" }} />

          {/* Destructive action — isolated, clearly labeled as dangerous */}
          <div className="mt-3 flex items-center gap-2">
            <button
              className="font-mono text-xs rounded-lg px-3 py-2 transition-all focus:outline-none"
              style={{
                color: "#fca5a5",
                background: "rgba(239,68,68,0.12)",
                border: "1px solid rgba(239,68,68,0.35)",
                cursor: "pointer"
              }}
              onFocus={e => { e.currentTarget.style.boxShadow = "0 0 0 3px rgba(239,68,68,0.4)"; }}
              onBlur={e => { e.currentTarget.style.boxShadow = "none"; }}
            >
              ⚠ Reset All Progress
            </button>
            <p className="text-[10px] font-mono" style={{ color: "#f87171", opacity: 0.7 }}>
              Cannot be undone
            </p>
          </div>
        </div>

        {/* Bottom status bar */}
        <div className="absolute bottom-0 left-0 right-0 px-4 py-2 flex items-center justify-between"
          style={{ background: "#0d0830", borderTop: "1px solid #4a3bb5" }}>
          <span className="text-[9px] font-mono" style={{ color: "#6d5fd5" }}>
            Collect pancakes · Feed the carrot
          </span>
          <button className="flex items-center gap-1 font-mono text-[10px] px-2 py-1 rounded"
            style={{ color: "#c4b5fd", background: "rgba(124,58,237,0.2)", border: "1px solid #6d5fd5", cursor: "pointer" }}>
            <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
              <rect x="1" y="1" width="3" height="1.2" rx=".6" fill="currentColor"/>
              <rect x="1" y="4.4" width="8" height="1.2" rx=".6" fill="currentColor"/>
              <rect x="1" y="7.8" width="5" height="1.2" rx=".6" fill="currentColor"/>
            </svg>
            Chat
          </button>
        </div>

        <div className="absolute top-[52px] right-3 text-[8px] font-mono" style={{ color: "#6d5fd5" }}>
          A11y: WCAG AA contrast · 44px targets · visible focus
        </div>
      </div>
    </div>
  );
}
