import { useState } from 'react';
import { FaTemperatureHigh, FaWind } from 'react-icons/fa';
import { MdWaterDrop } from 'react-icons/md';
import { PiSpeakerSimpleHighBold } from 'react-icons/pi';

const DEFAULT_THRESHOLDS = {
  temperature: { max: 30, min: 18 },
  humidity:    { max: 70, min: 30 },
  co2:         { max: 1000, min: null },
  noise:       { max: 75,  min: null },
};

const PROPS = [
  { key: "temperature", icon: FaTemperatureHigh,      name: "Temperature", punch: "Set comfortable range",     bg: "bg-orange-100", color: "text-orange-500", repr: "(°C)",  hasMin: true  },
  { key: "humidity",    icon: MdWaterDrop,             name: "Humidity",    punch: "Set comfortable range",     bg: "bg-blue-100",   color: "text-blue-500",   repr: "(%)",   hasMin: true  },
  { key: "co2",         icon: FaWind,                  name: "CO₂ Level",   punch: "Set air quality threshold", bg: "bg-green-100",  color: "text-green-500",  repr: "(ppm)", hasMin: false },
  { key: "noise",       icon: PiSpeakerSimpleHighBold, name: "Noise Level", punch: "Set noise threshold",       bg: "bg-purple-100", color: "text-purple-500", repr: "(dB)",  hasMin: false },
];

const Settings = () => {
  const [thresholds, setThresholds] = useState(DEFAULT_THRESHOLDS);
  const [enabled, setEnabled] = useState({ temperature: true, humidity: true, co2: true, noise: true });
  const [saved, setSaved] = useState(false);

  const handleChange = (key, field, value) => {
    setThresholds(prev => ({
      ...prev,
      [key]: { ...prev[key], [field]: value === '' ? null : Number(value) },
    }));
    setSaved(false);
  };

  const handleSave = () => {
    // placeholder — will POST to backend when auth + settings endpoint is added
    console.log('Thresholds to save:', thresholds);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div id = "settings" className='bg-white w-full h-fit rounded-2xl p-6 mb-10 shadow-lg'>
      <div className='text-2xl font-bold flex justify-between p-4'>
        Threshold Settings
        <button
          onClick={handleSave}
          className={`text-sm rounded-lg text-white p-2 px-4 transition ${saved ? 'bg-green-500' : 'bg-indigo-500 hover:bg-indigo-400'}`}
        >
          {saved ? 'Saved!' : 'Save Changes'}
        </button>
      </div>
      <div className="sections flex flex-wrap justify-evenly items-center">
        {PROPS.map(prop => (
          <div key={prop.key} className="w-[42vw] p-5">
            <div className="top flex justify-between">
              <span className="left flex justify-center items-center text-left">
                <prop.icon className={`${prop.color} ${prop.bg} w-12 h-12 rounded-xl p-3`} />
                <span className="flex flex-col pl-4">
                  {prop.name} <i className='text-sm text-gray-600'>{prop.punch}</i>
                </span>
              </span>
              <span
                className={`toggle flex items-center pl-1 w-12 h-7 rounded-4xl cursor-pointer ${enabled[prop.key] ? "bg-indigo-500" : "bg-red-400"}`}
                onClick={() => setEnabled(prev => ({ ...prev, [prop.key]: !prev[prop.key] }))}
              >
                <div className={`ball w-5 h-5 rounded-full bg-white transition-all ${enabled[prop.key] ? "translate-x-5" : "translate-x-0"}`} />
              </span>
            </div>
            <div className="bottom flex flex-col mt-8 text-left text-gray-500 text-sm">
              <label>Maximum {prop.repr}</label>
              <input
                type="number"
                className='text-black text-lg outline outline-gray-300 rounded-md px-4 py-1 mb-4 mt-1'
                value={thresholds[prop.key]?.max ?? ''}
                onChange={e => handleChange(prop.key, 'max', e.target.value)}
              />
              {prop.hasMin && (
                <>
                  <label>Minimum {prop.repr}</label>
                  <input
                    type="number"
                    className='text-black outline outline-gray-300 rounded-md text-lg px-4 py-1 mt-1'
                    value={thresholds[prop.key]?.min ?? ''}
                    onChange={e => handleChange(prop.key, 'min', e.target.value)}
                  />
                </>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Settings;