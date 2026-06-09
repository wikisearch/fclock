import { useEffect, useMemo, useRef, useState } from "react";
import FlipCard from "./components/FlipCard";

function pad(n: number) {
  return n.toString().padStart(2, "0");
}

export default function App() {
  const [now, setNow] = useState(new Date());
  const [is24, setIs24] = useState(true);
  const [showSeconds, setShowSeconds] = useState(true);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [isDark, setIsDark] = useState(false);
  const [keepAwake, setKeepAwake] = useState(false);
  const wakeLockRef = useRef<any>(null);

  // Tick mỗi giây
  useEffect(() => {
    const id = window.setInterval(() => setNow(new Date()), 1000);
    return () => window.clearInterval(id);
  }, []);

  // Thay đổi theme trên <body>
  useEffect(() => {
    document.documentElement.setAttribute(
      "data-theme",
      isDark ? "dark" : "light"
    );
  }, [isDark]);

  // Keep Awake (Screen Wake Lock)
  useEffect(() => {
    const apply = async () => {
      try {
        if (keepAwake && "wakeLock" in navigator) {
          // @ts-ignore
          wakeLockRef.current = await navigator.wakeLock.request("screen");
        } else if (!keepAwake && wakeLockRef.current) {
          await wakeLockRef.current.release();
          wakeLockRef.current = null;
        }
      } catch {}
    };
    apply();
    const onVis = () => {
      if (document.visibilityState === "visible" && keepAwake) apply();
    };
    document.addEventListener("visibilitychange", onVis);
    return () => document.removeEventListener("visibilitychange", onVis);
  }, [keepAwake]);

  const { hh, mm, ss, ampm } = useMemo(() => {
    const h24 = now.getHours();
    const isPm = h24 >= 12;
    const h12 = ((h24 + 11) % 12) + 1;
    const h = is24 ? h24 : h12;
    return {
      hh: pad(h),
      mm: pad(now.getMinutes()),
      ss: pad(now.getSeconds()),
      ampm: isPm ? "PM" : "AM",
    };
  }, [now, is24]);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
    } else {
      document.exitFullscreen().catch(() => {});
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 text-center font-mono relative">
      {/* Nút cài đặt góc trên */}
      <div className="absolute top-6 right-6 z-50">
        <button
          onClick={() => setSettingsOpen(true)}
          className="btn-brut !px-4 !py-2 !text-xs"
        >
          [ ⚙ ]
        </button>
      </div>

      <div className="flex flex-col items-center gap-8 animate-zoom-in w-full max-w-[1200px]">
        {/* Kicker Header */}
        <p className="font-bold text-[1.05rem] md:text-[1.2rem] mt-[-1rem] md:mt-[-2rem] tracking-widest uppercase text-[var(--ink)]">
          [ FLIP CLOCK ONLINE ]
        </p>

        {/* Khối Clock Chính */}
        <div className="flex flex-wrap items-center justify-center select-none w-full gap-4 md:gap-8">
          <FlipGroup digits={hh} />
          
          {/* Dấu hai chấm kiểu SVG Brutalist (thay cho dấu hai chấm thường) */}
          <div className="w-[3rem] h-[5rem] md:w-[4rem] md:h-[8rem] flex flex-col items-center justify-center gap-4 shrink-0 mt-2 md:mt-4">
            <svg
              viewBox="0 0 100 100"
              className="w-full h-full drop-shadow-[4px_4px_0px_var(--ink)] animate-pulse"
              style={{ filter: 'drop-shadow(4px 4px 0px var(--ink))' }}
            >
              <rect x="35" y="20" width="30" height="20" fill="var(--ink)" />
              <rect x="35" y="60" width="30" height="20" fill="var(--ink)" />
            </svg>
          </div>

          <FlipGroup digits={mm} />

          {/* Dấu hai chấm & Giây */}
          {showSeconds && (
            <>
              <div className="w-[2rem] h-[4rem] md:w-[3rem] md:h-[6rem] flex flex-col items-center justify-center gap-4 shrink-0 mt-2 md:mt-4">
                <svg
                  viewBox="0 0 100 100"
                  className="w-full h-full drop-shadow-[4px_4px_0px_var(--ink)] animate-pulse"
                  style={{ filter: 'drop-shadow(4px 4px 0px var(--ink))', animationDelay: '0.5s' }}
                >
                  <rect x="35" y="25" width="30" height="15" fill="var(--ink)" />
                  <rect x="35" y="60" width="30" height="15" fill="var(--ink)" />
                </svg>
              </div>
              <FlipGroup digits={ss} small />
            </>
          )}

          {/* Chỉ báo AM/PM nếu là 12H */}
          {!is24 && (
            <div className="flex flex-col justify-center ml-2">
              <span className="font-black text-4xl md:text-6xl tracking-tighter text-[var(--ink)]"
                    style={{ filter: 'drop-shadow(3px 3px 0px color-mix(in srgb, var(--ink) 20%, transparent))' }}>
                {ampm}
              </span>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center justify-center gap-4 mt-6">
          <button className="btn-brut" onClick={toggleFullscreen}>
            [ FULLSCREEN ]
          </button>
          <button
            className="btn-brut"
            onClick={() => setIsDark((v) => !v)}
          >
            [ THEME: {isDark ? "DARK" : "LIGHT"} ]
          </button>
        </div>
      </div>

      {/* Cửa sổ Settings mộc mạc */}
      {settingsOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[var(--ink)]/80 backdrop-blur-sm">
          <div className="bg-[var(--cream)] border-4 border-[var(--ink)] shadow-[8px_8px_0px_var(--ink)] w-full max-w-md p-6 flex flex-col gap-6 animate-zoom-in">
            <div className="flex justify-between items-center border-b-4 border-[var(--ink)] pb-4">
              <h2 className="text-2xl font-black tracking-widest uppercase">
                [ CONFIG ]
              </h2>
              <button
                className="font-black text-xl hover:text-red-500 transition-colors"
                onClick={() => setSettingsOpen(false)}
              >
                ✕
              </button>
            </div>

            <div className="flex flex-col gap-4 text-left">
              <SettingRow
                label="FORMAT"
                val={is24 ? "24H" : "12H"}
                onClick={() => setIs24(!is24)}
              />
              <SettingRow
                label="SECONDS"
                val={showSeconds ? "ON" : "OFF"}
                onClick={() => setShowSeconds(!showSeconds)}
              />
              <SettingRow
                label="KEEP AWAKE"
                val={keepAwake ? "ON" : "OFF"}
                onClick={() => setKeepAwake(!keepAwake)}
              />
            </div>

            <button
              className="btn-brut w-full mt-4 !py-4"
              onClick={() => setSettingsOpen(false)}
            >
              [ CLOSE ]
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function FlipGroup({ digits, small }: { digits: string; small?: boolean }) {
  const [a, b] = digits.split("");
  return (
    <div className="flex gap-2 md:gap-3">
      <FlipCard value={a} small={small} />
      <FlipCard value={b} small={small} />
    </div>
  );
}

function SettingRow({
  label,
  val,
  onClick,
}: {
  label: string;
  val: string;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className="flex items-center justify-between p-4 border-2 border-[var(--ink)] hover:bg-[var(--ink)] hover:text-[var(--cream)] transition-colors group text-lg font-bold tracking-widest uppercase"
    >
      <span>{label}</span>
      <span className="bg-[var(--ink)] text-[var(--cream)] group-hover:bg-[var(--cream)] group-hover:text-[var(--ink)] px-3 py-1">
        {val}
      </span>
    </button>
  );
}
