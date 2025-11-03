# SEO Setup Instructions for EngrAssist.com

## Changes Made

### 1. Canonical Tags ✓
All main HTML pages already have canonical tags pointing to `https://engrassist.com/[page-name]`

### 2. Noindex Tags Removed ✓
- Removed noindex from `privacy.html`
- Removed noindex from `terms.html`
- Kept noindex on `404.html` (standard practice for error pages)

### 3. Google Cloud Storage Configuration

#### Apply Website Configuration
Run this command to configure your GCS bucket:

```bash
gsutil web set -m index.html -e 404.html gs://engrassist.com
```

This tells Google Cloud Storage:
- Use `index.html` as the main page (so `/` serves `/index.html`)
- Use `404.html` as the error page

#### Set Up URL Redirects (HTTP → HTTPS, www → non-www)

For Google Cloud Storage, URL redirects must be configured at the **Load Balancer** level, not in the bucket itself.

**Steps to configure redirects:**

1. **Go to Google Cloud Console**
   - Navigate to: Network Services → Load Balancing
   - Find your load balancer for engrassist.com

2. **Add HTTP to HTTPS Redirect**
   - Edit your load balancer
   - For the HTTP frontend (port 80), add a URL redirect rule:
     - Protocol: HTTPS
     - Response Code: 301 (Permanent Redirect)

3. **Add www to non-www Redirect**
   - Create/edit URL map rules
   - Add a redirect for `www.engrassist.com` → `engrassist.com`:
     - Host: www.engrassist.com
     - Path: /*
     - Redirect to: https://engrassist.com
     - Response Code: 301

4. **Alternative: Use Cloud CDN or Cloud Load Balancing**
   - Cloud CDN can handle these redirects automatically
   - Or use `gcloud compute url-maps` commands

#### Example gcloud commands (if using Load Balancer):

```bash
# Create a URL map with redirect rules
gcloud compute url-maps import engrassist-url-map \
    --source=url-map-config.yaml \
    --global

# Update the load balancer
gcloud compute target-http-proxies update engrassist-http-proxy \
    --url-map=engrassist-url-map
```

### 4. Verification Steps

After deploying these changes:

1. **Test URLs manually:**
   ```
   http://engrassist.com → https://engrassist.com ✓
   http://www.engrassist.com → https://engrassist.com ✓
   https://www.engrassist.com → https://engrassist.com ✓
   https://engrassist.com/index.html → https://engrassist.com/ ✓
   ```

2. **In Google Search Console:**
   - Wait 24-48 hours after deployment
   - Click "VALIDATE FIX" on each error
   - Google will re-crawl and verify within a few days

3. **Check canonical tags:**
   ```bash
   curl -I https://engrassist.com/about.html | grep canonical
   ```

## Summary of What Was Fixed

✅ **Canonical Tags**: All pages have proper canonical tags pointing to https://engrassist.com
✅ **Noindex Removed**: Removed from privacy.html and terms.html
✅ **GCS Config**: Created website configuration for index.html and 404.html
⚠️ **Redirects**: Need to be configured in Google Cloud Load Balancer (see instructions above)

## Next Steps

1. Apply the GCS website configuration (see command above)
2. Configure Load Balancer redirects for HTTP→HTTPS and www→non-www
3. Deploy updated HTML files to GCS bucket
4. Wait 24-48 hours
5. Validate fixes in Google Search Console
