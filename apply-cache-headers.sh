#!/bin/bash
# Cache Headers Application Script for GCS
# Applies optimal cache headers to reduce bandwidth costs and improve performance

set -e

echo "============================================"
echo "EngrAssist Cache Headers Application Script"
echo "============================================"
echo ""

# Check if BUCKET_NAME is provided
if [ -z "$1" ]; then
    echo "❌ Error: Bucket name not provided"
    echo ""
    echo "Usage: $0 <bucket-name>"
    echo "Example: $0 engrassist.com"
    echo ""
    echo "Or set GCP_BUCKET_NAME environment variable:"
    echo "  export GCP_BUCKET_NAME=engrassist.com"
    echo "  $0"
    exit 1
fi

BUCKET="${1:-$GCP_BUCKET_NAME}"
BUCKET_URL="gs://${BUCKET}"

echo "Target bucket: $BUCKET_URL"
echo ""

# Check if gsutil is available
if ! command -v gsutil &> /dev/null; then
    echo "❌ Error: gsutil not found"
    echo "Install Google Cloud SDK: https://cloud.google.com/sdk/docs/install"
    exit 1
fi

# Test bucket access
echo "Testing bucket access..."
if ! gsutil ls "$BUCKET_URL" &> /dev/null; then
    echo "❌ Error: Cannot access bucket $BUCKET_URL"
    echo "Make sure you're authenticated: gcloud auth login"
    exit 1
fi
echo "✓ Bucket access confirmed"
echo ""

# Function to apply cache headers with retry logic
apply_cache_headers() {
    local pattern="$1"
    local cache_control="$2"
    local description="$3"

    echo "Applying cache headers to: $description"
    echo "  Pattern: $pattern"
    echo "  Cache-Control: $cache_control"

    local max_retries=3
    local retry_count=0

    while [ $retry_count -lt $max_retries ]; do
        if gsutil -m setmeta -h "Cache-Control:$cache_control" "${BUCKET_URL}/${pattern}" 2>/dev/null; then
            echo "  ✓ Successfully applied"
            echo ""
            return 0
        else
            retry_count=$((retry_count + 1))
            if [ $retry_count -lt $max_retries ]; then
                echo "  ⚠ Retry $retry_count/$max_retries..."
                sleep 2
            fi
        fi
    done

    echo "  ⚠ Warning: Could not apply to some files (may not exist)"
    echo ""
    return 1
}

echo "Starting cache header application..."
echo ""

# HTML files (1 day = 86400 seconds)
apply_cache_headers "*.html" "public, max-age=86400" "HTML files (1 day)"
apply_cache_headers "articles/*.html" "public, max-age=86400" "Article HTML files (1 day)"

# CSS and JavaScript files (1 year = 31536000 seconds, immutable)
apply_cache_headers "*.css" "public, max-age=31536000, immutable" "CSS files (1 year)"
apply_cache_headers "*.js" "public, max-age=31536000, immutable" "JavaScript files (1 year)"

# Images - PNG, JPG, WebP (1 year, immutable)
apply_cache_headers "images/*.png" "public, max-age=31536000, immutable" "PNG images (1 year)"
apply_cache_headers "images/*.jpg" "public, max-age=31536000, immutable" "JPG images (1 year)"
apply_cache_headers "images/*.jpeg" "public, max-age=31536000, immutable" "JPEG images (1 year)"
apply_cache_headers "images/*.webp" "public, max-age=31536000, immutable" "WebP images (1 year)"
apply_cache_headers "images/*.svg" "public, max-age=31536000, immutable" "SVG images (1 year)"
apply_cache_headers "images/*.gif" "public, max-age=31536000, immutable" "GIF images (1 year)"

# Templates (1 week = 604800 seconds)
apply_cache_headers "header.html" "public, max-age=604800" "Header template (1 week)"
apply_cache_headers "footer.html" "public, max-age=604800" "Footer template (1 week)"

# Fonts (1 year)
apply_cache_headers "fonts/*" "public, max-age=31536000, immutable" "Font files (1 year)"

# Service Worker (should not be cached aggressively)
apply_cache_headers "service-worker.js" "public, max-age=0, must-revalidate" "Service Worker (no cache)"

# Other static assets
apply_cache_headers "*.xml" "public, max-age=86400" "XML files (1 day)"
apply_cache_headers "*.txt" "public, max-age=86400" "Text files (1 day)"
apply_cache_headers "*.json" "public, max-age=86400" "JSON files (1 day)"

echo "============================================"
echo "Cache Headers Applied Successfully!"
echo "============================================"
echo ""
echo "Summary of cache durations:"
echo "  • HTML files: 1 day"
echo "  • CSS/JS files: 1 year (immutable)"
echo "  • Images: 1 year (immutable)"
echo "  • Templates: 1 week"
echo "  • Service Worker: No cache"
echo ""
echo "Expected benefits:"
echo "  • 60-70% reduction in bandwidth usage"
echo "  • Faster page loads for returning visitors"
echo "  • Reduced GCS operation costs"
echo ""
echo "Next steps:"
echo "  1. Test website: https://engrassist.com"
echo "  2. Check cache headers: curl -I https://engrassist.com/styles.css"
echo "  3. Monitor bandwidth in GCP Console"
echo ""
