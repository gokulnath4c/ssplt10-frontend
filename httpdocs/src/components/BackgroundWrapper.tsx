import React from 'react';

interface BackgroundWrapperProps {
  children: React.ReactNode;
  className?: string;
}

const BackgroundWrapper: React.FC<BackgroundWrapperProps> = ({
  children,
  className = ""
}) => {
  return (
    <div className={`min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-green-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 ${className}`}>
      {/* Animated background elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        {/* Cricket-themed decorative elements */}
        <div className="absolute top-10 left-10 w-2 h-2 bg-cricket-green rounded-full opacity-20 animate-pulse"></div>
        <div className="absolute top-20 right-20 w-3 h-3 bg-sport-orange rounded-full opacity-15 animate-pulse delay-1000"></div>
        <div className="absolute bottom-20 left-20 w-2 h-2 bg-cricket-blue rounded-full opacity-25 animate-pulse delay-500"></div>
        <div className="absolute bottom-10 right-10 w-4 h-4 bg-green-400 rounded-full opacity-10 animate-pulse delay-1500"></div>

        {/* Subtle gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-transparent via-transparent to-white/5"></div>
      </div>

      {/* Main content */}
      <div className="relative z-10">
        {children}
      </div>
    </div>
  );
};

export default BackgroundWrapper;