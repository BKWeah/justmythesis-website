# JUSTmyTHESIS Website

An interactive card-style brochure website for JUSTmyTHESIS - Academic Research, Thesis Development Support & Research Coaching.

## Overview

This is a static interactive brochure website built with Next.js, TypeScript, and Tailwind CSS. It presents JUSTmyTHESIS services one page at a time, guiding visitors to contact us for a FREE Project Assessment.

## Features

- Card-Style Navigation: Full-screen card experience with smooth transitions
- Mobile-First Design: Optimized for all screen sizes
- Keyboard Navigation: Left/Right arrow keys to navigate
- Touch/Swipe Support: Swipe left/right on mobile devices
- Premium Styling: Navy blue, gold, and white color palette
- Progress Indicator: Visual page tracker with dots
- WhatsApp CTA: Direct contact via WhatsApp on the final page

## Tech Stack

- Framework: Next.js 14 (App Router)
- Language: TypeScript
- Styling: Tailwind CSS
- Deployment: Vercel-ready

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn

### Installation

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build

# Start production server
npm start
```

## Project Structure

```
├── src/
│   ├── app/
│   │   ├── layout.tsx      # Root layout with metadata
│   │   ├── page.tsx        # Main page with navigation logic
│   │   └── globals.css     # Global styles
│   ├── components/
│   │   ├── BrochureCard.tsx       # Individual card component
│   │   └── NavigationControls.tsx  # Navigation buttons & progress
│   └── data/
│       └── brochurePages.ts # Content for all 6 pages
├── public/
│   └── images/
│       ├── logo/jmt-logo.png
│       ├── hero-students.jpg
│       ├── academic-support.jpg
│       ├── research-workspace.jpg
│       ├── thesis-defense.jpg
│       ├── research-process.jpg
│       └── graduate-success.jpg
└── ...
```

## Pages

1. Front Cover - Hero section with main value proposition
2. Who We Are - Company background and mission
3. Service Packages (Part 1) - Packages A, B, C
4. Service Packages (Part 2) - Packages D, E, F, G
5. Service Process - 6-step process explanation
6. Pricing & Contact - Contribution guide and contact information

## Contact Information

- Phone/WhatsApp: +231776732989
- Email: kontentkingkong@gmail.com
- Location: Monrovia, Liberia

## License

ISC
