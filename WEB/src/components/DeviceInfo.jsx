import { BsCpuFill } from "react-icons/bs";
import { FaWifi } from "react-icons/fa";
import { MdPower } from "react-icons/md";
import { useSensor } from '../context/SensorContext.jsx';

function getTimeSince(ts) {
  if (!ts) return 'N/A';
  const diff = Math.floor((Date.now() - ts) / 1000);
  if (diff < 60) return `${diff}s ago`;
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  return `${Math.floor(diff / 3600)}h ago`;
}

const DeviceInfo = () => {
  const { connected, deviceInfo, lastSeen } = useSensor();

  const cards = [
    {
      icon: BsCpuFill,
      name: "Device Status",
      status: connected ? "Online & Active" : "Offline",
      bg: connected ? "bg-green-100" : "bg-red-100",
      color: connected ? "text-green-500" : "text-red-500",
      rows: [
        { label: "Last Update", value: getTimeSince(lastSeen)           },
        { label: "Device Code", value: deviceInfo?.device_code ?? "N/A" },
        { label: "Location",    value: deviceInfo?.location    ?? "N/A" },
      ],
    },
    {
      icon: FaWifi,
      name: "Connection",
      status: connected ? "Connected" : "Disconnected",
      bg: connected ? "bg-blue-100" : "bg-red-100",
      color: connected ? "text-blue-500" : "text-red-500",
      rows: [
        { label: "Status",      value: connected ? "Active" : "Inactive" },
        { label: "Description", value: deviceInfo?.description ?? "N/A"  },
        { label: "Registered",  value: deviceInfo?.created_at ? new Date(deviceInfo.created_at).toLocaleDateString() : "N/A" },
      ],
    },
    {
      icon: MdPower,
      name: "Power Status",
      status: "AC Powered",
      bg: "bg-purple-100",
      color: "text-purple-500",
      rows: [
        { label: "Power Mode",       value: "Performance" },
        { label: "Backup Battery",   value: "N/A"         },
        { label: "Est. Battery Life",value: "N/A"         },
      ],
    },
  ];

  return (
    <div className="w-full bg-white p-5 sm:p-6 flex flex-col rounded-2xl shadow-lg mb-10">
      <h1 className="text-xl sm:text-2xl font-bold text-left mb-6">Device Information</h1>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 sm:gap-6">
        {cards.map((card, index) => (
          <div key={index} className="flex flex-col gap-3 p-4 rounded-xl bg-gray-50">
            {/* icon + name */}
            <div className="flex items-center gap-3">
              <card.icon className={`w-11 h-11 p-2.5 rounded-xl shrink-0 ${card.bg} ${card.color}`} />
              <div>
                <p className="font-semibold text-gray-800 text-sm sm:text-base">{card.name}</p>
                <p className={`text-xs font-semibold ${card.color}`}>{card.status}</p>
              </div>
            </div>

            {/* rows */}
            <div className="flex flex-col gap-1.5 pt-1 border-t border-gray-200">
              {card.rows.map((row, i) => (
                <div key={i} className="flex justify-between text-xs sm:text-sm text-gray-500">
                  <span>{row.label}</span>
                  <span className="font-semibold text-gray-700 text-right ml-2 truncate max-w-[55%]">{row.value}</span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default DeviceInfo;