#!/usr/bin/env node

/**
 * Build script to obfuscate JavaScript files for production deployment
 * This protects proprietary calculation algorithms from easy copying
 */

const JavaScriptObfuscator = require('javascript-obfuscator');
const fs = require('fs');
const path = require('path');

// Configuration
const CONFIG = {
  sourceFile: path.join(__dirname, '..', 'src', 'load_calculation.js'),
  outputFile: path.join(__dirname, '..', 'load_calculation.js'),

  // Obfuscation options - balanced for protection vs. performance
  options: {
    compact: true,
    controlFlowFlattening: true,
    controlFlowFlatteningThreshold: 0.75,
    deadCodeInjection: true,
    deadCodeInjectionThreshold: 0.4,
    debugProtection: false, // Set to true for extra protection (but impacts debugging)
    debugProtectionInterval: 0,
    disableConsoleOutput: false,
    identifierNamesGenerator: 'hexadecimal',
    log: false,
    numbersToExpressions: true,
    renameGlobals: false,
    selfDefending: true, // Prevents beautification/formatting
    simplify: true,
    splitStrings: true,
    splitStringsChunkLength: 10,
    stringArray: true,
    stringArrayCallsTransform: true,
    stringArrayEncoding: ['base64'],
    stringArrayIndexShift: true,
    stringArrayRotate: true,
    stringArrayShuffle: true,
    stringArrayWrappersCount: 2,
    stringArrayWrappersChainedCalls: true,
    stringArrayWrappersParametersMaxCount: 4,
    stringArrayWrappersType: 'function',
    stringArrayThreshold: 0.75,
    transformObjectKeys: true,
    unicodeEscapeSequence: false
  }
};

console.log('🔒 EngrAssist Code Protection Build');
console.log('=====================================\n');

// Check if source file exists
if (!fs.existsSync(CONFIG.sourceFile)) {
  console.error(`❌ Error: Source file not found: ${CONFIG.sourceFile}`);
  console.error('   Make sure you have renamed load_calculation.js to src/load_calculation.js');
  process.exit(1);
}

try {
  console.log(`📖 Reading source file: ${path.basename(CONFIG.sourceFile)}`);
  const sourceCode = fs.readFileSync(CONFIG.sourceFile, 'utf8');

  const sourceStats = fs.statSync(CONFIG.sourceFile);
  console.log(`   Size: ${(sourceStats.size / 1024).toFixed(2)} KB`);

  console.log('\n🔄 Obfuscating code...');
  console.log('   This may take a minute for large files...');

  const obfuscationResult = JavaScriptObfuscator.obfuscate(sourceCode, CONFIG.options);

  console.log('✅ Obfuscation complete!');

  console.log(`\n💾 Writing obfuscated file: ${path.basename(CONFIG.outputFile)}`);
  fs.writeFileSync(CONFIG.outputFile, obfuscationResult.getObfuscatedCode(), 'utf8');

  const outputStats = fs.statSync(CONFIG.outputFile);
  console.log(`   Size: ${(outputStats.size / 1024).toFixed(2)} KB`);

  const sizeIncrease = ((outputStats.size / sourceStats.size - 1) * 100).toFixed(1);
  console.log(`   Size change: +${sizeIncrease}%`);

  console.log('\n✨ Build complete!');
  console.log('\n📋 Next steps:');
  console.log('   1. Test the obfuscated code in a browser');
  console.log('   2. Commit changes to git');
  console.log('   3. Push to deploy\n');

} catch (error) {
  console.error('❌ Obfuscation failed:', error.message);
  process.exit(1);
}
