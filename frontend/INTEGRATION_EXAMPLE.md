# Universal Input Settings Integration Example

This document shows how to integrate the new Universal Input Settings system with existing components.

## Key Changes Made

### 1. New Components Created

- **`InputSettingsPanel.tsx`** - Replaces `MidiSettingsPanel` with universal input method management
- **`InputMethodContext.tsx`** - Global state management for input preferences
- **`QuestionDrivenMusicToolWithInputContext.tsx`** - Wrapper with context integration

### 2. Updated Components

- **`UnifiedMusicInput.tsx`** - Now supports global input method preference

## How to Update Existing Components

### Before (Individual Input Method Selection):

```tsx
// In AnalysisHub.tsx - BEFORE
<UnifiedMusicInput
  value={inputs[activeAnalysisType]}
  onChange={(value) => handleInputChange(activeAnalysisType, value)}
  inputType={activeAnalysisType as InputType}
  midiData={midiData}
  // Each component manages its own input method
/>
```

### After (Global Input Method):

```tsx
// In AnalysisHub.tsx - AFTER
<UnifiedMusicInput
  value={inputs[activeAnalysisType]}
  onChange={(value) => handleInputChange(activeAnalysisType, value)}
  inputType={activeAnalysisType as InputType}
  componentId="analysis-hub" // Unique identifier for this component
  midiData={midiData}
  useGlobalInputMethod={true} // Use global preference
/>
```

### Key Changes:

1. **Add `componentId`** - Unique identifier for component-specific preferences
2. **Set `useGlobalInputMethod={true}`** - Uses global input method context
3. **Remove local input method state** - Context handles this now

## Integration Steps

### Step 1: Wrap App with Context

```tsx
// In App.tsx or main entry point
import { InputMethodProvider } from './contexts/InputMethodContext';

function App() {
  return (
    <InputMethodProvider>
      <QuestionDrivenMusicTool showDebugInfo={false} />
    </InputMethodProvider>
  );
}
```

### Step 2: Replace MIDI Settings Panel

```tsx
// Replace this:
<MidiSettingsPanel 
  status={midiStatus}
  devices={midiDevices}
  // ... other props
/>

// With this:
<InputSettingsPanel 
  activeInputMethod={activeInputMethod}
  onInputMethodChange={setInputMethod}
  midiStatus={midiStatus}
  midiDevices={midiDevices}
  // ... other props
  showDetailedConfig={true}
/>
```

### Step 3: Update Components Using UnifiedMusicInput

```tsx
// Add these props to UnifiedMusicInput components:
<UnifiedMusicInput
  // ... existing props
  componentId="unique-component-id"
  useGlobalInputMethod={true}
/>
```

## Component-Specific Preferences

The system supports different input method preferences for different components:

```tsx
// Analysis Hub might prefer MIDI
<UnifiedMusicInput componentId="analysis-hub" useGlobalInputMethod={true} />

// Reference Tab might prefer mouse clicking
<UnifiedMusicInput componentId="reference-tab" useGlobalInputMethod={true} />

// Both respect global setting but can have component-specific overrides
```

## Benefits of This Approach

### 1. **Single Control Point**
- Users set their preference once in the header
- Applies across the entire app automatically

### 2. **Persistent Preferences**
- Preferences saved to localStorage
- Restored on app reload

### 3. **Smart MIDI Handling**
- Auto-fallback to keyboard when MIDI disconnects
- Auto-switch to MIDI when reconnected (if preferred)

### 4. **Component Flexibility**
- Components can still use local input method if needed
- Global preference with component-specific overrides

### 5. **Status Visibility**
- Current input method always visible in header
- Status indicators show connection state
- Quick access to detailed configuration

## Migration Strategy

### Phase 1: Basic Integration (Completed)
- ✅ Created core context and components
- ✅ Updated UnifiedMusicInput to support global method
- ✅ Replaced MidiSettingsPanel with InputSettingsPanel

### Phase 2: Component Updates (Next Steps)
- Update AnalysisHub to use `componentId="analysis-hub"`
- Update ReferenceTab to use `componentId="reference-tab"`
- Update ModeIdentificationTab to use global input method

### Phase 3: Advanced Features (Future)
- Smart method suggestions based on component context
- Usage analytics and preference learning
- Keyboard shortcuts for method switching

## Testing Checklist

- [ ] Input method preference persists across page reloads
- [ ] MIDI auto-fallback works when device disconnects
- [ ] Global method applies to all UnifiedMusicInput components
- [ ] Component-specific preferences override global when needed
- [ ] Mobile interface works correctly
- [ ] Accessibility (keyboard navigation, screen readers)

## File Structure

```
src/
├── components/
│   ├── InputSettingsPanel.tsx          # New universal input panel
│   ├── ui/unified-music-input.tsx       # Updated with global method support
│   └── QuestionDrivenMusicToolWithInputContext.tsx # Context wrapper
├── contexts/
│   └── InputMethodContext.tsx           # Global state management
└── styles/
    └── input-settings.css               # Styling for new components
```

This integration provides a seamless, user-friendly way to manage input methods globally while maintaining the flexibility for component-specific preferences.