// Debug script to check EnhancedModalAnalyzer confidence
import { EnhancedModalAnalyzer } from './src/services/enhancedModalAnalyzer.js';
import { ComprehensiveAnalysisEngine } from './src/services/comprehensiveAnalysisService.js';

console.log('=== Debug: G F C G Modal Analysis ===');

// Test EnhancedModalAnalyzer directly
const analyzer = new EnhancedModalAnalyzer();
const result = analyzer.analyzeModalCharacteristics(['G', 'F', 'C', 'G'], 'C major');

console.log('Enhanced Modal Analyzer Result:');
console.log('- Detected Tonic:', result?.detectedTonicCenter);
console.log('- Mode Name:', result?.modeName);
console.log('- Roman Numerals:', result?.romanNumerals);
console.log('- Confidence:', result?.confidence);
console.log('- Evidence:', result?.evidence);

// Test ComprehensiveAnalysisEngine
const engine = new ComprehensiveAnalysisEngine();
const comprehensive = await engine.analyzeComprehensively('G F C G', 'C major');

console.log('\nComprehensive Analysis Engine Result:');
console.log('- Primary Approach:', comprehensive.primaryApproach);
console.log('- Has Modal Enhancement:', !!comprehensive.modal);
console.log('- Has Enhanced Analysis:', !!comprehensive.modal?.enhancedAnalysis);
console.log('- Modal Confidence:', comprehensive.modal?.enhancedAnalysis?.confidence);