import { useState, useRef, useEffect } from 'react';
import { Bell, CheckCheck } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { useNotifications } from '../../hooks/useNotifications';

interface Notification {
  id: string;
  title: string;
  message: string;
  createdAt: string;
  isRead: boolean;
}

export default function NotificationBell() {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const { notifications, unreadCount, markAsRead, markAllAsRead } = useNotifications();

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleNotificationClick = (notification: Notification) => {
    if (!notification.isRead) {
      markAsRead(notification.id);
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative neu-sm rounded-full p-2.5 transition-all duration-200 hover:scale-105 active:scale-95"
        aria-label="Notifications"
      >
        <Bell className="h-5 w-5 text-holst-navy-900" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-holst-sand text-[10px] font-semibold text-holst-navy-900">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-3 w-80 overflow-hidden rounded-2xl neu-lg bg-holst-cream z-50">
          <div className="flex items-center justify-between border-b border-holst-navy-800/10 px-5 py-4">
            <h3 className="font-display text-lg font-semibold text-holst-navy-900">
              Notifications
            </h3>
            {unreadCount > 0 && (
              <button
                onClick={markAllAsRead}
                className="flex items-center gap-1 text-xs font-medium text-holst-blue transition-colors hover:text-holst-navy-900"
              >
                <CheckCheck className="h-3.5 w-3.5" />
                Mark all read
              </button>
            )}
          </div>

          <div className="max-h-96 overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="px-5 py-10 text-center">
                <Bell className="mx-auto mb-3 h-10 w-10 text-holst-navy-800/20" />
                <p className="text-sm text-holst-navy-800/50">No notifications yet</p>
              </div>
            ) : (
              notifications.map((notification) => (
                <button
                  key={notification.id}
                  onClick={() => handleNotificationClick(notification)}
                  className={`w-full border-b border-holst-navy-800/5 px-5 py-3.5 text-left transition-colors hover:bg-holst-navy-800/5 ${
                    !notification.isRead ? 'bg-holst-sand/10' : ''
                  }`}
                >
                  <div className="flex items-start gap-3">
                    {!notification.isRead && (
                      <span className="mt-1.5 h-2 w-2 flex-shrink-0 rounded-full bg-holst-sand" />
                    )}
                    <div className={`flex-1 ${notification.isRead ? 'ml-5' : ''}`}>
                      <p className={`text-sm font-medium text-holst-navy-900 ${!notification.isRead ? '' : 'opacity-70'}`}>
                        {notification.title}
                      </p>
                      <p className="mt-0.5 text-xs text-holst-navy-800/50 line-clamp-2">
                        {notification.message}
                      </p>
                      <p className="font-accent mt-1 text-[10px] text-holst-navy-800/40">
                        {formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })}
                      </p>
                    </div>
                  </div>
                </button>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
