const express = require("express");
const cors = require("cors");
const multer = require("multer");
const PdfParse = require("pdf-parse");
const mammoth = require("mammoth");
const fs = require("fs");
const path = require("path");

const app = express();
const PORT = 5000;

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
      
      PdfParse(dataBuffer)
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
    // Clean up uploaded file
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
    
    res.json({
      success: true,
      text: extractedText.trim(),
      message: "Resume parsed successfully",
    });
  }).catch(function(error) {
    // Clean up file on error
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

// Start server
app.listen(PORT, function() {
  console.log("✅ Resume Parser Backend running on http://localhost:" + PORT);
  console.log("📁 Upload endpoint: POST http://localhost:" + PORT + "/api/parse-resume");
});
app.get("/", (req, res) => {
  res.send("Backend is running ✅");
});
