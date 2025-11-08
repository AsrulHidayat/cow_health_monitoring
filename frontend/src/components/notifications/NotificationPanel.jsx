// src/components/notifications/NotificationPanel.jsx
import React, { useState } from 'react';

// Helper function untuk format waktu
const formatTimeAgo = (timestamp) => {
  const now = new Date();
  const time = new Date(timestamp);
  const diffInMinutes = Math.floor((now - time) / (1000 * 60));
  
  if (diffInMinutes < 1) return 'Baru saja';
  if (diffInMinutes < 60) return `${diffInMinutes} menit lalu`;
  
  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) return `${diffInHours} jam lalu`;
  
  const diffInDays = Math.floor(diffInHours / 24);
  if (diffInDays < 7) return `${diffInDays} hari lalu`;
  
  return `${Math.floor(diffInDays / 7)} minggu lalu`;
};

// Komponen untuk single notification item - IMPROVED UI
const NotificationItem = ({ notification, onMarkAsRead, onDelete, onViewDetail }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const getIcon = () => {
    switch (notification.type) {
      case 'urgent':
        return (
          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-red-500 to-red-600 flex items-center justify-center shadow-lg">
            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
        );
      case 'warning':
        return (
          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-yellow-400 to-yellow-500 flex items-center justify-center shadow-lg">
            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
        );
      default:
        return (
          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-400 to-blue-500 flex items-center justify-center shadow-lg">
            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
        );
    }
  };

  const getBgColor = () => {
    if (!notification.isRead) {
      return notification.type === 'urgent' 
        ? 'bg-gradient-to-r from-red-50 via-red-50 to-white' 
        : 'bg-gradient-to-r from-yellow-50 via-yellow-50 to-white';
    }
    return 'bg-white';
  };

  const getBorderColor = () => {
    return notification.type === 'urgent' ? 'border-l-red-500' : 'border-l-yellow-500';
  };

  return (
    <div 
      className={`relative rounded-xl p-4 mb-4 border-l-4 ${getBorderColor()} ${getBgColor()} shadow-sm hover:shadow-xl transition-all duration-300 cursor-pointer overflow-hidden group`}
      onClick={() => {
        if (!notification.isRead) {
          onMarkAsRead(notification.id);
        }
        setIsExpanded(!isExpanded);
      }}
    >
      {/* Unread Indicator */}
      {!notification.isRead && (
        <div className="absolute top-3 right-3">
          <span className="flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-blue-500"></span>
          </span>
        </div>
      )}

      <div className="flex gap-4">
        {/* Icon */}
        <div className="flex-shrink-0">
          {getIcon()}
        </div>
        
        {/* Content */}
        <div className="flex-1 min-w-0">
          {/* Header */}
          <div className="flex justify-between items-start mb-2">
            <div className="flex-1">
              <h4 className="font-bold text-gray-900 text-base mb-1">
                {notification.severity}
              </h4>
              <div className="flex items-center gap-2">
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                  🐄 {notification.sapiName}
                </span>
                <span className="text-xs text-gray-500">
                  {formatTimeAgo(notification.timestamp)}
                </span>
              </div>
            </div>
          </div>
          
          {/* Message */}
          <p className="text-sm text-gray-700 leading-relaxed mb-3">
            {notification.message}
          </p>
          
          {/* Parameters */}
          {notification.parameters && notification.parameters.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-4">
              {notification.parameters.map((param, idx) => (
                <span 
                  key={idx}
                  className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${
                    notification.type === 'urgent'
                      ? 'bg-red-100 text-red-700 border border-red-200'
                      : 'bg-yellow-100 text-yellow-700 border border-yellow-200'
                  }`}
                >
                  {param === 'suhu' && '🌡️'}
                  {param === 'detak jantung' && '❤️'}
                  {param === 'gerakan' && '🏃'}
                  {' '}{param}
                </span>
              ))}
            </div>
          )}
          
          {/* Expanded Actions */}
          <div 
            className={`transition-all duration-300 overflow-hidden ${
              isExpanded ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
            }`}
          >
            <div className="border-t border-gray-200 pt-4 mt-2 space-y-3">
              {/* Primary Action */}
              <button 
                onClick={(e) => {
                  e.stopPropagation();
                  onViewDetail(notification.sapiId);
                }}
                className={`w-full flex items-center justify-center gap-2 px-4 py-3 rounded-lg font-semibold text-white transition-all transform hover:scale-105 ${
                  notification.type === 'urgent'
                    ? 'bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 shadow-lg shadow-red-500/50'
                    : 'bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-600 hover:to-yellow-700 shadow-lg shadow-yellow-500/50'
                }`}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
                Periksa Kondisi Sapi Sekarang
              </button>
              
              {/* Secondary Actions Grid */}
              <div className="grid grid-cols-3 gap-2">
                <button 
                  onClick={(e) => {
                    e.stopPropagation();
                    alert('Menghubungi petugas untuk ' + notification.sapiName);
                  }}
                  className="flex flex-col items-center gap-1 bg-white border-2 border-blue-200 hover:border-blue-400 hover:bg-blue-50 px-3 py-3 rounded-lg transition-all group"
                  title="Hubungi Petugas"
                >
                  <svg className="w-5 h-5 text-blue-600 group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                  </svg>
                  <span className="text-xs font-medium text-gray-700">Hubungi</span>
                </button>
                
                <button 
                  onClick={(e) => {
                    e.stopPropagation();
                    console.log('Viewing sensor graph for', notification.sapiId);
                  }}
                  className="flex flex-col items-center gap-1 bg-white border-2 border-green-200 hover:border-green-400 hover:bg-green-50 px-3 py-3 rounded-lg transition-all group"
                  title="Lihat Grafik"
                >
                  <svg className="w-5 h-5 text-green-600 group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                  <span className="text-xs font-medium text-gray-700">Grafik</span>
                </button>
                
                <button 
                  onClick={(e) => {
                    e.stopPropagation();
                    if (window.confirm('Hapus notifikasi ini?')) {
                      onDelete(notification.id);
                    }
                  }}
                  className="flex flex-col items-center gap-1 bg-white border-2 border-red-200 hover:border-red-400 hover:bg-red-50 px-3 py-3 rounded-lg transition-all group"
                  title="Hapus"
                >
                  <svg className="w-5 h-5 text-red-600 group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                  <span className="text-xs font-medium text-gray-700">Hapus</span>
                </button>
              </div>
            </div>
          </div>

          {/* Expand/Collapse Indicator */}
          <div className="flex justify-center mt-3">
            <button 
              className="text-xs text-gray-500 hover:text-gray-700 flex items-center gap-1 transition-colors"
              onClick={(e) => {
                e.stopPropagation();
                setIsExpanded(!isExpanded);
              }}
            >
              {isExpanded ? (
                <>
                  Tutup aksi
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                  </svg>
                </>
              ) : (
                <>
                  Lihat aksi
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Hover Effect Border */}
      <div className="absolute inset-0 border-2 border-transparent group-hover:border-blue-200 rounded-xl transition-all pointer-events-none"></div>
    </div>
  );
};

// Komponen utama NotificationPanel - IMPROVED UI
const NotificationPanel = ({ 
  isOpen, 
  onClose, 
  sapiName, 
  notifications, 
  onMarkAsRead, 
  onDelete, 
  onMarkAllAsRead,
  onViewDetail 
}) => {
  const [filter, setFilter] = useState('all'); // all, urgent, warning, unread

  if (!isOpen) return null;

  const unreadCount = notifications.filter(n => !n.isRead).length;
  const urgentCount = notifications.filter(n => n.type === 'urgent' && !n.isRead).length;

  // Filter notifications
  const filteredNotifications = notifications.filter(notif => {
    if (filter === 'all') return true;
    if (filter === 'unread') return !notif.isRead;
    return notif.type === filter;
  });

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-40 backdrop-blur-sm z-50 flex justify-end animate-fade-in"
      onClick={onClose}
    >
      <div 
        className="bg-gradient-to-b from-white to-gray-50 w-full max-w-lg h-full flex flex-col shadow-2xl animate-slide-in"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header - Enhanced */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 p-6 shadow-lg">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-white bg-opacity-20 flex items-center justify-center">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                </svg>
              </div>
              <div>
                <h3 className="text-xl font-bold text-white">
                  Notifikasi
                </h3>
                <p className="text-blue-100 text-sm">{sapiName}</p>
              </div>
            </div>
            <button 
              onClick={onClose}
              className="text-white hover:bg-white hover:bg-opacity-20 rounded-full p-2 transition-all"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          
          {/* Stats & Actions */}
          <div className="flex items-center justify-between">
            <div className="flex gap-4">
              <div className="bg-white bg-opacity-20 backdrop-blur-sm rounded-lg px-3 py-2">
                <div className="text-2xl font-bold text-white">{notifications.length}</div>
                <div className="text-xs text-blue-100">Total</div>
              </div>
              <div className="bg-white bg-opacity-20 backdrop-blur-sm rounded-lg px-3 py-2">
                <div className="text-2xl font-bold text-white">{unreadCount}</div>
                <div className="text-xs text-blue-100">Belum dibaca</div>
              </div>
              {urgentCount > 0 && (
                <div className="bg-red-500 bg-opacity-90 backdrop-blur-sm rounded-lg px-3 py-2 animate-pulse">
                  <div className="text-2xl font-bold text-white">{urgentCount}</div>
                  <div className="text-xs text-red-100">Mendesak</div>
                </div>
              )}
            </div>
            
            {notifications.length > 0 && unreadCount > 0 && (
              <button 
                onClick={onMarkAllAsRead}
                className="bg-white text-blue-600 hover:bg-blue-50 px-4 py-2 rounded-lg text-sm font-semibold transition-all shadow-md hover:shadow-lg"
              >
                Tandai Semua
              </button>
            )}
          </div>
        </div>

        {/* Filter Tabs */}
        {notifications.length > 0 && (
          <div className="bg-white border-b border-gray-200 px-4 py-3 flex gap-2 overflow-x-auto">
            {[
              { key: 'all', label: 'Semua', count: notifications.length },
              { key: 'unread', label: 'Belum Dibaca', count: unreadCount },
              { key: 'urgent', label: 'Mendesak', count: notifications.filter(n => n.type === 'urgent').length },
              { key: 'warning', label: 'Peringatan', count: notifications.filter(n => n.type === 'warning').length },
            ].map(tab => (
              <button
                key={tab.key}
                onClick={() => setFilter(tab.key)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all whitespace-nowrap ${
                  filter === tab.key
                    ? 'bg-blue-100 text-blue-700 shadow-sm'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                {tab.label}
                {tab.count > 0 && (
                  <span className={`ml-2 px-2 py-0.5 rounded-full text-xs font-bold ${
                    filter === tab.key ? 'bg-blue-200' : 'bg-gray-200'
                  }`}>
                    {tab.count}
                  </span>
                )}
              </button>
            ))}
          </div>
        )}
        
        {/* Content - Scrollable */}
        <div className="flex-1 overflow-y-auto p-4">
          {filteredNotifications.length === 0 ? (
            // Empty State - Enhanced
            <div className="flex flex-col items-center justify-center h-full text-center px-6">
              <div className="w-32 h-32 rounded-full bg-gradient-to-br from-green-100 to-green-200 flex items-center justify-center mb-6 shadow-lg">
                <svg className="w-16 h-16 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">
                {filter === 'all' ? 'Tidak Ada Notifikasi' : 'Tidak Ada Hasil'}
              </h3>
              <p className="text-sm text-gray-600 max-w-xs leading-relaxed">
                {filter === 'all' 
                  ? `${sapiName} dalam kondisi baik. Anda akan mendapat pemberitahuan jika ada parameter yang bermasalah.`
                  : `Tidak ada notifikasi untuk filter "${filter === 'unread' ? 'Belum Dibaca' : filter === 'urgent' ? 'Mendesak' : 'Peringatan'}".`
                }
              </p>
            </div>
          ) : (
            // Notification List
            <div>
              {filteredNotifications.map(notification => (
                <NotificationItem
                  key={notification.id}
                  notification={notification}
                  onMarkAsRead={onMarkAsRead}
                  onDelete={onDelete}
                  onViewDetail={onViewDetail}
                />
              ))}
            </div>
          )}
        </div>
      </div>
      
      {/* Styles untuk animasi */}
      <style jsx>{`
        @keyframes fade-in {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        
        @keyframes slide-in {
          from { transform: translateX(100%); }
          to { transform: translateX(0); }
        }
        
        .animate-fade-in {
          animation: fade-in 0.2s ease-out;
        }
        
        .animate-slide-in {
          animation: slide-in 0.3s cubic-bezier(0.16, 1, 0.3, 1);
        }
      `}</style>
    </div>
  );
};

export default NotificationPanel;