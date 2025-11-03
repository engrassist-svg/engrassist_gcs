# Website Backup - EngrAssist

**Backup Date:** November 3, 2025
**Total Files:** 77
**Total Size:** 18MB

## Contents

This backup contains a complete copy of the EngrAssist HVAC engineering website, including:

### Core Files
- **HTML Pages:** All main pages including calculators, tools, and informational content
- **Stylesheets:** styles.css - Main stylesheet for the website
- **JavaScript:** scripts.js, load_calculation.js, service-worker.js - Interactive functionality
- **Assets:** Favicons, icons, and configuration files

### Directories
- **articles/** - Technical articles about HVAC equipment (9 articles)
- **images/** - All image assets including logos, diagrams, and backgrounds
- **src/** - Source JavaScript files
- **build/** - Build scripts

### Configuration Files
- **sitemap.xml** - Website sitemap for search engines
- **robots.txt** - Search engine crawler instructions
- **ads.txt** - Advertising configuration
- **package.json** - Node.js package configuration
- **gcs-website-config.json** - Website-specific configuration

## How to Use This Backup

### Viewing the Website Locally

1. **Simple Method (Static Files):**
   - Open `index.html` in any web browser
   - Navigate through the site using the links

2. **Using a Local Web Server (Recommended):**
   ```bash
   # Using Python 3
   python3 -m http.server 8000

   # Using Python 2
   python -m SimpleHTTPServer 8000

   # Using Node.js (if http-server is installed)
   npx http-server -p 8000
   ```
   Then open http://localhost:8000 in your browser

### Deploying to a Web Host

1. Upload all files and folders to your web hosting service
2. Ensure the root directory contains `index.html`
3. Make sure your web server serves `.html` files
4. Configure your domain to point to the hosting location

### Important Notes

- This backup excludes Git repository files (.git directory)
- No sensitive credentials or API keys are included
- The website is fully static and doesn't require a database
- All calculators and tools work client-side using JavaScript

## File Structure

```
website-backup/
├── articles/               # HVAC technical articles
├── images/                 # Image assets
├── src/                    # Source files
├── build/                  # Build utilities
├── index.html              # Homepage
├── styles.css              # Main stylesheet
├── scripts.js              # Main JavaScript file
├── sitemap.xml             # SEO sitemap
├── robots.txt              # Crawler rules
└── [other HTML pages]      # Individual page files
```

## Pages Included

- Home (index.html)
- Calculators: Chiller, Boiler, Load Calculation, Pipe Sizing, Pump Sizing
- Tools: Ductulator, Interpolator, Psychrometric Chart, Air Balance
- Resources: ASHRAE Standards, Code Requirements, Equipment Specifications
- Articles: HVAC equipment guides and technical information
- Utility Pages: About, Contact, Terms, Privacy, 404

## Support

For questions about this backup or the website, refer to the original repository or contact the website administrator.
