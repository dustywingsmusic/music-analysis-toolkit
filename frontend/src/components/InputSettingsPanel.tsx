/**
 * InputSettingsPanel - Universal Input Settings System
 * 
 * Replaces MidiSettingsPanel with comprehensive input method management.
 * Provides global input method selection (keyboard/mouse/midi) and MIDI device configuration.
 * 
 * Features:
 * - Global input method preference with persistence
 * - Quick method switching via dropdown
 * - Comprehensive MIDI device configuration
 * - Status indicators and connection management
 * - Mobile-responsive design
 */

import React, { useState, useCallback } from 'react';
import { cn } from '../lib/utils';
import '../styles/input-settings.css';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Separator } from './ui/separator';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from './ui/dropdown-menu';
import { ChevronDownIcon, Settings2Icon, KeyboardIcon, MouseIcon, PianoIcon } from 'lucide-react';
import type { MidiDevice } from '../types';
import { trackInteraction } from '../utils/tracking';
import { logger } from '../utils/logger';
import { useInputMethod } from '../contexts/InputMethodContext';

export type { InputMethod } from '../contexts/InputMethodContext';

interface InputSettingsPanelProps {
  
  // MIDI configuration (when method is 'midi')
  midiStatus?: string;
  midiDevices?: MidiDevice[];
  selectedMidiDevice?: string | null;
  setSelectedMidiDevice?: (deviceId: string) => void;
  midiError?: string | null;
  midiEnabled?: boolean;
  enableMidi?: () => void;
  disableMidi?: () => void;
  
  // Display configuration
  className?: string;
  showDetailedConfig?: boolean;
}

const InputSettingsPanel: React.FC<InputSettingsPanelProps> = ({
  midiStatus = 'Initializing...',
  midiDevices = [],
  selectedMidiDevice = null,
  setSelectedMidiDevice = () => {},
  midiError = null,
  midiEnabled = true,
  enableMidi = () => {},
  disableMidi = () => {},
  className = '',
  showDetailedConfig = false
}) => {
  // Use global input method context
  const { activeInputMethod, setInputMethod, midiAvailable, midiConnected, updateMidiAvailability } = useInputMethod();
  
  const [isExpanded, setIsExpanded] = useState(false);
  const [showQuickSwitcher, setShowQuickSwitcher] = useState(false);

  // Input method configurations
  const inputMethods = [
    {
      id: 'keyboard' as const,
      label: 'Keyboard',
      icon: KeyboardIcon,
      shortIcon: '⌨️',
      description: 'Type notes and chords directly',
      status: 'Always available'
    },
    {
      id: 'mouse' as const,
      label: 'Mouse',
      icon: MouseIcon,
      shortIcon: '🖱️',
      description: 'Click to select notes and chords',
      status: 'Always available'
    },
    {
      id: 'midi' as const,
      label: 'MIDI',
      icon: PianoIcon,
      shortIcon: '🎹',
      description: 'Play your MIDI keyboard',
      status: midiError ? 'Error' : midiEnabled ? (midiStatus.includes('Listening') ? 'Active' : 'Connected') : 'Disabled'
    }
  ];

  const currentMethod = inputMethods.find(method => method.id === activeInputMethod);
  const isMidiMethod = activeInputMethod === 'midi';
  const midiMethodConfig = inputMethods.find(m => m.id === 'midi');

  // Status indicator logic
  const getStatusColor = (method: typeof inputMethods[0]) => {
    if (method.id !== 'midi') return 'bg-green-400';
    if (midiError) return 'bg-red-400';
    if (!midiEnabled) return 'bg-gray-400';
    if (midiStatus.includes('Listening')) return 'bg-green-400 animate-pulse';
    return 'bg-yellow-400';
  };

  const getStatusText = () => {
    if (activeInputMethod !== 'midi') return currentMethod?.status || 'Ready';
    if (midiError) return 'MIDI Error';
    if (!midiEnabled) return 'MIDI Disabled';
    return midiStatus;
  };

  const handleMethodChange = useCallback((method: InputMethod) => {
    logger.webClick('Input method changed', {
      component: 'InputSettingsPanel',
      action: 'method_change',
      previousMethod: activeInputMethod,
      newMethod: method
    });

    setInputMethod(method, 'header-control');
    setShowQuickSwitcher(false);
    
    trackInteraction(`Input Settings - ${method}`, 'Input Method');
  }, [activeInputMethod, setInputMethod]);

  const toggleExpanded = useCallback(() => {
    const newState = !isExpanded;
    setIsExpanded(newState);
    
    trackInteraction(`Input Settings Panel - ${newState ? 'Open' : 'Close'}`, 'Navigation');
    logger.webClick('Input settings panel toggled', {
      component: 'InputSettingsPanel',
      action: 'panel_toggle',
      expanded: newState,
      currentMethod: activeInputMethod
    });
  }, [isExpanded, activeInputMethod]);

  const handleMidiToggle = useCallback(() => {
    if (midiEnabled) {
      disableMidi();
      // If MIDI was active, switch to keyboard
      if (activeInputMethod === 'midi') {
        handleMethodChange('keyboard');
      }
    } else {
      enableMidi();
    }
  }, [midiEnabled, enableMidi, disableMidi, activeInputMethod, handleMethodChange]);
  
  // Update MIDI availability in context when MIDI status changes
  React.useEffect(() => {
    const available = midiEnabled && !midiError;
    const connected = available && midiStatus.includes('Listening');
    updateMidiAvailability(available, connected);
  }, [midiEnabled, midiError, midiStatus, updateMidiAvailability]);

  return (
    <div className={cn("input-settings-panel", className)}>
      {/* Main Control Button */}
      <div className="flex items-center gap-2">
        {/* Quick Method Switcher Dropdown */}
        <DropdownMenu open={showQuickSwitcher} onOpenChange={setShowQuickSwitcher}>
          <DropdownMenuTrigger asChild>
            <Button
              variant="outline"
              size="sm"
              className="flex items-center gap-2 px-3 py-2 h-9"
              title={`Current input: ${currentMethod?.label} - ${getStatusText()}`}
            >
              <span className="text-base">{currentMethod?.shortIcon}</span>
              <span className="hidden sm:inline text-sm font-medium">
                {currentMethod?.label}
              </span>
              <div className={cn(
                "w-2 h-2 rounded-full",
                getStatusColor(currentMethod!)
              )} />
              <ChevronDownIcon className="w-3 h-3 text-muted-foreground" />
            </Button>
          </DropdownMenuTrigger>
          
          <DropdownMenuContent align="end" className="w-56">
            <div className="px-2 py-1.5 text-xs font-medium text-muted-foreground">
              Input Method
            </div>
            <DropdownMenuSeparator />
            
            {inputMethods.map((method) => {
              const Icon = method.icon;
              const isActive = method.id === activeInputMethod;
              const isDisabled = method.id === 'midi' && midiError;
              
              return (
                <DropdownMenuItem
                  key={method.id}
                  onClick={() => !isDisabled && handleMethodChange(method.id)}
                  disabled={isDisabled}
                  className={cn(
                    "flex items-center gap-3 px-3 py-2 cursor-pointer",
                    isActive && "bg-primary/10 text-primary",
                    isDisabled && "opacity-50 cursor-not-allowed"
                  )}
                >
                  <Icon className="w-4 h-4" />
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{method.label}</span>
                      {isActive && (
                        <Badge variant="secondary" className="text-xs px-1 py-0">
                          Active
                        </Badge>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground">{method.description}</p>
                  </div>
                  <div className="flex items-center gap-1">
                    <div className={cn(
                      "w-2 h-2 rounded-full",
                      getStatusColor(method)
                    )} />
                    <span className="text-xs text-muted-foreground">
                      {method.status}
                    </span>
                  </div>
                </DropdownMenuItem>
              );
            })}
            
            {/* MIDI Settings Link */}
            {(isMidiMethod || midiDevices.length > 0) && (
              <>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={toggleExpanded}
                  className="flex items-center gap-3 px-3 py-2 cursor-pointer"
                >
                  <Settings2Icon className="w-4 h-4" />
                  <span>MIDI Configuration</span>
                </DropdownMenuItem>
              </>
            )}
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Detailed Configuration Toggle */}
        {showDetailedConfig && (
          <Button
            variant="ghost"
            size="sm"
            onClick={toggleExpanded}
            className="px-2 py-2 h-9"
            title="Open detailed input settings"
          >
            <Settings2Icon className="w-4 h-4" />
          </Button>
        )}
      </div>

      {/* Expanded Configuration Panel */}
      {isExpanded && (
        <div className="input-settings-expanded-panel">
          <div className="input-settings-card">
            {/* Current Method Display */}
            <div className="mb-4">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-lg">{currentMethod?.shortIcon}</span>
                <h3 className="text-sm font-semibold">
                  Active Input Method: {currentMethod?.label}
                </h3>
                <div className={cn(
                  "w-2 h-2 rounded-full",
                  getStatusColor(currentMethod!)
                )} />
              </div>
              <p className="text-xs text-muted-foreground">
                {currentMethod?.description}
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                Status: <span className={cn(
                  midiError && isMidiMethod ? 'text-red-400' : 'text-green-400'
                )}>
                  {getStatusText()}
                </span>
              </p>
              {midiError && isMidiMethod && (
                <p className="text-red-400 text-xs mt-1">Error: {midiError}</p>
              )}
            </div>

            <Separator className="mb-4" />

            {/* MIDI-specific Configuration */}
            {isMidiMethod && (
              <div className="space-y-4">
                {/* MIDI Enable/Disable Toggle */}
                <div className="flex items-center justify-between">
                  <div>
                    <label htmlFor="midi-enabled" className="text-sm font-medium">
                      MIDI Input
                    </label>
                    <p className="text-xs text-muted-foreground">
                      Enable MIDI keyboard input
                    </p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      id="midi-enabled"
                      type="checkbox"
                      checked={midiEnabled}
                      onChange={handleMidiToggle}
                      className="sr-only"
                    />
                    <div className={cn(
                      "w-11 h-6 rounded-full transition-colors",
                      midiEnabled ? 'bg-primary' : 'bg-muted'
                    )}>
                      <div className={cn(
                        "w-5 h-5 bg-background rounded-full shadow-md transform transition-transform mt-0.5 ml-0.5",
                        midiEnabled ? 'translate-x-5' : 'translate-x-0'
                      )} />
                    </div>
                  </label>
                </div>

                {/* MIDI Device Selection */}
                {midiEnabled && midiDevices.length > 0 && (
                  <div>
                    <label htmlFor="midi-device-select" className="block text-sm font-medium mb-2">
                      MIDI Input Device
                    </label>
                    <select
                      id="midi-device-select"
                      value={selectedMidiDevice || ''}
                      onChange={(e) => setSelectedMidiDevice(e.target.value)}
                      className="w-full px-3 py-2 text-sm bg-background border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                    >
                      <option value="" disabled>Select a MIDI device</option>
                      {midiDevices.map(device => (
                        <option key={device.id} value={device.id}>
                          {device.name}
                        </option>
                      ))}
                    </select>
                    {selectedMidiDevice && (
                      <p className="text-xs text-muted-foreground mt-1">
                        Connected to: {midiDevices.find(d => d.id === selectedMidiDevice)?.name}
                      </p>
                    )}
                  </div>
                )}

                {/* MIDI Status Information */}
                {midiEnabled && (
                  <div className="p-3 bg-muted/30 rounded-md">
                    <h4 className="text-sm font-medium mb-2">Connection Status</h4>
                    <div className="space-y-1 text-xs">
                      <div className="flex justify-between">
                        <span>Status:</span>
                        <span className={cn(
                          "font-medium",
                          midiError ? 'text-red-600' : 'text-green-600'
                        )}>
                          {midiStatus}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span>Devices:</span>
                        <span>{midiDevices.length} available</span>
                      </div>
                      {selectedMidiDevice && (
                        <div className="flex justify-between">
                          <span>Active Device:</span>
                          <span className="font-medium">
                            {midiDevices.find(d => d.id === selectedMidiDevice)?.name || 'Unknown'}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* MIDI Help */}
                {midiEnabled && midiDevices.length === 0 && (
                  <div className="p-3 bg-primary/5 border border-primary/20 rounded-md">
                    <h4 className="text-sm font-medium text-primary mb-1">
                      No MIDI Devices Found
                    </h4>
                    <p className="text-xs text-muted-foreground">
                      Connect a MIDI keyboard and refresh the page, or check your browser's MIDI permissions.
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* Non-MIDI Method Info */}
            {!isMidiMethod && (
              <div className="p-3 bg-muted/30 rounded-md">
                <h4 className="text-sm font-medium mb-1">
                  {currentMethod?.label} Input Active
                </h4>
                <p className="text-xs text-muted-foreground">
                  {currentMethod?.description}. This method is always available and ready to use.
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default InputSettingsPanel;