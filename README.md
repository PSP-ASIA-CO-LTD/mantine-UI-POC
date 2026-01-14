# Bourbon Mall - Operation Manager

A React frontend application for managing mall operations including packages, staff, teams, and assignments.

## Getting Started

### Prerequisites

- Node.js 18+ installed on your system
- npm or yarn package manager

### Installation

1. Install dependencies:
   ```bash
   npm install
   ```

2. Start the development server:
   ```bash
   npm run dev
   ```

3. Open your browser and go to:
   ```
   http://localhost:5173
   ```

### Building for Production

```bash
npm run build
```

The built files will be in the `dist` directory.

### Preview Production Build

```bash
npm run build
npm run preview
```

### Deploy to Production

#### Option 1: Static Hosting (Recommended)
Deploy to Vercel, Netlify, or GitHub Pages:

```bash
npm run build
# Then upload the `dist` folder to your hosting service
```

#### Option 2: Serve with Node.js
```bash
npm run build
# Serve the dist folder with any static file server
npx serve dist
```

#### Option 3: Serve with Python
```bash
npm run build
cd dist
python3 -m http.server 8080
```

## Project Structure

```
bourbon-44/
├── public/
│   └── data/          # CSV data files
├── src/
│   ├── api/           # API layer
│   ├── components/    # React components
│   ├── pages/         # Page components
│   ├── types/         # TypeScript types
│   ├── utils/         # Utility functions
│   ├── App.tsx        # Main app component
│   └── main.tsx       # Entry point
├── index.html
└── package.json
```

## Features

- **Dashboard** - Overview with stats and workload forecast
- **Packages** - Create and manage service packages
- **Staff** - View and manage staff members
- **Teams** - Manage teams and their assignments

## Tech Stack

- React 19
- TypeScript
- Vite
- Mantine UI
- React Router
- PapaParse (CSV parsing)
