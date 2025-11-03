# Cloudflare Migration Guide for EngrAssist

## Overview

This guide walks you through migrating from Google Cloud Load Balancer to Cloudflare CDN to reduce costs from ~$20-26/month to ~$0.01-0.50/month (98% savings).

### Cost Comparison

| Component | Current (GCP LB) | After (Cloudflare) | Savings |
|-----------|------------------|-------------------|---------|
| Load Balancer | $18-20/month | $0/month | $18-20/month |
| Bandwidth (Egress) | $2-6/month | $0/month | $2-6/month |
| GCS Storage | $0.02/month | $0.02/month | $0 |
| GCS Operations | $0.02/month | $0.01/month | $0.01/month |
| **Total** | **$20-26/month** | **$0.03-0.50/month** | **~$20-26/month** |

### Benefits of Cloudflare

- ✅ **Free unlimited bandwidth** (no egress charges)
- ✅ **Free SSL/TLS certificates** (automatic)
- ✅ **Global CDN** with 300+ data centers
- ✅ **Automatic compression** (Gzip, Brotli)
- ✅ **DDoS protection**
- ✅ **Automatic image optimization** (Cloudflare Polish - paid plans)
- ✅ **Better performance** for global users
- ✅ **Web Application Firewall** (WAF)
- ✅ **Analytics and insights**

---

## Prerequisites

Before starting, ensure you have:
- Access to your domain registrar (to update nameservers)
- Access to GCP Console
- GCS bucket already configured and public
- Current website working at https://engrassist.com

---

## Migration Steps

### Phase 1: Prepare GCS Bucket

#### 1.1 Verify Bucket Configuration

```bash
# Check bucket website configuration
gsutil web get gs://engrassist.com

# Expected output:
# Main page suffix: index.html
# Not found page: 404.html
```

#### 1.2 Ensure Bucket is Public

```bash
# Make bucket publicly readable
gsutil iam ch allUsers:objectViewer gs://engrassist.com

# Verify public access
gsutil iam get gs://engrassist.com
```

#### 1.3 Get Bucket Website URL

Your GCS bucket can be accessed at:
```
http://engrassist.com.storage.googleapis.com
```

Or:
```
https://storage.googleapis.com/engrassist.com
```

Test this URL in your browser to ensure it works.

---

### Phase 2: Set Up Cloudflare

#### 2.1 Create Cloudflare Account

1. Go to [cloudflare.com](https://www.cloudflare.com)
2. Sign up for a free account
3. Verify your email address

#### 2.2 Add Your Domain

1. Click "Add a site" in the Cloudflare dashboard
2. Enter `engrassist.com`
3. Select the **Free** plan ($0/month)
4. Click "Continue"

#### 2.3 Import Existing DNS Records

Cloudflare will scan your existing DNS records. You should see:

| Type | Name | Content | Proxy Status |
|------|------|---------|--------------|
| A | engrassist.com | (your current IP) | Proxied (orange cloud) |
| A | www | (your current IP) | Proxied (orange cloud) |

**Note**: Keep the orange cloud icon enabled (Proxied) for CDN benefits.

#### 2.4 Add CNAME to GCS Bucket

Replace or add these DNS records:

**For root domain (engrassist.com):**
```
Type: CNAME
Name: engrassist.com
Target: c.storage.googleapis.com
Proxy: ON (orange cloud)
TTL: Auto
```

**For www subdomain:**
```
Type: CNAME
Name: www
Target: c.storage.googleapis.com
Proxy: ON (orange cloud)
TTL: Auto
```

**Important**: Some DNS providers don't allow CNAME at root. If you get an error:

**Option A**: Use A records (workaround)
1. Get the IP addresses of `c.storage.googleapis.com`:
   ```bash
   dig c.storage.googleapis.com +short
   ```
2. Add A records for each IP address returned

**Option B**: Use Cloudflare Page Rules (recommended)
- Keep your existing A record
- Use a Page Rule to redirect to the GCS bucket (see Phase 3)

---

### Phase 3: Configure Cloudflare Settings

#### 3.1 SSL/TLS Settings

1. Go to **SSL/TLS** tab
2. Set SSL/TLS encryption mode to **Full** (not "Full (strict)")
   - Reason: GCS doesn't use a custom SSL certificate
3. Enable **Always Use HTTPS**
4. Enable **Automatic HTTPS Rewrites**

#### 3.2 Page Rules for GCS Integration

Create a Page Rule to route traffic to your GCS bucket:

1. Go to **Rules** → **Page Rules**
2. Click "Create Page Rule"

**Page Rule 1: Redirect www to non-www**
```
URL Match: www.engrassist.com/*
Setting: Forwarding URL
Status Code: 301 (Permanent Redirect)
Destination: https://engrassist.com/$1
```

**Page Rule 2: Serve from GCS Bucket** (if using A records)
```
URL Match: engrassist.com/*
Settings:
  - Host Header Override: engrassist.com.storage.googleapis.com
  - Resolve Override: c.storage.googleapis.com
```

Free plan includes 3 page rules - use them wisely!

#### 3.3 Caching Settings

1. Go to **Caching** tab
2. Set **Caching Level** to "Standard"
3. Set **Browser Cache TTL** to "Respect Existing Headers"
4. Enable **Tiered Caching** (free)

#### 3.4 Speed Optimizations

1. Go to **Speed** → **Optimization**
2. Enable these settings:
   - ✅ Auto Minify: CSS, JavaScript, HTML
   - ✅ Brotli compression
   - ✅ Early Hints (improves load time)
   - ✅ HTTP/2 to Origin
   - ✅ HTTP/3 (QUIC)

#### 3.5 Security Settings

1. Go to **Security** → **Settings**
2. Set **Security Level** to "Medium"
3. Enable **Bot Fight Mode** (free)
4. Enable **Challenge Passage**: 30 minutes

---

### Phase 4: Update Domain Nameservers

#### 4.1 Get Cloudflare Nameservers

In your Cloudflare dashboard, you'll see nameservers like:
```
ada.ns.cloudflare.com
lyle.ns.cloudflare.com
```

#### 4.2 Update at Your Domain Registrar

1. Log in to your domain registrar (e.g., Google Domains, Namecheap, GoDaddy)
2. Find DNS settings / Nameservers section
3. Change nameservers to Cloudflare's nameservers
4. Save changes

**Propagation time**: 2-24 hours (usually < 4 hours)

#### 4.3 Verify Nameserver Change

Check nameserver propagation:
```bash
dig NS engrassist.com +short
```

Expected output:
```
ada.ns.cloudflare.com.
lyle.ns.cloudflare.com.
```

Or use online tools:
- [whatsmydns.net](https://www.whatsmydns.net)
- [dnschecker.org](https://dnschecker.org)

---

### Phase 5: Configure GCS for Cloudflare

#### 5.1 Set Up CORS Headers (if needed)

If you have AJAX requests to your bucket:

```bash
cat > cors-config.json <<EOF
[
  {
    "origin": ["https://engrassist.com"],
    "method": ["GET", "HEAD"],
    "responseHeader": ["Content-Type", "Cache-Control"],
    "maxAgeSeconds": 3600
  }
]
EOF

gsutil cors set cors-config.json gs://engrassist.com
```

#### 5.2 Apply Cache Headers

Run the cache headers script:

```bash
chmod +x apply-cache-headers.sh
./apply-cache-headers.sh engrassist.com
```

This ensures browsers and Cloudflare cache your content optimally.

---

### Phase 6: Test and Validate

#### 6.1 Test Website Functionality

Visit these URLs and verify they work:
- https://engrassist.com
- https://engrassist.com/mechanical_page.html
- https://engrassist.com/ductulator.html
- https://engrassist.com/articles/load-calculation-basics.html

Test all your calculators:
- Load calculation calculator
- Ductulator
- Chiller sizing
- Etc.

#### 6.2 Check SSL Certificate

```bash
curl -I https://engrassist.com
```

Look for:
```
HTTP/2 200
cf-cache-status: HIT
cf-ray: ...
```

The `cf-cache-status: HIT` means Cloudflare is caching your content!

#### 6.3 Test Performance

Use these tools:
- [PageSpeed Insights](https://pagespeed.web.dev)
- [GTmetrix](https://gtmetrix.com)
- [WebPageTest](https://www.webpagetest.org)

You should see **significant improvements** in:
- First Contentful Paint (FCP)
- Largest Contentful Paint (LCP)
- Time to First Byte (TTFB)

#### 6.4 Verify Compression

```bash
curl -I -H "Accept-Encoding: br, gzip" https://engrassist.com/styles.css
```

Look for:
```
content-encoding: br
```

Or:
```
content-encoding: gzip
```

---

### Phase 7: Remove GCP Load Balancer (Cost Savings!)

**⚠️ IMPORTANT**: Only do this after verifying Cloudflare is working!

#### 7.1 Identify Load Balancer Components

```bash
# List forwarding rules
gcloud compute forwarding-rules list

# List backend buckets
gcloud compute backend-buckets list

# List URL maps
gcloud compute url-maps list

# List target proxies
gcloud compute target-http-proxies list
gcloud compute target-https-proxies list
```

#### 7.2 Delete Load Balancer (in order)

```bash
# Replace these names with your actual resource names

# 1. Delete forwarding rules
gcloud compute forwarding-rules delete engrassist-http-forwarding-rule --global
gcloud compute forwarding-rules delete engrassist-https-forwarding-rule --global

# 2. Delete target proxies
gcloud compute target-http-proxies delete engrassist-http-proxy
gcloud compute target-https-proxies delete engrassist-https-proxy

# 3. Delete URL map
gcloud compute url-maps delete engrassist-url-map

# 4. Delete backend bucket
gcloud compute backend-buckets delete engrassist-backend-bucket

# 5. Release static IP (if you reserved one)
gcloud compute addresses delete engrassist-ip --global
```

#### 7.3 Verify Deletion and Cost Reduction

1. Go to GCP Console → Billing → Reports
2. Filter by "Compute Engine"
3. Verify load balancer costs are gone
4. Expected monthly cost: **< $0.50** (just GCS storage + minimal operations)

---

## Phase 8: Cloudflare Advanced Optimizations

### 8.1 Configure Browser Cache TTL

Optimize cache rules per content type:

1. Go to **Caching** → **Configuration**
2. Create **Cache Rules**:

| URL Pattern | Edge Cache TTL | Browser Cache TTL |
|-------------|----------------|-------------------|
| `*.css` | 1 month | 1 year |
| `*.js` | 1 month | 1 year |
| `*.png` | 1 month | 1 year |
| `*.webp` | 1 month | 1 year |
| `*.html` | 1 hour | 1 day |

### 8.2 Purge Cache When Deploying

Add to your deployment workflow:

```bash
# Install cloudflare CLI
npm install -g cloudflare-cli

# Purge cache after deployment
cf-cli purge-cache --zone=engrassist.com
```

Or use Cloudflare API:
```bash
curl -X POST "https://api.cloudflare.com/client/v4/zones/{zone_id}/purge_cache" \
  -H "Authorization: Bearer {api_token}" \
  -H "Content-Type: application/json" \
  --data '{"purge_everything":true}'
```

### 8.3 Enable Analytics

1. Go to **Analytics & Logs**
2. Review traffic patterns
3. Identify most-accessed pages
4. Optimize those pages first

---

## Rollback Plan

If something goes wrong, you can quickly rollback:

### Option 1: Keep GCP Load Balancer (Safe)

Don't delete the load balancer until you're 100% confident Cloudflare is working.

### Option 2: Revert DNS

1. Change nameservers back to your original DNS provider
2. Wait for propagation (2-24 hours)
3. Your old setup will work again

### Option 3: Bypass Cloudflare

In Cloudflare DNS settings, click the orange cloud icon to turn it gray (DNS only). This disables CDN but keeps DNS working.

---

## Monitoring and Maintenance

### Daily Checks (First Week)

- [ ] Verify website is accessible
- [ ] Check all calculators work
- [ ] Monitor GCP billing for cost reduction
- [ ] Check Cloudflare analytics

### Weekly Checks

- [ ] Review Cloudflare analytics
- [ ] Check cache hit ratio (aim for >85%)
- [ ] Monitor Core Web Vitals in Google Search Console
- [ ] Verify SSL certificate is valid

### Monthly Tasks

- [ ] Compare GCP costs (should be <$0.50/month)
- [ ] Review Cloudflare security events
- [ ] Optimize cache rules based on analytics
- [ ] Update cache headers if needed

---

## Troubleshooting

### Issue: Website not loading

**Solution**:
1. Check nameserver propagation: `dig NS engrassist.com`
2. Verify bucket is public: `gsutil iam get gs://engrassist.com`
3. Check Cloudflare Page Rules are correct
4. Verify DNS records point to `c.storage.googleapis.com`

### Issue: SSL certificate errors

**Solution**:
1. Set SSL mode to "Full" (not "Full (strict)")
2. Wait 15 minutes for SSL to provision
3. Clear browser cache
4. Check Cloudflare SSL/TLS settings

### Issue: 404 errors for files

**Solution**:
1. Verify files exist in GCS: `gsutil ls gs://engrassist.com/`
2. Check file permissions are public
3. Purge Cloudflare cache
4. Verify bucket website config: `gsutil web get gs://engrassist.com`

### Issue: Changes not appearing

**Solution**:
1. Purge Cloudflare cache: Dashboard → Caching → Purge Everything
2. Check browser cache (hard refresh: Ctrl+Shift+R)
3. Verify files were uploaded to GCS
4. Check cache headers are correct

### Issue: High bandwidth costs still

**Solution**:
1. Verify Cloudflare proxy is ON (orange cloud)
2. Check cache hit ratio in analytics
3. Apply cache headers to GCS: `./apply-cache-headers.sh`
4. Verify Cloudflare is caching: `curl -I https://engrassist.com | grep cf-cache-status`

---

## Cost Tracking

### Before Migration
- Load Balancer: $18-20/month
- Bandwidth: $2-6/month
- Storage: $0.02/month
- **Total: ~$20-26/month**

### After Migration (Expected)
- Cloudflare: $0/month (Free plan)
- Storage: $0.02/month
- Bandwidth: ~$0/month (cached by Cloudflare)
- Operations: $0.01/month
- **Total: ~$0.03/month**

### Savings: ~$20-25/month = $240-300/year

---

## Additional Resources

- [Cloudflare Documentation](https://developers.cloudflare.com)
- [GCS Static Website Hosting](https://cloud.google.com/storage/docs/hosting-static-website)
- [Cloudflare Page Rules Guide](https://support.cloudflare.com/hc/en-us/articles/218411427)
- [Cloudflare Speed Optimizations](https://developers.cloudflare.com/speed)

---

## Support

If you encounter issues during migration:
1. Check Cloudflare Community: [community.cloudflare.com](https://community.cloudflare.com)
2. Review GCP documentation
3. Check this guide's troubleshooting section

---

**Last Updated**: 2025-11-03
**Estimated Migration Time**: 2-4 hours
**Estimated Downtime**: 0-10 minutes (during DNS propagation)
**Cost Savings**: ~$240-300/year
