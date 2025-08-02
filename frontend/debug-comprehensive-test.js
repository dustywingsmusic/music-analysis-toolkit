import { describe, it, expect } from 'vitest';
import { ComprehensiveAnalysisEngine } from '../src/services/comprehensiveAnalysisService.js';

describe('Debug Comprehensive Analysis', () => {
  it('should debug G F C G with C major parent key', async () => {
    const engine = new ComprehensiveAnalysisEngine();
    const result = await engine.analyzeComprehensively('G F C G', 'C major');
    
    console.log('=== Debug Results ===');
    console.log('Primary Approach:', result.primaryApproach);
    console.log('Has Modal Enhancement:', !!result.modal);
    console.log('Has Enhanced Analysis:', !!result.modal?.enhancedAnalysis);
    
    if (result.modal?.enhancedAnalysis) {
      console.log('Enhanced Modal Analysis:');
      console.log('- Detected Tonic:', result.modal.enhancedAnalysis.detectedTonicCenter);
      console.log('- Mode Name:', result.modal.enhancedAnalysis.modeName);
      console.log('- Confidence:', result.modal.enhancedAnalysis.confidence);
      console.log('- Roman Numerals:', result.modal.enhancedAnalysis.romanNumerals);
    } else {
      console.log('No enhanced modal analysis - fell back to legacy');
    }
    
    // This should fail if modal enhancement is not working
    expect(result.modal?.enhancedAnalysis).toBeDefined();
    expect(result.modal?.enhancedAnalysis?.detectedTonicCenter).toBe('G');
    expect(result.modal?.enhancedAnalysis?.romanNumerals).toEqual(['I', 'bVII', 'IV', 'I']);
  });
});