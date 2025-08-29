import React, { useEffect, useState, useRef } from "react";
import io from "socket.io-client";
import { Line } from "react-chartjs-2";
import "chart.js/auto";
import "chartjs-adapter-date-fns"; // penting untuk time axis

// Sesuaikan dengan backend
const SOCKET_URL = "http://localhost:5001";
const API_URL = "http://localhost:5001/api/suhu?limit=50";

function App() {
  const [dataPoints, setDataPoints] = useState([]);
  const socketRef = useRef(null);

  useEffect(() => {
    // Ambil riwayat awal
    fetch(API_URL)
      .then((res) => res.json())
      .then((rows) => {
        // rows default urut DESC, balik biar grafik jalan ke kanan
        const pts = rows.reverse().map((r) => ({
          x: new Date(r.waktu), // ubah string jadi Date object
          y: r.nilai,
        }));
        setDataPoints(pts);
      });

    // Connect socket.io
    socketRef.current = io(SOCKET_URL);
    socketRef.current.on("connect", () => console.log("✅ socket connected"));
    socketRef.current.on("new-suhu", (row) => {
      setDataPoints((prev) => {
        const next = [
          ...prev,
          { x: new Date(row.waktu), y: row.nilai }
        ];
        return next.slice(-100); // batasi 100 poin terakhir
      });
    });

    return () => {
      socketRef.current.disconnect();
    };
  }, []);

  const chartData = {
    datasets: [
      {
        label: "Suhu (°C)",
        data: dataPoints,
        tension: 0.2,
        borderColor: "blue",
        fill: false,
      },
    ],
  };

  const options = {
    parsing: { xAxisKey: "x", yAxisKey: "y" },
    scales: {
      x: {
        type: "time",
        time: {
          tooltipFormat: "HH:mm:ss",
        },
        title: {
          display: true,
          text: "Waktu",
        },
      },
      y: {
        title: {
          display: true,
          text: "Suhu (°C)",
        },
      },
    },
  };

  return (
    <div style={{ padding: 20 }}>
      <h1>Dashboard Suhu</h1>
      <Line data={chartData} options={options} />
      <p>Data points: {dataPoints.length}</p>
    </div>
  );
}

export default App;
