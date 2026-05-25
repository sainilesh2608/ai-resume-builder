const express = require("express");
const cors = require("cors");
const multer = require("multer");
const pdfParse = require("pdf-parse"); // ✅ FIXED
const mammoth = require("mammoth");
const fs = require("fs");
const path = require("path");

require('dotenv').config();
const app = express();

// Ensure fetch is available in Node (for older runtimes)
let fetchFn = global.fetch;
if (!fetchFn) {
  try {
    // node-fetch v2 exports a function
    fetchFn = require('node-fetch');
    global.fetch = fetchFn;
  } catch (e) {
    fetchFn = null;
  }
}
// Use a module-scoped `fetch` that falls back to global or the loaded node-fetch
const fetchClient = (typeof fetch !== 'undefined') ? fetch : (global.fetch || fetchFn || null);
const PORT = process.env.PORT || 5000; // ✅ FIXED

// Middleware
app.use(cors());
app.use(express.json());

// Multer setup for file uploads
const upload = multer({
  dest: "uploads/",
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: function(req, file, cb) {
    const allowedMimes = [
      "application/pdf",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      "text/plain",
    ];
    if (allowedMimes.includes(file.mimetype) || file.originalname.endsWith(".docx")) {
      cb(null, true);
    } else {
      cb(new Error("Invalid file type. Only PDF, DOCX, and TXT are allowed."));
    }
  },
});

// Parse text from PDF
function extractTextFromPDF(filePath) {
  return new Promise(function(resolve, reject) {
    fs.readFile(filePath, function(err, dataBuffer) {
      if (err) {
        return reject(new Error("PDF read error: " + err.message));
      }
      
      pdfParse(dataBuffer) // ✅ FIXED
        .then(function(data) {
          resolve(data.text);
        })
        .catch(function(error) {
          reject(new Error("PDF parsing error: " + error.message));
        });
    });
  });
}

// Parse text from DOCX
function extractTextFromDOCX(filePath) {
  return new Promise(function(resolve, reject) {
    mammoth.extractRawText({ path: filePath }).then(function(result) {
      resolve(result.value);
    }).catch(function(error) {
      reject(new Error("DOCX parsing error: " + error.message));
    });
  });
}

// Parse text from TXT
function extractTextFromTXT(filePath) {
  try {
    return Promise.resolve(fs.readFileSync(filePath, "utf8"));
  } catch (error) {
    return Promise.reject(new Error("TXT parsing error: " + error.message));
  }
}

// Resume parsing endpoint
app.post("/api/parse-resume", upload.single("file"), function(req, res) {
  if (!req.file) {
    return res.status(400).json({ error: "No file uploaded" });
  }

  const filePath = req.file.path;
  const fileName = req.file.originalname.toLowerCase();
  let extractionPromise;

  if (fileName.endsWith(".pdf") || req.file.mimetype === "application/pdf") {
    extractionPromise = extractTextFromPDF(filePath);
  } else if (
    fileName.endsWith(".docx") ||
    req.file.mimetype === "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
  ) {
    extractionPromise = extractTextFromDOCX(filePath);
  } else if (fileName.endsWith(".txt") || req.file.mimetype === "text/plain") {
    extractionPromise = extractTextFromTXT(filePath);
  } else {
    fs.unlinkSync(filePath);
    return res.status(400).json({ error: "Unsupported file type" });
  }

  extractionPromise.then(function(extractedText) {
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
    
    res.json({
      success: true,
      text: extractedText.trim(),
      message: "Resume parsed successfully",
    });
  }).catch(function(error) {
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
    console.error("Error:", error);
    res.status(500).json({
      success: false,
      error: error.message || "Error parsing resume",
    });
  });
});

// Health check endpoint
app.get("/api/health", function(req, res) {
  res.json({ status: "Backend is running" });
});

// Proxy endpoint to call Google Generative Language API server-side
app.post('/api/generate', async function (req, res) {
  try {
    const prompt = req.body?.prompt;
    if (!prompt) return res.status(400).json({ error: 'Missing prompt' });

    const apiKey = process.env.GEMINI_API_KEY || process.env.VITE_GEMINI_API_KEY;
    if (!apiKey) return res.status(500).json({ error: 'Server missing GEMINI API key' });

    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-latest:generateContent?key=${apiKey}`;

    if (!fetchClient) return res.status(500).json({ error: 'Server missing fetch implementation. Install node-fetch or use Node 18+' });

    const gRes = await fetchClient(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] }),
    });

    const data = await gRes.json();
    if (!gRes.ok) {
      return res.status(gRes.status).json({ error: data.error || data });
    }

    return res.json({ success: true, data });
  } catch (err) {
    console.error('Generate proxy error:', err);
    return res.status(500).json({ error: err.message || 'Internal server error' });
  }
});

// Root route
app.get("/", (req, res) => {
  res.send("Backend is running ✅");
});

// Start server
app.listen(PORT, function() {
  console.log("✅ Resume Parser Backend running on port " + PORT);
});