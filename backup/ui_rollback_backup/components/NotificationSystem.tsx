import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { X, CheckCircle, AlertCircle, Info, AlertTriangle } from "lucide-react";

interface Notification {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message?: string;
  duration?: number;
  action?: {
    label: string;
    onClick: () => void;
  };
}

interface NotificationSystemProps {
  position?: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left' | 'top-center';
  maxNotifications?: number;
}

const NotificationSystem = ({
  position = 'top-right',
  maxNotifications = 5
}: NotificationSystemProps) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);

  // Auto-remove notifications after duration
  useEffect(() => {
    notifications.forEach((notification) => {
      if (notification.duration !== 0) {
        const timer = setTimeout(() => {
          removeNotification(notification.id);
        }, notification.duration || 5000);

        return () => clearTimeout(timer);
      }
    });
  }, [notifications]);

  const addNotification = (notification: Omit<Notification, 'id'>) => {
    const id = Date.now().toString();
    const newNotification: Notification = {
      ...notification,
      id,
      duration: notification.duration ?? 5000
    };

    setNotifications(prev => {
      const updated = [newNotification, ...prev];
      return updated.slice(0, maxNotifications);
    });

    return id;
  };

  const removeNotification = (id: string) => {
    setNotifications(prev => prev.filter(notification => notification.id !== id));
  };

  const getIcon = (type: string) => {
    switch (type) {
      case 'success': return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'error': return <AlertCircle className="w-5 h-5 text-red-500" />;
      case 'warning': return <AlertTriangle className="w-5 h-5 text-yellow-500" />;
      case 'info': return <Info className="w-5 h-5 text-blue-500" />;
      default: return <Info className="w-5 h-5 text-blue-500" />;
    }
  };

  const getStyles = (type: string) => {
    switch (type) {
      case 'success':
        return 'bg-green-50 border-green-200 text-green-800 dark:bg-green-900/20 dark:border-green-800 dark:text-green-400';
      case 'error':
        return 'bg-red-50 border-red-200 text-red-800 dark:bg-red-900/20 dark:border-red-800 dark:text-red-400';
      case 'warning':
        return 'bg-yellow-50 border-yellow-200 text-yellow-800 dark:bg-yellow-900/20 dark:border-yellow-800 dark:text-yellow-400';
      case 'info':
        return 'bg-blue-50 border-blue-200 text-blue-800 dark:bg-blue-900/20 dark:border-blue-800 dark:text-blue-400';
      default:
        return 'bg-gray-50 border-gray-200 text-gray-800 dark:bg-gray-900/20 dark:border-gray-800 dark:text-gray-400';
    }
  };

  const getPositionClasses = () => {
    switch (position) {
      case 'top-right': return 'top-4 right-4';
      case 'top-left': return 'top-4 left-4';
      case 'bottom-right': return 'bottom-4 right-4';
      case 'bottom-left': return 'bottom-4 left-4';
      case 'top-center': return 'top-4 left-1/2 transform -translate-x-1/2';
      default: return 'top-4 right-4';
    }
  };

  // Expose addNotification function globally for easy access
  useEffect(() => {
    (window as any).showNotification = addNotification;
    return () => {
      delete (window as any).showNotification;
    };
  }, []);

  if (notifications.length === 0) return null;

  return (
    <div className={`fixed z-50 space-y-2 ${getPositionClasses()}`}>
      {notifications.map((notification) => (
        <div
          key={notification.id}
          className={`max-w-sm w-full p-4 rounded-lg border shadow-lg transform transition-all duration-300 ease-out animate-in slide-in-from-right-2 ${getStyles(notification.type)}`}
        >
          <div className="flex items-start gap-3">
            <div className="flex-shrink-0 mt-0.5">
              {getIcon(notification.type)}
            </div>

            <div className="flex-1 min-w-0">
              <h4 className="text-sm font-semibold leading-tight">
                {notification.title}
              </h4>

              {notification.message && (
                <p className="text-sm opacity-90 mt-1 leading-relaxed">
                  {notification.message}
                </p>
              )}

              {notification.action && (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={notification.action.onClick}
                  className="mt-3 h-7 px-3 text-xs border-current hover:bg-current hover:text-white"
                >
                  {notification.action.label}
                </Button>
              )}
            </div>

            <Button
              size="sm"
              variant="ghost"
              onClick={() => removeNotification(notification.id)}
              className="flex-shrink-0 h-6 w-6 p-0 hover:bg-black/10 dark:hover:bg-white/10"
            >
              <X className="w-3 h-3" />
            </Button>
          </div>

          {/* Progress bar for auto-dismiss */}
          {notification.duration && notification.duration > 0 && (
            <div className="mt-3 h-1 bg-current/20 rounded-full overflow-hidden">
              <div
                className="h-full bg-current animate-progress"
                style={{
                  animationDuration: `${notification.duration}ms`,
                  animationTimingFunction: 'linear'
                }}
              />
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

// Utility functions for easy notification creation
export const showSuccessNotification = (title: string, message?: string, duration?: number) => {
  (window as any).showNotification?.({
    type: 'success',
    title,
    message,
    duration
  });
};

export const showErrorNotification = (title: string, message?: string, duration?: number) => {
  (window as any).showNotification?.({
    type: 'error',
    title,
    message,
    duration
  });
};

export const showWarningNotification = (title: string, message?: string, duration?: number) => {
  (window as any).showNotification?.({
    type: 'warning',
    title,
    message,
    duration
  });
};

export const showInfoNotification = (title: string, message?: string, duration?: number) => {
  (window as any).showNotification?.({
    type: 'info',
    title,
    message,
    duration
  });
};

export default NotificationSystem;