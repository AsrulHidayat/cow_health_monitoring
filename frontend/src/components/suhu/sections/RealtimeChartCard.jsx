
import React from 'react';
import DateTimeRangePicker from '../charts/DateTimeRangePicker';
import ChartRealtime from '../charts/ChartRealtime';
import { TIME_FILTERS, TEMPERATURE_CATEGORIES } from '../utils/SuhuUtils';
import { CowIcon, PlusIcon } from '../SuhuPageComponents';

const Pagination = ({ dataOffset, totalPages, handlePageSelect, handlePrevPage, handleNextPage, getPageOptions, getCurrentPage, filteredHistory, ITEMS_PER_PAGE }) => {
  if (filteredHistory.length <= ITEMS_PER_PAGE) return null;

  return (
    <>
      <select
        value={dataOffset}
        onChange={(e) => handlePageSelect(e.target.value)}
        className="border border-gray-300 rounded-lg text-gray-600 px-3 py-2 text-sm hover:border-green-400 hover:shadow transition"
      >
        {getPageOptions().map((option, idx) => (
          <option key={idx} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>

      <div className="flex items-center gap-2">
        <button
          onClick={handlePrevPage}
          disabled={dataOffset === 0}
          className="px-3 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>

        <span className="text-sm text-gray-600 font-medium px-2">
          {getCurrentPage()} / {totalPages}
        </span>

        <button
          onClick={handleNextPage}
          disabled={dataOffset + ITEMS_PER_PAGE >= filteredHistory.length}
          className="px-3 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>
    </>
  );
};

const RealtimeChartCard = ({
  loading,
  cows,
  displayedData,
  filteredHistory,
  dataOffset,
  ITEMS_PER_PAGE,
  dateRange,
  setDateRange,
  appliedTimeRange,
  setAppliedTimeRange,
  datePickerStats,
  timePeriod,
  setTimePeriod,
  filterCategory,
  setFilterCategory,
  totalPages,
  handlePageSelect,
  handlePrevPage,
  handleNextPage
}) => {

  const getPageOptions = () => {
    const options = [];
    for (let i = 0; i < totalPages; i++) {
      const label = i === 0 ? "Terbaru" : `${i * ITEMS_PER_PAGE} data sebelumnya`;
      options.push({ value: i * ITEMS_PER_PAGE, label });
    }
    return options.reverse();
  };

  const getCurrentPage = () => Math.floor(dataOffset / ITEMS_PER_PAGE) + 1;

  return (
    <div className="bg-gray-50 rounded-xl border border-gray-200">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 px-6 py-4 bg-white border-b border-gray-200 rounded-t-xl">
        <div className="flex items-center gap-2">
          <h2 className="text-lg font-semibold text-gray-800">Realtime Graphics</h2>
          <span className="text-gray-400 cursor-help text-sm">ⓘ</span>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <DateTimeRangePicker
            onApply={({ startDate, endDate, startTime, endTime }) => {
              setDateRange({ startDate, endDate });
              setAppliedTimeRange({ startTime, endTime });
            }}
            onReset={() => {
              setDateRange({ startDate: null, endDate: null });
              setAppliedTimeRange({ startTime: "00:00", endTime: "23:59" });
            }}
            stats={datePickerStats}
            timeCategory={timePeriod}
          />

          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className="border border-gray-300 rounded-lg text-gray-600 px-3 py-2 text-sm hover:border-blue-400 hover:shadow transition"
          >
            {TEMPERATURE_CATEGORIES.map(cat => (
              <option key={cat.value} value={cat.value}>
                {cat.label}
              </option>
            ))}
          </select>

          <select
            value={timePeriod}
            onChange={(e) => setTimePeriod(e.target.value)}
            className={`border border-gray-300 rounded-lg text-gray-600 px-3 py-2 text-sm hover:border-blue-400 hover:shadow transition ${dateRange.startDate && dateRange.endDate ? 'bg-gray-100 opacity-70 cursor-not-allowed' : ''}`}
          >
            {Object.values(TIME_FILTERS).map(filter => (
              <option key={filter.value} value={filter.value}>
                {filter.label}
              </option>
            ))}
          </select>

          <Pagination
            dataOffset={dataOffset}
            totalPages={totalPages}
            handlePageSelect={handlePageSelect}
            handlePrevPage={handlePrevPage}
            handleNextPage={handleNextPage}
            getPageOptions={getPageOptions}
            getCurrentPage={getCurrentPage}
            filteredHistory={filteredHistory}
            ITEMS_PER_PAGE={ITEMS_PER_PAGE}
          />
        </div>
      </div>

      <div className="bg-gray-50 min-h-[400px] flex items-center justify-center rounded-b-xl">
        {loading ? (
          <div className="text-center py-20">
            <div className="w-12 h-12 border-4 border-green-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-600 font-medium">Memuat data sapi...</p>
          </div>
        ) : cows.length > 0 ? (
          displayedData.length > 0 ? (
            <div className="w-full h-full p-6">
              <ChartRealtime data={displayedData} />
              {filteredHistory.length > ITEMS_PER_PAGE && (
                <div className="mt-4 text-center">
                  <p className="text-sm text-gray-500">
                    Menampilkan data {dataOffset + 1} - {Math.min(filteredHistory.length, dataOffset + ITEMS_PER_PAGE)} dari {filteredHistory.length} total data
                  </p>
                </div>
              )}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <CowIcon />
              <p className="text-gray-700 font-medium mt-4">Belum ada data suhu untuk periode ini.</p>
            </div>
          )
        ) : (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <CowIcon />
            <p className="text-gray-700 font-medium mt-4">Belum ada ID sapi yang terdaftar.</p>
            <p className="text-gray-400 text-sm mt-1">Tambahkan data sapi terlebih dahulu untuk memulai monitoring.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default RealtimeChartCard;
