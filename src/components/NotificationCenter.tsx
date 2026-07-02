import React from "react";
import { Bell, Trophy, CheckCircle, Calendar, X } from "lucide-react";
import { AppNotification } from "../types";

interface NotificationCenterProps {
  notifications: AppNotification[];
  onToggleRead: (id: string) => void;
  onDelete: (id: string) => void;
  onMarkAllRead: () => void;
  onClearAll: () => void;
  isOpen: boolean;
  onClose: () => void;
}

export default function NotificationCenter({
  notifications,
  onToggleRead,
  onDelete,
  onMarkAllRead,
  onClearAll,
  isOpen,
  onClose,
}: NotificationCenterProps) {
  if (!isOpen) return null;

  const unreadCount = notifications.filter((n) => !n.read).length;

  const getIcon = (type: AppNotification["type"]) => {
    switch (type) {
      case "achievement":
        return <Trophy className="text-amber-500 w-3.5 h-3.5 shrink-0 mt-0.5" />;
      case "completed":
        return <CheckCircle className="text-emerald-500 w-3.5 h-3.5 shrink-0 mt-0.5" />;
      case "reminder":
        return <Calendar className="text-blue-400 w-3.5 h-3.5 shrink-0 mt-0.5" />;
      default:
        return <Bell className="text-[var(--theme-accent)] w-3.5 h-3.5 shrink-0 mt-0.5" />;
    }
  };

  const formatTime = (isoString: string) => {
    try {
      const date = new Date(isoString);
      const now = new Date();
      const diffMs = now.getTime() - date.getTime();
      const diffMins = Math.floor(diffMs / 60000);
      const diffHours = Math.floor(diffMins / 60);
      
      if (diffMins < 1) return "Just now";
      if (diffMins < 60) return `${diffMins}m ago`;
      if (diffHours < 24) return `${diffHours}h ago`;
      return date.toLocaleDateString(undefined, { month: "short", day: "numeric" });
    } catch {
      return "Recently";
    }
  };

  return (
    <>
      {/* Invisible backdrop overlay to catch clicks outside */}
      <div 
        className="fixed inset-0 z-40 bg-transparent cursor-default"
        onClick={onClose}
      />

      {/* Compact Floating Popover styled with dynamic theme properties */}
      <div className="fixed right-4 top-16 w-80 bg-[var(--theme-card)] border border-[var(--theme-border)] rounded-xl shadow-xl z-50 flex flex-col animate-fadeIn overflow-hidden">
        
        {/* Header */}
        <div className="p-3 border-b border-[var(--theme-border)] flex items-center justify-between bg-[var(--theme-bg)]/20">
          <span className="text-[11px] font-bold text-[var(--theme-text-dark)] flex items-center gap-1.5 font-mono uppercase tracking-wider">
            <Bell size={13} className="text-[var(--theme-accent)] animate-pulse" /> Notifications
          </span>
          <div className="flex items-center gap-2">
            {notifications.length > 0 && (
              <button 
                type="button"
                onClick={onClearAll}
                className="text-[10px] font-semibold text-[var(--theme-text-main)] hover:text-rose-500 transition-colors cursor-pointer font-mono"
                title="Clear all notifications"
              >
                Clear all
              </button>
            )}
            <button
              type="button"
              onClick={onClose}
              className="text-[var(--theme-text-main)] hover:text-[var(--theme-text-dark)] opacity-60 p-0.5 rounded cursor-pointer"
            >
              <X size={12} />
            </button>
          </div>
        </div>

        {/* Scroll List */}
        <div className="max-h-[300px] overflow-y-auto divide-y divide-[var(--theme-border)]/50">
          {notifications.length === 0 ? (
            <div className="py-8 px-4 text-center flex flex-col items-center justify-center">
              <Bell size={18} className="text-[var(--theme-text-main)] opacity-30 mb-1" />
              <p className="text-[11px] font-medium text-[var(--theme-text-main)] opacity-75">All caught up</p>
            </div>
          ) : (
            notifications.map((notif) => (
              <div 
                key={notif.id} 
                className={`p-3 flex gap-2.5 items-start transition-colors relative group hover:bg-[var(--theme-bg)]/30 cursor-pointer ${
                  !notif.read ? "bg-[var(--theme-accent-light)]/20" : ""
                }`}
                onClick={() => onToggleRead(notif.id)}
                title={notif.read ? "Mark unread" : "Mark read"}
              >
                {getIcon(notif.type)}

                <div className="flex-1 min-w-0 pr-3">
                  <div className="flex items-center justify-between gap-1.5">
                    <p className={`text-[11px] leading-tight truncate ${!notif.read ? "font-bold text-[var(--theme-text-dark)]" : "font-medium text-[var(--theme-text-main)]"}`}>
                      {notif.title}
                    </p>
                    <span className="text-[9px] text-[var(--theme-text-main)] opacity-60 whitespace-nowrap font-mono shrink-0">
                      {formatTime(notif.timestamp)}
                    </span>
                  </div>
                  <p className="text-[10px] text-[var(--theme-text-main)] opacity-80 leading-normal mt-0.5">
                    {notif.message}
                  </p>
                </div>

                {/* Dismiss button */}
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onDelete(notif.id);
                  }}
                  className="absolute right-2.5 top-2.5 text-[var(--theme-text-main)] hover:text-rose-500 opacity-0 group-hover:opacity-100 transition-opacity p-0.5 cursor-pointer"
                  title="Delete notification"
                >
                  <X size={10} />
                </button>
              </div>
            ))
          )}
        </div>

        {/* Footer marking all read */}
        {unreadCount > 0 && (
          <button
            type="button"
            onClick={onMarkAllRead}
            className="w-full text-center py-2 bg-[var(--theme-bg)]/30 hover:bg-[var(--theme-bg)]/50 text-[10px] font-semibold text-[var(--theme-accent)] border-t border-[var(--theme-border)] transition-colors cursor-pointer font-mono"
          >
            ✓ MARK ALL AS READ
          </button>
        )}
      </div>
    </>
  );
}
