# Order Book Visualizer

A web application that visualizes order book data from CSV files with YouTube-like playback controls.

## Features

- **CSV Upload** - Upload MBP-10 format order book data
- **Horizontal Bar Chart** - View current order book depth (bids/asks at each price level)
- **Historical Line Chart** - See price levels over time
- **Playback Controls** - Play, pause, stop, skip forward/back, adjust speed (0.5x - 10x)

## Tech Stack

- **Frontend**: React, TypeScript, Vite, Recharts
- **Backend**: Node.js, Express

## Getting Started

### Prerequisites

- Node.js (v18 or higher recommended)

### Installation

```bash
# Clone the repository
git clone <repo-url>
cd ProSights

# Install dependencies
npm install
```

### Running the App

You need to run both the backend server and the frontend dev server:

```bash
# Terminal 1 - Start the backend server (port 4000)
npm run server

# Terminal 2 - Start the frontend dev server (port 5173)
npm run dev
```

Then open http://localhost:5173 in your browser.

### Usage

1. Upload a CSV file using the upload button
2. Wait for processing (large files may take a moment)
3. Use the playback controls to navigate through the data:
   - **Play/Pause** - Start or pause automatic playback
   - **Stop** - Reset to beginning
   - **+100 / -100** - Skip forward or backward 100 ticks
   - **Speed** - Adjust playback speed (0.5x to 10x)
   - **Slider** - Scrub to any position

## CSV Format

The app expects MBP-10 (Market By Price, 10 levels) format with columns:
- `ts_event` - Timestamp
- `bid_px_00` through `bid_px_09` - Bid prices at each level
- `bid_sz_00` through `bid_sz_09` - Bid sizes at each level
- `ask_px_00` through `ask_px_09` - Ask prices at each level
- `ask_sz_00` through `ask_sz_09` - Ask sizes at each level

## Project Structure

```
ProSights/
├── server.js              # Express backend
├── App.tsx                # Main React component
├── OrderBookPlayer.tsx    # Player with charts and controls
├── HorizontalBarChart.tsx # Current order book depth
├── HistoricalLineChart.tsx# Price levels over time
├── PlaybackControls.tsx   # Playback UI controls
├── UploadCSV.tsx          # File upload component
└── package.json
```
