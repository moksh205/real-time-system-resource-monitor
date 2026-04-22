# Real-Time System Resource Monitor & Analyzer

## Description
A system that simulates and analyzes CPU, memory, disk usage, and processes in a modern operating-system style dashboard.

## Features
- Real-time CPU, memory, and disk simulation
- Live line and bar graphs powered by Chart.js
- Process management with add, kill, search, filter, sorting, and priority controls
- Smart analyzer rules for CPU, memory, disk, and heavy process detection
- Toast alert system with dangerous values highlighted in red
- Dark futuristic glassmorphism UI with neon highlights
- Dark/light toggle and smooth Framer Motion transitions

## Tech Stack
- React
- Vite
- Tailwind CSS
- Framer Motion
- Chart.js
- react-chartjs-2
- lucide-react

## Installation
```bash
npm install
npm run dev
```

## Usage
Open the local Vite URL after running the dev server. The dashboard updates every 1.5 seconds with realistic simulated resource pressure. Use Add to create a process, Kill to remove one instantly, Reset to restore the system, and the search/filter controls to inspect specific processes.

## Future Scope
- Persist simulation sessions in local storage
- Add disk process attribution and network throughput
- Export performance reports as CSV or PDF
- Add configurable alert thresholds
- Support multiple simulated machines or containers
