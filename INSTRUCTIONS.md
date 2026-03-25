# 🚀 AI-Powered Resume Builder

A complete full-fledged web application that helps users create optimized cover letters and resumes using AI. It features automatic resume parsing, keyword analysis, and ATS scoring.

## 📋 Project Structure

```
ai-powered-resume-builder/
├── src/
│   ├── pages/
│   │   ├── home.jsx          # Main React component
│   │   └── home.css          # Styling
│   ├── App.jsx               # App wrapper
│   ├── main.jsx              # React entry point
│   └── index.css             # Global styles
├── server.js                 # Express backend server
├── package.json              # Dependencies & scripts
├── vite.config.js            # Vite configuration
├── index.html                # HTML template
├── uploads/                  # Temporary resume uploads
└── .env.local                # API keys (gitignored)
```

## 🛠️ Tech Stack

### Frontend
- **React 19** - UI framework
- **Vite** - Build tool
- **Bootstrap CSS** - Styling components

### Backend
- **Node.js + Express** - API server
- **Multer** - File upload handling
- **pdf-parse** - PDF text extraction
- **Mammoth** - Word document parsing
- **CORS** - Cross-origin requests

### AI
- **Google Gemini API** - Cover letter & resume generation

## 📦 Installation

### 1. Clone/Setup Project
```bash
cd "c:\Users\91767\OneDrive\Documents\Personal Projects\Ai Resume Builder\ai-powered-resume-builder"
```

### 2. Install Dependencies
```bash
npm install
```

## 🚀 Running the Project

### Option 1: Run Frontend + Backend Together (Recommended)
```bash
npm run dev:full
```

This will start:
- **Backend Server**: `http://localhost:5000`
- **Frontend App**: `http://localhost:5173`

### Option 2: Run Separately

**Terminal 1 - Backend:**
```bash
npm run server
```

**Terminal 2 - Frontend:**
```bash
npm run dev
```

## ✨ Features

### 1. **Resume File Upload**
- Upload PDF, DOCX, or TXT files
- Automatic text extraction via backend
- No client-side parsing errors

### 2. **AI-Generated Results**
- **Tailored Cover Letter** - Professional cover letter customized to job
- **Resume Optimization** - Improved resume content with better formatting
- **Keyword Analysis** - Identifies important keywords and missing skills
- **ATS Score** - Estimates how well resume matches job description (0-100)

### 3. **Multi-Step Form**
- Step 1: Company details & tone
- Step 2: Job description
- Step 3: Resume upload or manual input
- Step 4: Review & Generate

### 4. **Results Display**
- Expandable result cards
- Color-coded sections
- Smooth animations
- ATS gauge visualization

## 📝 Environment Variables

Create `.env.local`:
```
VITE_GOOGLE_API_KEY=AIzaSyAA6DQltUIZo5X8FuspirCPVJ5AeK2sDeM
```

## 🔧 API Endpoints

### POST `/api/parse-resume`
Upload and parse a resume file.

**Request:**
```
Content-Type: multipart/form-data
Body: file (PDF, DOCX, or TXT)
```

**Response:**
```json
{
  "success": true,
  "text": "extracted resume content...",
  "message": "Resume parsed successfully"
}
```

### GET `/api/health`
Check if backend is running.

## 🐛 Troubleshooting

### Backend not connecting
- Ensure backend is running: `npm run server`
- Check if port 5000 is available
- Try restarting both servers

### Resume parsing fails
- Verify file format (PDF, DOCX, TXT only)
- Check file size (max 10MB)
- Try a different resume file

### API key issues
- Verify `.env.local` exists with valid API key
- Check if API key is active in Google Cloud

## 📚 How to Use

1. **Fill Company Details**
   - Enter company name
   - Select experience level (Fresher/Experienced)
   - Choose cover letter tone

2. **Add Job Description**
   - Paste job description from job posting

3. **Upload Resume**
   - Click upload area and select PDF/DOCX/TXT
   - Or manually paste resume content

4. **Generate Results**
   - Click "Review & Generate"
   - Wait for AI to process
   - Download or copy results

## 🎨 UI Features

- **Dark theme** for easy viewing
- **Smooth animations** and transitions
- **Responsive design** for all devices
- **Expandable cards** to manage content
- **ATS gauge** with color-coded scoring

## 📈 Next Steps (Optional Enhancements)

- [ ] Download results as PDF
- [ ] Email results directly
- [ ] Save projects to database
- [ ] User authentication
- [ ] History of generated resumes
- [ ] Multiple language support
- [ ] Advanced ATS analysis

## 🤝 Support

For issues or questions, check:
1. Ensure both servers are running
2. Check browser console for errors
3. Verify API key is valid
4. Clear browser cache if needed

---

**Created with ❤️ for job seekers everywhere**
