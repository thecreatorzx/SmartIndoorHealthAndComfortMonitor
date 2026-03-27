import { useState, useMemo } from "react";
import { Line } from "react-chartjs-2";
import { useSensor } from "../context/SensorContext.jsx";
import {
  Chart as ChartJS, LineElement, PointElement,
  LinearScale, CategoryScale, Tooltip, Legend
} from "chart.js";

ChartJS.register(LineElement, PointElement, LinearScale, CategoryScale, Tooltip, Legend);

const RANGES = { "1H": 12, "6H": 72, "24H": 288, "7D": 2016 };

function formatTime(ts) {
  const d = new Date(ts);
  return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

const Trends = () => {
  const { history } = useSensor();
  const [range, setRange] = useState("1H");

  const slice = useMemo(() => {
    const count = RANGES[range];
    return history.slice(-count);
  }, [history, range]);

  const labels = slice.map(r => formatTime(r.recorded_at));

  const data = {
    labels,
    datasets: [
      { label: "Temperature (°C)", data: slice.map(r => r.temperature), borderColor: "#ff6b00", borderWidth: 2, pointRadius: 0, tension: 0.3, yAxisID: "temp"     },
      { label: "Humidity (%)",     data: slice.map(r => r.humidity),    borderColor: "#2979ff", borderWidth: 2, pointRadius: 0, tension: 0.3, yAxisID: "humidity"  },
      { label: "CO₂ (ppm)",        data: slice.map(r => r.co2),         borderColor: "#00a651", borderWidth: 2, pointRadius: 0, tension: 0.3, yAxisID: "co2"       },
      { label: "Noise (dB)",       data: slice.map(r => r.noise),       borderColor: "#a855f7", borderWidth: 2, pointRadius: 0, tension: 0.3, yAxisID: "noise"     },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { position: "top", align: "start" } },
    scales: {
      x: { ticks: { maxRotation: 45, minRotation: 45, maxTicksLimit: 10 } },
      temp:     { type: "linear", position: "left",  title: { display: true, text: "Temp (°C)"  } },
      humidity: { type: "linear", position: "right", grid: { drawOnChartArea: false }, title: { display: true, text: "Humidity (%)" } },
      co2:      { type: "linear", position: "right", grid: { drawOnChartArea: false }, title: { display: true, text: "CO₂ (ppm)"    } },
      noise:    { type: "linear", position: "right", grid: { drawOnChartArea: false }, title: { display: true, text: "Noise (dB)"   } },
    },
  };

  return (
    <div className="m-auto bg-white p-8 rounded-2xl shadow-lg mb-10 w-full">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-2xl font-semibold">Real-time Trends</h3>
        <div>
          {Object.keys(RANGES).map(btn => (
            <button
              key={btn}
              onClick={() => setRange(btn)}
              className={`ml-2 px-4 py-1.5 rounded-lg border-none cursor-pointer transition ${range === btn ? "bg-indigo-500 text-white" : "bg-gray-200 text-black"}`}
            >
              {btn}
            </button>
          ))}
        </div>
      </div>

      {slice.length === 0 ? (
        <div className="h-87.5 flex items-center justify-center text-gray-400">
          Waiting for data...
        </div>
      ) : (
        <div className="h-87.5">
          <Line data={data} options={options} />
        </div>
      )}
    </div>
  );
};

export default Trends;