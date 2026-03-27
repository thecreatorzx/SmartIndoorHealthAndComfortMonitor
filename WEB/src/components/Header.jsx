import { useState, useRef, useEffect } from "react";
import { GoDotFill } from "react-icons/go";
import { MdHome } from "react-icons/md";
import { FaBell } from "react-icons/fa";
import { IoMdSettings } from "react-icons/io";
import { useSensor } from "../context/SensorContext.jsx";

const ALERT_STYLES = {
  threshold: { bg: "bg-yellow-50", border: "border-yellow-400", text: "text-yellow-700", label: "Threshold Breach" },
  timeout:   { bg: "bg-red-50",    border: "border-red-400",    text: "text-red-700",    label: "Device Timeout"  },
};

const Header = ({ user, onLogout }) => {
  const { connected, alerts } = useSensor();
  const [showNotifications, setShowNotifications] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handler = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setShowNotifications(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const initials = user?.name
    ?.split(" ")
    .map(n => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  return (
    <div className='sticky top-0 z-30'>
      <header className="px-14 w-screen h-[12vh] bg-white flex justify-between items-center mb-10 shadow-lg">
        <span className="text-sm font-bold flex justify-evenly items-center">
          <i className='w-7 h-7 bg-linear-to-br from-purple-400 via-blue-500 to-violet-600 flex justify-center items-center rounded-md'>
            <MdHome size={"18px"} color='white' />
          </i>
          <span className="ml-2.5">
            <div className="text-xl">ComfortAI Monitor</div>
            <div className="text-[0.65rem] font-normal flex">
              <GoDotFill className={`mt-0.5 ${connected ? "text-green-600" : "text-red-500"} mr-1`} />
              Real-time monitoring
            </div>
          </span>
        </span>

        <span className='flex justify-evenly items-center space-x-4'>
          <span className={`flex p-1 px-2.5 text-xs font-bold rounded-sm cursor-default ${connected ? "bg-green-100 text-green-600 hover:bg-green-200" : "bg-red-100 hover:bg-red-200 text-red-600"}`}>
            <GoDotFill className='mt-0.5 mr-1' /> Device {connected ? "Online" : "Offline"}
          </span>

          {/* bell + dropdown */}
          <div className="relative" ref={dropdownRef}>
            <span
              className='relative w-8 h-8 hover:bg-gray-200 cursor-pointer rounded-3xl flex justify-center items-center'
              onClick={() => setShowNotifications(prev => !prev)}
            >
              <FaBell size={"18px"} />
              {alerts.length > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                  {alerts.length > 9 ? '9+' : alerts.length}
                </span>
              )}
            </span>

            {showNotifications && (
              <div className="absolute right-0 top-10 w-96 bg-white rounded-2xl shadow-2xl border border-gray-100 z-50">
                <div className="flex justify-between items-center px-5 py-4 border-b border-gray-100">
                  <h2 className="font-bold text-gray-800">Notifications</h2>
                  <span className="text-xs text-gray-400">{alerts.length} alerts</span>
                </div>

                <div className="max-h-96 overflow-y-auto">
                  {alerts.length === 0 ? (
                    <div className="px-5 py-8 text-center text-gray-400 text-sm">
                      No alerts yet
                    </div>
                  ) : (
                    alerts.map((alert) => {
                      const style = ALERT_STYLES[alert.type] ?? ALERT_STYLES.threshold;
                      return (
                        <div
                          key={alert.id}
                          className={`px-5 py-4 border-l-4 ${style.border} ${style.bg} border-b border-gray-100 last:border-b-0`}
                        >
                          <div className={`text-xs font-bold uppercase mb-1 ${style.text}`}>
                            {style.label}
                          </div>

                          {alert.type === "timeout" && (
                            <p className="text-sm text-gray-700">{alert.message}</p>
                          )}

                          {alert.type === "threshold" && alert.breaches && (
                            <ul className="text-sm text-gray-700 space-y-0.5">
                              {Object.entries(alert.breaches)
                                .filter(([, severity]) => severity !== null)
                                .map(([field, severity]) => (
                                  <li key={field} className="flex justify-between">
                                    <span className="capitalize">{field}</span>
                                    <span className={`font-semibold ${severity === "critical" ? "text-red-500" : "text-yellow-500"}`}>
                                      {severity}
                                    </span>
                                  </li>
                                ))}
                            </ul>
                          )}

                          <div className="text-xs text-gray-400 mt-1">
                            {new Date(alert.receivedAt).toLocaleTimeString()}
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            )}
          </div>

          <span onClick={() => {
            const el = document.querySelector('#settings');
            if (!el) return;
            const target = el.getBoundingClientRect().top-100 + window.scrollY;
            const start = window.scrollY;
            const diff = target - start;
            const duration = 600;
            let startTime;

            const step = (timestamp) => {
              if (!startTime) startTime = timestamp;
              const progress = Math.min((timestamp - startTime) / duration, 1);
              // ease in-out
              const ease = progress < 0.5
                ? 2 * progress * progress
                : -1 + (4 - 2 * progress) * progress;
              window.scrollTo(0, start + diff * ease);
              if (progress < 1) requestAnimationFrame(step);
            };

            requestAnimationFrame(step);
  }} className='w-8 h-8 hover:bg-gray-200 cursor-pointer rounded-3xl flex justify-center items-center'>
            <IoMdSettings size={"20px"} />
          </span>

          {/* avatar — shows initials, click to logout */}
          <span
            className='w-8 h-8 bg-linear-to-br from-violet-400 via-pink-400 to-red-500 flex justify-center items-center rounded-3xl text-sm font-medium text-white cursor-pointer'
            onClick={onLogout}
            title={`Logout (${user?.name})`}
          >
            {initials}
          </span>
        </span>
      </header>
    </div>
  );
};

export default Header;