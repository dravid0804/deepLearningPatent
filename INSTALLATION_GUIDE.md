# ANT-EV 2.0 Installation & System Setup Guide

This guide provides step-by-step instructions for installing and running the **ANT-EV 2.0** application on any workstation or presentation laptop.

---

## 💻 System Prerequisites

Before running the software on a new machine, ensure the following prerequisites are installed:

| Component | Minimum Version | Recommended Version | Download Link |
|---|---|---|---|
| **Node.js** | v18.0.0 | v20.x or v22.x LTS | [https://nodejs.org/](https://nodejs.org/) |
| **npm** | v9.0.0 | v10.x+ | Included with Node.js |
| **Web Browser** | Modern HTML5 | Google Chrome, Microsoft Edge, Firefox, Safari | - |
| **Operating System** | - | Windows 10/11, macOS (Intel / Apple Silicon), Linux | - |

---

## 🚀 Quick Setup Instructions

### 1. Open Terminal or PowerShell
Navigate to the project root directory where the files are located:
```bash
cd /path/to/EVSTATION_DEEP
```

### 2. Install Project Dependencies
Run the package installation command:
```bash
npm install
```
*Note: This installs React, Vite, Lucide Icons, TailwindCSS, and all lightweight visualization utilities.*

### 3. Start Development Server
Launch the local web server:
```bash
npm run dev
```
You will see output similar to:
```
  VITE v5.x.x  ready in 350 ms

  ➜  Local:   http://localhost:5173/
  ➜  Network: use --host to expose
```

### 4. Open in Web Browser
Open your browser and navigate to:
**`http://localhost:5173`**

---

## ⚡ Windows One-Click Quickstart

On Windows systems, you can simply double-click the **`start.bat`** file located in the project root. It will automatically start the development server and keep the console open.

---

## 📦 Creating an Offline Production Package (For USB / Offline Defense)

If you need to demonstrate the software without an active internet connection or Node environment:

1. Run the build command:
   ```bash
   npm run build
   ```
2. This compiles the entire application into the **`dist/`** directory.
3. You can serve the static build using any simple HTTP server:
   - **Using Python**:
     ```bash
     python -m http.server 8080 --directory dist
     ```
   - **Using Node Preview**:
     ```bash
     npm run preview
     ```

---

## 🛠️ Troubleshooting

- **Port in use (`Error: listen EADDRINUSE: address already in use :::5173`)**:
  - Run with an alternate port: `npx vite --port 3000`
- **Node version too old**:
  - Check version with `node -v`. If below v18, please upgrade from [nodejs.org](https://nodejs.org).
- **Execution Policy Error in PowerShell on Windows**:
  - Run PowerShell as Administrator and execute: `Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser`
