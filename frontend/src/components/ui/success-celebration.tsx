import React from 'react';
import { cn } from '../../lib/utils';

interface SuccessCelebrationProps {
  trigger?: boolean;
  message?: string;
  variant?: 'mode-found' | 'analysis-complete' | 'discovery-success' | 'harmony-analyzed';
  className?: string;
}

const celebrationMessages = {
  'mode-found': [
    "🎉 Mode identified!",
    "✨ Musical mystery solved!",
    "🎵 Mode discovered!",
    "🎼 Analysis complete!"
  ],
  'analysis-complete': [
    "🎊 Analysis finished!",
    "✅ Results ready!",
    "🎯 Analysis successful!",
    "🌟 Done!"
  ],
  'discovery-success': [
    "🔍 Discovery complete!",
    "🗺️ Musical exploration finished!",
    "🎪 New modes discovered!",
    "🎭 Exploration successful!"
  ],
  'harmony-analyzed': [
    "🎵 Harmony mapped!",
    "🎼 Chords analyzed!",
    "🎹 Progression understood!",
    "🎨 Harmony complete!"
  ]
};

const SuccessCelebration: React.FC<SuccessCelebrationProps> = ({
  trigger = false,
  message,
  variant = 'analysis-complete',
  className
}) => {
  const [isVisible, setIsVisible] = React.useState(false);
  const [currentMessage, setCurrentMessage] = React.useState(
    message || celebrationMessages[variant][0]
  );

  React.useEffect(() => {
    if (trigger) {
      // Random message if no custom message provided
      if (!message) {
        const messages = celebrationMessages[variant];
        const randomMessage = messages[Math.floor(Math.random() * messages.length)];
        setCurrentMessage(randomMessage);
      }
      
      setIsVisible(true);
      
      // Auto-hide after animation
      const timer = setTimeout(() => {
        setIsVisible(false);
      }, 3000);
      
      return () => clearTimeout(timer);
    }
  }, [trigger, message, variant]);

  if (!isVisible) return null;

  return (
    <div className={cn(
      "fixed top-4 right-4 z-50 animate-celebration-enter",
      className
    )}>
      <div className="bg-primary text-primary-foreground px-6 py-3 rounded-lg shadow-lg border-2 border-primary/20">
        <div className="flex items-center space-x-2">
          <span className="animate-bounce text-lg">{currentMessage}</span>
        </div>
        
        {/* Confetti effect */}
        <div className="absolute -inset-1 overflow-hidden rounded-lg pointer-events-none">
          {[...Array(8)].map((_, i) => (
            <div
              key={i}
              className={cn(
                "absolute w-2 h-2 rounded-full animate-confetti",
                i % 4 === 0 && "bg-yellow-400",
                i % 4 === 1 && "bg-pink-400", 
                i % 4 === 2 && "bg-blue-400",
                i % 4 === 3 && "bg-green-400"
              )}
              style={{
                left: `${10 + i * 10}%`,
                animationDelay: `${i * 0.1}s`,
                animationDuration: `${1.5 + i * 0.2}s`
              }}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default SuccessCelebration;