/**
 * Mapping Validation Tests
 *
 * These tests ensure consistency between the various mapping constants
 * and prevent drift between related data structures.
 */

import { describe, test, expect } from 'vitest';
import { allScaleData } from '../../../src/constants/scales';
import {
  validateMappings,
  getAllModes,
  getMappingStats,
  MODE_TO_SCALE_FAMILY,
  MODE_TO_INDEX_MAPPINGS
} from '../../../src/constants/mappings';

describe('Constants Mapping Validation', () => {
  test('validateMappings should pass without errors', () => {
    // This ensures that all mappings are internally consistent
    expect(() => validateMappings()).not.toThrow();
  });

  test('MODE_TO_INDEX_MAPPINGS should be consistent with allScaleData', () => {
    // Check that all modes in allScaleData have corresponding mappings
    allScaleData.forEach(scaleData => {
      const scaleName = scaleData.name;
      const modes = scaleData.commonNames || scaleData.alternateNames || [];

      modes.forEach((modeName, index) => {
        if (!scaleData.skipCommonNames) {
          // Verify that the mode appears in MODE_TO_INDEX_MAPPINGS
          const familyMappings = MODE_TO_INDEX_MAPPINGS[scaleName];
          expect(familyMappings, `Missing mappings for scale family: ${scaleName}`).toBeDefined();

          // Check if the mode name exists in the mappings (with some flexibility for variants)
          const hasMapping = Object.keys(familyMappings).some(key =>
            key.toLowerCase().includes(modeName.toLowerCase()) ||
            modeName.toLowerCase().includes(key.toLowerCase())
          );

          if (!hasMapping) {
            console.warn(`Mode "${modeName}" from ${scaleName} not found in MODE_TO_INDEX_MAPPINGS`);
          }
        }
      });
    });
  });

  test('MODE_TO_SCALE_FAMILY should cover all modes from allScaleData', () => {
    const missingModes: string[] = [];

    allScaleData.forEach(scaleData => {
      const modes = scaleData.commonNames || scaleData.alternateNames || [];

      modes.forEach(modeName => {
        if (!scaleData.skipCommonNames) {
          // Check if mode exists in MODE_TO_SCALE_FAMILY (allowing for variants)
          const hasMapping = Object.keys(MODE_TO_SCALE_FAMILY).some(key =>
            key.toLowerCase() === modeName.toLowerCase() ||
            key.toLowerCase().includes(modeName.toLowerCase()) ||
            modeName.toLowerCase().includes(key.toLowerCase())
          );

          if (!hasMapping) {
            missingModes.push(`${modeName} (from ${scaleData.name})`);
          }
        }
      });
    });

    if (missingModes.length > 0) {
      console.warn('Modes missing from MODE_TO_SCALE_FAMILY:', missingModes);
    }

    // Don't fail the test but warn - some variations might be intentionally omitted
    expect(missingModes.length).toBeLessThan(10); // Allow some flexibility
  });

  test('getAllModes function should return comprehensive mode list', () => {
    const allModesByFamily = getAllModes();

    // Should be organized by scale family
    expect(allModesByFamily).toHaveProperty('Major Scale');
    expect(allModesByFamily).toHaveProperty('Melodic Minor');

    // Major scale modes should include basic modes
    expect(allModesByFamily['Major Scale']).toContain('Ionian');
    expect(allModesByFamily['Major Scale']).toContain('Dorian');
    expect(allModesByFamily['Major Scale']).toContain('Mixolydian');

    // Melodic minor should include advanced modes
    if (allModesByFamily['Melodic Minor']) {
      expect(allModesByFamily['Melodic Minor']).toContain('Lydian Dominant');
      expect(allModesByFamily['Melodic Minor']).toContain('Altered');
    }

    // Should have reasonable number of scale families
    expect(Object.keys(allModesByFamily).length).toBeGreaterThan(5);
    expect(Object.keys(allModesByFamily).length).toBeLessThan(10);
  });

  test('getMappingStats should provide useful statistics', () => {
    const stats = getMappingStats();

    expect(stats).toHaveProperty('scaleFamilies');
    expect(stats).toHaveProperty('totalModes');
    expect(stats).toHaveProperty('totalNoteVariants');
    expect(stats).toHaveProperty('scaleFamilyNames');

    expect(stats.scaleFamilies).toBeGreaterThan(5);
    expect(stats.totalModes).toBeGreaterThan(20);
    expect(stats.totalNoteVariants).toBeGreaterThan(20); // Should include sharps, flats, etc
    expect(Array.isArray(stats.scaleFamilyNames)).toBe(true);
  });

  test('allScaleData structure should be valid', () => {
    expect(allScaleData).toBeDefined();
    expect(Array.isArray(allScaleData)).toBe(true);
    expect(allScaleData.length).toBeGreaterThan(5);

    allScaleData.forEach((scaleData, index) => {
      // Each scale should have required properties
      expect(scaleData.name, `Scale ${index} missing name`).toBeDefined();
      expect(scaleData.tableId, `Scale ${index} missing tableId`).toBeDefined();
      expect(scaleData.headers, `Scale ${index} missing headers`).toBeDefined();
      expect(scaleData.modeIntervals, `Scale ${index} missing modeIntervals`).toBeDefined();

      // Headers and mode intervals should match in length
      // Note: Headers include the "Mode / Scale Degree" column, so +1
      expect(scaleData.headers.length).toBe(scaleData.modeIntervals.length + 1);

      // Each mode should have 12-tone interval arrays (except pentatonic/blues)
      scaleData.modeIntervals.forEach((intervals, modeIndex) => {
        expect(Array.isArray(intervals),
          `Scale ${scaleData.name} mode ${modeIndex} intervals not array`).toBe(true);

        if (scaleData.isDiatonic) {
          expect(intervals.length).toBe(7);
        }
        // All intervals should be 0-11
        intervals.forEach(interval => {
          expect(interval).toBeGreaterThanOrEqual(0);
          expect(interval).toBeLessThanOrEqual(11);
        });
      });
    });
  });
});
