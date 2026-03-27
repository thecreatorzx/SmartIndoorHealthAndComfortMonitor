import { useMemo } from 'react';
import { FaTemperatureHigh, FaWind } from 'react-icons/fa';
import { MdWaterDrop } from 'react-icons/md';
import { PiSpeakerSimpleHighBold } from 'react-icons/pi';
import { useSensor } from '../context/SensorContext.jsx';

const FIELDS = [
  { key: "temperature", label: "Avg Temperature", unit: "°C",  icon: FaTemperatureHigh,      bg: "bg-orange-100", color: "text-orange-500" },
  { key: "humidity",    label: "Avg Humidity",    unit: "%",   icon: MdWaterDrop,             bg: "bg-blue-100",   color: "text-blue-500"   },
  { key: "co2",         label: "Avg CO₂",         unit: " ppm",icon: FaWind,                  bg: "bg-green-100",  color: "text-green-500"  },
  { key: "noise",       label: "Avg Noise",       unit: " dB", icon: PiSpeakerSimpleHighBold, bg: "bg-purple-100", color: "text-purple-500" },
];

const Summary = () => {
  const { history } = useSensor();

  const stats = useMemo(() => {
    if (history.length === 0) return null;

    // today's readings only
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);
    const todayReadings = history.filter(r => new Date(r.recorded_at) >= todayStart);
    const source = todayReadings.length > 0 ? todayReadings : history;

    return FIELDS.reduce((acc, field) => {
      const values = source.map(r => r[field.key]).filter(v => v != null);
      if (values.length === 0) { acc[field.key] = null; return acc; }
      const avg = values.reduce((a, b) => a + b, 0) / values.length;
      const min = Math.min(...values);
      const max = Math.max(...values);
      acc[field.key] = { avg, min, max };
      return acc;
    }, {});
  }, [history]);

  return (
    <div className='w-full h-fit bg-white p-6 flex flex-col rounded-2xl shadow-lg mb-10'>
      <h1 className='text-2xl font-bold text-left mb-6'>Today's Summary</h1>
      <div className="cards flex justify-around items-center">
        {FIELDS.map(field => {
          const s = stats?.[field.key];
          return (
            <div key={field.key} className="flex justify-center items-center flex-col">
              <field.icon className={`w-12 h-12 p-3 rounded-xl mb-2 ${field.bg} ${field.color}`} />
              <div className="text-2xl font-semibold pb-1">
                {s ? `${s.avg.toFixed(1)}${field.unit}` : '--'}
              </div>
              <div className="text-sm text-gray-700 pb-1">{field.label}</div>
              <div className="text-sm text-gray-500">
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