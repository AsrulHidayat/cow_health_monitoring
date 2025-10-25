import React, { useState } from "react";
import { ArrowUpTrayIcon, ArrowDownTrayIcon } from "@heroicons/react/24/outline";
import * as XLSX from 'xlsx';

export default function Navbar({ title, cowId, cowData }) {
  const [isExporting, setIsExporting] = useState(false);
  const [isImporting, setIsImporting] = useState(false);

  // Fungsi untuk export data ke Excel
  const handleExport = async () => {
    if (!cowId) {
      alert("Silakan pilih sapi terlebih dahulu");
      return;
    }

    setIsExporting(true);
    
    try {
      // Ambil data temperature dari API
      const response = await fetch(`http://localhost:5001/api/temperature/${cowId}/history?limit=10000`);
      const result = await response.json();
      
      if (!result.data || result.data.length === 0) {
        alert("Tidak ada data untuk diekspor");
        return;
      }

      // Format data untuk Excel
      const excelData = result.data.map((item, index) => ({
        'No': index + 1,
        'ID Sapi': cowData?.tag || `Sapi ${cowId}`,
        'Tanggal': new Date(item.created_at).toLocaleDateString('id-ID'),
        'Waktu': new Date(item.created_at).toLocaleTimeString('id-ID'),
        'Suhu (°C)': item.temperature,
        'Status': categorizeTemperature(item.temperature)
      }));

      // Buat workbook dan worksheet
      const ws = XLSX.utils.json_to_sheet(excelData);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, "Data Suhu");

      // Set column widths
      const wscols = [
        { wch: 5 },  // No
        { wch: 15 }, // ID Sapi
        { wch: 15 }, // Tanggal
        { wch: 12 }, // Waktu
        { wch: 12 }, // Suhu
        { wch: 20 }  // Status
      ];
      ws['!cols'] = wscols;

      // Generate filename dengan timestamp
      const timestamp = new Date().toISOString().split('T')[0];
      const filename = `Data_Suhu_${cowData?.tag || `Sapi_${cowId}`}_${timestamp}.xlsx`;

      // Download file
      XLSX.writeFile(wb, filename);
      
      alert(`✅ Berhasil mengekspor ${result.data.length} data suhu!`);
    } catch (error) {
      console.error("Error exporting data:", error);
      alert("❌ Gagal mengekspor data. Silakan coba lagi.");
    } finally {
      setIsExporting(false);
    }
  };

  // Fungsi untuk import data dari Excel
  const handleImport = async (event) => {
    const file = event.target.files[0];
    
    if (!file) return;

    // Validasi tipe file
    const validTypes = [
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'application/vnd.ms-excel'
    ];
    
    if (!validTypes.includes(file.type)) {
      alert("Format file tidak valid. Gunakan file Excel (.xlsx atau .xls)");
      return;
    }

    setIsImporting(true);

    try {
      const reader = new FileReader();
      
      reader.onload = async (e) => {
        try {
          const data = new Uint8Array(e.target.result);
          const workbook = XLSX.read(data, { type: 'array' });
          
          // Ambil sheet pertama
          const sheetName = workbook.SheetNames[0];
          const worksheet = workbook.Sheets[sheetName];
          
          // Convert ke JSON
          const jsonData = XLSX.utils.sheet_to_json(worksheet);
          
          if (jsonData.length === 0) {
            alert("File Excel kosong atau format tidak valid");
            return;
          }

          // Validasi struktur data
          const requiredColumns = ['ID Sapi', 'Tanggal', 'Waktu', 'Suhu (°C)'];
          const firstRow = jsonData[0];
          const hasRequiredColumns = requiredColumns.every(col => col in firstRow);
          
          if (!hasRequiredColumns) {
            alert(`Format file tidak sesuai. Pastikan memiliki kolom: ${requiredColumns.join(', ')}`);
            return;
          }

          // Proses dan validasi data
          let successCount = 0;
          let errorCount = 0;
          const errors = [];

          for (let i = 0; i < jsonData.length; i++) {
            const row = jsonData[i];
            
            try {
              // Validasi data
              const temperature = parseFloat(row['Suhu (°C)']);
              
              if (isNaN(temperature) || temperature < 30 || temperature > 45) {
                throw new Error(`Suhu tidak valid: ${row['Suhu (°C)']}`);
              }

              // Parsing tanggal dan waktu
              const dateStr = row['Tanggal'];
              const timeStr = row['Waktu'];
              const dateTime = new Date(`${dateStr} ${timeStr}`);
              
              if (isNaN(dateTime.getTime())) {
                throw new Error(`Format tanggal/waktu tidak valid`);
              }

              // Kirim ke API
              const response = await fetch('http://localhost:5001/api/temperature', {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                  cow_id: cowId,
                  temperature: temperature,
                  created_at: dateTime.toISOString()
                })
              });

              if (response.ok) {
                successCount++;
              } else {
                throw new Error('Gagal menyimpan ke database');
              }
              
            } catch (error) {
              errorCount++;
              errors.push(`Baris ${i + 2}: ${error.message}`);
            }
          }

          // Tampilkan hasil
          let message = `✅ Import selesai!\n\n`;
          message += `Berhasil: ${successCount} data\n`;
          
          if (errorCount > 0) {
            message += `Gagal: ${errorCount} data\n\n`;
            message += `Error pertama:\n${errors.slice(0, 3).join('\n')}`;
          }
          
          alert(message);
          
          // Refresh halaman jika ada data yang berhasil
          if (successCount > 0) {
            window.location.reload();
          }
          
        } catch (error) {
          console.error("Error processing file:", error);
          alert("❌ Gagal memproses file. Pastikan format file sesuai.");
        } finally {
          setIsImporting(false);
        }
      };
      
      reader.readAsArrayBuffer(file);
      
    } catch (error) {
      console.error("Error importing data:", error);
      alert("❌ Gagal mengimpor data. Silakan coba lagi.");
      setIsImporting(false);
    }

    // Reset input file
    event.target.value = '';
  };

  // Helper function untuk kategori suhu
  const categorizeTemperature = (temp) => {
    if (temp < 37.5) return "Hipotermia";
    if (temp >= 37.5 && temp <= 39.5) return "Normal";
    if (temp > 39.5 && temp <= 40.5) return "Demam Ringan";
    if (temp > 40.5 && temp <= 41.5) return "Demam Tinggi";
    return "Kritis";
  };

  return (
    <div className="w-full border-b border-gray-200 bg-white px-6 py-6 flex justify-between items-center">
      {/* Judul kiri */}
      <h1 className="text-lg font-semibold text-gray-800">{title}</h1>
      
      {/* Tombol kanan — hanya muncul kalau ada cowId */}
      {cowId && (
        <div className="flex gap-3">
          {/* Button Export */}
          <button 
            onClick={handleExport}
            disabled={isExporting}
            className="flex items-center gap-2 border border-blue-400 text-blue-500 hover:bg-blue-50 font-medium px-4 py-2 rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isExporting ? (
              <>
                <div className="w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                <span>Exporting...</span>
              </>
            ) : (
              <>
                <ArrowUpTrayIcon className="w-5 h-5" />
                <span>Export</span>
              </>
            )}
          </button>

          {/* Button Import */}
          <label className="flex items-center gap-2 border border-blue-400 text-blue-500 hover:bg-blue-50 font-medium px-4 py-2 rounded-lg transition-all cursor-pointer">
            {isImporting ? (
              <>
                <div className="w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
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
              accept=".xlsx,.xls"
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