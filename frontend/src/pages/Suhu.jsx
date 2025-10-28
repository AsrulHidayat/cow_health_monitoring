import { useState } from "react";
import axios from "axios";

// 🔹 Import hooks
import { useTemperatureData } from "../components/suhu/hooks/useTemperatureData";

// 🔹 Import utilitas dan komponen UI
import { TIME_FILTERS, categorizeTemperature, getCategoryStyles } from "../components/suhu/utils/SuhuUtils";
import { Navbar, PlusIcon } from "../components/suhu/SuhuPageComponents";
import SensorStatus from "../components/suhu/SensorStatus";
import EditCheckupModal from "../components/suhu/modals/EditCheckupModal";
import DeleteModal from "../components/suhu/modals/DeleteModal";

// 🔹 Import seksi komponen
import HeaderSection from "../components/suhu/sections/HeaderSection";
import RealtimeChartCard from "../components/suhu/sections/RealtimeChartCard";
import AverageCard from "../components/suhu/sections/AverageCard";
import HistoryCard from "../components/suhu/sections/HistoryCard";

export default function Suhu() {
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

  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const handleEditCheckup = async (status) => {
    if (!cowId) return;
    try {
      const token = localStorage.getItem("token");
      await axios.put(
        `http://localhost:5001/api/cows/${cowId}/checkup-status`,
        { checkupStatus: status },
        { headers: { Authorization: `Bearer ${token}` } }
      );
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

  const handleDelete = async () => {
    if (!cowId || !selectedCow) return;

    try {
      const token = localStorage.getItem("token");

      // Hapus ID sapi (soft delete)
      const response = await axios.delete(
        `http://localhost:5001/api/cows/${cowId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      console.log("✅ Response delete:", response.data);

      // Update state: hapus dari daftar cows
      setCows(prevCows => prevCows.filter(cow => cow.id !== cowId));

      // Reset selected cow
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

  const avgCategory = avgData.avg_temp ? categorizeTemperature(avgData.avg_temp) : null;

  return (
    <div className="flex flex-col w-full min-h-screen bg-gray-50">
      <Navbar title="Suhu" cowId={cowId} cowData={selectedCow} />

      <HeaderSection
        cows={cows}
        cowId={cowId}
        onCowChange={setCowId}
        avgCategory={avgCategory}
        selectedCow={selectedCow}
        onEditClick={() => setShowEditModal(true)}
        onDeleteClick={() => setShowDeleteModal(true)}
        getCowCondition={getCowCondition}
        getCowConditionStyle={getCowConditionStyle}
        getCategoryStyles={getCategoryStyles}
      />

      {cows.length > 0 && (
        <div className="px-6 pt-6">
          <SensorStatus sensorStatus={sensorStatus} />
        </div>
      )}

      <div className="px-6 py-6 space-y-6">
        {cows.length === 0 && !loading && (
          <button className="flex items-center gap-2 px-5 py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-lg shadow-sm transition-all font-medium">
            <PlusIcon />
            <span>Tambah Sapi</span>
          </button>
        )}

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

      <EditCheckupModal
        show={showEditModal}
        onClose={() => setShowEditModal(false)}
        onConfirm={handleEditCheckup}
      />

      <DeleteModal
        show={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={handleDelete}
      />
    </div>
  );
}
