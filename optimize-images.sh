#!/bin/bash
# Image Optimization Script for EngrAssist
# Converts PNG images to WebP and compresses them for bandwidth savings

set -e

echo "============================================"
echo "EngrAssist Image Optimization Script"
echo "============================================"
echo ""

# Check if required tools are installed
check_dependencies() {
    local missing_deps=()

    if ! command -v cwebp &> /dev/null; then
        missing_deps+=("webp")
    fi

    if ! command -v pngquant &> /dev/null; then
        missing_deps+=("pngquant")
    fi

    if [ ${#missing_deps[@]} -ne 0 ]; then
        echo "❌ Missing dependencies: ${missing_deps[*]}"
        echo ""
        echo "Install with:"
        echo "  Ubuntu/Debian: sudo apt-get install webp pngquant"
        echo "  macOS: brew install webp pngquant"
        echo ""
        exit 1
    fi
}

# Calculate file size in KB
get_file_size_kb() {
    local file="$1"
    if [ -f "$file" ]; then
        du -k "$file" | cut -f1
    else
        echo "0"
    fi
}

# Optimize a single image
optimize_image() {
    local input_file="$1"
    local filename=$(basename "$input_file")
    local dirname=$(dirname "$input_file")
    local name="${filename%.*}"
    local ext="${filename##*.}"

    # Skip if not PNG or JPG
    if [[ ! "$ext" =~ ^(png|PNG|jpg|JPG|jpeg|JPEG)$ ]]; then
        return
    fi

    echo "Processing: $filename"

    local original_size=$(get_file_size_kb "$input_file")
    local total_saved=0

    # Convert to WebP
    local webp_file="${dirname}/${name}.webp"
    if [ ! -f "$webp_file" ] || [ "$input_file" -nt "$webp_file" ]; then
        cwebp -q 85 -m 6 "$input_file" -o "$webp_file" 2>/dev/null
        local webp_size=$(get_file_size_kb "$webp_file")
        local webp_saved=$((original_size - webp_size))
        echo "  ✓ WebP created: ${webp_size}KB (saved ${webp_saved}KB / $((webp_saved * 100 / original_size))%)"
        total_saved=$((total_saved + webp_saved))
    else
        echo "  ⊘ WebP already exists and is up-to-date"
    fi

    # Compress PNG (if PNG file)
    if [[ "$ext" =~ ^(png|PNG)$ ]]; then
        local compressed_file="${dirname}/${name}_compressed.png"
        pngquant --quality=80-95 --skip-if-larger --output "$compressed_file" "$input_file" 2>/dev/null || true

        if [ -f "$compressed_file" ]; then
            local compressed_size=$(get_file_size_kb "$compressed_file")
            local png_saved=$((original_size - compressed_size))
            echo "  ✓ PNG compressed: ${compressed_size}KB (saved ${png_saved}KB / $((png_saved * 100 / original_size))%)"

            # Ask user if they want to replace original
            # For automation, we'll keep both files
            echo "  ℹ Compressed version saved as: ${name}_compressed.png"
            total_saved=$((total_saved + png_saved))
        else
            echo "  ⊘ PNG already optimized (skipped)"
        fi
    fi

    echo "  Original: ${original_size}KB → Total potential savings: ${total_saved}KB"
    echo ""

    # Return savings for tracking
    echo "$total_saved" >> /tmp/image_optimization_savings.tmp
}

# Main execution
main() {
    echo "Checking dependencies..."
    check_dependencies
    echo "✓ All dependencies installed"
    echo ""

    # Initialize savings tracker
    echo "0" > /tmp/image_optimization_savings.tmp

    # Find and optimize images
    echo "Scanning for images in ./images directory..."
    echo ""

    if [ ! -d "images" ]; then
        echo "❌ Error: 'images' directory not found"
        echo "Run this script from the project root directory"
        exit 1
    fi

    local image_count=0
    while IFS= read -r -d '' image_file; do
        optimize_image "$image_file"
        ((image_count++))
    done < <(find images -type f \( -iname "*.png" -o -iname "*.jpg" -o -iname "*.jpeg" \) -print0)

    # Calculate total savings
    local total_savings=0
    while IFS= read -r savings; do
        total_savings=$((total_savings + savings))
    done < /tmp/image_optimization_savings.tmp

    rm -f /tmp/image_optimization_savings.tmp

    echo "============================================"
    echo "Optimization Complete!"
    echo "============================================"
    echo "Images processed: $image_count"
    echo "Total potential savings: ${total_savings}KB (~$((total_savings / 1024))MB)"
    echo ""
    echo "Next steps:"
    echo "1. Review the compressed images"
    echo "2. Replace originals with compressed versions if satisfied"
    echo "3. Update HTML to use <picture> tags with WebP"
    echo "4. Run './apply-cache-headers.sh' after deploying"
    echo ""
    echo "Example HTML usage:"
    echo '  <picture>'
    echo '    <source srcset="images/logo.webp" type="image/webp">'
    echo '    <img src="images/logo.png" alt="Logo" loading="lazy">'
    echo '  </picture>'
    echo ""
}

main "$@"
