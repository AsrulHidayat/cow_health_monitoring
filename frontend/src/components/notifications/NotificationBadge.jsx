// src/components/notifications/NotificationBadge.jsx
import React from 'react';

const NotificationBadge = ({ count, onClick }) => {
  const hasNotifications = count > 0;

  return (
    <button
      onClick={onClick}
      className={`relative p-3 rounded-xl transition-all duration-300 group ${hasNotifications
        ? 'bg-gradient-to-br from-blue-50 to-blue-100 hover:from-blue-100 hover:to-blue-200 shadow-md hover:shadow-lg'
        : 'bg-gray-50 hover:bg-gray-100'
        }`}
      aria-label={`Notifikasi: ${count} belum dibaca`}
    >
      {/* Bell Icon dengan Animasi */}
      <div className="relative">
        <svg
          className={`w-6 h-6 transition-all duration-300 ${hasNotifications
            ? 'text-blue-600 animate-wiggle'
            : 'text-gray-600 group-hover:text-gray-800'
            }`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
          />
        </svg>

        {/* Notification Dot Animation (untuk notifikasi baru) */}
        {hasNotifications && (
          <span className="absolute -top-1 -right-1 flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
          </span>
        )}
      </div>

      {/* Badge Count - Enhanced */}
      {hasNotifications && (
        <span className="absolute -top-2 -right-2 bg-gradient-to-br from-red-500 to-red-600 text-white text-xs font-bold rounded-full min-w-[24px] h-6 flex items-center justify-center px-1.5 shadow-lg border-2 border-white animate-bounce-subtle">
          {count > 99 ? '99+' : count}
        </span>
      )}

      {/* Tooltip di bawah ikon */}
      <div className="absolute top-full left-1/2 -translate-x-1/2 mt-3 hidden group-hover:block z-50">
        <div className="bg-gray-900 text-white text-xs rounded-lg py-2 px-3 whitespace-nowrap shadow-xl">
          {hasNotifications
            ? `${count} notifikasi belum dibaca`
            : 'Tidak ada notifikasi'}
          {/* Segitiga kecil di atas tooltip */}
          <div className="absolute bottom-full left-1/2 -translate-x-1/2 -mb-px">
            <div className="border-4 border-transparent border-b-gray-900"></div>
          </div>
        </div>
      </div>

      {/* Styles untuk animasi custom */}
      <style jsx>{`
        @keyframes wiggle {
          0%, 100% { transform: rotate(0deg); }
          25% { transform: rotate(-10deg); }
          75% { transform: rotate(10deg); }
        }
        
        @keyframes bounce-subtle {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-2px); }
        }
        
        .animate-wiggle {
          animation: wiggle 0.5s ease-in-out;
        }
        
        .animate-bounce-subtle {
          animation: bounce-subtle 2s ease-in-out infinite;
        }
      `}</style>
    </button>
  );
};

export default NotificationBadge;