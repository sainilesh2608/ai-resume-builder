# Deployment Guide - AI Resume Builder

## Security Best Practices

✅ **Your API key is already secure because:**
- The Gemini API key lives **only on the backend** (server-side)
- Frontend makes requests to your backend, never directly to Google
- The backend acts as a proxy (authentication gateway)

## Quick Deploy (Recommended)

### 1️⃣ Backend → Render.com (Free tier available)

```bash
# Prerequisites:
# - Push your code to GitHub (or use Render's Git integration)
# - Go to https://render.com and sign up

# In Render dashboard:
1. Click "New +" → "Web Service"
2. Connect your GitHub repo
3. Configure:
   - Name: ai-resume-parser (or your choice)
   - Root Directory: . (leave blank)
   - Build Command: npm install
   - Start Command: npm run server
   - Environment: Node
4. Click "Environment" tab → "Add Environment Variable"
   - Key: GEMINI_API_KEY
   - Value: YOUR_NEW_API_KEY (from Google AI Studio)
5. Deploy → Copy your backend URL (e.g., https://ai-resume-parser.onrender.com)
```

### 2️⃣ Frontend → Vercel (Free tier, recommended)

```bash
# Prerequisites:
# - Push your code to GitHub
# - Go to https://vercel.com and sign up

# In Vercel dashboard:
1. Click "Add New..." → "Project"
2. Import your GitHub repo
3. Configure:
   - Framework: Vite
   - Root Directory: . (default)
   - Build Command: npm run build
   - Output Directory: dist
4. Click "Environment Variables"
   - Add: VITE_API_BASE = https://ai-resume-parser.onrender.com
     (use your actual Render backend URL from step 1)
5. Deploy
```

### 3️⃣ Enable CORS on Backend

Update your `server.js` to allow your frontend domain:

```javascript
const cors = require("cors");

// In production, restrict to your frontend domain
const corsOptions = {
  origin: process.env.FRONTEND_URL || "*", // Set to your Vercel URL in production
  credentials: true,
};

app.use(cors(corsOptions));
```

Add to Render environment variables:
- `FRONTEND_URL` = `https://your-app.vercel.app`

---

## Environment Variables Summary

### Backend (.env file / Render environment)
```
GEMINI_API_KEY=YOUR_GOOGLE_API_KEY    # 🔒 Secret - server only
PORT=5000                              # Optional
FRONTEND_URL=https://your-app.vercel.app  # Optional - for CORS
```

### Frontend (.env.local file / Vercel environment)
```
VITE_API_BASE=https://your-backend.onrender.com  # Production only
```

---

## Local Development (No Changes Needed)

```bash
# 1. Create .env locally (copy from .env.example)
cp .env.example .env

# 2. Add your API key
# GEMINI_API_KEY=YOUR_KEY

# 3. Leave VITE_API_BASE empty (Vite proxy handles it)

# 4. Run both servers
npm run dev:full
```

---

## Alternative Hosting Options

| Platform | Backend | Frontend | Free Tier | Notes |
|----------|---------|----------|-----------|-------|
| **Render** | ✅ | ❌ | Yes (12hr uptime) | Simple, auto-deploys from Git |
| **Railway** | ✅ | ❌ | Yes ($5/mo) | Generous free tier |
| **Vercel** | ❌ | ✅ | Yes | Best for Vite apps |
| **Netlify** | ❌ | ✅ | Yes | Alternative to Vercel |
| **Fly.io** | ✅ | ✅ | Yes (3 shared-cpu) | Both on same platform |

---

## Troubleshooting

### "CORS error" or "Network error"
- Check that `VITE_API_BASE` in production matches your backend URL exactly
- Verify CORS is enabled on backend for your frontend domain
- Check browser DevTools → Network tab for actual request URL

### "Server missing GEMINI API key"
- Ensure `GEMINI_API_KEY` is set in your hosting platform's environment variables
- Don't use `.env` file in production - use the platform's UI/CLI

### API key keeps getting flagged as "leaked"
- If you commit your key to GitHub, Google detects it automatically
- Always use `.env` (gitignored) for local development
- Always use platform environment variables for production
- If key is leaked, generate a new one immediately

---

## Security Checklist

- [ ] API key never appears in frontend code
- [ ] API key never appears in version control (`.env` is gitignored)
- [ ] API key stored in production platform's secret manager
- [ ] Backend CORS configured to allow only your frontend domain
- [ ] `.env` file is in `.gitignore`
- [ ] Frontend `.env.local` is in `.gitignore`
- [ ] API key rotated after any accidental exposure

---

## Next Steps

1. Generate a new API key at https://aistudio.google.com/app/apikey
2. Test locally with `npm run dev:full`
3. Push to GitHub
4. Deploy backend to Render (10 min setup)
5. Deploy frontend to Vercel (5 min setup)
6. Set `VITE_API_BASE` environment variable in Vercel to your Render URL

Need help? Check the console logs on your hosting platform for errors.
