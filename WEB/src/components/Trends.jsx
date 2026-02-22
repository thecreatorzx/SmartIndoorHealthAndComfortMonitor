import React, { useState } from "react";
import {
  Chart as ChartJS,
  LineElement,
  PointElement,
  LinearScale,
  CategoryScale,
  Tooltip,
  Legend
} from "chart.js";
import { Line } from "react-chartjs-2";
ChartJS.register(
  LineElement,
  PointElement,
  LinearScale,
  CategoryScale,
  Tooltip,
  Legend
);

const Trends = () => {
  const [range, setRange] = useState("1H");
  const labels = [
    "10:45 AM","10:47 AM","10:49 AM","10:51 AM","10:53 AM",
    "10:55 AM","10:57 AM","10:59 AM","11:01 AM","11:03 AM",
    "11:05 AM","11:07 AM","11:09 AM","11:11 AM","11:13 AM",
    "11:15 AM","11:17 AM","11:19 AM","11:21 AM","11:23 AM",
    "11:25 AM","11:27 AM","11:29 AM","11:31 AM","11:33 AM",
    "11:35 AM","11:37 AM","11:39 AM","11:41 AM","11:43 AM",
    "11:45 AM"
  ];
  const data = {
    labels: labels,
    datasets: [
      {
        label: "Temperature (°C)",
        data: labels.map(() => 21 + Math.random() * 3),
        borderColor: "#ff6b00",
        borderWidth: 2,
        pointRadius: 0,
        tension: 0.3,
        yAxisID: "temp"
      },
      {
        label: "Humidity (%)",
        data: labels.map(() => 40 + Math.random() * 15),
        borderColor: "#2979ff",
        borderWidth: 2,
        pointRadius: 0,
        tension: 0.3,
        yAxisID: "humidity"
      },
      {
        label: "CO₂ (ppm)",
        data: labels.map(() => 600 + Math.random() * 200),
        borderColor: "#00a651",
        borderWidth: 2,
        pointRadius: 0,
        tension: 0.3,
        yAxisID: "co2"
      },
      {
        label: "Noise (dB)",
        data: labels.map(() => 45 + Math.random() * 10),
        borderColor: "#a855f7",
        borderWidth: 2,
        pointRadius: 0,
        tension: 0.3,
        yAxisID: "noise"
      }
    ]
  };

 const options = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      position: "top",
      align: "start"
    }
  },
  scales: {
    x: {
      ticks: {
        maxRotation: 45,
        minRotation: 45
      }
    },

    temp: {
      type: "linear",
      position: "left",
      min: 21,
      max: 24,
      title: {
        display: true,
        text: "Temperature (°C)"
      }
    },

    humidity: {
      type: "linear",
      position: "right",
      min: 35,
      max: 55,
      grid: {
        drawOnChartArea: false
      },
      title: {
        display: true,
        text: "Humidity (%)"
      }
    },

    co2: {
      type: "linear",
      position: "right",
      min: 600,
      max: 800,
      grid: {
        drawOnChartArea: false
      },
      title: {
        display: true,
        text: "CO₂ (ppm)"
      }
    },

    noise: {
      type: "linear",
      position: "right",
      min: 35,
      max: 55,
      grid: {
        drawOnChartArea: false
      },
      title: {
        display: true,
        text: "Noise (dB)"
      }
    }
  }
};
   return (
  <div
    className="m-auto bg-white p-8 rounded-2xl shadow-lg mb-10"
  >
    <div className="flex justify-between items-center mb-4 ">
      <h3 className="m-0  text-2xl font-semibold">
        Real-time Trends (Last Hour)
      </h3>
      <div>
        {["1H","6H","24H","7D"].map((btn) => (

          <button
            key={btn}

            onClick={() => setRange(btn)}

            className={`ml-2 px-4 py-1.5 rounded-lg border-none cursor-pointer transition
              ${
                range === btn
                ? "bg-indigo-500 text-white"
                : "bg-gray-200 text-black"
              }
            `}
          >
            {btn}
          </button>
        ))}
      </div>
    </div>

    <div className="h-87.5">
      <Line
        data={data}
        options={options}
      />
    </div>
  </div>
  );
};
export default Trends;