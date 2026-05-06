import { useSensor } from '../context/SensorContext.jsx';
import { FaSmile, FaFrown, FaMeh, FaClock, FaArrowUp, FaArrowDown } from "react-icons/fa";
import { useEffect, useRef, useState } from 'react';

function getComfortStatus(score) {
  if (score === null) return { text: "Waiting for data...", icon: FaMeh };
  if (score >= 90) return { text: "Excellent — Your environment is optimal for comfort and productivity", icon: FaSmile };
  if (score >= 70) return { text: "Good — Minor improvements could enhance comfort", icon: FaMeh };
  return { text: "Poor — Your environment needs attention", icon: FaFrown };
}

function getTimeSince(ts) {
  if (!ts) return null;
  const diff = Math.floor((Date.now() - ts) / 1000);
  if (diff < 60) return `${diff}s ago`;
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  return `${Math.floor(diff / 3600)}h ago`;
}

const Hero = () => {
  const { comfortScore, lastSeen, connected } = useSensor();
  const prevScore = useRef(null);
  const [change, setChange] = useState(0);
  const [timeSince, setTimeSince] = useState(null);

  useEffect(() => {
    if (comfortScore !== null && prevScore.current !== null)
      setChange(comfortScore - prevScore.current);
    prevScore.current = comfortScore;
  }, [comfortScore]);

  useEffect(() => {
    setTimeSince(getTimeSince(lastSeen));
    const interval = setInterval(() => setTimeSince(getTimeSince(lastSeen)), 1000);
    return () => clearInterval(interval);
  }, [lastSeen]);

  const score = comfortScore ?? 0;
  const { text: statusText, icon: StatusIcon } = getComfortStatus(comfortScore);

  return (
    <div className="mb-8 rounded-2xl shadow-lg">
      <section className="w-full bg-linear-to-br from-indigo-600 via-violet-500 to-purple-800 px-6 sm:px-10 py-8 sm:py-0 sm:h-[36vh] sm:min-h-[200px] rounded-2xl flex flex-col sm:flex-row justify-between items-center text-white shadow-lg gap-6 sm:gap-0">

        {/* ── text side ── */}
        <span className="flex flex-col items-center sm:items-start gap-2 text-center sm:text-left">
          <p className="font-semibold text-sm sm:text-base">AI Comfort Score</p>

          <h1 className="text-5xl sm:text-6xl font-bold">
            {comfortScore ?? '--'}
            <span className="text-2xl sm:text-3xl"> /100</span>
          </h1>

          <p className="text-sm sm:text-base max-w-xs sm:max-w-none">{statusText}</p>

          {/* meta row */}
          <p className="flex flex-wrap justify-center sm:justify-start items-center gap-x-3 gap-y-1 text-sm">
            {comfortScore !== null && change !== 0 && (
              change > 0
                ? <span className="flex items-center gap-1"><FaArrowUp color="lightgreen" />+{change}</span>
                : <span className="flex items-center gap-1"><FaArrowDown color="#f22" />{change}</span>
            )}
            {timeSince && (
              <span className="flex items-center gap-1.5 text-white/80">
                <FaClock size="12px" /> Updated {timeSince}
              </span>
            )}
            {!connected && (
              <span className="text-red-300 text-xs font-semibold">— Device offline</span>
            )}
          </p>
        </span>

        {/* ── circle gauge ── */}
        <span className="relative flex items-center justify-center w-36 h-36 sm:w-48 sm:h-48 shrink-0">
          <svg className="w-full h-full -rotate-90" viewBox="0 0 200 200">
            <circle cx="100" cy="100" r="80" stroke="rgba(255,255,255,0.2)" strokeWidth="12" fill="none" />
            <circle
              cx="100" cy="100" r="80"
              stroke="white" strokeWidth="12" fill="none"
              strokeLinecap="round"
              strokeDasharray={2 * Math.PI * 80}
              strokeDashoffset={(2 * Math.PI * 80) * (1 - score / 100)}
              style={{ transition: "stroke-dashoffset 0.8s ease" }}
            />
          </svg>
          <StatusIcon className="absolute w-10 h-10 sm:w-14 sm:h-14" />
        </span>

      </section>
    </div>
  );
};

export default Hero;