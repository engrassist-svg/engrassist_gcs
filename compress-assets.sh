#!/bin/bash
# Asset Compression Script
# Compresses CSS and JS files with gzip for bandwidth savings

set -e

echo "============================================"
echo "EngrAssist Asset Compression Script"
echo "============================================"
echo ""

# Function to compress a file
compress_file() {
    local file="$1"
    local original_size=$(stat -f%z "$file" 2>/dev/null || stat -c%s "$file")

    # Create gzipped version
    gzip -9 -k -f "$file"

    local compressed_size=$(stat -f%z "$file.gz" 2>/dev/null || stat -c%s "$file.gz")
    local savings=$((original_size - compressed_size))
    local percentage=$((savings * 100 / original_size))

    echo "  ✓ $(basename "$file"): ${original_size} → ${compressed_size} bytes (${percentage}% reduction)"

    # Return savings for tracking
    echo "$savings" >> /tmp/compression_savings.tmp
}

echo "Compressing CSS files..."
echo "0" > /tmp/compression_savings.tmp

# Compress CSS files
if [ -f "styles.css" ]; then
    compress_file "styles.css"
else
    echo "  ⚠ Warning: styles.css not found"
fi

echo ""
echo "Compressing JavaScript files..."

# Compress main JS files
for js_file in scripts.js load_calculation.js; do
    if [ -f "$js_file" ]; then
        compress_file "$js_file"
    else
        echo "  ⚠ Warning: $js_file not found"
    fi
done

# Compress service worker
if [ -f "service-worker.js" ]; then
    compress_file "service-worker.js"
else
    echo "  ⚠ Warning: service-worker.js not found"
fi

# Calculate total savings
total_savings=0
while IFS= read -r savings; do
    total_savings=$((total_savings + savings))
done < /tmp/compression_savings.tmp

rm -f /tmp/compression_savings.tmp

echo ""
echo "============================================"
echo "Compression Complete!"
echo "============================================"
echo "Total savings: $((total_savings / 1024))KB"
echo ""
echo "Compressed files created:"
echo "  • styles.css.gz"
echo "  • scripts.js.gz"
echo "  • load_calculation.js.gz"
echo "  • service-worker.js.gz"
echo ""
echo "These will be uploaded to GCS with Content-Encoding headers"
echo ""
