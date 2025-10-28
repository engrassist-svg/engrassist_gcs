# Source Code Directory

This directory contains the **original, readable source code** for the EngrAssist calculators.

## Important Notes

⚠️ **DO NOT** edit `load_calculation.js` in the root directory directly!

- The file in the root directory is **obfuscated** and auto-generated
- Always edit the source files in this `src/` directory
- Run `npm run build` to regenerate the obfuscated version

## Build Process

### To build obfuscated code:

```bash
npm install          # Install dependencies (first time only)
npm run build        # Build obfuscated version
```

This will:
1. Read `src/load_calculation.js` (readable source with copyright)
2. Obfuscate the code using javascript-obfuscator
3. Write the obfuscated version to `load_calculation.js` (production file)

### Deployment

The GitHub Actions workflow automatically:
1. Runs `npm run build` to generate obfuscated code
2. Deploys to Google Cloud Storage
3. **Excludes** this `src/` directory from deployment

## File Structure

```
engrassist_gcs/
├── src/
│   └── load_calculation.js     ← EDIT THIS (source code)
├── load_calculation.js          ← DO NOT EDIT (obfuscated, auto-generated)
├── build/
│   └── obfuscate.js            ← Build script
├── package.json
└── .github/workflows/
    └── deploy.yml              ← Auto-builds on deployment
```

## Copyright

All source code is proprietary and confidential.
See copyright notice in source files for details.
