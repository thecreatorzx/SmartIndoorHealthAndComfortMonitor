import { useEffect, useState } from 'react';
import axios from 'axios';
import { BsExclamationTriangleFill } from 'react-icons/bs';
import { FaTimesCircle, FaCheckCircle } from 'react-icons/fa';
import { MdOutlineArrowUpward } from 'react-icons/md';
import { useSensor } from '../context/SensorContext.jsx';

function timeAgo(ts) {
  const diff = Math.floor((Date.now() - new Date(ts).getTime()) / 1000);
  if (diff < 60)    return `${diff}s ago`;
  if (diff < 3600)  return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
}

// ── style maps ─────────────────────────────────────────────────────────────
const LIVE_STYLES = {
  threshold:  { bg: "bg-yellow-50", border: "border-yellow-400", text: "text-yellow-700", icon: BsExclamationTriangleFill, label: "Threshold Breach"  },
  timeout:    { bg: "bg-red-50",    border: "border-red-400",    text: "text-red-700",    icon: FaTimesCircle,             label: "Device Timeout"    },
  escalation: { bg: "bg-orange-50", border: "border-orange-400", text: "text-orange-700", icon: MdOutlineArrowUpward,      label: "Escalation"        },
};

const DB_STYLES = {
  warning:  { bg: "bg-yellow-50", border: "border-yellow-400", text: "text-yellow-700", icon: BsExclamationTriangleFill },
  critical: { bg: "bg-red-50",    border: "border-red-400",    text: "text-red-700",    icon: FaTimesCircle             },
};

// ── helpers ────────────────────────────────────────────────────────────────
function buildLiveMessage(alert) {
  if (alert.type === 'timeout')    return alert.message ?? 'Device not responding';
  if (alert.type === 'escalation') return alert.message ?? 'Exposure escalated to critical';
  if (alert.type === 'threshold' && alert.breaches) {
    const breached = Object.entries(alert.breaches)
      .filter(([, s]) => s !== null)
      .map(([field, severity]) => `${field.replace(/_/g, ' ')} (${severity})`)
      .join(', ');
    return `Threshold breach: ${breached}`;
  }
  return 'Unknown alert';
}

// ── DB alert card ──────────────────────────────────────────────────────────
const DbAlertCard = ({ alert, onAcknowledge }) => {
  const style = DB_STYLES[alert.severity] ?? DB_STYLES.warning;
  const Icon  = style.icon;

  return (
    <div className={`flex items-start p-4 rounded-2xl border-2 ${style.border} ${style.bg} shrink-0 ${alert.acknowledged ? 'opacity-60' : ''}`}>
      <Icon className={`w-9 h-9 sm:w-10 sm:h-10 p-2 sm:p-2.5 rounded-xl mr-3 sm:mr-4 shrink-0 bg-white ${style.text}`} />
      <div className="flex flex-col text-left flex-1 min-w-0">
        <div className="flex justify-between items-start gap-2">
          <span className={`font-semibold text-sm sm:text-base ${style.text}`}>
            {alert.title}
          </span>
          {alert.acknowledged && (
            <span className="text-xs text-gray-400 flex items-center gap-1 shrink-0">
              <FaCheckCircle className="text-green-400" /> Read
            </span>
          )}
        </div>
        <span className="text-sm text-gray-600 mt-0.5">{alert.message}</span>
        <div className="flex justify-between items-center mt-1 flex-wrap gap-1">
          <span className="text-xs text-gray-400">{timeAgo(alert.created_at)}</span>
          {!alert.acknowledged && (
            <button
              onClick={() => onAcknowledge(alert.id)}
              className="text-xs text-indigo-500 font-semibold hover:text-indigo-700 transition"
            >
              Dismiss
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

// ── Live alert card ────────────────────────────────────────────────────────
const LiveAlertCard = ({ alert }) => {
  const style = LIVE_STYLES[alert.type] ?? LIVE_STYLES.threshold;
  const Icon  = style.icon;

  return (
    <div className={`flex items-start p-4 rounded-2xl border-2 ${style.border} ${style.bg} shrink-0`}>
      <Icon className={`w-9 h-9 sm:w-10 sm:h-10 p-2 sm:p-2.5 rounded-xl mr-3 sm:mr-4 shrink-0 bg-white ${style.text}`} />
      <div className="flex flex-col text-left flex-1 min-w-0">
        <div className="flex justify-between items-center gap-2">
          <span className={`font-semibold text-sm sm:text-base ${style.text}`}>
            {style.label}
          </span>
          <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-white text-gray-500 shrink-0">
            Live
          </span>
        </div>
        <span className="text-sm text-gray-600 truncate">{buildLiveMessage(alert)}</span>
        <span className="text-xs text-gray-400 mt-1">{timeAgo(alert.receivedAt)}</span>
      </div>
    </div>
  );
};

// ── Main component ─────────────────────────────────────────────────────────
const AlertsNotification = () => {
  const { alerts: liveAlerts, DEVICE_CODE, SERVER_URL } = useSensor();
  const [dbAlerts, setDbAlerts]   = useState([]);
  const [loading, setLoading]     = useState(true);
  const [activeTab, setActiveTab] = useState('all'); // 'all' | 'live' | 'history'

  // fetch persisted alerts on mount
  useEffect(() => {
    axios.get(`${SERVER_URL}/devices/${DEVICE_CODE}/alerts?limit=50`, { withCredentials: true })
      .then(res => setDbAlerts(res.data.data ?? []))
      .catch(err => console.error('Failed to fetch alerts:', err.message))
      .finally(() => setLoading(false));
  }, []);

  const handleAcknowledge = (id) => {
    axios.patch(
      `${SERVER_URL}/devices/${DEVICE_CODE}/alerts/${id}/acknowledge`,
      {},
      { withCredentials: true }
    )
      .then(() => {
        setDbAlerts(prev =>
          prev.map(a => a.id === id ? { ...a, acknowledged: true } : a)
        );
      })
      .catch(err => console.error('Acknowledge failed:', err.message));
  };

  const unreadDb   = dbAlerts.filter(a => !a.acknowledged).length;
  const totalLive  = liveAlerts.length;
  const totalCount = totalLive + dbAlerts.length;

  return (
    <div className="w-full bg-white p-5 sm:p-6 flex flex-col rounded-2xl shadow-lg mb-10">

      {/* header */}
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-xl sm:text-2xl font-bold">Alerts & Notifications</h1>
        <div className="flex items-center gap-2 text-sm text-gray-400">
          {unreadDb > 0 && (
            <span className="bg-red-100 text-red-600 font-semibold text-xs px-2 py-0.5 rounded-full">
              {unreadDb} unread
            </span>
          )}
          <span>{totalCount} total</span>
        </div>
      </div>

      {/* tabs */}
      <div className="flex gap-2 mb-4 border-b border-gray-100 pb-3">
        {[
          { key: 'all',     label: 'All'         },
          { key: 'live',    label: `Live (${totalLive})`           },
          { key: 'history', label: `History (${dbAlerts.length})`  },
        ].map(tab => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`text-sm px-3 py-1.5 rounded-lg transition ${
              activeTab === tab.key
                ? 'bg-indigo-500 text-white'
                : 'text-gray-500 hover:bg-gray-100'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* content */}
      <div className="flex flex-col gap-3 max-h-96 overflow-y-auto pr-1">

        {/* live alerts */}
        {(activeTab === 'all' || activeTab === 'live') && (
          <>
            {liveAlerts.length === 0 && activeTab === 'live' && (
              <div className="text-center text-gray-400 py-6 text-sm">
                No live alerts this session
              </div>
            )}
            {liveAlerts.map(alert => (
              <LiveAlertCard key={alert.id} alert={alert} />
            ))}
          </>
        )}

        {/* db alerts */}
        {(activeTab === 'all' || activeTab === 'history') && (
          <>
            {loading && (
              <div className="flex flex-col gap-3">
                {[1, 2, 3].map(i => (
                  <div key={i} className="h-20 rounded-2xl bg-gray-100 animate-pulse" />
                ))}
              </div>
            )}
            {!loading && dbAlerts.length === 0 && activeTab === 'history' && (
              <div className="text-center text-gray-400 py-6 text-sm">
                No historical alerts found
              </div>
            )}
            {!loading && dbAlerts.map(alert => (
              <DbAlertCard
                key={alert.id}
                alert={alert}
                onAcknowledge={handleAcknowledge}
              />
            ))}
          </>
        )}

        {/* empty state for all tab */}
        {activeTab === 'all' && totalCount === 0 && !loading && (
          <div className="text-center text-gray-400 py-8 text-sm">
            No alerts — all systems normal
          </div>
        )}
      </div>
    </div>
  );
};

export default AlertsNotification;