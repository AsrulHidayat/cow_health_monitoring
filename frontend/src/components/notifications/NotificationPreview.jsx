// src/components/notifications/NotificationPreview.jsx
// Komponen untuk preview notifikasi di sidebar (kolom kanan)

import React from 'react';

const NotificationPreview = ({ notifications, onOpenPanel, onMarkAsRead }) => {
  const unreadCount = notifications.filter(n => !n.isRead).length;
  const urgentCount = notifications.filter(n => n.type === 'urgent' && !n.isRead).length;

  const formatTimeAgo = (timestamp) => {
    const now = new Date();
    const time = new Date(timestamp);
    const diffInMinutes = Math.floor((now - time) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'Baru saja';
    if (diffInMinutes < 60) return `${diffInMinutes}m`;
    
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `${diffInHours}j`;
    
    return `${Math.floor(diffInHours / 24)}h`;
  };

  return (
    <div className="lg:col-span-2 bg-gradient-to-br from-green-50 to-blue-50 rounded-xl p-6 flex flex-col border border-green-100 h-full shadow-lg">
      {/* Header */}
      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-green-400 to-green-500 flex items-center justify-center">
            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
            </svg>
          </div>
          <h3 className="text-gray-800 font-bold text-lg">Notifikasi</h3>
          {unreadCount > 0 && (
            <span className="bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full">
              {unreadCount}
            </span>
          )}
        </div>
        <button 
          onClick={onOpenPanel}
          className="text-sm text-blue-600 hover:text-blue-800 cursor-pointer transition font-semibold hover:underline"
        >
          Lihat Semua
        </button>
      </div>

      {/* Stats Cards */}
      {notifications.length > 0 && (
        <div className="grid grid-cols-2 gap-3 mb-4">
          <div className="bg-white rounded-lg p-3 shadow-sm">
            <div className="text-2xl font-bold text-gray-900">{notifications.length}</div>
            <div className="text-xs text-gray-600">Total Notif</div>
          </div>
          <div className="bg-gradient-to-br from-red-50 to-red-100 rounded-lg p-3 shadow-sm border border-red-200">
            <div className="text-2xl font-bold text-red-600">{urgentCount}</div>
            <div className="text-xs text-red-700 font-medium">Mendesak</div>
          </div>
        </div>
      )}

      {/* Content */}
      <div className="flex-1 overflow-y-auto custom-scrollbar">
        {notifications.length === 0 ? (
          // Empty State
          <div className="flex flex-col items-center justify-center text-center h-full">
            <div className="w-32 h-32 rounded-full bg-gradient-to-br from-green-100 to-green-200 flex items-center justify-center mb-4 shadow-lg">
              <svg className="w-16 h-16 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="text-green-700 font-bold text-lg mb-2">Semua Aman! 🎉</h3>
            <p className="text-green-600 text-sm max-w-xs">
              Tidak ada notifikasi. Semua sapi dalam kondisi baik.
            </p>
          </div>
        ) : (
          // Preview 3 notifikasi terbaru
          <div className="space-y-3">
            {notifications.slice(0, 3).map((notif) => (
              <div 
                key={notif.id}
                className={`bg-white rounded-lg p-4 border-l-4 ${
                  notif.type === 'urgent' ? 'border-red-500' : 'border-yellow-500'
                } ${!notif.isRead ? 'shadow-md' : 'shadow-sm'} cursor-pointer hover:shadow-xl transition-all duration-300 group relative overflow-hidden`}
                onClick={() => {
                  if (!notif.isRead) {
                    onMarkAsRead(notif.id);
                  }
                  onOpenPanel();
                }}
              >
                {/* Unread Indicator */}
                {!notif.isRead && (
                  <div className="absolute top-2 right-2">
                    <span className="flex h-2 w-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
                    </span>
                  </div>
                )}

                {/* Content */}
                <div className="flex items-start gap-3">
                  {/* Icon */}
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${
                    notif.type === 'urgent' 
                      ? 'bg-gradient-to-br from-red-100 to-red-200' 
                      : 'bg-gradient-to-br from-yellow-100 to-yellow-200'
                  }`}>
                    <span className="text-xl">
                      {notif.type === 'urgent' ? '🚨' : '⚠️'}
                    </span>
                  </div>
                  
                  {/* Text */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2 mb-1">
                      <h4 className={`font-bold text-sm line-clamp-1 ${
                        notif.type === 'urgent' ? 'text-red-700' : 'text-yellow-700'
                      }`}>
                        {notif.severity}
                      </h4>
                      <span className="text-xs text-gray-500 whitespace-nowrap">
                        {formatTimeAgo(notif.timestamp)}
                      </span>
                    </div>
                    <p className="text-xs text-gray-600 line-clamp-2 mb-2">
                      {notif.message}
                    </p>
                    
                    {/* Parameters - Compact */}
                    {notif.parameters && notif.parameters.length > 0 && (
                      <div className="flex flex-wrap gap-1">
                        {notif.parameters.slice(0, 2).map((param, idx) => (
                          <span 
                            key={idx}
                            className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                              notif.type === 'urgent'
                                ? 'bg-red-100 text-red-700'
                                : 'bg-yellow-100 text-yellow-700'
                            }`}
                          >
                            {param}
                          </span>
                        ))}
                        {notif.parameters.length > 2 && (
                          <span className="text-xs text-gray-500">
                            +{notif.parameters.length - 2}
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                {/* Hover Effect */}
                <div className="absolute inset-0 border-2 border-transparent group-hover:border-blue-300 rounded-lg transition-all pointer-events-none"></div>
              </div>
            ))}
            
            {/* Show More Button */}
            {notifications.length > 3 && (
              <button 
                onClick={onOpenPanel}
                className="w-full text-center text-sm text-blue-600 hover:text-blue-800 py-3 bg-white hover:bg-blue-50 rounded-lg transition-all font-semibold shadow-sm hover:shadow-md border border-blue-200"
              >
                Lihat {notifications.length - 3} notifikasi lainnya →
              </button>
            )}
          </div>
        )}
      </div>

      {/* Custom Scrollbar Styles */}
      <style jsx>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(0, 0, 0, 0.2);
          border-radius: 3px;
        }
        
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(0, 0, 0, 0.3);
        }
      `}</style>
    </div>
  );
};

export default NotificationPreview;