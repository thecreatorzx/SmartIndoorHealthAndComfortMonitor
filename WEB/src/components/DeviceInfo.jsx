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
        { label: "Last Update",   value: getTimeSince(lastSeen)              },
        { label: "Device Code",   value: deviceInfo?.device_code   ?? "N/A"  },
        { label: "Location",      value: deviceInfo?.location      ?? "N/A"  },
      ],
    },
    {
      icon: FaWifi,
      name: "Connection",
      status: connected ? "Connected" : "Disconnected",
      bg: connected ? "bg-blue-100" : "bg-red-100",
      color: connected ? "text-blue-500" : "text-red-500",
      rows: [
        { label: "Status",      value: connected ? "Active" : "Inactive"    },
        { label: "Description", value: deviceInfo?.description ?? "N/A"     },
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
        { label: "Power Mode",      value: "Performance" },
        { label: "Backup Battery",  value: "N/A"         },
        { label: "Est. Battery Life", value: "N/A"       },
      ],
    },
  ];

  return (
    <div className='w-full h-fit bg-white p-6 flex flex-col rounded-2xl shadow-lg mb-10'>
      <h1 className='text-2xl font-bold text-left mb-6'>Device Information</h1>
      <div className="cards flex justify-around items-center">
        {cards.map((card, index) => (
          <div key={index} className="flex justify-center items-start flex-col text-left">
            <div className="flex justify-center items-center">
              <card.icon className={`w-12 h-12 p-3 rounded-xl mb-2 ${card.bg} ${card.color}`} />
              <div className="flex flex-col ml-4">
                <i className='font-semibold'>{card.name}</i>
                <i className={`text-sm font-semibold ${card.color}`}>{card.status}</i>
              </div>
            </div>
            <div className="flex w-[28vw] m-auto flex-col mt-2">
              {card.rows.map((row, i) => (
                <div key={i} className="text-sm text-gray-500 pb-1 flex justify-between">
                  {row.label}: <i className='text-gray-700 font-semibold'>{row.value}</i>
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