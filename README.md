# Snagging List Report Writer

Professional new build defects reporting system for property inspectors and surveyors.

![Snagging List Report Writer](https://surveyingpeople01-blip.github.io/snagging-list-report-writer/)

## Features

- **Authentication** - Secure login (demo: admin/admin)
- **Dashboard** - View, filter, and search all reports
- **Report Editor** - 20 pre-defined rooms with snag management
- **Snag Items** - Location, description, priority (Critical/High/Medium/Low), status tracking
- **Photo Attachments** - Upload and preview photos for each snag
- **Auto-fill Templates** - Common defect descriptions for quick entry
- **PDF Export** - Professional branded reports
- **Local Storage** - Data persists in browser

## Tech Stack

- React 19 + TypeScript
- Vite
- Tailwind CSS
- jsPDF (PDF generation)
- Lucide React (icons)

## Quick Start

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build

# Deploy to GitHub Pages
npm run deploy
```

## Deployment

### GitHub Pages
The app is configured for GitHub Pages deployment:
```bash
npm run deploy
```

### Traditional Web Hosting
1. Run `npm run build`
2. Upload contents of `dist/` folder to your web hosting root
3. Ensure `index.html` is in the domain root

## License

© Surveying People. All rights reserved.
