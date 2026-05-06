import { FaTemperatureHigh, FaWind, FaCheckCircle, FaExclamationTriangle, FaTimesCircle, FaSun } from 'react-icons/fa';
import { MdWaterDrop, MdWbSunny } from 'react-icons/md';
import { PiSpeakerSimpleHighFill } from 'react-icons/pi';
import { WiBarometer } from 'react-icons/wi';
import { useSensor } from '../context/SensorContext.jsx';

// ── Severity thresholds matching backend exactly ───────────────────────────
function getSeverity(key, value) {
  if (value == null) return null;
  switch (key) {
    case 'temperature':
      if (value < 10 || value > 38)  return 'critical';
      if (value < 18 || value > 30)  return 'warning';
      return null;
    case 'humidity':
      if (value < 20 || value > 85)  return 'critical';
      if (value < 30 || value > 70)  return 'warning';
      return null;
    case 'air_quality':
      if (value > 2500) return 'critical';
      if (value > 1000) return 'warning';
      return null;
    case 'noise':
      if (value > 90)   return 'critical';
      if (value > 75)   return 'warning';
      return null;
    case 'uv':
      if (value > 8)    return 'critical';
      if (value > 6)    return 'warning';
      return null;
    case 'light':
      if (value > 2000) return 'critical';
      if (value > 1000) return 'warning';
      return null;
    case 'pressure':
      if (value < 970 || value > 1040)  return 'critical';
      if (value < 990 || value > 1025)  return 'warning';
      return null;
    default:
      return null;
  }
}

const SEVERITY_STYLES = {
  null:     { label: "OPTIMAL",  text: "text-green-500",  bg: "bg-green-100",  icon: FaCheckCircle,         iconColor: "text-green-500"  },
  warning:  { label: "WARNING",  text: "text-yellow-500", bg: "bg-yellow-100", icon: FaExclamationTriangle, iconColor: "text-yellow-500" },
  critical: { label: "CRITICAL", text: "text-red-500",    bg: "bg-red-100",    icon: FaTimesCircle,         iconColor: "text-red-500"    },
  absent:   { label: "N/A",      text: "text-gray-400",   bg: "bg-gray-100",   icon: FaCheckCircle,         iconColor: "text-gray-300"   },
};

const FIELDS = [
  { key: "temperature", label: "Temperature", icon: FaTemperatureHigh,      iconBg: "bg-orange-100", iconColor: "text-orange-500", unit: "°C",   target: "18–30°C",      always: true  },
  { key: "humidity",    label: "Humidity",    icon: MdWaterDrop,             iconBg: "bg-blue-100",   iconColor: "text-blue-500",   unit: "%",    target: "30–70%",       always: true  },
  { key: "air_quality", label: "Air Quality", icon: FaWind,                  iconBg: "bg-green-100",  iconColor: "text-green-500",  unit: " ppm", target: "< 1000 ppm",   always: false },
  { key: "noise",       label: "Noise Level", icon: PiSpeakerSimpleHighFill, iconBg: "bg-purple-100", iconColor: "text-purple-500", unit: " dB",  target: "< 75 dB",      always: false },
  { key: "light",       label: "Light",       icon: MdWbSunny,               iconBg: "bg-yellow-100", iconColor: "text-yellow-500", unit: " lux", target: "< 1000 lux",   always: false },
  { key: "uv",          label: "UV Index",    icon: FaSun,                   iconBg: "bg-pink-100",   iconColor: "text-pink-500",   unit: "",     target: "< 6",          always: false },
  { key: "pressure",    label: "Pressure",    icon: WiBarometer,             iconBg: "bg-gray-100",   iconColor: "text-gray-500",   unit: " hPa", target: "990–1025 hPa", always: false },
];

const ReadingCard = ({ field, value, isAbsent }) => {
  const severity   = isAbsent ? 'absent' : getSeverity(field.key, value);
  const styleKey   = isAbsent ? 'absent' : (severity ?? 'null');
  const style      = SEVERITY_STYLES[styleKey];
  const StatusIcon = style.icon;

  return (
    <div className={`flex-1 min-w-35 max-w-65 bg-white rounded-2xl shadow-lg p-5 sm:p-6 flex flex-col gap-3 ${isAbsent ? 'opacity-60' : ''}`}>
      {/* top row */}
      <div className="flex justify-between items-center">
        <field.icon className={`w-10 h-10 sm:w-12 sm:h-12 p-2 sm:p-2.5 rounded-lg ${field.iconBg} ${field.iconColor}`} />
        <span className={`text-xs font-semibold px-2 py-1 rounded-lg ${style.text} ${style.bg}`}>
          {style.label}
        </span>
      </div>

      {/* value */}
      <div className="flex items-end gap-1">
        <span className="text-3xl sm:text-4xl font-bold leading-none">
          {isAbsent
            ? '—'
            : value != null
              ? (Number.isInteger(value) ? value : value.toFixed(1))
              : '--'}
        </span>
        {!isAbsent && <span className="text-gray-400 text-lg sm:text-xl pb-0.5">{field.unit}</span>}
      </div>

      {/* label + target */}
      <div>
        <p className="font-semibold text-sm sm:text-base">{field.label}</p>
        <p className="text-gray-500 text-xs sm:text-sm flex justify-between items-center mt-1">
          {isAbsent ? 'Sensor warming up…' : `Target: ${field.target}`}
          <StatusIcon className={`${style.iconColor} ml-2`} />
        </p>
      </div>
    </div>
  );
};

const Readings = () => {
  const { latestReading } = useSensor();

  return (
    <div className="mb-10 flex flex-col">
      <p className="text-2xl font-bold pb-5">Current Readings</p>
      <div className="flex flex-wrap gap-4 sm:gap-6 justify-start sm:justify-evenly">
        {FIELDS.map(field => {
          const value    = latestReading?.[field.key];
          // absent = optional field AND it's missing from the reading object entirely
          const isAbsent = !field.always && latestReading != null && !(field.key in latestReading);
          return (
            <ReadingCard
              key={field.key}
              field={field}
              value={value ?? null}
              isAbsent={isAbsent}
            />
          );
        })}
      </div>
    </div>
  );
};

export default Readings;