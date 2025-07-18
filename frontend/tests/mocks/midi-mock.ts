import { vi } from 'vitest';

/**
 * WebMIDI API mock implementation for testing
 * Provides realistic MIDI input simulation for the Music Modes App
 */

// MIDI message types
export const MIDI_MESSAGE_TYPES = {
  NOTE_ON: 0x90,
  NOTE_OFF: 0x80,
  CONTROL_CHANGE: 0xb0,
  PROGRAM_CHANGE: 0xc0,
  PITCH_BEND: 0xe0,
} as const;

// Mock MIDI input device
export class MockMIDIInput {
  public id: string;
  public manufacturer: string;
  public name: string;
  public type: 'input' = 'input';
  public version: string;
  public state: 'connected' | 'disconnected';
  public connection: 'open' | 'closed' | 'pending';
  public onmidimessage: ((event: any) => void) | null = null;
  public onstatechange: ((event: any) => void) | null = null;

  private eventListeners: Map<string, ((event: any) => void)[]> = new Map();

  constructor(id: string = 'mock-input-1', name: string = 'Mock MIDI Input') {
    this.id = id;
    this.manufacturer = 'Mock Manufacturer';
    this.name = name;
    this.version = '1.0.0';
    this.state = 'connected';
    this.connection = 'open';
  }

  addEventListener(type: string, listener: (event: any) => void): void {
    if (!this.eventListeners.has(type)) {
      this.eventListeners.set(type, []);
    }
    this.eventListeners.get(type)!.push(listener);
  }

  removeEventListener(type: string, listener: (event: any) => void): void {
    const listeners = this.eventListeners.get(type);
    if (listeners) {
      const index = listeners.indexOf(listener);
      if (index > -1) {
        listeners.splice(index, 1);
      }
    }
  }

  dispatchEvent(event: any): boolean {
    const listeners = this.eventListeners.get(event.type) || [];
    listeners.forEach(listener => listener(event));
    
    if (event.type === 'midimessage' && this.onmidimessage) {
      this.onmidimessage(event);
    }
    
    return true;
  }

  // Simulate MIDI note on message
  simulateNoteOn(note: number, velocity: number = 127, channel: number = 0): void {
    const data = new Uint8Array([
      MIDI_MESSAGE_TYPES.NOTE_ON | channel,
      note,
      velocity
    ]);
    
    const event = {
      type: 'midimessage',
      data,
      timeStamp: performance.now(),
      target: this,
    };
    
    this.dispatchEvent(event);
  }

  // Simulate MIDI note off message
  simulateNoteOff(note: number, velocity: number = 0, channel: number = 0): void {
    const data = new Uint8Array([
      MIDI_MESSAGE_TYPES.NOTE_OFF | channel,
      note,
      velocity
    ]);
    
    const event = {
      type: 'midimessage',
      data,
      timeStamp: performance.now(),
      target: this,
    };
    
    this.dispatchEvent(event);
  }

  // Simulate chord input (multiple notes at once)
  simulateChord(notes: number[], velocity: number = 127, channel: number = 0): void {
    notes.forEach(note => {
      this.simulateNoteOn(note, velocity, channel);
    });
  }

  // Simulate scale input (notes in sequence)
  simulateScale(notes: number[], velocity: number = 127, channel: number = 0, delay: number = 100): void {
    notes.forEach((note, index) => {
      setTimeout(() => {
        this.simulateNoteOn(note, velocity, channel);
      }, index * delay);
    });
  }

  // Simulate rapid note input for performance testing
  simulateRapidInput(notes: number[], velocity: number = 127, channel: number = 0): void {
    notes.forEach(note => {
      this.simulateNoteOn(note, velocity, channel);
    });
  }

  open(): Promise<MockMIDIInput> {
    this.connection = 'open';
    return Promise.resolve(this);
  }

  close(): Promise<MockMIDIInput> {
    this.connection = 'closed';
    return Promise.resolve(this);
  }
}

// Mock MIDI output device
export class MockMIDIOutput {
  public id: string;
  public manufacturer: string;
  public name: string;
  public type: 'output' = 'output';
  public version: string;
  public state: 'connected' | 'disconnected';
  public connection: 'open' | 'closed' | 'pending';
  public onstatechange: ((event: any) => void) | null = null;

  constructor(id: string = 'mock-output-1', name: string = 'Mock MIDI Output') {
    this.id = id;
    this.manufacturer = 'Mock Manufacturer';
    this.name = name;
    this.version = '1.0.0';
    this.state = 'connected';
    this.connection = 'open';
  }

  send(data: number[] | Uint8Array, timestamp?: number): void {
    // Mock implementation - just log the sent data
    console.log('MIDI Output sent:', data, 'at', timestamp || performance.now());
  }

  clear(): void {
    // Mock implementation
    console.log('MIDI Output cleared');
  }

  open(): Promise<MockMIDIOutput> {
    this.connection = 'open';
    return Promise.resolve(this);
  }

  close(): Promise<MockMIDIOutput> {
    this.connection = 'closed';
    return Promise.resolve(this);
  }
}

// Mock MIDI access
export class MockMIDIAccess {
  public inputs: Map<string, MockMIDIInput>;
  public outputs: Map<string, MockMIDIOutput>;
  public sysexEnabled: boolean;
  public onstatechange: ((event: any) => void) | null = null;

  private eventListeners: Map<string, ((event: any) => void)[]> = new Map();

  constructor() {
    this.inputs = new Map();
    this.outputs = new Map();
    this.sysexEnabled = false;

    // Add default mock devices
    const mockInput = new MockMIDIInput();
    const mockOutput = new MockMIDIOutput();
    
    this.inputs.set(mockInput.id, mockInput);
    this.outputs.set(mockOutput.id, mockOutput);
  }

  addEventListener(type: string, listener: (event: any) => void): void {
    if (!this.eventListeners.has(type)) {
      this.eventListeners.set(type, []);
    }
    this.eventListeners.get(type)!.push(listener);
  }

  removeEventListener(type: string, listener: (event: any) => void): void {
    const listeners = this.eventListeners.get(type);
    if (listeners) {
      const index = listeners.indexOf(listener);
      if (index > -1) {
        listeners.splice(index, 1);
      }
    }
  }

  // Get the first available input device
  getFirstInput(): MockMIDIInput | undefined {
    return this.inputs.values().next().value;
  }

  // Get the first available output device
  getFirstOutput(): MockMIDIOutput | undefined {
    return this.outputs.values().next().value;
  }

  // Add a new input device
  addInput(input: MockMIDIInput): void {
    this.inputs.set(input.id, input);
    this.dispatchStateChange('connected', input);
  }

  // Remove an input device
  removeInput(inputId: string): void {
    const input = this.inputs.get(inputId);
    if (input) {
      this.inputs.delete(inputId);
      this.dispatchStateChange('disconnected', input);
    }
  }

  private dispatchStateChange(state: 'connected' | 'disconnected', port: MockMIDIInput | MockMIDIOutput): void {
    const event = {
      type: 'statechange',
      port: { ...port, state },
    };

    const listeners = this.eventListeners.get('statechange') || [];
    listeners.forEach(listener => listener(event));

    if (this.onstatechange) {
      this.onstatechange(event);
    }
  }
}

// Mock navigator.requestMIDIAccess function
export const createMockMIDIAccess = (): MockMIDIAccess => {
  return new MockMIDIAccess();
};

// Vitest mock setup
export const setupMIDIMock = () => {
  const mockMIDIAccess = createMockMIDIAccess();
  
  // Mock the global navigator.requestMIDIAccess
  global.navigator.requestMIDIAccess = vi.fn().mockResolvedValue(mockMIDIAccess);
  
  return mockMIDIAccess;
};

// Test utilities for MIDI simulation
export const midiTestUtils = {
  // Simulate playing a complete scale
  playScale: async (input: MockMIDIInput, notes: number[], delay: number = 100) => {
    for (let i = 0; i < notes.length; i++) {
      input.simulateNoteOn(notes[i]);
      if (i < notes.length - 1) {
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
  },

  // Simulate playing a chord
  playChord: (input: MockMIDIInput, notes: number[], velocity: number = 127) => {
    input.simulateChord(notes, velocity);
  },

  // Simulate clearing all notes
  clearNotes: (input: MockMIDIInput, notes: number[]) => {
    notes.forEach(note => input.simulateNoteOff(note));
  },

  // Wait for a specified time
  wait: (ms: number) => new Promise(resolve => setTimeout(resolve, ms)),

  // Create a sequence of MIDI events for testing
  createMIDISequence: (events: Array<{ type: 'noteOn' | 'noteOff', note: number, delay?: number }>) => {
    return events.map((event, index) => ({
      ...event,
      timestamp: index * (event.delay || 100),
    }));
  },
};

// Export default mock for easy importing
export default {
  MockMIDIInput,
  MockMIDIOutput,
  MockMIDIAccess,
  createMockMIDIAccess,
  setupMIDIMock,
  midiTestUtils,
  MIDI_MESSAGE_TYPES,
};