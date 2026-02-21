# SketchRace 🎨

A multi-player drawing and guessing game built with React, Colyseus (WebSocket), and Konva.

## Features
- **Artistic Sketch Theme**: A unique, hand-drawn sketchbook aesthetic with watercolor colors and paper textures.
- **Team-based Gameplay**: Blue and Green teams compete to guess the most drawings.
- **Steal Mechanic**: If the drawing team fails, the other team gets a chance to "steal" the points.
- **Interactive Canvas**: Real-time drawing with various tools (Pen, Eraser, Undo).

## Project Structure
- `/my-client`: Vite + React + Tailwind CSS + Konva (Frontend)
- `/my-server`: Node.js + Colyseus (Backend)

## Getting Started

### Prerequisites
- Node.js (v18+)
- npm or yarn

### Installation

1. Clone the repository.
2. Install dependencies for both parts:
   ```bash
   # Client
   cd my-client && npm install
   # Server
   cd ../my-server && npm install
   ```

### Running Locally

1. Start the server (port 2567):
   ```bash
   cd my-server && npm run start
   ```
2. Start the client (dev server):
   ```bash
   cd my-client && npm run dev
   ```

## License
MIT
