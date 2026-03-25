# ⚡ Setup Guide - Node.js LTS Upgrade Required

Your current Node version (**v10.24.1**) is too old for modern packages. You need to upgrade to at least **Node v16 LTS** (or later).

## 🚀 Step 1: Upgrade Node.js

### Option A: Using nvm (Node Version Manager) - RECOMMENDED
```powershell
# Install nvm-windows from: https://github.com/coreymc/nvm/releases
# After installation, in PowerShell:

nvm install 18.17.0
nvm use 18.17.0
node --version  # Should show v18.17.0
```

### Option B: Direct Download
1. Go to https://nodejs.org/en/
2. Download **LTS version** (18.x or 20.x recommended)
3. Run the installer
4. Restart your terminal

### Option C: Using Chocolatey (if installed)
```powershell
choco upgrade nodejs
```

---

## 🔄 Step 2: Reinstall Dependencies

After upgrading Node.js, clean and reinstall:

```powershell
cd "c:\Users\91767\OneDrive\Documents\Personal Projects\Ai Resume Builder\ai-powered-resume-builder"

# Clear npm cache
npm cache clean --force

# Remove node_modules and package-lock
rm -r node_modules
rm package-lock.json

# Reinstall everything
npm install
```

---

## 🎯 Step 3: Verify Installation

```powershell
node --version    # Should be v16 or higher
npm --version     # Should be v7 or higher
```

---

## ▶️ Step 4: Run the Project

### Terminal 1 - Start Backend:
```powershell
cd "c:\Users\91767\OneDrive\Documents\Personal Projects\Ai Resume Builder\ai-powered-resume-builder"
npm run server
```

Should output:
```
✅ Resume Parser Backend running on http://localhost:5000
```

### Terminal 2 - Start Frontend:
```powershell
cd "c:\Users\91767\OneDrive\Documents\Personal Projects\Ai Resume Builder\ai-powered-resume-builder"
npm run dev
```

Should output:
```
VITE v... ready in ... ms

➜  Local:   http://localhost:5173/
```

---

## 📱 Access the App

Open browser and go to: **http://localhost:5173**

---

## ✅ Troubleshooting

### Error: "Cannot find module 'node:events'"
- Node.js version is too old
- Follow Step 1 to upgrade

### Error: "Port 5000 already in use"
- Change port in `server.js` line 10
- Or kill existing process: `netstat -ano | findstr :5000`

### Error: "Module not found"
- Run `npm install` again
- Clear cache: `npm cache clean --force`

### Error: "CORS error"
- Ensure backend is running on port 5000
- Frontend must be on port 5173

---

## 🎉 You're All Set!

Once both servers are running:
1. Go to http://localhost:5173
2. Fill in company details
3. Add job description
4. Upload resume (PDF/DOCX/TXT)
5. Click Generate
6. View AI-generated results!

Happy job hunting! 🚀
