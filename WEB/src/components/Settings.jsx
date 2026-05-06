import { useState } from 'react';
import { FaTemperatureHigh, FaWind, FaSun } from 'react-icons/fa';
import { MdWaterDrop, MdWbSunny } from 'react-icons/md';
import { PiSpeakerSimpleHighBold } from 'react-icons/pi';
import { WiBarometer } from 'react-icons/wi';

const BACKEND_THRESHOLDS = {
  temperature: { warning: { min: 18, max: 30 }, critical: { min: 10, max: 38 } },
  humidity:    { warning: { min: 30, max: 70 }, critical: { min: 20, max: 85 } },
  air_quality: { warning: { max: 1000 },        critical: { max: 2500 }        },
  noise:       { warning: { max: 75 },          critical: { max: 90 }          },
  light:       { warning: { max: 1000 },        critical: { max: 2000 }        },
  uv:          { warning: { max: 6 },           critical: { max: 8 }           },
  pressure:    { warning: { min: 990, max: 1025 }, critical: { min: 970, max: 1040 } },
};

const DEFAULT_DISPLAY = {
  temperature: { max: 30,   min: 18   },
  humidity:    { max: 70,   min: 30   },
  air_quality: { max: 1000, min: null },
  noise:       { max: 75,   min: null },
  light:       { max: 1000, min: null },
  uv:          { max: 6,    min: null },
  pressure:    { max: 1025, min: 990  },
};

const PROPS = [
  { key: "temperature", icon: FaTemperatureHigh,      name: "Temperature", punch: "Comfortable range",     bg: "bg-orange-100", color: "text-orange-500", repr: "°C",  hasMin: true  },
  { key: "humidity",    icon: MdWaterDrop,             name: "Humidity",    punch: "Comfortable range",     bg: "bg-blue-100",   color: "text-blue-500",   repr: "%",   hasMin: true  },
  { key: "air_quality", icon: FaWind,                  name: "Air Quality", punch: "Air quality threshold", bg: "bg-green-100",  color: "text-green-500",  repr: "ppm", hasMin: false },
  { key: "noise",       icon: PiSpeakerSimpleHighBold, name: "Noise Level", punch: "Noise threshold",       bg: "bg-purple-100", color: "text-purple-500", repr: "dB",  hasMin: false },
  { key: "light",       icon: MdWbSunny,               name: "Light",       punch: "Light threshold",       bg: "bg-yellow-100", color: "text-yellow-500", repr: "lux", hasMin: false },
  { key: "uv",          icon: FaSun,                   name: "UV Index",    punch: "UV threshold",          bg: "bg-pink-100",   color: "text-pink-500",   repr: "",    hasMin: false },
  { key: "pressure",    icon: WiBarometer,             name: "Pressure",    punch: "Pressure range",        bg: "bg-gray-100",   color: "text-gray-500",   repr: "hPa", hasMin: true  },
];

function loadSaved() {
  try {
    const saved = localStorage.getItem('display_thresholds');
    return saved ? JSON.parse(saved) : DEFAULT_DISPLAY;
  } catch {
    return DEFAULT_DISPLAY;
  }
}

const Settings = () => {
  const [thresholds, setThresholds] = useState(loadSaved);
  const [enabled, setEnabled]       = useState({ temperature: true, humidity: true, air_quality: true, noise: true, light: true, uv: true, pressure: true });
  const [saved, setSaved]           = useState(false);
  const [showInfo, setShowInfo]     = useState(false);

  const handleChange = (key, field, value) => {
    setThresholds(prev => ({
      ...prev,
      [key]: { ...prev[key], [field]: value === '' ? null : Number(value) },
    }));
    setSaved(false);
  };

  const handleSave = () => {
    localStorage.setItem('display_thresholds', JSON.stringify(thresholds));
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const handleReset = () => {
    setThresholds(DEFAULT_DISPLAY);
    localStorage.setItem('display_thresholds', JSON.stringify(DEFAULT_DISPLAY));
    setSaved(false);
  };

  return (
    <div id="settings" className="bg-white w-full rounded-2xl p-5 sm:p-6 mb-10 shadow-lg">

      {/* header */}
      <div className="flex flex-wrap justify-between items-start gap-3 p-2 sm:p-4 mb-2">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold">Display Thresholds</h2>
          <p className="text-xs text-gray-400 mt-1 flex items-center gap-1">
            Controls colour-coding on your dashboard only.
            <button
              onClick={() => setShowInfo(p => !p)}
              className="ml-1 text-indigo-400 underline underline-offset-2 hover:text-indigo-600 transition"
            >
              {showInfo ? 'Hide' : 'What does this mean?'}
            </button>
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={handleReset}
            className="text-sm rounded-lg text-gray-500 border border-gray-200 px-3 py-2 hover:bg-gray-50 transition"
          >
            Reset defaults
          </button>
          <button
            onClick={handleSave}
            className={`text-sm rounded-lg text-white px-3 py-2 sm:px-4 transition ${
              saved ? 'bg-green-500' : 'bg-indigo-500 hover:bg-indigo-400'
            }`}
          >
            {saved ? 'Saved!' : 'Save Changes'}
          </button>
        </div>
      </div>

      {/* info banner */}
      {showInfo && (
        <div className="mx-2 sm:mx-4 mb-4 p-4 bg-indigo-50 border border-indigo-100 rounded-xl text-sm text-indigo-700 leading-relaxed">
          <p className="font-semibold mb-1">About display thresholds</p>
          <p>
            These values control how readings are colour-coded on your dashboard (green / yellow / red).
            They are saved locally in your browser and do <span className="font-semibold">not</span> affect
            when the device sends alerts — those are controlled by the backend using fixed thresholds.
          </p>
          <p className="mt-2 text-xs text-indigo-500">
            Backend alert thresholds for reference — Temperature: warning &lt;18 or &gt;30°C, critical &lt;10 or &gt;38°C ·
            Humidity: warning 30–70%, critical 20–85% · Air quality: warning &gt;1000, critical &gt;2500 ppm ·
            Noise: warning &gt;75, critical &gt;90 dB · UV: warning &gt;6, critical &gt;8 · Light: warning &gt;1000, critical &gt;2000 lux ·
            Pressure: warning 990–1025, critical 970–1040 hPa
          </p>
        </div>
      )}

      {/* grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
        {PROPS.map(prop => (
          <div key={prop.key} className="bg-gray-50 rounded-xl p-4 sm:p-5 border border-gray-100">

            {/* top row: icon + label + toggle */}
            <div className="flex justify-between items-center mb-5">
              <span className="flex items-center gap-3">
                <prop.icon className={`${prop.color} ${prop.bg} w-11 h-11 rounded-xl p-2.5 shrink-0`} />
                <span className="flex flex-col">
                  <span className="font-semibold text-gray-800 text-sm sm:text-base">{prop.name}</span>
                  <span className="text-xs text-gray-500">{prop.punch}</span>
                </span>
              </span>

              <button
                className={`relative flex items-center w-11 h-6 rounded-full cursor-pointer transition-colors shrink-0 ${
                  enabled[prop.key] ? 'bg-indigo-500' : 'bg-red-400'
                }`}
                onClick={() => setEnabled(prev => ({ ...prev, [prop.key]: !prev[prop.key] }))}
                aria-label={`Toggle ${prop.name}`}
              >
                <span className={`absolute w-4 h-4 rounded-full bg-white shadow transition-transform ${
                  enabled[prop.key] ? 'translate-x-6' : 'translate-x-1'
                }`} />
              </button>
            </div>

            {/* inputs */}
            <div className={`flex flex-col gap-3 text-sm text-gray-500 transition-opacity ${!enabled[prop.key] ? 'opacity-40 pointer-events-none' : ''}`}>
              <div>
                <label className="block mb-1">Maximum {prop.repr && `(${prop.repr})`}</label>
                <input
                  type="number"
                  className="w-full text-gray-900 text-base outline outline-gray-300 rounded-lg px-3 py-2 focus:outline-indigo-400 transition"
                  value={thresholds[prop.key]?.max ?? ''}
                  onChange={e => handleChange(prop.key, 'max', e.target.value)}
                />
              </div>
              {prop.hasMin && (
                <div>
                  <label className="block mb-1">Minimum {prop.repr && `(${prop.repr})`}</label>
                  <input
                    type="number"
                    className="w-full text-gray-900 text-base outline outline-gray-300 rounded-lg px-3 py-2 focus:outline-indigo-400 transition"
                    value={thresholds[prop.key]?.min ?? ''}
                    onChange={e => handleChange(prop.key, 'min', e.target.value)}
                  />
                </div>
              )}
            </div>

          </div>
        ))}
      </div>
    </div>
  );
};

export default Settings;