import React, { useState } from "react";
import {
  ArrowUpTrayIcon,
  ArrowDownTrayIcon,
  ChevronDownIcon,
  DocumentArrowDownIcon,
  TableCellsIcon,
} from "@heroicons/react/24/outline";
import * as XLSX from "xlsx";

export default function Navbar({ title, cowId, cowData }) {
  const [isExporting, setIsExporting] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [showExportMenu, setShowExportMenu] = useState(false);

  const handleExport = async (format) => {
    if (!cowId) {
      alert("Silakan pilih sapi terlebih dahulu");
      return;
    }

    setIsExporting(true);
    setShowExportMenu(false);

    try {
      const response = await fetch(
        `http://localhost:5001/api/temperature/${cowId}/history?limit=10000`
      );
      const result = await response.json();

      if (!result.data || result.data.length === 0) {
        alert("Tidak ada data untuk diekspor");
        return;
      }

      const excelData = result.data.map((item, index) => ({
        No: index + 1,
        "ID Sapi": cowData?.tag || `Sapi ${cowId}`,
        Tanggal: new Date(item.created_at).toLocaleDateString("id-ID"),
        Waktu: new Date(item.created_at).toLocaleTimeString("id-ID"),
        "Suhu (°C)": item.temperature,
        Status: categorizeTemperature(item.temperature),
      }));

      const timestamp = new Date().toISOString().split("T")[0];
      const filenameBase = `Data_Suhu_${cowData?.tag || `Sapi_${cowId}`}_${timestamp}`;

      if (format === "excel") {
        const ws = XLSX.utils.json_to_sheet(excelData);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "Data Suhu");
        ws["!cols"] = [
          { wch: 5 },
          { wch: 15 },
          { wch: 15 },
          { wch: 12 },
          { wch: 12 },
          { wch: 20 },
        ];
        XLSX.writeFile(wb, `${filenameBase}.xlsx`);
        alert(`✅ Berhasil mengekspor ${result.data.length} data ke Excel!`);
      }

      if (format === "csv") {
        const csv = XLSX.utils.sheet_to_csv(XLSX.utils.json_to_sheet(excelData));
        const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
        const link = document.createElement("a");
        link.href = URL.createObjectURL(blob);
        link.download = `${filenameBase}.csv`;
        link.click();
        alert(`✅ Berhasil mengekspor ${result.data.length} data ke CSV!`);
      }
    } catch (error) {
      console.error("Error exporting data:", error);
      alert("❌ Gagal mengekspor data. Silakan coba lagi.");
    } finally {
      setIsExporting(false);
    }
  };

  const handleImport = async (event) => {
  const file = event.target.files[0];
  if (!file) return;

  const isExcel =
    file.type === "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" ||
    file.type === "application/vnd.ms-excel" ||
    file.name.endsWith(".xlsx") ||
    file.name.endsWith(".xls");
  const isCSV = file.type === "text/csv" || file.name.endsWith(".csv");

  if (!isExcel && !isCSV) {
    alert("Format file tidak valid. Gunakan file Excel (.xlsx, .xls) atau CSV (.csv)");
    return;
  }

  setIsImporting(true);

  try {
    const reader = new FileReader();

    reader.onload = async (e) => {
      try {
        let jsonData = [];

        if (isCSV) {
          // ✅ Parse CSV
          const text = e.target.result;
          const workbook = XLSX.read(text, { type: "string" });
          const sheetName = workbook.SheetNames[0];
          jsonData = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName]);
        } else {
          // ✅ Parse Excel
          const data = new Uint8Array(e.target.result);
          const workbook = XLSX.read(data, { type: "array" });
          const sheetName = workbook.SheetNames[0];
          jsonData = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName]);
        }

        if (jsonData.length === 0) {
          alert("File kosong atau format tidak valid");
          return;
        }

        const requiredColumns = ["ID Sapi", "Tanggal", "Waktu", "Suhu (°C)"];
        const firstRow = jsonData[0];
        const hasRequiredColumns = requiredColumns.every((col) => col in firstRow);

        if (!hasRequiredColumns) {
          alert(`Format file tidak sesuai. Pastikan memiliki kolom: ${requiredColumns.join(", ")}`);
          return;
        }

        let successCount = 0;
        let errorCount = 0;
        const errors = [];

        for (let i = 0; i < jsonData.length; i++) {
          const row = jsonData[i];
          try {
            const temperature = parseFloat(row["Suhu (°C)"]);

            if (isNaN(temperature) || temperature < 30 || temperature > 45) {
              throw new Error(`Suhu tidak valid: ${row["Suhu (°C)"]}`);
            }

            const dateStr = row["Tanggal"];
            const timeStr = row["Waktu"];
            const dateTime = new Date(`${dateStr} ${timeStr}`);

            if (isNaN(dateTime.getTime())) {
              throw new Error(`Format tanggal/waktu tidak valid`);
            }

            const response = await fetch("http://localhost:5001/api/temperature", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                cow_id: cowId,
                temperature,
                created_at: dateTime.toISOString(),
              }),
            });

            if (response.ok) successCount++;
            else throw new Error("Gagal menyimpan ke database");
          } catch (error) {
            errorCount++;
            errors.push(`Baris ${i + 2}: ${error.message}`);
          }
        }

        let message = `✅ Import selesai!\n\nBerhasil: ${successCount} data\n`;
        if (errorCount > 0) {
          message += `Gagal: ${errorCount} data\n\nError pertama:\n${errors
            .slice(0, 3)
            .join("\n")}`;
        }

        alert(message);
        if (successCount > 0) window.location.reload();
      } catch (error) {
        console.error("Error processing file:", error);
        alert("❌ Gagal memproses file. Pastikan format file sesuai.");
      } finally {
        setIsImporting(false);
      }
    };

    if (isCSV) reader.readAsText(file);
    else reader.readAsArrayBuffer(file);
  } catch (error) {
    console.error("Error importing data:", error);
    alert("❌ Gagal mengimpor data. Silakan coba lagi.");
    setIsImporting(false);
  }

  event.target.value = "";
};

  const categorizeTemperature = (temp) => {
    if (temp < 37.5) return "Hipotermia";
    if (temp <= 39.5) return "Normal";
    if (temp <= 40.5) return "Demam Ringan";
    if (temp <= 41.5) return "Demam Tinggi";
    return "Kritis";
  };

  return (
    <div className="w-full border-b border-gray-200 bg-white px-8 py-5 flex justify-between items-center relative">
      <h1 className="text-xl font-semibold text-gray-800">{title}</h1>

      {cowId && (
<div className="flex gap-3 items-center">
  {/* EXPORT DROPDOWN */}
  <div className="relative">
    <button
      onClick={() => setShowExportMenu(!showExportMenu)}
      disabled={isExporting}
      className="flex items-center gap-2 border border-blue-400 text-blue-500 hover:bg-blue-50 text-sm font-medium px-4 py-2.5 rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
    >
      {isExporting ? (
        <>
          <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
          <span>Exporting...</span>
        </>
      ) : (
        <>
          <ArrowUpTrayIcon className="w-5 h-5" />
          <span>Export</span>
          <ChevronDownIcon className="w-4 h-4" />
        </>
      )}
    </button>

    {/* Dropdown Menu */}
    {showExportMenu && !isExporting && (
      <div className="absolute right-0 mt-2 bg-white shadow-md border border-gray-200 rounded-lg z-50 w-44 py-1 animate-fadeIn">
        <button
          onClick={() => handleExport("excel")}
          className="flex items-center gap-2 w-full text-left px-4 py-2 hover:bg-blue-50 text-sm text-gray-700"
        >
          <TableCellsIcon className="w-5 h-5 text-green-500" />
          <span>Excel (.xlsx)</span>
        </button>
        <button
          onClick={() => handleExport("csv")}
          className="flex items-center gap-2 w-full text-left px-4 py-2 hover:bg-blue-50 text-sm text-gray-700"
        >
          <DocumentArrowDownIcon className="w-5 h-5 text-orange-500" />
          <span>CSV (.csv)</span>
        </button>
      </div>
    )}
  </div>

  {/* IMPORT BUTTON */}
  <label className="flex items-center gap-2 border border-blue-400 text-blue-500 hover:bg-blue-50 text-sm font-medium px-4 py-2.5 rounded-lg transition-all cursor-pointer">
    {isImporting ? (
      <>
        <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
        <span>Importing...</span>
      </>
    ) : (
      <>
        <ArrowDownTrayIcon className="w-5 h-5" />
        <span>Import</span>
      </>
    )}
    <input
      type="file"
      accept=".xlsx,.xls,.csv"
      onChange={handleImport}
      disabled={isImporting}
      className="hidden"
    />
  </label>
</div>
      )}
    </div>
  );
}
