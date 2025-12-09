import { useTheme } from '../contexts/ThemeContext';

interface AnimatedTaglineProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

export function AnimatedTagline({ className = '', size = 'md' }: AnimatedTaglineProps) {
  const { isDarkMode } = useTheme();
  
  const sizeClasses = {
    sm: 'text-xs md:text-sm',
    md: 'text-sm md:text-base',
    lg: 'text-xl md:text-2xl lg:text-3xl xl:text-4xl',
  };

  const subSizeClasses = {
    sm: 'text-xs',
    md: 'text-xs md:text-sm',
    lg: 'text-sm md:text-base lg:text-lg',
  };

  const text = "Where Your Finances Finally Make Sense!!";
  const subText = "Small Tracking Today, Big Savings Tomorrow.";

  return (
    <div className={`flex flex-col ${className}`}>
      <div className="typewriter-container">
        <span className={`gradient-text typewriter-text ${sizeClasses[size]}`}>
          {text}
        </span>
        <span className={`typewriter-cursor ${sizeClasses[size]}`}>|</span>
      </div>
      <div className={`sub-tagline text-right ${subSizeClasses[size]} ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
        {subText}
      </div>
    </div>
  );
}

