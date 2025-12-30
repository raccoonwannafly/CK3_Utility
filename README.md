
# 👑 CK3 Royal Utility Suite

> *The ultimate companion tool for Crusader Kings III players, modders, and roleplayers.*

**CK3 Royal Utility** is a feature-rich web application designed to bridge the gap between technical game data (DNA strings, mod scripts) and immersive roleplay. Whether you are min-maxing a 400-point Ironman build, writing a dynasty's backstory, or deep-diving into DNA morphology for modding, this suite has a tool for you.

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![React](https://img.shields.io/badge/React-19-blue)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue)
![Vite](https://img.shields.io/badge/Vite-6.0-purple)

---

## ✨ Features

### 1. 🛡️ Character Trait Planner
- **Point Calculator**: Plan your Ruler Designer builds within the 400-point limit.
- **Filtering**: Easily find traits by category (Congenital, Education, Personality, etc.).
- **Conflict Detection**: Automatically handles incompatible traits (e.g., *Humble* vs *Arrogant*).

### 2. 🧙‍♂️ Character Sheet (Royal Advisor)
- **Roleplay Hub**: A dedicated space to finalize your character's biography, strategy, and dynasty motto.
- **Portrait Management**: Input an image URL to associate a visual portrait with your build.
- **DNA Storage**: Store your persistent DNA strings alongside your character's lore.

### 3. 🧬 DNA Forge & Manager
- **Visual Editor**: Manipulate individual gene sliders (Chin, Eyes, Nose, etc.) with a UI that mimics the in-game Ruler Designer logic.
- **DNA Conversion**: Instantly convert between **Persistent DNA** (Save File) and **Ruler Designer DNA** (Console).
- **Raw Byte Editor**: Fine-tune specific gene bytes (0-255) for precise control.

### 4. 🔬 Morph Lab (Comparator)
*A powerful tool for Modders.*
- **File Comparison**: Load and compare multiple Mod files (`.txt`) side-by-side.
- **Diff Highlighting**: Visual indicators for value differences (Green/Red).
- **Sweet Spot Mixing**: Mathematically blend two DNA sources to create natural genetic variations.
- **Patch Generation**: Export combined data as game-ready mod script files.

### 5. 🏛️ The Archives (Gallery)
- **Local Persistence**: Save your creations to your browser's local storage.
- **Steam Import**: Scrape character data directly from Steam Workshop URLs.
- **Export/Import**: Backup your entire character library to JSON.

---

## 🛠️ Tech Stack

- **Frontend**: React 19, TypeScript, Tailwind CSS (Custom "CK3 Glass" Theme)
- **Build Tool**: Vite
- **Backend**: Node.js, Express (For proxying Steam requests)
- **Icons**: Lucide React

---

## 🚀 Getting Started

### Prerequisites
- Node.js (v18+)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/ck3-royal-utility.git
   cd ck3-royal-utility
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure Environment**
   Create a `.env` file in the root directory:
   ```env
   PORT=3001
   ```

### Running the App

**Option A: Full Development (Frontend + Backend)**
You need two terminals.

Terminal 1 (Backend):
```bash
npm run server
```

Terminal 2 (Frontend):
```bash
npm run dev
```
*Open `http://localhost:5173` to view the app.*

**Option B: Production Build**
Build the frontend and serve it via the Express backend.

```bash
npm run build
npm start
```
*Open `http://localhost:3001` to view the app.*

---

## 📖 Usage Guide

### Using the Morph Lab (For Modders)
1. Navigate to the **Morph Lab** tab.
2. Click **"Reset & Load"** to upload your base `dna_morphs.txt` file (or paste a DNA string in the workbench).
3. Upload a second file to compare using **"Add Column"**.
4. Use the **"Mix Columns"** panel to blend values between two files.
5. Click the `⬇️` icon in a column header to export the result as a `.txt` file ready for `common/dna_data/`.

### Using the Character Sheet
1. Go to the **Trait Planner** and select your character's traits, culture, and religion.
2. Click **"Finalize Character"**.
3. Enter your backstory and paste your DNA string/Image URL to save to the Gallery.

---

## ⚠️ Disclaimer

This tool is an unofficial community utility. It is not affiliated with, endorsed, sponsored, or specifically approved by Paradox Interactive. Crusader Kings III is a trademark of Paradox Interactive.

---

## 📄 License

MIT License. See [LICENSE](LICENSE) for details.
