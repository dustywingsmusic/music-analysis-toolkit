import { describe, it, expect, beforeEach } from 'vitest';
import { SharedScaleTablesService, sharedScaleTablesService } from '../../../src/services/SharedScaleTablesService';

describe('SharedScaleTablesService', () => {
  let service: SharedScaleTablesService;

  beforeEach(() => {
    service = new SharedScaleTablesService({
      enableMidi: true,
      enableSearch: true,
      enableFiltering: true,
      enableCrossNavigation: true,
      pluginMode: false
    });
  });

  describe('Service Initialization', () => {
    it('should create service with default configuration', () => {
      expect(service).toBeDefined();
    });

    it('should initialize with processed scales', () => {
      const scales = service.getFilteredScales();
      expect(scales.length).toBeGreaterThan(0);
    });

    it('should provide available scale families', () => {
      const families = service.getAvailableScaleFamilies();
      expect(families).toContain('Major Scale');
      expect(families).toContain('Melodic Minor');
      expect(families).toContain('Harmonic Minor');
    });

    it('should provide available root notes', () => {
      const roots = service.getAvailableRootNotes();
      expect(roots).toContain('C');
      expect(roots).toContain('D');
      expect(roots).toContain('E');
      expect(roots.length).toBe(12);
    });
  });

  describe('Scale Filtering', () => {
    it('should filter scales by root note', () => {
      const cScales = service.getFilteredScales({ rootNote: 'C' });
      expect(cScales.length).toBeGreaterThan(0);
      cScales.forEach(scale => {
        expect(scale.rootNoteName).toBe('C');
      });
    });

    it('should filter scales by scale family', () => {
      const majorScales = service.getFilteredScales({ scaleFamily: 'Major Scale' });
      expect(majorScales.length).toBeGreaterThan(0);
      majorScales.forEach(scale => {
        expect(scale.scaleFamily).toBe('Major Scale');
      });
    });

    it('should filter scales by search query', () => {
      const dorianScales = service.getFilteredScales({ searchQuery: 'dorian' });
      expect(dorianScales.length).toBeGreaterThan(0);
      dorianScales.forEach(scale => {
        expect(scale.name?.toLowerCase()).toContain('dorian');
      });
    });

    it('should filter scales by MIDI input', () => {
      const cMajorPitchClasses = new Set([0, 2, 4, 5, 7, 9, 11]);
      const matchingScales = service.getFilteredScales({
        showOnlyMatches: true,
        playedPitchClasses: cMajorPitchClasses
      });
      
      expect(matchingScales.length).toBeGreaterThan(0);
      matchingScales.forEach(scale => {
        // All played notes should be in the scale
        for (const note of cMajorPitchClasses) {
          expect(scale.pitchClasses.has(note)).toBe(true);
        }
      });
    });
  });

  describe('Scale Finding', () => {
    it('should find scale by ID', () => {
      const scales = service.getFilteredScales();
      const firstScale = scales[0];
      const foundScale = service.findScaleById(firstScale.id);
      
      expect(foundScale).toBeDefined();
      expect(foundScale?.id).toBe(firstScale.id);
    });

    it('should find scales by mode name', () => {
      const dorianScales = service.findScalesByMode('Dorian');
      expect(dorianScales.length).toBeGreaterThan(0);
      dorianScales.forEach(scale => {
        expect(scale.name?.toLowerCase()).toContain('dorian');
      });
    });

    it('should find scales by root note', () => {
      const cScales = service.findScalesByRoot('C');
      expect(cScales.length).toBeGreaterThan(0);
      cScales.forEach(scale => {
        expect(scale.rootNoteName).toBe('C');
      });
    });
  });

  describe('MIDI Integration', () => {
    it('should provide MIDI scale suggestions', () => {
      const cMajorPitchClasses = new Set([0, 2, 4, 5, 7, 9, 11]);
      const suggestions = service.getMidiScaleSuggestions(cMajorPitchClasses);
      
      expect(suggestions.length).toBeGreaterThan(0);
      
      // Should include major scale modes
      const hasIonian = suggestions.some(s => s.name?.includes('Ionian') && s.rootNoteName === 'C');
      const hasDorian = suggestions.some(s => s.name?.includes('Dorian') && s.rootNoteName === 'D');
      
      expect(hasIonian || hasDorian).toBe(true);
    });

    it('should handle empty MIDI input', () => {
      const suggestions = service.getMidiScaleSuggestions(new Set());
      expect(suggestions.length).toBe(0);
    });
  });

  describe('Cross-Navigation', () => {
    it('should navigate from analysis results', () => {
      const highlight = service.navigateFromAnalysis({
        sourceTab: 'harmony',
        targetMode: 'Mixolydian',
        targetTonic: 'G'
      });
      
      expect(highlight).toBeDefined();
      expect(highlight?.reason).toBe('analysis');
    });

    it('should handle invalid navigation targets', () => {
      const highlight = service.navigateFromAnalysis({
        sourceTab: 'harmony',
        targetMode: 'InvalidMode',
        targetTonic: 'X'
      });
      
      expect(highlight).toBeNull();
    });
  });

  describe('Highlighting System', () => {
    it('should set and clear highlights', () => {
      const scales = service.getFilteredScales();
      const testScale = scales[0];
      
      service.setHighlight({
        cellId: testScale.id,
        reason: 'analysis',
        temporary: false
      });
      
      const highlights = service.getHighlights();
      expect(highlights.has(testScale.id)).toBe(true);
      
      service.clearHighlight(testScale.id);
      const clearedHighlights = service.getHighlights();
      expect(clearedHighlights.has(testScale.id)).toBe(false);
    });

    it('should clear all highlights', () => {
      const scales = service.getFilteredScales().slice(0, 3);
      
      scales.forEach(scale => {
        service.setHighlight({
          cellId: scale.id,
          reason: 'test',
          temporary: false
        });
      });
      
      let highlights = service.getHighlights();
      expect(highlights.size).toBe(3);
      
      service.clearAllHighlights();
      highlights = service.getHighlights();
      expect(highlights.size).toBe(0);
    });
  });

  describe('Plugin Support', () => {
    it('should create plugin-optimized instance', () => {
      const pluginService = SharedScaleTablesService.createPluginInstance();
      expect(pluginService).toBeDefined();
      
      const exportData = pluginService.exportForPlugin();
      expect(exportData.scales).toBeDefined();
      expect(exportData.families).toBeDefined();
      expect(exportData.rootNotes).toBeDefined();
      expect(exportData.config.pluginMode).toBe(true);
    });

    it('should export data for plugin packaging', () => {
      const exportData = service.exportForPlugin();
      
      expect(exportData.scales.length).toBeGreaterThan(0);
      expect(exportData.families.length).toBeGreaterThan(0);
      expect(exportData.rootNotes.length).toBe(12);
    });
  });

  describe('Shared Service Instance', () => {
    it('should provide default shared instance', () => {
      expect(sharedScaleTablesService).toBeDefined();
      expect(sharedScaleTablesService).toBeInstanceOf(SharedScaleTablesService);
    });

    it('should have scales loaded in shared instance', () => {
      const scales = sharedScaleTablesService.getFilteredScales();
      expect(scales.length).toBeGreaterThan(0);
    });
  });

  describe('Navigation Interface', () => {
    it('should create navigation interface', () => {
      const navigation = service.createNavigation();
      
      expect(navigation.highlightScale).toBeDefined();
      expect(navigation.clearHighlights).toBeDefined();
      expect(navigation.scrollToScale).toBeDefined();
      expect(navigation.setFilter).toBeDefined();
      expect(navigation.getVisibleScales).toBeDefined();
    });
  });
});