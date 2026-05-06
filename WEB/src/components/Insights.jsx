import { useEffect, useState } from 'react';
import axios from 'axios';
import { FaLightbulb, FaMoon, FaCheckCircle } from 'react-icons/fa';
import { BsExclamationTriangleFill } from 'react-icons/bs';
import { GoGraph } from 'react-icons/go';
import { MdCalendarToday } from 'react-icons/md';
import { useSensor } from '../context/SensorContext.jsx';

function timeAgo(ts) {
  const diff = Math.floor((Date.now() - new Date(ts).getTime()) / 1000);
  if (diff < 60)   return `${diff}s ago`;
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
}

const SEVERITY_STYLES = {
  critical: { bg: "bg-red-50",    border: "border-red-200",    badge: "bg-red-100 text-red-600",    icon: BsExclamationTriangleFill, iconBg: "bg-red-500"    },
  warning:  { bg: "bg-yellow-50", border: "border-yellow-200", badge: "bg-yellow-100 text-yellow-700", icon: BsExclamationTriangleFill, iconBg: "bg-yellow-500" },
  digest:   { bg: "bg-blue-50",   border: "border-blue-200",   badge: "bg-blue-100 text-blue-600",  icon: MdCalendarToday,           iconBg: "bg-blue-500"   },
};

function getStyle(insight) {
  if (insight.trigger_type === 'digest') return SEVERITY_STYLES.digest;
  return SEVERITY_STYLES[insight.severity] ?? SEVERITY_STYLES.warning;
}

function getBadgeLabel(insight) {
  if (insight.trigger_type === 'digest') return 'Daily Digest';
  if (insight.severity === 'critical')   return 'Critical Breach';
  return 'Warning Breach';
}

function getBreachedLabel(fields) {
  if (!fields?.length) return null;
  return fields.map(f => f.replace(/_/g, ' ')).join(', ');
}

const InsightCard = ({ insight, onAcknowledge }) => {
  const style = getStyle(insight);
  const Icon  = style.icon;

  return (
    <div className={`flex items-start gap-4 rounded-2xl border p-5 sm:p-6 ${style.bg} ${style.border} ${insight.acknowledged ? 'opacity-60' : ''}`}>
      <span className="shrink-0 mt-0.5">
        <Icon className={`w-10 h-10 p-2.5 rounded-xl text-white ${style.iconBg}`} />
      </span>

      <span className="flex flex-col gap-1.5 text-left min-w-0 flex-1">
        {/* badges row */}
        <div className="flex flex-wrap items-center gap-2">
          <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${style.badge}`}>
            {getBadgeLabel(insight)}
          </span>
          {insight.acknowledged && (
            <span className="text-xs text-gray-400 flex items-center gap-1">
              <FaCheckCircle className="text-green-400" /> Read
            </span>
          )}
          {getBreachedLabel(insight.breached_fields) && (
            <span className="text-xs text-gray-500 capitalize">
              — {getBreachedLabel(insight.breached_fields)}
            </span>
          )}
        </div>

        {/* summary */}
        <p className="font-semibold text-gray-800 text-sm sm:text-base">
          {insight.summary}
        </p>

        {/* recommendation */}
        {insight.recommendation && (
          <p className="text-sm text-gray-500 leading-relaxed">
            {insight.recommendation}
          </p>
        )}

        {/* digest averages */}
        {insight.trigger_type === 'digest' && insight.sensor_snapshot?.averages && (
          <div className="flex flex-wrap gap-x-4 gap-y-1 mt-1 text-xs text-gray-500">
            {Object.entries(insight.sensor_snapshot.averages).map(([k, v]) => (
              <span key={k} className="capitalize">
                <span className="font-semibold text-gray-700">{k.replace(/_/g, ' ')}:</span> {parseFloat(v).toFixed(1)}
              </span>
            ))}
          </div>
        )}

        {/* footer */}
        <div className="flex items-center justify-between mt-1 flex-wrap gap-2">
          <span className="text-xs text-gray-400">{timeAgo(insight.created_at)}</span>
          {!insight.acknowledged && (
            <button
              onClick={() => onAcknowledge(insight.id)}
              className="text-xs text-indigo-500 font-semibold hover:text-indigo-700 transition"
            >
              Mark as read
            </button>
          )}
        </div>
      </span>
    </div>
  );
};

const Insights = () => {
  const { insights: liveInsights, DEVICE_CODE, SERVER_URL } = useSensor();
  const [insights, setInsights] = useState([]);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState(null);

  // initial fetch from REST
  useEffect(() => {
    axios.get(`${SERVER_URL}/devices/${DEVICE_CODE}/insights?limit=20`, { withCredentials: true })
      .then(res => setInsights(res.data.data ?? []))
      .catch(err => setError(err.response?.data?.error || err.message))
      .finally(() => setLoading(false));
  }, []);

  // merge live insights from socket (prepend, deduplicate by id)
  useEffect(() => {
    if (!liveInsights.length) return;
    setInsights(prev => {
      const existingIds = new Set(prev.map(i => i.id));
      const newOnes = liveInsights.filter(i => !existingIds.has(i.id));
      return [...newOnes, ...prev].slice(0, 50);
    });
  }, [liveInsights]);

  const handleAcknowledge = (id) => {
    axios.patch(
      `${SERVER_URL}/devices/${DEVICE_CODE}/insights/${id}/acknowledge`,
      {},
      { withCredentials: true }
    )
      .then(() => {
        setInsights(prev =>
          prev.map(i => i.id === id ? { ...i, acknowledged: true } : i)
        );
      })
      .catch(err => console.error('Acknowledge failed:', err.message));
  };

  return (
    <div className="mb-10">
      <div className="flex justify-between items-center pb-6">
        <h1 className="text-2xl font-bold">AI-Powered Insights</h1>
        {insights.length > 0 && (
          <span className="text-sm text-gray-400">
            {insights.filter(i => !i.acknowledged).length} unread
          </span>
        )}
      </div>

      {loading && (
        <div className="flex flex-col gap-4">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-28 rounded-2xl bg-gray-100 animate-pulse" />
          ))}
        </div>
      )}

      {error && (
        <div className="p-5 bg-red-50 border border-red-200 rounded-2xl text-sm text-red-600">
          Failed to load insights: {error}
        </div>
      )}

      {!loading && !error && insights.length === 0 && (
        <div className="flex flex-col items-center justify-center py-16 text-gray-400 gap-3">
          <GoGraph className="w-12 h-12 opacity-30" />
          <p className="text-sm">No insights yet — they appear when thresholds are breached or daily digests are generated.</p>
        </div>
      )}

      {!loading && insights.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
          {insights.map(insight => (
            <InsightCard
              key={insight.id}
              insight={insight}
              onAcknowledge={handleAcknowledge}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default Insights;