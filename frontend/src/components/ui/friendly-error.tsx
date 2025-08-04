import React from 'react';
import { cn } from '../../lib/utils';
import DelightfulButton from './delightful-button';

interface FriendlyErrorProps {
  title?: string;
  message?: string;
  suggestions?: string[];
  onRetry?: () => void;
  onClear?: () => void;
  className?: string;
}

const encouragingMessages = [
  "Even Mozart made mistakes! Let's try again.",
  "That's not quite right, but you're on the right track!",
  "Close! Music theory can be tricky sometimes.",
  "No worries - let's fine-tune this together.",
  "Looks like we hit a sour note. Let's make it harmonious!",
  "Every great musician learns from trial and error."
];

const helpfulTips = [
  "Double-check your note names (C, D, E, F, G, A, B)",
  "Use # for sharps and b for flats (like C# or Bb)",
  "For chord progressions, try standard notation (Am, F, C7)",
  "Make sure notes are separated by spaces",
  "MIDI input should work automatically when you play"
];

const FriendlyError: React.FC<FriendlyErrorProps> = ({
  title,
  message,
  suggestions,
  onRetry,
  onClear,
  className
}) => {
  const [currentMessage] = React.useState(() => 
    encouragingMessages[Math.floor(Math.random() * encouragingMessages.length)]
  );
  
  const [currentTip] = React.useState(() =>
    helpfulTips[Math.floor(Math.random() * helpfulTips.length)]
  );

  return (
    <div className={cn(
      "bg-destructive/5 border border-destructive/20 rounded-lg p-6 space-y-4 animate-shake-once",
      className
    )}>
      {/* Header with friendly emoji */}
      <div className="flex items-center space-x-3">
        <span className="text-2xl animate-bounce-gentle">🎼</span>
        <div>
          <h3 className="text-lg font-semibold text-foreground">
            {title || "Oops! Something went off-key"}
          </h3>
          <p className="text-sm text-muted-foreground mt-1">
            {message || currentMessage}
          </p>
        </div>
      </div>
      
      {/* Helpful suggestion */}
      <div className="bg-muted/50 rounded-md p-3">
        <div className="flex items-start space-x-2">
          <span className="text-primary text-sm">💡</span>
          <p className="text-sm text-muted-foreground">
            <strong>Tip:</strong> {currentTip}
          </p>
        </div>
      </div>
      
      {/* Custom suggestions */}
      {suggestions && suggestions.length > 0 && (
        <div className="space-y-2">
          <p className="text-sm font-medium text-foreground">Try this:</p>
          <ul className="space-y-1">
            {suggestions.map((suggestion, index) => (
              <li key={index} className="flex items-start space-x-2 text-sm text-muted-foreground">
                <span className="text-primary">•</span>
                <span>{suggestion}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
      
      {/* Actions */}
      <div className="flex items-center space-x-3 pt-2">
        {onRetry && (
          <DelightfulButton
            onClick={onRetry}
            size="sm"
            musical
            className="flex-1"
          >
            Try Again
          </DelightfulButton>
        )}
        {onClear && (
          <DelightfulButton
            onClick={onClear}
            variant="outline"
            size="sm"
            className="flex-1"
          >
            Start Over
          </DelightfulButton>
        )}
      </div>
      
      {/* Encouragement footer */}
      <div className="text-center pt-2 border-t border-border">
        <p className="text-xs text-muted-foreground italic">
          Remember: Every wrong note is just one step closer to the right one! 🎵
        </p>
      </div>
    </div>
  );
};

export default FriendlyError;