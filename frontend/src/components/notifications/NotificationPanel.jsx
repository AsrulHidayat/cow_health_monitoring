// src/components/notifications/NotificationPanel.jsx
import React from 'react';

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

// Komponen untuk single notification item
const NotificationItem = ({ notification, onMarkAsRead, onDelete, onViewDetail }) => {
  const getIcon = () => {
    switch (notification.type) {
      case 'urgent':
        return '🚨';
      case 'warning':
        return '⚠️';
      default:
        return 'ℹ️';
    }
  };

  return (
    <div 
      className={`bg-white rounded-lg p-4 mb-3 border-l-4 ${
        notification.type === 'urgent' ? 'border-red-500' : 'border-yellow-500'
      } ${!notification.isRead ? 'bg-blue-50' : ''} hover:shadow-md transition-shadow cursor-pointer`}
      onClick={() => !notification.isRead && onMarkAsRead(notification.id)}
    >
      <div className="flex gap-3">
        {/* Icon */}
        <div className="text-3xl flex-shrink-0 relative">
          {getIcon()}
          {!notification.isRead && (
            <span className="absolute top-0 right-0 w-2 h-2 bg-blue-500 rounded-full"></span>
          )}
        </div>
        
        {/* Content */}
        <div className="flex-1 min-w-0">
          {/* Header */}
          <div className="flex justify-between items-start mb-2">
            <h4 className="font-semibold text-gray-900 text-sm">
              {notification.severity} - {notification.sapiName}
            </h4>
            <span className="text-xs text-gray-500 whitespace-nowrap ml-2">
              {formatTimeAgo(notification.timestamp)}
            </span>
          </div>
          
          {/* Message */}
          <p className="text-sm text-gray-700 mb-2">{notification.message}</p>
          
          {/* Parameters */}
          {notification.parameters && notification.parameters.length > 0 && (
            <div className="flex flex-wrap gap-1 mb-3">
              <span className="text-xs text-gray-600">Parameter:</span>
              {notification.parameters.map((param, idx) => (
                <span 
                  key={idx}
                  className="text-xs bg-red-100 text-red-800 px-2 py-1 rounded-full"
                >
                  {param}
                </span>
              ))}
            </div>
          )}
          
          {/* Actions */}
          <div className="border-t pt-3 mt-2">
            <button 
              onClick={(e) => {
                e.stopPropagation();
                onViewDetail(notification.sapiId);
              }}
              className="text-blue-600 hover:text-blue-800 text-sm font-medium mb-2 block"
            >
              segera periksa kondisi sapi →
            </button>
            
            <div className="flex gap-2">
              <button 
                onClick={(e) => {
                  e.stopPropagation();
                  alert('Menghubungi petugas untuk ' + notification.sapiName);
                }}
                className="flex items-center gap-1 bg-gray-100 hover:bg-gray-200 px-3 py-1 rounded text-xs transition"
                title="Hubungi Petugas"
              >
                📞
              </button>
              
              <button 
                onClick={(e) => {
                  e.stopPropagation();
                  console.log('Viewing sensor graph for', notification.sapiId);
                }}
                className="flex items-center gap-1 bg-gray-100 hover:bg-gray-200 px-3 py-1 rounded text-xs transition"
                title="Lihat Grafik Sensor"
              >
                📊
              </button>
              
              <button 
                onClick={(e) => {
                  e.stopPropagation();
                  if (window.confirm('Hapus notifikasi ini?')) {
                    onDelete(notification.id);
                  }
                }}
                className="flex items-center gap-1 bg-red-50 hover:bg-red-100 text-red-600 px-3 py-1 rounded text-xs ml-auto transition"
                title="Hapus Notifikasi"
              >
                🗑️
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Komponen utama NotificationPanel
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
  if (!isOpen) return null;

  const unreadCount = notifications.filter(n => !n.isRead).length;

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-30 z-50 flex justify-end animate-fade-in"
      onClick={onClose}
    >
      <div 
        className="bg-white w-full max-w-md h-full flex flex-col shadow-2xl animate-slide-in"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header - Sticky */}
        <div className="bg-gray-50 p-5 border-b sticky top-0 z-10">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <h3 className="text-lg font-semibold text-gray-900">
                Notifikasi - {sapiName}
              </h3>
              {unreadCount > 0 && (
                <span className="bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full">
                  {unreadCount}
                </span>
              )}
            </div>
            <button 
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700 text-2xl leading-none"
            >
              ✕
            </button>
          </div>
          
          {notifications.length > 0 && (
            <button 
              onClick={onMarkAllAsRead}
              className="text-sm text-blue-600 hover:text-blue-800 transition"
            >
              Mark as read
            </button>
          )}
        </div>
        
        {/* Content - Scrollable */}
        <div className="flex-1 overflow-y-auto p-4 bg-gray-50">
          {notifications.length === 0 ? (
            // Empty State
            <div className="flex flex-col items-center justify-center h-full text-center">
              <div className="text-6xl mb-4 opacity-50">🔔</div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Tidak Ada Notifikasi
              </h3>
              <p className="text-sm text-gray-600 max-w-xs">
                {sapiName} dalam kondisi baik. Anda akan mendapat pemberitahuan jika ada parameter yang bermasalah.
              </p>
            </div>
          ) : (
            // Notification List
            notifications.map(notification => (
              <NotificationItem
                key={notification.id}
                notification={notification}
                onMarkAsRead={onMarkAsRead}
                onDelete={onDelete}
                onViewDetail={onViewDetail}
              />
            ))
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
          animation: slide-in 0.3s ease-out;
        }
      `}</style>
    </div>
  );
};

export default NotificationPanel;