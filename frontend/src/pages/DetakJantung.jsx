import { useState, useEffect } from "react";
import axios from "axios";
import { Navbar } from "../components/suhu/SuhuPageComponents";

export default function DetakJantung() {
  const [cows, setCows] = useState([]);
  const [cowId, setCowId] = useState(null);
  const [setLoading] = useState(true);

  useEffect(() => {
    const fetchCows = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await axios.get("http://localhost:5001/api/cows", {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (Array.isArray(res.data) && res.data.length > 0) {
          setCows(res.data);
          setCowId(res.data[0].id);
        }
      } catch (error) {
        console.error("Gagal memuat data sapi:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchCows();
  },);

  const selectedCow = cows.find((c) => c.id === cowId);

  return (
    <div className="flex flex-col w-full bg-gray-50">
      <Navbar title="Detak Jantung" cowId={cowId} cowData={selectedCow} />

      <div className="px-8 lg:px-12 py-8 flex-1 flex items-center justify-center">
          {/* 🔹 Grid Utama: Card & Timeline */}
          <div className="w-full max-w-7xl flex flex-col lg:flex-row gap-8">

            {/* 🩷 CARD FITUR */}
            <div className="w-full lg:w-1/2 bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
              <div className="bg-gradient-to-r from-pink-500 via-red-500 to-pink-600 px-8 py-10 text-center">
                <div className="inline-flex items-center justify-center w-20 h-20 bg-white/20 backdrop-blur-md rounded-full mb-5 animate-pulse">
                  <svg
                    className="w-12 h-12 text-white"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                    />
                  </svg>
                </div>
                <h1 className="text-3xl font-bold text-white mb-2">
                  Monitoring Detak Jantung
                </h1>
                <p className="text-lg text-white/90 font-medium">
                  Fitur Sedang Dalam Pengembangan
                </p>
              </div>

              <div className="p-8 space-y-8">
                <div className="flex items-center justify-center">
                  <div className="inline-flex items-center gap-3 px-5 py-2.5 bg-yellow-50 border-2 border-yellow-300 rounded-full">
                    <div className="w-2.5 h-2.5 bg-yellow-400 rounded-full animate-pulse"></div>
                    <span className="text-yellow-800 font-bold text-xs uppercase tracking-wide">
                      Under Development
                    </span>
                  </div>
                </div>

                <div className="text-center space-y-6">
                  <h2 className="text-xl font-bold text-gray-800">
                    Fitur yang Akan Hadir
                  </h2>
                  <p className="text-gray-600 leading-relaxed text-sm">
                    Kami sedang mengembangkan sistem monitoring detak jantung
                    real-time untuk memantau kesehatan kardiovaskular sapi Anda
                    dengan lebih akurat dan menyeluruh.
                  </p>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mt-8">
                    {/* 3 CARD FITUR */}
                    {[
                      {
                        color: "pink",
                        title: "Monitoring Real-time",
                        desc: "Pemantauan detak jantung secara langsung",
                        icon: (
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M13 10V3L4 14h7v7l9-11h-7z"
                          />
                        ),
                      },
                      {
                        color: "purple",
                        title: "Analisis Tren",
                        desc: "Grafik dan analisis pola detak jantung",
                        icon: (
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                          />
                        ),
                      },
                      {
                        color: "red",
                        title: "Alert Otomatis",
                        desc: "Notifikasi instant jika ada abnormalitas",
                        icon: (
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
                          />
                        ),
                      },
                    ].map((f, i) => (
                      <div
                        key={i}
                        className={`bg-${f.color}-50 rounded-xl p-5 border border-${f.color}-200 hover:shadow-md transition-shadow`}
                      >
                        <div
                          className={`w-10 h-10 bg-${f.color}-500 rounded-lg flex items-center justify-center mx-auto mb-4`}
                        >
                          <svg
                            className="w-5 h-5 text-white mx-auto my-auto"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            {f.icon}
                          </svg>
                        </div>
                        <h3 className="font-bold text-gray-800 text-sm mb-1">
                          {f.title}
                        </h3>
                        <p className="text-xs text-gray-600">{f.desc}</p>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="bg-gradient-to-r from-blue-50 to-cyan-50 rounded-xl p-6 border border-blue-200">
                  <h3 className="font-bold text-gray-800 mb-3 text-sm">
                    Status Pengembangan
                  </h3>
                  <ul className="space-y-2.5 text-sm text-gray-700">
                    <li className="flex items-center gap-2">
                      <span>✅</span>
                      <span>Hardware sensor detak jantung dalam pengadaan</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <span>✅</span>
                      <span>Sistem integrasi API sedang dibangun</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <span>🟡</span>
                      <span>Testing dan kalibrasi algoritma deteksi</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <span>⚪</span>
                      <span>Deployment dan peluncuran fitur</span>
                    </li>
                  </ul>
                  <p className="mt-4 text-xs text-blue-700 font-medium bg-blue-100 rounded-lg px-3 py-2 inline-block">
                    💡 Estimasi peluncuran: <b>Q2 2025</b>
                  </p>
                </div>
              </div>
            </div>

            {/* 🕒 TIMELINE - Lebih menarik */}
            <div className="w-full lg:w-1/2 bg-white rounded-2xl shadow-lg border border-gray-200 p-8">
              <div className="mb-8">
                <h3 className="text-xl font-bold text-gray-800 mb-2 text-center">
                  🚀 Roadmap Pengembangan
                </h3>
                <p className="text-sm text-gray-600 text-center">
                  Timeline pengembangan fitur monitoring
                </p>
              </div>

              <div className="relative">
                <div className="absolute left-8 top-0 bottom-0 w-0.5 bg-gradient-to-b from-pink-400 via-purple-400 to-gray-300"></div>

                <div className="space-y-8 relative">
                  {[
                    {
                      phase: "Phase 1",
                      title: "Riset & Desain",
                      status: "completed",
                      date: "Q4 2024",
                      tasks: ["Analisis kebutuhan", "Desain sistem"],
                      progress: 100
                    },
                    {
                      phase: "Phase 2",
                      title: "Pengadaan Hardware",
                      status: "completed",
                      date: "Q1 2025",
                      tasks: ["Pembelian sensor", "Setup perangkat"],
                      progress: 100
                    },
                    {
                      phase: "Phase 3",
                      title: "Pengembangan Software",
                      status: "in-progress",
                      date: "Q1-Q2 2025",
                      tasks: ["Coding aplikasi", "Integrasi API"],
                      progress: 60
                    },
                    {
                      phase: "Phase 4",
                      title: "Testing & Deployment",
                      status: "upcoming",
                      date: "Q2 2025",
                      tasks: ["Testing sistem", "Go live"],
                      progress: 0
                    },
                  ].map((item, index) => (
                    <div key={index} className="flex items-start gap-4 relative group">
                      <div
                        className={`w-16 h-16 rounded-full flex items-center justify-center flex-shrink-0 z-10 shadow-lg transition-transform group-hover:scale-110 ${item.status === "completed"
                            ? "bg-gradient-to-br from-green-400 to-green-500"
                            : item.status === "in-progress"
                              ? "bg-gradient-to-br from-yellow-400 to-orange-400 animate-pulse"
                              : "bg-gradient-to-br from-gray-300 to-gray-400"
                          }`}
                      >
                        {item.status === "completed" ? (
                          <svg
                            className="w-8 h-8 text-white"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={3}
                              d="M5 13l4 4L19 7"
                            />
                          </svg>
                        ) : item.status === "in-progress" ? (
                          <svg
                            className="w-8 h-8 text-white"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                            />
                          </svg>
                        ) : (
                          <svg
                            className="w-8 h-8 text-white"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                            />
                          </svg>
                        )}
                      </div>

                      <div className={`flex-1 ${item.status === "in-progress"
                          ? "bg-yellow-50 border-2 border-yellow-200"
                          : "bg-gray-50 border border-gray-200"
                        } rounded-xl p-5 hover:shadow-md transition-all`}>
                        <div className="flex items-center gap-3 mb-2">
                          <span className="text-xs font-bold text-pink-600 uppercase tracking-wide">
                            {item.phase}
                          </span>
                          <span
                            className={`px-2.5 py-1 rounded-full text-xs font-bold ${item.status === "completed"
                                ? "bg-green-100 text-green-700"
                                : item.status === "in-progress"
                                  ? "bg-yellow-100 text-yellow-700"
                                  : "bg-gray-100 text-gray-700"
                              }`}
                          >
                            {item.status === "completed"
                              ? "Selesai"
                              : item.status === "in-progress"
                                ? "Berjalan"
                                : "Akan Datang"}
                          </span>
                        </div>
                        <h4 className="font-bold text-gray-800 mb-1 text-base">
                          {item.title}
                        </h4>
                        <p className="text-xs text-gray-600 mb-3">📅 {item.date}</p>

                        {/* Tasks list */}
                        <ul className="text-xs text-gray-600 space-y-1 mb-3">
                          {item.tasks.map((task, i) => (
                            <li key={i} className="flex items-center gap-2">
                              <span className="w-1.5 h-1.5 bg-gray-400 rounded-full"></span>
                              {task}
                            </li>
                          ))}
                        </ul>

                        {/* Progress bar */}
                        <div className="mt-3">
                          <div className="flex justify-between text-xs mb-1">
                            <span className="text-gray-600">Progress</span>
                            <span className="font-semibold text-gray-700">{item.progress}%</span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                            <div
                              className={`h-2 rounded-full transition-all ${item.status === "completed"
                                  ? "bg-green-500"
                                  : item.status === "in-progress"
                                    ? "bg-gradient-to-r from-yellow-400 to-orange-400"
                                    : "bg-gray-300"
                                }`}
                              style={{ width: `${item.progress}%` }}
                            ></div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Overall progress */}
              <div className="mt-10 p-5 bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl border border-purple-200">
                <div className="flex justify-between items-center mb-2">
                  <span className="font-bold text-gray-700 text-sm">Overall Progress</span>
                  <span className="font-bold text-purple-600 text-sm">65%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                  <div className="bg-gradient-to-r from-purple-500 to-pink-500 h-3 rounded-full" style={{ width: '65%' }}></div>
                </div>
              </div>
            </div>
          </div>
          {/* END GRID */}     
      </div>
    </div>
  );
}