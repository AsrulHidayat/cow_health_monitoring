import React, { useEffect, useState, useRef } from "react";
import io from "socket.io-client";
import { Line } from "react-chartjs-2";
import "chart.js/auto";
import "chartjs-adapter-date-fns";

const SOCKET_URL = "http://localhost:5001";
const API_URL = "http://localhost:5001/api/suhu?limit=50";
const API_AGG_URL = "http://localhost:5001/api/suhu/avg";

function App() {
  const [dataPoints, setDataPoints] = useState([]);
  const [aggPoints, setAggPoints] = useState([]);
  const [period, setPeriod] = useState("hour");
  const socketRef = useRef(null);

  // Realtime raw data
  useEffect(()=>{
    fetch(API_URL)
      .then(res=>res.json())
      .then(rows=>{
        if(!Array.isArray(rows)) rows=[];
        const pts = rows.reverse().map(r=>({ x: new Date(r.waktu), y: parseFloat(r.nilai) }));
        setDataPoints(pts);
      });

    socketRef.current = io(SOCKET_URL);
    socketRef.current.on("connect", ()=>console.log("✅ socket connected"));
    socketRef.current.on("new-suhu", row=>{
      setDataPoints(prev=>{
        const next = [...prev, { x: new Date(row.waktu), y: parseFloat(row.nilai) }];
        return next.slice(-100);
      });
    });

    return ()=> socketRef.current.disconnect();
  },[]);

  // Aggregated data
  useEffect(()=>{
    fetch(`${API_AGG_URL}/${period}`)
      .then(res=>res.json())
      .then(rows=>{
        if(!Array.isArray(rows)) rows=[];
        const pts = rows.reverse().map(r=>({ x:new Date(r.periode), y:parseFloat(r.avg_suhu) }));
        setAggPoints(pts);
      });
  },[period]);

  const rawChart = {
    datasets:[{ label:"Suhu Realtime (°C)", data:dataPoints, tension:0.2, borderColor:"blue", fill:false }]
  };
  const aggChart = {
    datasets:[{ label:`Rata-rata (${period})`, data:aggPoints, tension:0.2, borderColor:"green", fill:false }]
  };
  const options = {
    parsing:{ xAxisKey:"x", yAxisKey:"y" },
    scales:{
      x:{ type:"time", time:{ tooltipFormat:"yyyy-MM-dd HH:mm" }, title:{ display:true, text:"Waktu" } },
      y:{ title:{ display:true, text:"Suhu (°C)" } }
    }
  };

  return (
    <div style={{padding:20}}>
      <h1>📊 Dashboard Suhu Sapi</h1>

      <h2>Realtime</h2>
      <Line data={rawChart} options={options} />
      <p>Data points: {dataPoints.length}</p>

      <h2>Rata-rata</h2>
      <select value={period} onChange={e=>setPeriod(e.target.value)}>
        <option value="minute">Per 1 Menit</option>
        <option value="10minutes">Per 10 Menit</option>
        <option value="hour">Per Jam</option>
        <option value="day">Per Hari</option>
        <option value="3days">Per 3 Hari</option>
        <option value="week">Per Minggu</option>
        <option value="month">Per Bulan</option>
      </select>
      <Line data={aggChart} options={options} />

      <h2>Riwayat Realtime (50 terakhir)</h2>
      <table border="1" cellPadding="5">
        <thead><tr><th>Waktu</th><th>Device</th><th>Suhu (°C)</th></tr></thead>
        <tbody>
          {dataPoints.slice().reverse().map((d,i)=>(
            <tr key={i}>
              <td>{d.x.toLocaleString()}</td>
              <td>esp32</td>
              <td>{d.y.toFixed(2)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default App;
