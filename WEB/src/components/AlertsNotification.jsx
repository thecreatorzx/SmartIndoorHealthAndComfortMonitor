import { BsExclamationTriangleFill } from "react-icons/bs";
import { FaCheckCircle, FaTimesCircle } from "react-icons/fa";
import { useSensor } from '../context/SensorContext.jsx';

const STYLES = {
  threshold: { bg: "bg-yellow-100", border: "border-yellow-400", dark: "text-yellow-600", icon: BsExclamationTriangleFill },
  timeout:   { bg: "bg-red-100",    border: "border-red-400",    dark: "text-red-600",    icon: FaTimesCircle              },
};

function formatTime(ts) {
  const diff = Math.floor((Date.now() - ts) / 1000);
  if (diff < 60) return `${diff} seconds ago`;
  if (diff < 3600) return `${Math.floor(diff / 60)} minutes ago`;
  return `${Math.floor(diff / 3600)} hours ago`;
}

// group consecutive duplicate alerts into one entry with a count
function groupAlerts(alerts) {
  const grouped = [];

  for (const alert of alerts) {
    const last = grouped[grouped.length - 1];

    const isSameType = last?.type === alert.type;
    const isSameTimeout = alert.type === 'timeout' && last?.type === 'timeout';
    const isSameThreshold = alert.type === 'threshold' &&
      last?.type === 'threshold' &&
      JSON.stringify(last.breaches) === JSON.stringify(alert.breaches);

    if (last && isSameType && (isSameTimeout || isSameThreshold)) {
      last.count += 1;
      last.receivedAt = alert.receivedAt; // update to most recent
    } else {
      grouped.push({ ...alert, count: 1 });
    }
  }

  return grouped;
}

function buildMessage(alert) {
  if (alert.type === 'timeout') return alert.message;
  if (alert.type === 'threshold' && alert.breaches) {
    const breached = Object.entries(alert.breaches)
      .filter(([, s]) => s !== null)
      .map(([field, severity]) => `${field} (${severity})`)
      .join(', ');
    return `Threshold breach: ${breached}`;
  }
  return 'Unknown alert';
}

const AlertsNotification = () => {
  const { alerts } = useSensor();
  const grouped = groupAlerts(alerts);

  return (
    <div className='w-full h-fit bg-white p-6 flex flex-col rounded-2xl shadow-lg mb-10'>
      <h1 className='text-2xl font-bold text-left mb-6 flex justify-between'>
        Recent Alerts & Notifications
        <span className='text-sm text-gray-400 font-normal self-center'>{alerts.length} total</span>
      </h1>

      {/* ✅ fixed height + scroll */}
      <div className="flex flex-col gap-4 max-h-96 overflow-y-auto pr-1">
        {grouped.length === 0 ? (
          <div className="text-center text-gray-400 py-8">No alerts — all systems normal</div>
        ) : (
          grouped.map(alert => {
            const style = STYLES[alert.type] ?? STYLES.threshold;
            const AlertIcon = style.icon;
            return (
              <div key={alert.id} className={`flex items-start p-4 rounded-2xl border-2 ${style.border} ${style.bg} shrink-0`}>
                <AlertIcon className={`w-10 h-10 p-2.5 rounded-xl mr-4 shrink-0 bg-white ${style.dark}`} />
                <div className="flex flex-col text-left flex-1">
                  <div className="flex justify-between items-center">
                    <span className={`font-semibold capitalize ${style.dark}`}>
                      {alert.type === 'threshold' ? 'Threshold Breach' : 'Device Timeout'}
                    </span>
                    {/* ✅ repeat count badge */}
                    {alert.count > 1 && (
                      <span className={`text-xs font-bold px-2 py-0.5 rounded-full bg-white ${style.dark}`}>
                        ×{alert.count}
                      </span>
                    )}
                  </div>
                  <span className="text-sm text-gray-600">{buildMessage(alert)}</span>
                  <span className="text-xs text-gray-400 mt-1">{formatTime(alert.receivedAt)}</span>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default AlertsNotification;