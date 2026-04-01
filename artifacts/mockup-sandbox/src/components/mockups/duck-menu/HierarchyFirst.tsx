export function HierarchyFirst() {
  return (
    <div className="w-full h-screen flex items-center justify-center bg-gray-800">
      <div
        className="relative overflow-hidden rounded-2xl"
        style={{ width: 460, height: 460, background: "#7B56F5" }}
      >
        {/* Zone 1 — Identity (top, primary weight) */}
        <div className="absolute top-0 left-0 right-0 flex flex-col items-center pt-7 pb-4"
          style={{ background: "linear-gradient(180deg,rgba(0,0,0,0.28) 0%,transparent 100%)" }}>
          <p className="text-white/70 text-xs font-mono uppercase tracking-widest mb-1">
            The Duck Game
          </p>
          <h1 className="font-['Bangers'] text-white leading-none drop-shadow-lg"
            style={{ fontSize: 68, letterSpacing: 2 }}>
            DUCK
          </h1>
          <h1 className="font-['Bangers'] text-white leading-none drop-shadow-lg"
            style={{ fontSize: 68, letterSpacing: 2, marginTop: -14 }}>
            GAME
          </h1>
        </div>

        {/* Zone 2 — Primary CTA (visual centre, highest contrast) */}
        <div className="absolute inset-0 flex flex-col items-center justify-center" style={{ paddingTop: 60 }}>
          <div
            className="rounded-xl px-8 py-3 font-mono font-bold text-white text-base shadow-xl cursor-pointer select-none"
            style={{ background: "rgba(255,255,255,0.18)", border: "2px solid rgba(255,255,255,0.45)", letterSpacing: 1 }}
          >
            ▶ &nbsp; Click the duck to start
          </div>
          {/* duck silhouette placeholder */}
          <div className="mt-6 flex items-end justify-center">
            <svg width="110" height="110" viewBox="0 0 110 110" fill="none">
              <ellipse cx="55" cy="75" rx="32" ry="22" fill="white" fillOpacity="0.93" />
              <ellipse cx="55" cy="54" rx="22" ry="24" fill="white" fillOpacity="0.93" />
              <ellipse cx="55" cy="36" rx="16" ry="18" fill="white" fillOpacity="0.93" />
              <ellipse cx="68" cy="38" rx="8" ry="5" fill="#F9C535" />
              <circle cx="60" cy="32" r="3" fill="#333" />
              <circle cx="70" cy="33" r="3" fill="#333" />
            </svg>
          </div>
        </div>

        {/* Zone 3 — Settings (bottom, tertiary — smallest visual weight) */}
        <div className="absolute bottom-0 left-0 right-0 pb-4 px-4"
          style={{ background: "linear-gradient(0deg,rgba(0,0,0,0.35) 0%,transparent 100%)" }}>
          <p className="text-white/50 text-[9px] font-mono uppercase tracking-widest text-center mb-2">
            Player Settings
          </p>
          <div className="flex gap-2">
            <div className="flex-1 flex items-center gap-1 bg-black/30 rounded-lg px-3 py-1.5">
              <span className="text-white/50 text-[10px] font-mono w-10 shrink-0">Name</span>
              <span className="text-white text-xs font-mono">Duck</span>
            </div>
            <div className="flex-1 flex items-center gap-1 bg-black/30 rounded-lg px-3 py-1.5">
              <span className="text-white/50 text-[10px] font-mono w-10 shrink-0">Room</span>
              <span className="text-white text-xs font-mono">duck-game</span>
            </div>
          </div>
          <div className="flex justify-center mt-2">
            <span className="text-red-300/70 text-[9px] font-mono underline cursor-pointer">Reset progress</span>
          </div>
        </div>

        {/* online badge */}
        <div className="absolute top-3 right-4 text-[10px] font-mono" style={{ color: "#6ee7b7" }}>online</div>
      </div>

      {/* Annotation */}
      <div className="absolute bottom-3 left-0 right-0 text-center">
        <p className="text-white/40 text-[10px] font-mono">
          Hierarchy: Identity → CTA → Settings · diminishing weight top→bottom
        </p>
      </div>
    </div>
  );
}
