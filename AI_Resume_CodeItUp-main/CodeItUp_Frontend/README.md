# Gauntlet.io Frontend

A competitive social media resume upload platform built with React, TypeScript, and shadcn/ui.

## Project Description

Gauntlet.io is a platform that makes the tech sector MORE competitive. If you can't land the job, you can STILL climb the ladder. We're pulling the ladder back up.

### Features

- **Job Listings**: Browse job opportunities (Indeed-style interface)
- **Resume Upload**: Upload PDF resumes for AI analysis
- **Match Scoring**: AI analyzes resumes against job criteria to generate match scores
- **Competitive Rankings**: Users are ranked against each other based on match scores
- **Tier System**: Climb from Barista/McDonalds (Copper) to CEO (Champ)
- **Application Streaks**: Earn bonuses for consistent high rankings

### Rank Tiers

1. **Barista/McDonalds** (Copper)
2. **Intern** (Silver)
3. **Junior Dev** (Gold)
4. **Senior Dev** (Plat)
5. **Work From Home Managing Director** (Diamond)
6. **CEO** (Champ)

## Tech Stack

- **React 19** with TypeScript
- **Vite** for build tooling
- **shadcn/ui** for UI components
- **Tailwind CSS** for styling
- **React Router** for navigation
- **Lucide React** for icons

## Color Scheme

- **Primary**: Purple (`hsl(262 83% 58%)`)
- **Background**: White
- **Accents**: Black text and borders

## Getting Started

### Prerequisites

- Node.js 18+ and npm

### Installation

```bash
npm install
```

### Development

```bash
npm run dev
```

The app will be available at `http://localhost:5173`

### Build

```bash
npm run build
```

### Preview Production Build

```bash
npm run preview
```

## Project Structure

```
src/
├── components/
│   ├── ui/          # shadcn/ui components
│   └── Header.tsx   # Main navigation header
├── pages/
│   ├── Home.tsx     # Landing page
│   ├── Jobs.tsx     # Job listings page
│   ├── Upload.tsx   # Resume upload page
│   ├── Ladder.tsx   # Competitive rankings/ladder
│   └── Profile.tsx  # User profile page
├── lib/
│   └── utils.ts     # Utility functions
├── App.tsx          # Main app with routing
└── main.tsx         # Entry point
```

## Pages

- **/** - Landing page with hero section and feature overview
- **/jobs** - Browse and search job listings
- **/upload** - Upload PDF resume for analysis
- **/ladder** - View competitive rankings and leaderboard
- **/profile** - View your profile, match scores, and progress

## License

Private project
