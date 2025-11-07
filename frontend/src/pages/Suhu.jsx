import { useState } from "react";
import axios from "axios";

// 🔹 Import hooks utama yang mengatur semua data dan logika suhu sapi
import { useTemperatureData } from "../components/suhu/hooks/useTemperatureData";

// 🔹 Import utilitas dan komponen UI pendukung
import { TIME_FILTERS, categorizeTemperature, getCategoryStyles } from "../components/suhu/utils/SuhuUtils";
import { Navbar, PlusIcon } from "../components/suhu/SuhuPageComponents";
import SensorStatus from "../components/suhu/SensorStatus";
import EditCheckupModal from "../components/suhu/modals/EditCheckupModal";
import DeleteModal from "../components/suhu/modals/DeleteModal";
import RestoreModal from "../components/suhu/modals/RestoreModal";

// 🔹 Import bagian-bagian layout halaman suhu
import HeaderSection from "../components/suhu/sections/HeaderSection";
import RealtimeChartCard from "../components/suhu/sections/RealtimeChartCard";
import AverageCard from "../components/suhu/sections/AverageCard";
import HistoryCard from "../components/suhu/sections/HistoryCard";

export default function Suhu() {
  // 🔹 Ambil seluruh data dan fungsi dari hook khusus suhu sapi
  const {
    cows,
    cowId,
    setCowId,
    selectedCow,
    loading,
    sensorStatus,
    avgData,
    filteredHistory,
    displayedData,
    dateRange,
    setDateRange,
    appliedTimeRange,
    setAppliedTimeRange,
    datePickerStats,
    timePeriod,
    setTimePeriod,
    filterCategory,
    setFilterCategory,
    dataOffset,
    totalPages,
    handlePrevPage,
    handleNextPage,
    handlePageSelect,
    getCowCondition,
    getCowConditionStyle,
    ITEMS_PER_PAGE,
    setCows
  } = useTemperatureData();

  // 🔹 State untuk kontrol modal dan data sapi yang dihapus
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showRestoreModal, setShowRestoreModal] = useState(false);
  const [deletedCows, setDeletedCows] = useState([]);
  const [restoreLoading, setRestoreLoading] = useState(false);

  // 🔹 Fungsi untuk ubah status pemeriksaan sapi
  const handleEditCheckup = async (status) => {
    if (!cowId) return;
    try {
      const token = localStorage.getItem("token");
      await axios.put(
        `http://localhost:5001/api/cows/${cowId}/checkup-status`,
        { checkupStatus: status },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      // Perbarui status di daftar sapi
      setCows(prevCows =>
        prevCows.map(cow =>
          cow.id === cowId
            ? { ...cow, checkupStatus: status }
            : cow
        )
      );
      setShowEditModal(false);
      alert(`✅ Status pemeriksaan berhasil diubah menjadi "${status}"`);
    } catch (error) {
      console.error("Gagal update status pemeriksaan:", error);
      alert("❌ Gagal mengubah status pemeriksaan. Silakan coba lagi.");
    }
  };

  // 🔹 Fungsi untuk menghapus data sapi (soft delete)
  const handleDelete = async () => {
    if (!cowId || !selectedCow) return;

    try {
      const token = localStorage.getItem("token");

      // Kirim request hapus ke backend
      const response = await axios.delete(
        `http://localhost:5001/api/cows/${cowId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      console.log("✅ Response delete:", response.data);

      // Hapus dari daftar sapi di state
      setCows(prevCows => prevCows.filter(cow => cow.id !== cowId));

      // Pilih sapi berikutnya jika masih ada
      const remainingCows = cows.filter(cow => cow.id !== cowId);
      if (remainingCows.length > 0) {
        setCowId(remainingCows[0].id);
      } else {
        setCowId(null);
      }

      setShowDeleteModal(false);
      alert(`✅ ID Sapi ${selectedCow.tag} berhasil dihapus beserta semua data monitoring terkait`);

    } catch (error) {
      console.error("Gagal menghapus sapi:", error);
      const errorMsg = error.response?.data?.message || "Gagal menghapus ID sapi. Silakan coba lagi.";
      alert(`❌ ${errorMsg}`);
      setShowDeleteModal(false);
    }
  };

  // 🔹 Fungsi untuk menampilkan modal restore dan memuat daftar sapi yang dihapus
  const handleShowRestoreModal = async () => {
    setRestoreLoading(true);
    setShowRestoreModal(true);
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get("http://localhost:5001/api/cows/deleted", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setDeletedCows(response.data);
    } catch (error) {
      console.error("Gagal mengambil data sapi yang dihapus:", error);
      alert("❌ Gagal memuat data sapi yang dihapus. Silakan coba lagi.");
      setShowRestoreModal(false);
    } finally {
      setRestoreLoading(false);
    }
  };

  // 🔹 Fungsi untuk me-restore data sapi yang dihapus
  const handleRestoreCow = async (cowToRestore) => {
    try {
      const token = localStorage.getItem("token");

      console.log(`🔄 Mengirim request restore untuk sapi ID: ${cowToRestore.id}`);

      // Kirim permintaan restore ke backend
      const response = await axios.put(
        `http://localhost:5001/api/cows/restore/${cowToRestore.id}`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      console.log("✅ Response restore:", response.data);

      const restoredCow = response.data.cow;

      // Tambahkan sapi yang di-restore ke daftar aktif
      setCows(prevCows => {
        const updated = [...prevCows, {
          id: restoredCow.id,
          tag: restoredCow.tag,
          umur: restoredCow.umur,
          user_id: restoredCow.user_id,
          checkupStatus: restoredCow.checkupStatus || 'Belum diperiksa',
          checkupDate: restoredCow.checkupDate,
          created_at: restoredCow.created_at,
          is_deleted: false,
          deleted_at: null
        }];

        // Urutkan berdasarkan tag
        return updated.sort((a, b) => a.tag.localeCompare(b.tag));
      });

      // Hapus dari daftar sapi yang dihapus
      setDeletedCows(prevDeleted =>
        prevDeleted.filter(cow => cow.id !== cowToRestore.id)
      );

      alert(`✅ Sapi berhasil di-restore!\n\nTag Lama: ${restoredCow.oldTag || cowToRestore.tag}\nTag Baru: ${restoredCow.tag}\n\nSemua data monitoring tetap tersimpan.`);

      // Tutup modal jika semua sapi sudah direstore
      if (deletedCows.length === 1) {
        setShowRestoreModal(false);
      }

    } catch (error) {
      console.error("❌ Gagal me-restore sapi:", error);
      console.error("Error details:", {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status
      });

      const errorMsg = error.response?.data?.message ||
        error.message ||
        "Gagal me-restore ID sapi. Silakan coba lagi.";
      alert(`❌ ${errorMsg}`);
    }
  };

  // 🔹 Menentukan label periode waktu yang sedang dipilih
  const getTimePeriodLabel = () => {
    if (dateRange.startDate && dateRange.endDate) {
      try {
        const start = new Date(dateRange.startDate).toLocaleDateString("id-ID", { day: "2-digit", month: "short" });
        const end = new Date(dateRange.endDate).toLocaleDateString("id-ID", { day: "2-digit", month: "short", year: "numeric" });
        return `${start} - ${end}`;
      } catch {
        return "Rentang Kustom";
      }
    }
    const filter = Object.values(TIME_FILTERS).find((f) => f.value === timePeriod);
    return filter ? filter.label : "Data";
  };

  // 🔹 Tentukan kategori suhu rata-rata untuk tampilan status
  const avgCategory = avgData.avg_temp ? categorizeTemperature(avgData.avg_temp) : null;

  return (
    <div className="flex flex-col w-full min-h-screen bg-gray-50">
      {/* 🔹 Navigasi utama halaman */}
      <Navbar title="Suhu" cowId={cowId} cowData={selectedCow} />

      {/* 🔹 Header berisi info sapi dan tombol aksi (edit, hapus, restore) */}
      <HeaderSection
        cows={cows}
        cowId={cowId}
        onCowChange={setCowId}
        avgCategory={avgCategory}
        selectedCow={selectedCow}
        onEditClick={() => setShowEditModal(true)}
        onDeleteClick={() => setShowDeleteModal(true)}
        onRestoreClick={handleShowRestoreModal}
        getCowCondition={getCowCondition}
        getCowConditionStyle={getCowConditionStyle}
        getCategoryStyles={getCategoryStyles}
      />

      {/* 🔹 Status koneksi sensor suhu */}
      {cows.length > 0 && (
        <div className="px-6 pt-6">
          <SensorStatus sensorStatus={sensorStatus} />
        </div>
      )}

      {/* 🔹 Konten utama halaman */}
      <div className="px-6 py-6 space-y-6">
        {/* 🔹 Tampilkan tombol tambah sapi jika belum ada data */}
        {cows.length === 0 && !loading && (
          <button className="flex items-center gap-2 px-5 py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-lg shadow-sm transition-all font-medium">
            <PlusIcon />
            <span>Tambah Sapi</span>
          </button>
        )}

        {/* 🔹 Kartu grafik realtime suhu sapi */}
        <RealtimeChartCard
          loading={loading}
          cows={cows}
          displayedData={displayedData}
          filteredHistory={filteredHistory}
          dataOffset={dataOffset}
          ITEMS_PER_PAGE={ITEMS_PER_PAGE}
          dateRange={dateRange}
          setDateRange={setDateRange}
          appliedTimeRange={appliedTimeRange}
          setAppliedTimeRange={setAppliedTimeRange}
          datePickerStats={datePickerStats}
          timePeriod={timePeriod}
          setTimePeriod={setTimePeriod}
          filterCategory={filterCategory}
          setFilterCategory={setFilterCategory}
          totalPages={totalPages}
          handlePageSelect={handlePageSelect}
          handlePrevPage={handlePrevPage}
          handleNextPage={handleNextPage}
        />

        {/* 🔹 Kartu statistik rata-rata dan riwayat data suhu */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <AverageCard
            filteredHistory={filteredHistory}
            avgData={avgData}
            displayedData={displayedData}
            getTimePeriodLabel={getTimePeriodLabel}
          />
          <HistoryCard
            filteredHistory={filteredHistory}
            displayedData={displayedData}
            dataOffset={dataOffset}
            getTimePeriodLabel={getTimePeriodLabel}
          />
        </div>
      </div>

      {/* 🔹 Style tambahan untuk scrollbar dan animasi */}
      <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: #f3f4f6;
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #22c55e;
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #16a34a;
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(-10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fadeIn {
          animation: fadeIn 0.3s ease-out;
        }
      `}</style>

      {/* 🔹 Modal edit status pemeriksaan */}
      <EditCheckupModal
        show={showEditModal}
        onClose={() => setShowEditModal(false)}
        onConfirm={handleEditCheckup}
      />

      {/* 🔹 Modal konfirmasi hapus sapi */}
      <DeleteModal
        show={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={handleDelete}
      />

      {/* 🔹 Modal restore data sapi */}
      <RestoreModal
        show={showRestoreModal}
        onClose={() => setShowRestoreModal(false)}
        deletedCows={deletedCows}
        onRestore={handleRestoreCow}
        loading={restoreLoading}
      />
    </div>
  );
}
