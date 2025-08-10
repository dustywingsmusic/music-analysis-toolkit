import React from 'react';
import { Button, ButtonProps } from './button';
import { cn } from '../../lib/utils';

interface DelightfulButtonProps extends ButtonProps {
  musical?: boolean;
  hapticFeedback?: boolean;
  sparkle?: boolean;
  children: React.ReactNode;
}

const DelightfulButton: React.FC<DelightfulButtonProps> = ({
  musical = false,
  hapticFeedback = false,
  sparkle = false,
  className,
  children,
  onClick,
  ...props
}) => {
  const [isPressed, setIsPressed] = React.useState(false);
  const [showSparkle, setShowSparkle] = React.useState(false);

  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    setIsPressed(true);

    if (sparkle) {
      setShowSparkle(true);
      setTimeout(() => setShowSparkle(false), 600);
    }

    // Haptic feedback for mobile devices
    if (hapticFeedback && 'vibrate' in navigator) {
      navigator.vibrate(50);
    }

    // Reset pressed state
    setTimeout(() => setIsPressed(false), 150);

    onClick?.(e);
  };

  return (
    <Button
      {...props}
      className={cn(
        // Base delightful styling
        "relative overflow-hidden transition-all duration-200 ease-out",
        "hover:shadow-lg hover:shadow-primary/25",
        "active:scale-95",

        // Musical styling
        musical && "hover:rotate-1 active:rotate-0",

        // Pressed state
        isPressed && "scale-95 shadow-inner",

        // Sparkle effect container
        sparkle && "hover:bg-gradient-to-r hover:from-primary hover:to-primary/80",

        className
      )}
      onClick={handleClick}
    >
      {/* Ripple effect */}
      <div className="absolute inset-0 overflow-hidden rounded-md">
        <div className={cn(
          "absolute inset-0 opacity-0 bg-white/20 rounded-full scale-0 transition-all duration-300",
          isPressed && "opacity-100 scale-150"
        )} />
      </div>

      {/* Sparkle particles */}
      {sparkle && showSparkle && (
        <div className="absolute inset-0 pointer-events-none">
          {[...Array(6)].map((_, i) => (
            <div
              key={i}
              className="absolute animate-sparkle"
              style={{
                left: `${20 + i * 12}%`,
                top: `${30 + (i % 2) * 40}%`,
                animationDelay: `${i * 0.1}s`
              }}
            >
              ✨
            </div>
          ))}
        </div>
      )}

      {/* Button content */}
      <span className="relative z-10 flex items-center justify-center gap-2">
        {musical && <span className="animate-pulse">🎵</span>}
        {children}
      </span>
    </Button>
  );
};

export default DelightfulButton;
