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
        return <Trophy className="text-amber-500 w-3.5 h-3.5 shrink-0 mt-0.5 opacity-80" />;
      case "completed":
        return <CheckCircle className="text-emerald-600 w-3.5 h-3.5 shrink-0 mt-0.5 opacity-80" />;
      case "reminder":
        return <Calendar className="text-stone-500 w-3.5 h-3.5 shrink-0 mt-0.5 opacity-80" />;
      default:
        return <Bell className="text-[var(--theme-accent)] w-3.5 h-3.5 shrink-0 mt-0.5 opacity-80" />;
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

      {/* Popover styled with premium, low-noise aesthetic */}
      <div className="fixed right-6 top-[55px] w-[320px] bg-[var(--theme-card)]/95 backdrop-blur-md border border-[var(--theme-border)]/60 rounded-xl shadow-2xl z-50 flex flex-col animate-fadeIn overflow-visible select-none">
        
        {/* Dropdown pointing arrow */}
        <div className="absolute right-12.5 -top-[6px] w-3 h-3 bg-[var(--theme-card)] border-t border-l border-[var(--theme-border)]/65 rotate-45 z-50 pointer-events-none" />

        {/* Header */}
        <div className="p-3.5 border-b border-[var(--theme-border)]/30 flex items-center justify-between relative bg-transparent z-10">
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-bold tracking-wider uppercase text-[var(--theme-text-dark)]">
              Notifications
            </span>
            {unreadCount > 0 && (
              <span className="bg-[var(--theme-accent-light)] text-[var(--theme-accent)] text-[9px] font-bold px-2 py-0.5 rounded-full border border-[var(--theme-accent)]/10">
                {unreadCount} NEW
              </span>
            )}
          </div>
          <div className="flex items-center gap-2.5">
            {notifications.length > 0 && (
              <button 
                type="button"
                onClick={onClearAll}
                className="text-[10px] font-medium text-[var(--theme-text-main)] hover:text-rose-600 transition-colors cursor-pointer"
                title="Clear all notifications"
              >
                Clear all
              </button>
            )}
            <button
              type="button"
              onClick={onClose}
              className="text-[var(--theme-text-main)] hover:text-[var(--theme-text-dark)] opacity-55 p-0.5 rounded cursor-pointer transition-colors"
            >
              <X size={12} />
            </button>
          </div>
        </div>

        {/* Scroll List */}
        <div className="max-h-[320px] overflow-y-auto divide-y divide-[var(--theme-border)]/15 scrollbar-thin relative z-10">
          {notifications.length === 0 ? (
            <div className="py-10 px-4 text-center flex flex-col items-center justify-center">
              <Bell size={18} className="text-[var(--theme-accent)] opacity-40 mb-2 animate-bounce-slow" />
              <p className="text-xs font-semibold text-[var(--theme-text-dark)] mb-0.5">All caught up!</p>
              <p className="text-[10px] text-[var(--theme-text-main)] opacity-60">You have no new companion alerts.</p>
            </div>
          ) : (
            notifications.map((notif) => (
              <div 
                key={notif.id} 
                className={`p-3.5 flex gap-3 items-start transition-all relative group cursor-pointer border-l-2 ${
                  !notif.read 
                    ? "bg-[var(--theme-accent-light)]/10 border-[var(--theme-accent)]" 
                    : "border-transparent hover:bg-[var(--theme-bg)]/20"
                }`}
                onClick={() => onToggleRead(notif.id)}
                title={notif.read ? "Mark as unread" : "Mark as read"}
              >
                <div className="p-1 bg-[var(--theme-card)] border border-[var(--theme-border)]/30 rounded-lg shadow-xs">
                  {getIcon(notif.type)}
                </div>

                <div className="flex-1 min-w-0 pr-4">
                  <div className="flex items-baseline justify-between gap-1.5">
                    <p className={`text-[11px] leading-snug truncate ${!notif.read ? "font-semibold text-[var(--theme-text-dark)]" : "font-normal text-[var(--theme-text-main)]"}`}>
                      {notif.title}
                    </p>
                    <span className="text-[8px] font-mono text-[var(--theme-text-main)] opacity-55 whitespace-nowrap shrink-0">
                      {formatTime(notif.timestamp)}
                    </span>
                  </div>
                  <p className="text-[10px] text-[var(--theme-text-main)] opacity-75 leading-relaxed mt-1">
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
                  className="absolute right-2 top-2 text-[var(--theme-text-main)] hover:text-rose-600 opacity-0 group-hover:opacity-100 transition-opacity p-0.5 cursor-pointer"
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
            className="w-full text-center py-2.5 bg-[var(--theme-accent-light)]/5 hover:bg-[var(--theme-accent-light)]/15 text-[10px] font-semibold text-[var(--theme-accent)] border-t border-[var(--theme-border)]/20 transition-all cursor-pointer relative z-10"
          >
            Mark all as read
          </button>
        )}
      </div>
    </>
  );
}
