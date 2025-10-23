# EngrAssist Website - Setup and Configuration Guide

## Table of Contents
1. [Google Cloud Storage Configuration](#google-cloud-storage-configuration)
2. [Google Analytics 4 Setup](#google-analytics-4-setup)
3. [Cache Headers for Performance](#cache-headers-for-performance)
4. [Image Optimization](#image-optimization)
5. [Deployment](#deployment)
6. [SEO Configuration](#seo-configuration)

---

## Google Cloud Storage Configuration

### Initial Setup

1. **Create a GCS Bucket**
   ```bash
   gsutil mb -c STANDARD -l us-central1 gs://your-bucket-name
   ```

2. **Enable Static Website Hosting**
   ```bash
   gsutil web set -m index.html -e 404.html gs://your-bucket-name
   ```

3. **Make Bucket Public**
   ```bash
   gsutil iam ch allUsers:objectViewer gs://your-bucket-name
   ```

### Cache Headers Configuration

To reduce bandwidth costs and improve performance, configure cache headers for your static assets:

#### Set Long Cache for Static Assets (1 year)
```bash
# CSS Files
gsutil -m setmeta -h "Cache-Control:public, max-age=31536000, immutable" \
  gs://your-bucket-name/styles.css

# JavaScript Files
gsutil -m setmeta -h "Cache-Control:public, max-age=31536000, immutable" \
  gs://your-bucket-name/scripts.js

# Images
gsutil -m setmeta -h "Cache-Control:public, max-age=31536000, immutable" \
  "gs://your-bucket-name/images/*.png" \
  "gs://your-bucket-name/images/*.jpg" \
  "gs://your-bucket-name/images/*.svg"
```

#### Set Short Cache for HTML Files (1 day)
```bash
gsutil -m setmeta -h "Cache-Control:public, max-age=86400" \
  "gs://your-bucket-name/*.html"
```

#### Set Cache for Templates (1 week)
```bash
gsutil -m setmeta -h "Cache-Control:public, max-age=604800" \
  gs://your-bucket-name/header.html \
  gs://your-bucket-name/footer.html
```

### Gzip Compression

Enable gzip compression to reduce file sizes (saves 70-80% bandwidth):

```bash
# For already gzipped files
gsutil -m setmeta -h "Content-Encoding:gzip" \
  -h "Content-Type:text/css" \
  gs://your-bucket-name/styles.css.gz

gsutil -m setmeta -h "Content-Encoding:gzip" \
  -h "Content-Type:application/javascript" \
  gs://your-bucket-name/scripts.js.gz
```

**Note**: For automatic compression, consider using Cloud CDN or Cloudflare.

### Cost Optimization

#### Estimated Monthly Costs (based on 10,000 visitors/month)

**Before Optimization:**
- Storage: ~500MB with .psd files = $0.02/month
- Bandwidth: ~50GB unoptimized = $6.00/month
- Operations: ~50,000 requests = $0.02/month
- **Total: ~$6.04/month**

**After Optimization:**
- Storage: ~100MB (removed .psd files) = $0.002/month
- Bandwidth: ~15GB (with compression & caching) = $1.80/month
- Operations: ~15,000 requests (with caching) = $0.006/month
- **Total: ~$1.81/month**

**Savings: ~70% reduction in costs**

---

## Google Analytics 4 Setup

### Create GA4 Property

1. Go to [Google Analytics](https://analytics.google.com/)
2. Create a new GA4 property
3. Copy your Measurement ID (format: G-XXXXXXXXXX)

### Update Tracking Code

The GA4 code is already added to `header.html` with the measurement ID `G-9HVPYW6169`.

**Current implementation in `header.html`:**
```javascript
gtag('config', 'G-9HVPYW6169');
```

And the script src:
```html
<script async src="https://www.googletagmanager.com/gtag/js?id=G-9HVPYW6169"></script>
```

### Recommended GA4 Events to Track

Add these custom events in your scripts.js:

```javascript
// Track calculator usage
function trackCalculatorUse(calculatorName) {
    gtag('event', 'calculator_use', {
        'calculator_name': calculatorName
    });
}

// Track form submissions
function trackFormSubmission(formName) {
    gtag('event', 'form_submit', {
        'form_name': formName
    });
}

// Track outbound links
function trackOutboundLink(url) {
    gtag('event', 'click', {
        'event_category': 'outbound',
        'event_label': url
    });
}
```

---

## Cache Headers for Performance

### Recommended Cache Headers by File Type

| File Type | Cache Duration | Header |
|-----------|----------------|--------|
| HTML | 1 day | `Cache-Control: public, max-age=86400` |
| CSS/JS | 1 year | `Cache-Control: public, max-age=31536000, immutable` |
| Images | 1 year | `Cache-Control: public, max-age=31536000, immutable` |
| Fonts | 1 year | `Cache-Control: public, max-age=31536000, immutable` |
| Templates | 1 week | `Cache-Control: public, max-age=604800` |

### Apply Cache Headers via gsutil

Create a bash script `apply-cache-headers.sh`:

```bash
#!/bin/bash

BUCKET="gs://your-bucket-name"

echo "Applying cache headers to static assets..."

# HTML files (1 day)
gsutil -m setmeta -h "Cache-Control:public, max-age=86400" \
  "$BUCKET/*.html"

# CSS and JS (1 year)
gsutil -m setmeta -h "Cache-Control:public, max-age=31536000, immutable" \
  "$BUCKET/styles.css" \
  "$BUCKET/scripts.js"

# Images (1 year)
gsutil -m setmeta -h "Cache-Control:public, max-age=31536000, immutable" \
  "$BUCKET/images/*"

# Templates (1 week)
gsutil -m setmeta -h "Cache-Control:public, max-age=604800" \
  "$BUCKET/header.html" \
  "$BUCKET/footer.html"

echo "Cache headers applied successfully!"
```

Make it executable and run:
```bash
chmod +x apply-cache-headers.sh
./apply-cache-headers.sh
```

---

## Image Optimization

### Current Image Sizes (Before Optimization)

- `Mechanical_Room_1000.png`: 2.7MB → Target: ~400KB
- `background.png`: 2.4MB → Target: ~300KB
- `RTU_1000.png`: 2.2MB → Target: ~350KB
- `logo_coffee.png`: 1.6MB → Target: ~200KB

### Optimization Steps

1. **Use Online Tools**
   - [TinyPNG](https://tinypng.com/) - PNG compression
   - [Squoosh](https://squoosh.app/) - Advanced compression with WebP
   - [ImageOptim](https://imageoptim.com/) - Desktop tool (Mac)

2. **Convert to WebP Format**
   ```bash
   # Using cwebp (install via: sudo apt-get install webp)
   cwebp -q 80 images/Mechanical_Room_1000.png -o images/Mechanical_Room_1000.webp
   ```

3. **Use Responsive Images**
   ```html
   <picture>
     <source srcset="images/logo_coffee.webp" type="image/webp">
     <source srcset="images/logo_coffee.png" type="image/png">
     <img src="images/logo_coffee.png" alt="EngrAssist Logo" loading="lazy">
   </picture>
   ```

### Expected Savings

- **Storage**: Reduce from ~20MB to ~4MB (80% reduction)
- **Bandwidth**: Reduce by 70-85%
- **Cost**: Save ~$4-5/month on bandwidth costs

---

## Deployment

### GitHub Actions Workflow

The deployment is automated via `.github/workflows/deploy.yml`.

**Recent Improvements:**
- ✅ Added `-c` flag for checksum comparison (only upload changed files)
- ✅ Excluded unnecessary files (.psd, .git, etc.) from deployment
- ✅ Multi-threaded upload with `-m` flag

### Manual Deployment

If you need to deploy manually:

```bash
# Authenticate
gcloud auth login

# Set project
gcloud config set project YOUR_PROJECT_ID

# Deploy (with exclusions)
gsutil -m rsync -r -d -c \
  -x ".git/.*|.github/.*|.*\.psd$|.*_old\.*|README\.md|SETUP_GUIDE\.md" \
  . gs://your-bucket-name
```

### Post-Deployment Checklist

After each deployment:
- [ ] Apply cache headers (run `apply-cache-headers.sh`)
- [ ] Test website functionality
- [ ] Check Google Search Console for crawl errors
- [ ] Verify sitemap is accessible: https://engrassist.com/sitemap.xml
- [ ] Test page speed: [PageSpeed Insights](https://pagespeed.web.dev/)

---

## SEO Configuration

### Sitemap Maintenance

Update sitemap.xml dates when making significant changes:

```xml
<lastmod>2025-10-21</lastmod>  <!-- Use current date -->
```

Submit sitemap to:
1. [Google Search Console](https://search.google.com/search-console)
2. [Bing Webmaster Tools](https://www.bing.com/webmasters)

### Schema.org Structured Data

Already implemented:
- ✅ Organization schema (index.html)
- ✅ WebSite schema with search (index.html)
- ✅ SoftwareApplication schema (ductulator.html)

**To add more schemas:**
- Add FAQPage schema to calculator pages
- Add BreadcrumbList schema for navigation
- Add HowTo schema for tutorials

### Open Graph & Twitter Cards

Already implemented on all pages. Test using:
- [Facebook Sharing Debugger](https://developers.facebook.com/tools/debug/)
- [Twitter Card Validator](https://cards-dev.twitter.com/validator)

### Robots.txt

Current configuration is good. No changes needed.

```
User-agent: *
Allow: /
Sitemap: https://engrassist.com/sitemap.xml
Disallow: /404.html
```

---

## Performance Monitoring

### Tools to Monitor

1. **Google Analytics 4** - User behavior, traffic sources
2. **Google Search Console** - SEO performance, crawl errors
3. **PageSpeed Insights** - Core Web Vitals
4. **GTmetrix** - Detailed performance analysis

### Target Metrics

- First Contentful Paint (FCP): < 1.8s
- Largest Contentful Paint (LCP): < 2.5s
- Cumulative Layout Shift (CLS): < 0.1
- First Input Delay (FID): < 100ms
- Page Load Time: < 3s

---

## Additional Recommendations

### Content Delivery Network (CDN)

Consider using Cloudflare (FREE plan) for:
- Free SSL/TLS certificate
- DDoS protection
- Automatic image optimization
- Free bandwidth (unlimited)
- Global CDN

**Setup**: Point your domain DNS to Cloudflare nameservers.

### Monitoring & Alerts

Set up monitoring for:
- Website uptime (UptimeRobot - free)
- GCS costs (Google Cloud Billing alerts)
- Core Web Vitals (Google Search Console)

### Backup Strategy

- Git repository serves as code backup
- GCS bucket versioning (optional):
  ```bash
  gsutil versioning set on gs://your-bucket-name
  ```

---

## Support & Maintenance

### Monthly Tasks
- [ ] Review Google Analytics data
- [ ] Check and update sitemap dates
- [ ] Review GCS costs and optimize
- [ ] Update content based on user feedback

### Quarterly Tasks
- [ ] Audit SEO performance
- [ ] Update structured data
- [ ] Review and optimize images
- [ ] Test all calculators for accuracy

---

## Contact

For questions or issues with this setup:
- Website: https://engrassist.com/contact.html
- Support: via Contact form

---

**Last Updated**: 2025-10-21
