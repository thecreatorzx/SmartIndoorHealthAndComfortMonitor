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
  if (diff < 60) return `${diff} seconds`;
  if (diff < 3600) return `${Math.floor(diff / 60)} minutes`;
  return `${Math.floor(diff / 3600)} hours`;
}

const Hero = () => {
  const { comfortScore, lastSeen, connected } = useSensor();
  const prevScore = useRef(null);
  const [change, setChange] = useState(0);
  const [timeSince, setTimeSince] = useState(null);

  // compute score change
  useEffect(() => {
    if (comfortScore !== null && prevScore.current !== null) {
      setChange(comfortScore - prevScore.current);
    }
    prevScore.current = comfortScore;
  }, [comfortScore]);

  // update "X seconds ago" every second
  useEffect(() => {
    setTimeSince(getTimeSince(lastSeen));
    const interval = setInterval(() => {
      setTimeSince(getTimeSince(lastSeen));
    }, 1000);
    return () => clearInterval(interval);
  }, [lastSeen]);

  const score = comfortScore ?? 0;
  const { text: statusText, icon: StatusIcon } = getComfortStatus(comfortScore);

  return (
    <div className='mb-8 rounded-2xl shadow-lg'>
      <section className="w-full h-[36vh] bg-linear-to-br from-indigo-600 via-violet-500 to-purple-800 px-10 rounded-2xl flex justify-between items-center text-white shadow-lg">
        <span className='flex justify-evenly items-start flex-col'>
          <p className='font-semibold'>AI Comfort Score</p>
          <h1 className='text-6xl font-bold pb-2'>
            {comfortScore ?? '--'}
            <span className='text-3xl'> /100</span>
          </h1>
          <p className='pb-2'>{statusText}</p>
          <p className='flex items-center'>
            {comfortScore !== null && (
              change > 0
                ? <span className="flex w-9 justify-between items-center"><FaArrowUp color='lightgreen' /> +{change}</span>
                : change < 0
                  ? <span className='flex w-9 justify-between items-center'><FaArrowDown color='#f22' />{change}</span>
                  : <span className='w-9' />
            )}
            {timeSince && (
              <span className='flex pl-6 items-center gap-2'>
                <FaClock /> Updated {timeSince} ago
              </span>
            )}
            {!connected && (
              <span className='ml-4 text-red-300 text-sm font-semibold'>
                — Device offline
              </span>
            )}
          </p>
        </span>

        <span className="relative flex items-center justify-center w-48 h-48 py-1">
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
          <StatusIcon className='absolute size-15' />
        </span>
      </section>
    </div>
  );
};

export default Hero;