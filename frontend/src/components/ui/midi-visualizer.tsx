import React from 'react';
import { cn } from '../../lib/utils';

interface MidiVisualizerProps {
  playedNotes?: string[];
  isActive?: boolean;
  className?: string;
}

interface Note {
  id: string;
  note: string;
  timestamp: number;
  velocity?: number;
}

const MidiVisualizer: React.FC<MidiVisualizerProps> = ({
  playedNotes = [],
  isActive = false,
  className
}) => {
  const [activeNotes, setActiveNotes] = React.useState<Note[]>([]);
  const [ripples, setRipples] = React.useState<{ id: string; x: number; y: number }[]>([]);

  // Update active notes when playedNotes changes
  React.useEffect(() => {
    if (playedNotes.length > 0) {
      const newNotes = playedNotes.map(note => ({
        id: `${note}-${Date.now()}-${Math.random()}`,
        note,
        timestamp: Date.now(),
        velocity: Math.random() * 0.5 + 0.5 // Random velocity between 0.5-1
      }));

      setActiveNotes(prev => [...prev, ...newNotes]);

      // Create ripple effects
      const newRipples = newNotes.map(note => ({
        id: note.id,
        x: Math.random() * 100,
        y: Math.random() * 100
      }));
      setRipples(prev => [...prev, ...newRipples]);

      // Clean up old notes after animation
      setTimeout(() => {
        setActiveNotes(prev => prev.filter(n => !newNotes.some(nn => nn.id === n.id)));
        setRipples(prev => prev.filter(r => !newRipples.some(nr => nr.id === r.id)));
      }, 1500);
    }
  }, [playedNotes]);

  if (!isActive && activeNotes.length === 0) {
    return (
      <div className={cn(
        "flex items-center justify-center h-24 bg-muted/30 rounded-lg border-2 border-dashed border-muted-foreground/20",
        className
      )}>
        <div className="text-center space-y-2">
          <div className="text-2xl opacity-50">🎹</div>
          <p className="text-xs text-muted-foreground">Play your MIDI keyboard</p>
        </div>
      </div>
    );
  }

  return (
    <div className={cn(
      "relative h-24 bg-gradient-to-r from-primary/5 to-accent/5 rounded-lg border border-primary/20 overflow-hidden",
      isActive && "animate-pulse-gentle",
      className
    )}>
      {/* Status indicator */}
      <div className="absolute top-2 right-2 z-10">
        <div className={cn(
          "w-3 h-3 rounded-full border-2 border-white/50",
          isActive ? "bg-green-400 animate-pulse" : "bg-muted-foreground/50"
        )} />
      </div>

      {/* Active notes display */}
      <div className="absolute inset-0 flex items-center justify-center space-x-2 z-10">
        {activeNotes.slice(-5).map((note, index) => (
          <div
            key={note.id}
            className="animate-note-pop bg-primary text-primary-foreground px-3 py-1 rounded-full text-sm font-mono font-semibold shadow-lg"
            style={{
              animationDelay: `${index * 0.1}s`,
              opacity: note.velocity || 1
            }}
          >
            {note.note}
          </div>
        ))}
      </div>

      {/* Ripple effects */}
      {ripples.map(ripple => (
        <div
          key={ripple.id}
          className="absolute animate-ripple pointer-events-none"
          style={{
            left: `${ripple.x}%`,
            top: `${ripple.y}%`,
            transform: 'translate(-50%, -50%)'
          }}
        >
          <div className="w-8 h-8 border-2 border-primary/30 rounded-full" />
        </div>
      ))}

      {/* Background waves */}
      <div className="absolute inset-0 opacity-20">
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-primary/10 to-transparent animate-wave-1" />
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-accent/10 to-transparent animate-wave-2" />
      </div>

      {/* Musical notes floating */}
      {isActive && (
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-1/4 left-1/4 text-primary/20 animate-float-1">♪</div>
          <div className="absolute top-1/2 right-1/3 text-accent/20 animate-float-2">♫</div>
          <div className="absolute bottom-1/3 left-1/2 text-primary/20 animate-float-3">♬</div>
        </div>
      )}
    </div>
  );
};

export default MidiVisualizer;
