import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { ModeFromRoot } from '../../services/scaleDataService';

interface ScaleGridProps {
  modes: ModeFromRoot[];
  onModeSelect?: (mode: ModeFromRoot) => void;
  highlightedModeId?: string;
  compact?: boolean;
  showCharacteristics?: boolean;
  enableFiltering?: boolean;
  interactionMode?: 'select' | 'preview' | 'compare';
  loadingModeId?: string | null;
  disabled?: boolean;
}

export const ScaleGrid: React.FC<ScaleGridProps> = ({
  modes,
  onModeSelect,
  highlightedModeId,
  compact = false,
  showCharacteristics = true,
  enableFiltering = true,
  interactionMode = 'select',
  loadingModeId = null,
  disabled = false
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredModes, setFilteredModes] = useState(modes);

  // Filter modes based on search term
  React.useEffect(() => {
    if (!searchTerm.trim()) {
      setFilteredModes(modes);
      return;
    }

    const filtered = modes.filter(mode =>
      mode.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      mode.commonName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      mode.parentScaleName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      mode.character?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      mode.notes.some(note => note.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    setFilteredModes(filtered);
  }, [searchTerm, modes]);

  const handleModeClick = (mode: ModeFromRoot) => {
    if (disabled || loadingModeId) {
      return; // Don't allow clicks when disabled or loading
    }
    if (onModeSelect) {
      onModeSelect(mode);
    }
  };

  return (
    <div className="scale-grid space-y-4">
      {enableFiltering && (
        <div className="scale-grid__filters">
          <Input
            placeholder="Search scales and modes..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="bg-slate-700 border-slate-600 text-slate-100 placeholder:text-slate-400"
          />
          {searchTerm && (
            <p className="text-sm text-slate-400 mt-2">
              Showing {filteredModes.length} of {modes.length} modes
            </p>
          )}
        </div>
      )}

      <div className={`
        grid gap-4
        ${compact ? 'grid-cols-2 md:grid-cols-3 lg:grid-cols-4' : 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3'}
      `}>
        {filteredModes.map((mode) => {
          const isLoading = loadingModeId === mode.id;
          const isDisabled = disabled || (loadingModeId && !isLoading);

          return (
            <Card
              key={mode.id}
              className={`
                scale-card transition-all duration-200 group relative
                ${isDisabled ? 'cursor-not-allowed opacity-50' : 'cursor-pointer hover:cursor-pointer'}
                ${!isDisabled ? 'hover:bg-accent/50 hover:scale-105 hover:shadow-lg' : ''}
                ${highlightedModeId === mode.id ? 'ring-2 ring-primary bg-primary/10' : ''}
                ${interactionMode === 'compare' ? 'hover:ring-2 hover:ring-secondary' : ''}
                ${!isDisabled ? 'hover:border-cyan-500/50' : ''}
                bg-slate-800 border-slate-600 border-2
                ${!isDisabled ? 'active:scale-95' : ''}
              `}
              onClick={() => handleModeClick(mode)}
            >
              {/* Loading overlay */}
              {isLoading && (
                <div className="absolute inset-0 bg-slate-900/80 flex items-center justify-center z-10 rounded-lg">
                  <div className="flex flex-col items-center space-y-2">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-cyan-500"></div>
                    <p className="text-xs text-cyan-400">Analyzing...</p>
                  </div>
                </div>
              )}

              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg text-slate-100">{mode.name}</CardTitle>
                  {mode.commonName && (
                    <Badge variant="secondary" className="text-xs bg-slate-600 text-slate-200">
                      {mode.commonName}
                    </Badge>
                  )}
                </div>
              </CardHeader>

              <CardContent className="space-y-3">
                <div className="scale-card__formula">
                  <Badge variant="outline" className="text-xs font-mono border-slate-500 text-slate-300">
                    {mode.formula}
                  </Badge>
                </div>

                <div className="scale-card__notes flex flex-wrap gap-1">
                  {mode.notes.map((note, index) => (
                    <Badge
                      key={index}
                      className="text-xs px-2 py-1 bg-cyan-600 text-white hover:bg-cyan-500"
                    >
                      {note}
                    </Badge>
                  ))}
                </div>

                {showCharacteristics && mode.character && (
                  <p className="scale-card__character text-sm text-slate-400 leading-relaxed">
                    {mode.character}
                  </p>
                )}

                <div className="scale-card__parent text-xs text-slate-500">
                  From <span className="text-slate-400">{mode.parentScaleName}</span> in <span className="text-slate-400">{mode.parentScaleRootNote}</span>
                </div>

                {/* Show "Click for deeper analysis" hint when not loading */}
                {!isLoading && !isDisabled && interactionMode === 'select' && (
                  <div className="scale-card__hint opacity-0 group-hover:opacity-100 transition-opacity">
                    <p className="text-xs text-cyan-400 text-center">
                      Click for deeper analysis & song examples
                    </p>
                  </div>
                )}

                {interactionMode === 'preview' && (
                  <div className="scale-card__actions opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button
                      variant="default"
                      size="sm"
                      className="w-full bg-cyan-600 hover:bg-cyan-500 text-white"
                      disabled={isDisabled}
                    >
                      ▶ Preview
                    </Button>
                  </div>
                )}

                {interactionMode === 'compare' && (
                  <div className="scale-card__actions opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full border-slate-500 text-slate-300 hover:bg-slate-700"
                      disabled={isDisabled}
                    >
                      + Compare
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      {filteredModes.length === 0 && searchTerm && (
        <div className="text-center py-8">
          <p className="text-slate-400">No modes found matching "{searchTerm}"</p>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setSearchTerm('')}
            className="mt-2 border-slate-500 text-slate-300 hover:bg-slate-700"
          >
            Clear search
          </Button>
        </div>
      )}

      {modes.length === 0 && (
        <div className="text-center py-8">
          <p className="text-slate-400">No modes to display</p>
        </div>
      )}
    </div>
  );
};

export default ScaleGrid;
