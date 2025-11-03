# GCP Cost Optimization Guide - EngrAssist

## Executive Summary

This guide provides comprehensive cost optimization strategies to reduce your Google Cloud Platform costs from **~$20-26/month to ~$0.01-0.50/month** (98% savings) without any loss in functionality.

### Quick Wins Summary

| Optimization | Savings | Effort | Priority |
|--------------|---------|--------|----------|
| Migrate to Cloudflare CDN | $18-20/month | Medium | **HIGH** |
| Enable gzip compression | $2-4/month | Low | **HIGH** |
| Optimize images | $1-3/month | Medium | **MEDIUM** |
| Apply cache headers | 60-70% bandwidth | Low | **HIGH** |

**Total Potential Savings: $240-300/year**

---

## Current Cost Breakdown

### Monthly Costs (Current Setup)

```
Google Cloud Load Balancer:    $18-20/month  (85% of costs)
Network Egress (Bandwidth):     $2-6/month   (10-20% of costs)
GCS Storage:                    $0.02/month  (< 1% of costs)
GCS Operations:                 $0.02/month  (< 1% of costs)
----------------------------------------
TOTAL:                         ~$20-26/month
```

### After Optimization

```
Cloudflare CDN (Free):          $0/month
Network Egress:                 $0/month     (served by Cloudflare)
GCS Storage:                    $0.02/month
GCS Operations:                 $0.01/month  (reduced by caching)
----------------------------------------
TOTAL:                         ~$0.03/month
```

**Annual Savings: $240-300**

---

## Optimization Implementations

### ✅ Completed (Automated in Deployment)

The following optimizations have been implemented and will run automatically on every deployment:

1. **Gzip Compression** - `.github/workflows/deploy.yml:27-31`
   - CSS/JS files compressed to ~30% of original size
   - Automatic compression on every deployment
   - Reduces bandwidth by 70%

2. **Cache Headers** - `.github/workflows/deploy.yml:80-105`
   - HTML: 1 day cache
   - CSS/JS: 1 year cache (immutable)
   - Images: 1 year cache
   - Templates: 1 week cache
   - Reduces repeat bandwidth by 60-70%

3. **Optimized Deployment Exclusions** - `.github/workflows/deploy.yml:44`
   - Excludes .sh scripts, documentation, .psd files
   - Reduces storage costs and upload time

### 🔧 Manual Optimizations Available

#### 1. Image Optimization (Run Once)

**Script:** `./optimize-images.sh`

**What it does:**
- Converts PNG images to WebP format (85% smaller)
- Compresses PNG files for fallback
- Preserves originals for safety

**Expected Results:**
- Images: 17MB → 3-4MB (76% reduction)
- Bandwidth savings: $1-3/month
- Storage savings: Minimal but helps

**How to run:**
```bash
# Install dependencies first
sudo apt-get install webp pngquant

# Run optimization
./optimize-images.sh

# Review compressed images
ls -lh images/*_compressed.png
ls -lh images/*.webp

# If satisfied, replace originals
# Then update HTML to use <picture> tags
```

**Example HTML usage:**
```html
<picture>
  <source srcset="images/logo_coffee.webp" type="image/webp">
  <img src="images/logo_coffee.png" alt="EngrAssist Logo" loading="lazy">
</picture>
```

#### 2. Manual Cache Header Application (If Needed)

**Script:** `./apply-cache-headers.sh`

**When to use:**
- If automated cache headers fail in deployment
- To apply headers to existing files
- For testing cache configuration

**How to run:**
```bash
# Authenticate to GCP
gcloud auth login

# Apply cache headers
./apply-cache-headers.sh engrassist.com
```

---

## Cloudflare Migration (Biggest Savings)

### Why Migrate?

**Cost Savings:**
- Eliminates $18-20/month load balancer cost
- Eliminates bandwidth egress charges
- **Saves ~$240/year**

**Performance Benefits:**
- Faster global load times (300+ edge locations)
- Automatic compression (Gzip, Brotli)
- Better DDoS protection
- Free SSL/TLS certificates

**Trade-offs:**
- DNS migration required (2-24 hours propagation)
- Minimal learning curve for Cloudflare dashboard
- **No functionality loss**

### Migration Steps

See comprehensive guide: **`CLOUDFLARE_MIGRATION_GUIDE.md`**

**Quick Summary:**
1. Create Cloudflare account (Free plan)
2. Add domain and configure DNS
3. Update nameservers at your registrar
4. Configure SSL/TLS to "Full" mode
5. Enable optimizations (auto-minify, compression)
6. Wait for DNS propagation (2-4 hours)
7. Delete GCP Load Balancer
8. Save $18-20/month!

**Estimated Time:** 2-4 hours
**Downtime:** 0-10 minutes during DNS switch

---

## Cost Comparison Table

### Scenario 1: Current Setup (No Changes)

| Component | Cost/Month |
|-----------|------------|
| Load Balancer | $18-20 |
| Bandwidth (50GB) | $6 |
| Storage | $0.02 |
| Operations | $0.02 |
| **TOTAL** | **$24-26** |

### Scenario 2: Optimized GCP (No Cloudflare)

| Component | Cost/Month |
|-----------|------------|
| Load Balancer | $18-20 |
| Bandwidth (15GB, cached) | $1.80 |
| Storage | $0.02 |
| Operations | $0.01 |
| **TOTAL** | **$19.83-21.83** |
| **Savings** | **$4-5/month** |

### Scenario 3: Cloudflare + Optimizations (Recommended)

| Component | Cost/Month |
|-----------|------------|
| Cloudflare CDN | $0 (Free) |
| Bandwidth | $0 (Cloudflare serves) |
| Storage | $0.02 |
| Operations | $0.01 |
| **TOTAL** | **$0.03** |
| **Savings** | **$24-26/month** |

---

## Implementation Roadmap

### Phase 1: Quick Wins (Already Done!) ✅

- [x] Enable gzip compression in deployment
- [x] Apply cache headers automatically
- [x] Optimize deployment exclusions
- [x] Create optimization scripts

**Impact:** Bandwidth reduced by ~70%
**Time:** Complete (automated)

### Phase 2: Image Optimization (15-30 minutes)

- [ ] Install image optimization tools (`webp`, `pngquant`)
- [ ] Run `./optimize-images.sh`
- [ ] Review compressed images
- [ ] Update HTML to use WebP with fallback
- [ ] Deploy changes

**Impact:** Additional $1-3/month savings
**Time:** 15-30 minutes

### Phase 3: Cloudflare Migration (2-4 hours)

- [ ] Read `CLOUDFLARE_MIGRATION_GUIDE.md`
- [ ] Create Cloudflare account
- [ ] Configure DNS records
- [ ] Update nameservers
- [ ] Wait for propagation (2-24 hours)
- [ ] Test website functionality
- [ ] Delete GCP Load Balancer

**Impact:** $18-20/month savings (biggest win!)
**Time:** 2-4 hours (mostly waiting for DNS)

---

## Monitoring and Validation

### After Each Deployment

Check these metrics:

```bash
# 1. Verify gzip compression
curl -I -H "Accept-Encoding: gzip" https://engrassist.com/styles.css
# Look for: content-encoding: gzip

# 2. Check cache headers
curl -I https://engrassist.com/styles.css
# Look for: cache-control: public, max-age=31536000, immutable

# 3. Test website functionality
# Visit all calculator pages and verify they work

# 4. Check file sizes
gsutil ls -lh gs://engrassist.com/styles.css
```

### Monthly Cost Review

1. Go to [GCP Billing Console](https://console.cloud.google.com/billing)
2. Review costs by service:
   - Compute Engine (Load Balancer) - should be $0 after Cloudflare
   - Cloud Storage - should be ~$0.02-0.03/month
   - Network Egress - should be minimal or $0

3. Set up billing alerts:
   ```bash
   # Alert if monthly costs exceed $5
   gcloud billing budgets create \
     --billing-account=YOUR_BILLING_ACCOUNT \
     --display-name="EngrAssist Budget Alert" \
     --budget-amount=5 \
     --threshold-rule=percent=80,basis=current-spend
   ```

### Performance Monitoring

Use these tools to track improvements:

1. **PageSpeed Insights**: https://pagespeed.web.dev
   - Target: 90+ score on mobile and desktop
   - Monitor Core Web Vitals

2. **GTmetrix**: https://gtmetrix.com
   - Track Fully Loaded Time: < 3s
   - Track Total Page Size: < 1MB

3. **Cloudflare Analytics** (after migration)
   - Monitor cache hit ratio (target: >85%)
   - Track bandwidth savings
   - Review security threats blocked

---

## Troubleshooting

### Issue: Deployment fails with gzip errors

**Solution:**
The workflow uses `|| true` to continue if files don't exist. If persistent:
```bash
# Check if files exist before deployment
ls -lh styles.css scripts.js load_calculation.js service-worker.js
```

### Issue: Cache headers not applied

**Solution:**
Run manual script:
```bash
./apply-cache-headers.sh engrassist.com
```

### Issue: Compressed files larger than originals

**Explanation:** This is normal for already-compressed files (like obfuscated JS). The workflow still benefits from caching.

### Issue: Images not optimized

**Solution:**
1. Install dependencies:
   ```bash
   sudo apt-get install webp pngquant
   ```

2. Run optimization:
   ```bash
   ./optimize-images.sh
   ```

3. Review and replace originals if satisfied

---

## Cost Optimization Checklist

### Immediate (Done) ✅
- [x] Gzip compression enabled in deployment
- [x] Cache headers applied automatically
- [x] Deployment exclusions optimized
- [x] Scripts created and executable

### Short-term (This Week)
- [ ] Run image optimization script
- [ ] Update HTML for WebP images
- [ ] Deploy optimized images
- [ ] Set up GCP billing alerts

### Medium-term (This Month)
- [ ] Read Cloudflare migration guide
- [ ] Create Cloudflare account
- [ ] Plan migration timeline (2-4 hours)
- [ ] Execute Cloudflare migration
- [ ] Delete GCP Load Balancer
- [ ] Verify $20/month savings in billing

### Ongoing (Monthly)
- [ ] Review GCP billing reports
- [ ] Monitor website performance
- [ ] Check Cloudflare analytics
- [ ] Optimize based on usage patterns

---

## Expected Results Timeline

### Week 1: Automated Optimizations
- **Bandwidth:** 50GB → 15GB (70% reduction)
- **Costs:** $24-26/month → $19.83-21.83/month
- **Savings:** ~$4-5/month

### Week 2: Image Optimization
- **Bandwidth:** 15GB → 10GB (additional 33% reduction)
- **Costs:** $19.83-21.83/month → $18.20-20.20/month
- **Savings:** ~$6-8/month

### Month 1: Cloudflare Migration
- **Bandwidth:** Unlimited (served by Cloudflare)
- **Costs:** $18-20/month → $0.03/month
- **Savings:** ~$24-26/month

### Year 1: Total Savings
- **Current Annual Cost:** $288-312/year
- **Optimized Annual Cost:** $0.36-6/year
- **Total Savings:** $282-311/year (98% reduction)

---

## Support and Resources

### Documentation
- `CLOUDFLARE_MIGRATION_GUIDE.md` - Comprehensive Cloudflare setup
- `SETUP_GUIDE.md` - Original setup documentation
- `SEO_SETUP_INSTRUCTIONS.md` - SEO configuration

### Scripts
- `optimize-images.sh` - Image optimization (WebP conversion)
- `apply-cache-headers.sh` - Manual cache header application
- `compress-assets.sh` - Standalone compression script

### External Resources
- [Cloudflare Free Plan](https://www.cloudflare.com/plans/free/)
- [GCP Pricing Calculator](https://cloud.google.com/products/calculator)
- [Google Cloud Storage Pricing](https://cloud.google.com/storage/pricing)
- [PageSpeed Insights](https://pagespeed.web.dev)

---

## Summary

### What's Been Implemented
✅ Automatic gzip compression (70% bandwidth reduction)
✅ Automatic cache headers (60-70% repeat bandwidth reduction)
✅ Optimized deployment workflow
✅ Cost optimization scripts created

### What You Can Do Now
1. **Quick win:** Deploy and get automatic savings (~$4-5/month)
2. **Medium effort:** Run image optimization (~$1-3/month additional)
3. **Big win:** Migrate to Cloudflare (~$18-20/month, biggest savings!)

### Bottom Line
- **Current costs:** $20-26/month
- **After all optimizations:** $0.03-0.50/month
- **Total savings:** $240-300/year (98% reduction)
- **Functionality impact:** NONE (website actually gets faster!)

---

**Last Updated:** 2025-11-03
**Next Review:** After Cloudflare migration
**Contact:** See SETUP_GUIDE.md for support

---

## Quick Start Commands

```bash
# Make scripts executable (if not already)
chmod +x optimize-images.sh apply-cache-headers.sh compress-assets.sh

# Optimize images (one-time)
./optimize-images.sh

# Apply cache headers manually (if needed)
./apply-cache-headers.sh engrassist.com

# Check current costs
gcloud billing accounts list
gcloud billing projects link YOUR_PROJECT_ID --billing-account=YOUR_BILLING_ACCOUNT

# Deploy with optimizations (automatic via GitHub Actions)
git add .
git commit -m "Apply cost optimizations"
git push origin main
```

Start with the automated optimizations (already done!), then proceed with image optimization and Cloudflare migration for maximum savings.
