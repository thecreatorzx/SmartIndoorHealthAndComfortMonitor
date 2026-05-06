import { useMemo } from 'react';
import { FaTemperatureHigh, FaWind, FaSun } from 'react-icons/fa';
import { MdWaterDrop, MdWbSunny } from 'react-icons/md';
import { PiSpeakerSimpleHighBold } from 'react-icons/pi';
import { WiBarometer } from 'react-icons/wi';
import { useSensor } from '../context/SensorContext.jsx';

const FIELDS = [
  { key: "temperature", label: "Avg Temperature", unit: "°C",   icon: FaTemperatureHigh,      bg: "bg-orange-100", color: "text-orange-500" },
  { key: "humidity",    label: "Avg Humidity",    unit: "%",    icon: MdWaterDrop,             bg: "bg-blue-100",   color: "text-blue-500"   },
  { key: "air_quality", label: "Avg Air Quality", unit: " ppm", icon: FaWind,                  bg: "bg-green-100",  color: "text-green-500"  },
  { key: "noise",       label: "Avg Noise",       unit: " dB",  icon: PiSpeakerSimpleHighBold, bg: "bg-purple-100", color: "text-purple-500" },
  { key: "light",       label: "Avg Light",       unit: " lux", icon: MdWbSunny,               bg: "bg-yellow-100", color: "text-yellow-500" },
  { key: "uv",          label: "Avg UV",          unit: "",     icon: FaSun,                   bg: "bg-pink-100",   color: "text-pink-500"   },
  { key: "pressure",    label: "Avg Pressure",    unit: " hPa", icon: WiBarometer,             bg: "bg-gray-100",   color: "text-gray-500"   },
];

const Summary = () => {
  const { history } = useSensor();

  const stats = useMemo(() => {
    if (history.length === 0) return null;

    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);
    const source = history.filter(r => new Date(r.recorded_at) >= todayStart);
    const readings = source.length > 0 ? source : history;

    return FIELDS.reduce((acc, field) => {
      const values = readings.map(r => r[field.key]).filter(v => v != null);
      if (values.length === 0) { acc[field.key] = null; return acc; }
      const avg = values.reduce((a, b) => a + b, 0) / values.length;
      acc[field.key] = { avg, min: Math.min(...values), max: Math.max(...values) };
      return acc;
    }, {});
  }, [history]);

  // only render fields that have data (optional sensors may have no values)
  const activeFields = FIELDS.filter(f => stats?.[f.key] != null);
  const displayFields = stats ? activeFields : FIELDS.slice(0, 4); // show skeleton for first 4

  return (
    <div className="w-full bg-white p-5 sm:p-6 flex flex-col rounded-2xl shadow-lg mb-10">
      <h1 className="text-xl sm:text-2xl font-bold text-left mb-6">Today's Summary</h1>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        {displayFields.map(field => {
          const s = stats?.[field.key];
          return (
            <div key={field.key} className="flex flex-col items-center text-center p-3 sm:p-4 rounded-xl bg-gray-50">
              <field.icon className={`w-10 h-10 sm:w-12 sm:h-12 p-2.5 sm:p-3 rounded-xl mb-3 ${field.bg} ${field.color}`} />
              <div className="text-xl sm:text-2xl font-semibold pb-1">
                {s ? `${s.avg.toFixed(1)}${field.unit}` : '--'}
              </div>
              <div className="text-xs sm:text-sm text-gray-600 pb-1">{field.label}</div>
              <div className="text-xs text-gray-400">
                {s ? `${s.min.toFixed(1)}–${s.max.toFixed(1)}${field.unit}` : '—'}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default Summary;