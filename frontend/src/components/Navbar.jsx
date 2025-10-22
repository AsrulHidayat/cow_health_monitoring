import React from "react";
import { ArrowUpTrayIcon, ArrowDownTrayIcon } from "@heroicons/react/24/outline";

export default function Navbar({ title, cowId }) {
  return (
    <div className="w-full border-b border-gray-200 bg-white px-6 py-6 flex justify-between items-center">
      {/* Judul kiri */}
      <h1 className="text-lg font-semibold text-gray-800">{title}</h1>
      {/* Tombol kanan — hanya muncul kalau ada cowId*/}
      {cowId < 0 && (
        <div className="flex gap-3">
          <button className="flex items-center gap-2 border border-blue-400 text-blue-500 hover:bg-blue-50 font-medium px-4 py-2 rounded-lg transition-all">
            <ArrowUpTrayIcon className="w-5 h-5" />
            Export
          </button>
          <button className="flex items-center gap-2 border border-blue-400 text-blue-500 hover:bg-blue-50 font-medium px-4 py-2 rounded-lg transition-all">
            <ArrowDownTrayIcon className="w-5 h-5" />
            Import
          </button>
        </div>
      )} 
    </div>
  );
}
