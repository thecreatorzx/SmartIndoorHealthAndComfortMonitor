import { FaTemperatureHigh, FaWind, FaCheckCircle, FaExclamationTriangle, FaTimesCircle } from 'react-icons/fa'
import { MdWaterDrop } from "react-icons/md";
import { PiSpeakerSimpleHighFill } from "react-icons/pi";
import { useSensor } from '../context/SensorContext.jsx';

const SEVERITY_STYLES = {
  null:     { label: "OPTIMAL",   text: "text-green-500",  bg: "bg-green-100",  icon: FaCheckCircle,        iconColor: "text-green-500"  },
  warning:  { label: "WARNING",   text: "text-yellow-500", bg: "bg-yellow-100", icon: FaExclamationTriangle, iconColor: "text-yellow-500" },
  critical: { label: "CRITICAL",  text: "text-red-500",    bg: "bg-red-100",    icon: FaTimesCircle,         iconColor: "text-red-500"    },
};

const FIELDS = [
  { key: "temperature", label: "Temperature", icon: FaTemperatureHigh, iconBg: "bg-orange-100", iconColor: "text-orange-500", unit: "°C",  target: "21–24°C"     },
  { key: "humidity",    label: "Humidity",    icon: MdWaterDrop,        iconBg: "bg-blue-100",   iconColor: "text-blue-500",   unit: "%",   target: "40–60%"      },
  { key: "co2",         label: "CO₂ Level",   icon: FaWind,             iconBg: "bg-green-100",  iconColor: "text-green-500",  unit: " ppm",target: "< 1000 ppm"  },
  { key: "noise",       label: "Noise Level", icon: PiSpeakerSimpleHighFill, iconBg: "bg-purple-100", iconColor: "text-purple-500", unit: " dB", target: "< 40 dB" },
];

const ReadingCard = ({ field, value, severity }) => {
  const style = SEVERITY_STYLES[severity] ?? SEVERITY_STYLES[null];
  const StatusIcon = style.icon;

  return (
    <span className="card w-70 h-60 bg-white rounded-2xl shadow-lg">
      <div className="top flex justify-between items-center px-6 pt-8">
        <field.icon className={`w-12 h-12 p-2.5 rounded-lg ${field.iconBg} ${field.iconColor}`} />
        <span className={`status h-6 p-2 flex rounded-lg justify-center items-center text-sm font-semibold ${style.text} ${style.bg}`}>
          {style.label}
        </span>
      </div>
      <div className="flex px-6 pt-6 text-4xl font-bold">
        {value !== null && value !== undefined ? (
          Number.isInteger(value) ? value : value.toFixed(1)
        ) : '--'}
        <i className='text-gray-400 text-2xl pl-1 pt-2'>{field.unit}</i>
      </div>
      <p className='flex px-6 pt-3 font-semibold'>{field.label}</p>
      <p className='flex justify-between pt-3 px-6 text-gray-500 text-sm'>
        Target: {field.target}
        <StatusIcon className={style.iconColor} />
      </p>
    </span>
  );
};

const Readings = () => {
  const { latestReading, alerts } = useSensor();

  // get latest threshold breach severities from most recent threshold alert
  const latestThresholdAlert = alerts.find(a => a.type === 'threshold');
  const breaches = latestThresholdAlert?.breaches ?? {};

  return (
    <div className='mb-10 flex flex-col justify-start items-start'>
      <p className='text-2xl font-bold pb-5'>Current Readings</p>
      <div className="w-full cards flex flex-wrap gap-10 justify-evenly items-center">
        {FIELDS.map(field => (
          <ReadingCard
            key={field.key}
            field={field}
            value={latestReading?.[field.key] ?? null}
            severity={breaches[field.key] ?? null}
          />
        ))}
      </div>
    </div>
  );
};

export default Readings;