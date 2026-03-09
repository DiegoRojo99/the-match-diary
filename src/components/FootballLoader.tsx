import React from 'react';

interface FootballLoaderProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  text?: string;
  className?: string;
}

const sizeClasses = {
  sm: 'w-8 h-8',
  md: 'w-12 h-12',
  lg: 'w-16 h-16',
  xl: 'w-20 h-20',
};

export default function FootballLoader({ 
  size = 'md', 
  text = 'Loading...', 
  className = '' 
}: FootballLoaderProps) {
  return (
    <div className={`flex flex-col items-center justify-center space-y-3 ${className}`}>
      <div className="relative">
        <img
          src="/football.png"
          alt="Loading..."
          className={`${sizeClasses[size]} animate-spin opacity-80`}
          style={{
            animationDuration: '1s',
            filter: 'brightness(1.1)',
          }}
        />
        {/* Optional glow effect */}
        <div 
          className={`absolute inset-0 ${sizeClasses[size]} bg-green-400 rounded-full opacity-20 animate-pulse`}
          style={{ animationDuration: '1.5s' }}
        />
      </div>
      {text && (
        <span className="text-gray-600 font-medium text-sm animate-pulse">
          {text}
        </span>
      )}
    </div>
  );
}