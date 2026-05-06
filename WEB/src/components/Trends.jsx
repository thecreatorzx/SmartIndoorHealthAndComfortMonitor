import { useState, useMemo } from "react";
import { Line } from "react-chartjs-2";
import { useSensor } from "../context/SensorContext.jsx";
import {
  Chart as ChartJS, LineElement, PointElement,
  LinearScale, CategoryScale, Tooltip, Legend
} from "chart.js";

ChartJS.register(LineElement, PointElement, LinearScale, CategoryScale, Tooltip, Legend);

const RANGES = { "1H": 1800, "6H": 10800, "24H": 43200, "7D": 302400 };

// filter history to last N seconds
function filterBySeconds(history, seconds) {
  const cutoff = Date.now() - seconds * 1000;
  return history.filter(r => new Date(r.recorded_at).getTime() >= cutoff);
}

function formatTime(ts) {
  const d = new Date(ts);
  return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

const DATASETS_CONFIG = [
  { key: "temperature", label: "Temperature (°C)", color: "#ff6b00", yAxis: "temp"        },
  { key: "humidity",    label: "Humidity (%)",      color: "#2979ff", yAxis: "humidity"    },
  { key: "air_quality", label: "Air Quality (ppm)", color: "#00a651", yAxis: "air_quality" },
  { key: "noise",       label: "Noise (dB)",        color: "#a855f7", yAxis: "noise"       },
  { key: "light",       label: "Light (lux)",       color: "#eab308", yAxis: "light"       },
  { key: "uv",          label: "UV Index",          color: "#ec4899", yAxis: "uv"          },
  { key: "pressure",    label: "Pressure (hPa)",    color: "#64748b", yAxis: "pressure"    },
];

// only show datasets that have at least 1 non-null value in the slice
function getActiveDatasets(slice, selected) {
  return DATASETS_CONFIG.filter(d =>
    selected.includes(d.key) && slice.some(r => r[d.key] != null)
  );
}

const ALL_KEYS = DATASETS_CONFIG.map(d => d.key);

const Trends = () => {
  const { history } = useSensor();
  const [range, setRange]       = useState("1H");
  const [selected, setSelected] = useState(["temperature", "humidity", "air_quality", "noise"]);

  const slice = useMemo(() => filterBySeconds(history, RANGES[range]), [history, range]);

  const labels          = slice.map(r => formatTime(r.recorded_at));
  const activeDatasets  = getActiveDatasets(slice, selected);

  const data = {
    labels,
    datasets: activeDatasets.map(d => ({
      label:       d.label,
      data:        slice.map(r => r[d.key] ?? null),
      borderColor: d.color,
      borderWidth: 2,
      pointRadius: 0,
      tension:     0.3,
      yAxisID:     d.yAxis,
      spanGaps:    false, // null values show as gaps — correct behavior
    })),
  };

  // build scales only for active datasets to avoid empty axes
  const scales = {
    x: {
      ticks: {
        maxRotation: 45,
        minRotation: 45,
        maxTicksLimit: 8,
        font: { size: 10 },
      },
    },
  };
  activeDatasets.forEach((d, i) => {
    scales[d.yAxis] = {
      type:     "linear",
      position: i === 0 ? "left" : "right",
      grid:     { drawOnChartArea: i === 0 },
      title:    { display: true, text: d.label, font: { size: 10 } },
    };
  });

  const options = {
    responsive:          true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "top",
        align:    "start",
        labels:   { boxWidth: 12, padding: 12, font: { size: 11 } },
      },
    },
    scales,
  };

  const toggleField = (key) => {
    setSelected(prev =>
      prev.includes(key)
        ? prev.length > 1 ? prev.filter(k => k !== key) : prev // keep at least 1
        : [...prev, key]
    );
  };

  return (
    <div className="bg-white p-5 sm:p-8 rounded-2xl shadow-lg mb-10 w-full">
      {/* header row */}
      <div className="flex flex-wrap justify-between items-center gap-3 mb-4">
        <h3 className="text-xl sm:text-2xl font-semibold">Real-time Trends</h3>
        <div className="flex gap-1 sm:gap-2 flex-wrap">
          {Object.keys(RANGES).map(btn => (
            <button
              key={btn}
              onClick={() => setRange(btn)}
              className={`px-3 sm:px-4 py-1.5 text-xs sm:text-sm rounded-lg border-none cursor-pointer transition ${
                range === btn ? "bg-indigo-500 text-white" : "bg-gray-200 text-black hover:bg-gray-300"
              }`}
            >
              {btn}
            </button>
          ))}
        </div>
      </div>

      {/* field toggle pills */}
      <div className="flex flex-wrap gap-2 mb-4">
        {DATASETS_CONFIG.map(d => (
          <button
            key={d.key}
            onClick={() => toggleField(d.key)}
            className={`px-2.5 py-1 text-xs rounded-full border transition ${
              selected.includes(d.key)
                ? 'text-white border-transparent'
                : 'bg-white text-gray-400 border-gray-200'
            }`}
            style={selected.includes(d.key) ? { backgroundColor: d.color, borderColor: d.color } : {}}
          >
            {d.label}
          </button>
        ))}
      </div>

      {slice.length === 0 ? (
        <div className="h-64 sm:h-87.5 flex items-center justify-center text-gray-400">
          Waiting for data…
        </div>
      ) : (
        <div className="h-64 sm:h-87.5">
          <Line data={data} options={options} />
        </div>
      )}
    </div>
  );
};

export default Trends;