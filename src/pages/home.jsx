import { useState, useEffect, useRef } from "react";
import "./home.css";

const STEPS = ["Details", "Job Info", "Resume", "Generate"];

function ResultCard({ icon, iconClass, name, desc, children, defaultOpen = false }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="rb-result-card">
      <div className="rb-result-head" onClick={() => setOpen(!open)}>
        <div className={`rb-result-icon ${iconClass}`}>{icon}</div>
        <div className="rb-result-meta">
          <div className="rb-result-name">{name}</div>
          <div className="rb-result-desc">{desc}</div>
        </div>
        <div className={`rb-chevron ${open ? "open" : ""}`}>▼</div>
      </div>
      {open && <div className="rb-result-body">{children}</div>}
    </div>
  );
}

function ATSGauge({ score }) {
  const num = parseInt(score?.match(/\d+/)?.[0]) || 0;
  const clamp = Math.min(100, Math.max(0, num));
  const circumference = 201;
  const offset = circumference - (circumference * clamp) / 100;
  const color = clamp >= 70 ? "#3ecf8e" : clamp >= 45 ? "#ffb347" : "#ff6b6b";
  const [animated, setAnimated] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setAnimated(true), 100);
    return () => clearTimeout(t);
  }, []);

  return (
    <div className="rb-ats-gauge">
      <div className="rb-gauge-ring">
        <svg className="rb-gauge-svg" viewBox="0 0 80 80">
          <circle className="rb-gauge-track" cx="40" cy="40" r="32" />
          <circle
            className="rb-gauge-fill"
            cx="40" cy="40" r="32"
            stroke={color}
            style={{ strokeDashoffset: animated ? offset : circumference }}
          />
        </svg>
        <div className="rb-gauge-label">
          <span className="rb-gauge-num" style={{ color }}>{animated ? clamp : 0}</span>
          <span className="rb-gauge-pct">/ 100</span>
        </div>
      </div>
      <div className="rb-gauge-info">
        <div className="rb-gauge-title" style={{ color }}>
          {clamp >= 70 ? "Strong Match ✓" : clamp >= 45 ? "Moderate Match" : "Needs Work"}
        </div>
        <div className="rb-gauge-bar-wrap">
          <div
            className="rb-gauge-bar"
            style={{ width: animated ? `${clamp}%` : "0%", background: color }}
          />
        </div>
      </div>
    </div>
  );
}

export default function HomePage() {
  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [parsedResponse, setParsedResponse] = useState(null);
  const [formData, setFormData] = useState({
    companyName: "",
    applyingAs: "",
    coverLetterTone: "",
    jobDescription: "",
    resume: "",
  });
  const resultsRef = useRef(null);

  const set = (key) => (e) => setFormData({ ...formData, [key]: e.target.value });

  const parseResponse = (text) => {
    // Clean markdown formatting
    const cleanText = (str) => {
      return str
        .replace(/\*\*/g, "")                    // Remove bold **
        .replace(/\*/g, "")                      // Remove italic *
        .replace(/#+\s/g, "")                    // Remove headers #
        .replace(/\|/g, "")                      // Remove table pipes |
        .replace(/---+/g, "")                    // Remove table separators ---
        .replace(/\[([^\]]+)\]\(([^)]+)\)/g, "$1") // Remove links
        .replace(/^\s*\n/gm, "\n")               // Remove empty lines
        .trim();
    };
    
    const coverLetterMatch = text.match(/1\.\s*Tailored Cover Letter\s*([\s\S]*?)(?=2\.|$)/i);
    const resumeMatch     = text.match(/2\.\s*Updated Resume Content\s*([\s\S]*?)(?=3\.|$)/i);
    const keywordMatch    = text.match(/3\.\s*Keyword Match Analysis\s*([\s\S]*?)(?=4\.|$)/i);
    const atsMatch        = text.match(/4\.\s*ATS Score Estimate.*?\s*([\s\S]*?)$/i);
    return {
      coverLetter:    cleanText(coverLetterMatch?.[1] || ""),
      resumeContent:  cleanText(resumeMatch?.[1] || ""),
      keywordAnalysis: cleanText(keywordMatch?.[1] || ""),
      atsScore:       cleanText(atsMatch?.[1] || ""),
    };
  };

  const handleResumeFileUpload = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      setLoading(true);
      const formDataToSend = new FormData();
      formDataToSend.append("file", file);

      // Send to backend for parsing
      const response = await fetch("http://localhost:5000/api/parse-resume", {
        method: "POST",
        body: formDataToSend,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to parse resume");
      }

      const result = await response.json();
      if (result.success) {
        setFormData({ ...formData, resume: result.text });
        alert("✅ Resume uploaded and parsed successfully!");
      } else {
        throw new Error(result.error || "Failed to parse resume");
      }
    } catch (error) {
      console.error("Error uploading resume:", error);
      alert(`❌ Error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  async function handleGenerate() {
    if (!formData.companyName || !formData.jobDescription) return;
    setLoading(true);
    setParsedResponse(null);

    const prompt = `You are a professional career coach and resume optimization expert.
Your task is to generate a personalized cover letter, improve the resume content, and provide an ATS analysis.

Company Name: ${formData.companyName}
Experience Level: ${formData.applyingAs}
Job Description: ${formData.jobDescription}
Current Resume: ${formData.resume || "(none provided)"}
Preferred Tone: ${formData.coverLetterTone}

Output clearly in sections:

1. Tailored Cover Letter
Write a professional cover letter addressed to ${formData.companyName}. Use tone: ${formData.coverLetterTone}.

2. Updated Resume Content
Suggest optimized resume summary, bullet points, and skills tailored to the job description. ATS-friendly.

3. Keyword Match Analysis
Extract important keywords from the job description. List which are in the resume and which are missing.

4. ATS Score Estimate (0–100)
Provide a rough ATS match score. Explain reasoning briefly.`;

    try {
      const res = await fetch(
        "https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-latest:generateContent",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "X-goog-api-key": import.meta.env.VITE_GEMINI_API_KEY,
          },
          body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] }),
        }
      );
      const result = await res.json();
      const text = result?.candidates?.[0]?.content?.parts?.[0]?.text || "";
      setParsedResponse(parseResponse(text));
      setTimeout(
        () => resultsRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }),
        100
      );
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

  const stepDone = (i) => {
    if (i === 0) return formData.companyName && formData.applyingAs && formData.coverLetterTone;
    if (i === 1) return !!formData.jobDescription;
    if (i === 2) return true;
    return false;
  };

  return (
    <div className="rb-root">
      <div className="rb-bg" />
      <div className="rb-grid" />
      <div className="orb orb1" />
      <div className="orb orb2" />
      <div className="orb orb3" />

      <div className="rb-wrap">

        {/* ── Hero ── */}
        <div className="rb-hero">
          <div className="rb-badge">
            <div className="rb-badge-dot" />
            AI-Powered Career Tools
          </div>
          <h1 className="rb-title">
            Craft Your<br /><em>Perfect Resume</em>
          </h1>
          <p className="rb-subtitle">
            Let AI tailor your cover letter, optimise your resume, and maximise your ATS score — in seconds.
          </p>
        </div>

        {/* ── Step Indicator ── */}
        <div className="rb-steps">
          {STEPS.map((s, i) => (
            <>
              <div
                key={s}
                className={`rb-step ${step === i ? "active" : ""} ${stepDone(i) && step !== i ? "done" : ""}`}
                onClick={() => setStep(i)}
              >
                <div className="rb-step-num">
                  {stepDone(i) && step !== i ? "✓" : i + 1}
                </div>
                <span className="rb-step-label">{s}</span>
              </div>
              {i < STEPS.length - 1 && (
                <div key={`line-${i}`} className={`rb-step-line ${stepDone(i) ? "filled" : ""}`} />
              )}
            </>
          ))}
        </div>

        {/* ── Form Card ── */}
        <div className="rb-card">

          {/* Step 0 — Details */}
          {step === 0 && (
            <div>
              <div className="rb-section">
                <div className="rb-section-title">Company & Role</div>
                <div className="rb-row">
                  <div className="rb-field">
                    <label className="rb-label">Company Name</label>
                    <input
                      className="rb-input"
                      placeholder="e.g. Google, Anthropic…"
                      value={formData.companyName}
                      onChange={set("companyName")}
                    />
                  </div>
                  <div className="rb-field">
                    <label className="rb-label">Experience Level</label>
                    <select className="rb-select" value={formData.applyingAs} onChange={set("applyingAs")}>
                      <option value="">Select level</option>
                      <option value="Fresher">Fresher</option>
                      <option value="Experienced">Experienced</option>
                    </select>
                  </div>
                </div>
              </div>

              <div className="rb-section">
                <div className="rb-section-title">Cover Letter Tone</div>
                <div className="rb-tone-pills">
                  {["Formal", "Informal", "Casual"].map((tone) => (
                    <button
                      key={tone}
                      type="button"
                      className={`rb-tone-pill ${formData.coverLetterTone === tone.toLowerCase() ? "active" : ""}`}
                      onClick={() => setFormData({ ...formData, coverLetterTone: tone.toLowerCase() })}
                    >
                      {tone}
                    </button>
                  ))}
                </div>
              </div>

              <div className="rb-btn-wrap">
                <button className="rb-btn" type="button" onClick={() => setStep(1)}>
                  <div className="rb-btn-shimmer" />
                  Continue →
                </button>
              </div>
            </div>
          )}

          {/* Step 1 — Job Description */}
          {step === 1 && (
            <div>
              <div className="rb-section">
                <div className="rb-section-title">Job Description</div>
                <div className="rb-field">
                  <label className="rb-label">Paste the full job description</label>
                  <textarea
                    className="rb-textarea"
                    style={{ minHeight: "200px" }}
                    placeholder="Paste the job description here. Include required skills, responsibilities, and qualifications…"
                    value={formData.jobDescription}
                    onChange={set("jobDescription")}
                  />
                  <span className="rb-hint">The more detail you provide, the better tailored your results will be.</span>
                </div>
              </div>
              <div className="rb-btn-wrap">
                <button className="rb-btn rb-btn-back" type="button" onClick={() => setStep(0)}>← Back</button>
                <button className="rb-btn" type="button" onClick={() => setStep(2)}>
                  <div className="rb-btn-shimmer" />
                  Continue →
                </button>
              </div>
            </div>
          )}

          {/* Step 2 — Resume */}
          {step === 2 && (
            <div>
              <div className="rb-section">
                <div className="rb-section-title">Current Resume</div>
                
                {/* File Upload */}
                <div className="rb-field">
                  <label className="rb-label">📄 Upload Resume File</label>
                  <div className="rb-file-upload">
                    <input
                      type="file"
                      accept=".pdf,.docx,.txt"
                      onChange={handleResumeFileUpload}
                      className="rb-file-input"
                      id="resume-file"
                      disabled={loading}
                    />
                    <label htmlFor="resume-file" className="rb-file-label">
                      {loading ? "⏳ Uploading & parsing..." : "📤 Click to upload PDF, Word, or Text file"}
                    </label>
                  </div>
                  <span className="rb-hint">Supported formats: PDF, DOCX, TXT (max 10MB)</span>
                </div>

                {/* Or Manual Input */}
                <div className="rb-field" style={{marginTop: "20px"}}>
                  <label className="rb-label">Or paste your resume manually</label>
                  <textarea
                    className="rb-textarea"
                    style={{ minHeight: "220px" }}
                    placeholder="Paste your resume content here — or leave blank and we'll draft one from the job description…"
                    value={formData.resume}
                    onChange={set("resume")}
                  />
                  <span className="rb-hint">Optional: if left blank, a resume draft will be generated for you.</span>
                </div>
              </div>
              <div className="rb-btn-wrap">
                <button className="rb-btn rb-btn-back" type="button" onClick={() => setStep(1)}>← Back</button>
                <button className="rb-btn" type="button" onClick={() => setStep(3)}>
                  <div className="rb-btn-shimmer" />
                  Review & Generate →
                </button>
              </div>
            </div>
          )}

          {/* Step 3 — Review */}
          {step === 3 && (
            <div>
              <div className="rb-section">
                <div className="rb-section-title">Review Your Inputs</div>
                <div className="rb-review-grid">
                  {[
                    { label: "Company",  val: formData.companyName      || "—" },
                    { label: "Level",    val: formData.applyingAs        || "—" },
                    { label: "Tone",     val: formData.coverLetterTone   || "—" },
                    { label: "Resume",   val: formData.resume ? "Provided ✓" : "Auto-generate" },
                  ].map(({ label, val }) => (
                    <div key={label} className="rb-review-item">
                      <div className="rb-review-label">{label}</div>
                      <div className="rb-review-val">{val}</div>
                    </div>
                  ))}
                </div>
              </div>
              <div className="rb-btn-wrap">
                <button className="rb-btn rb-btn-back" type="button" onClick={() => setStep(2)}>← Back</button>
                <button className="rb-btn" type="button" disabled={loading} onClick={handleGenerate}>
                  {!loading && <div className="rb-btn-shimmer" />}
                  {loading ? "Generating…" : "✦ Generate Now"}
                </button>
              </div>
            </div>
          )}
        </div>

        {/* ── Loading ── */}
        {loading && (
          <div className="rb-loading">
            <div className="rb-spinner" />
            <div className="rb-loading-text">Crafting your career documents…</div>
            <div className="rb-loading-dots">
              <span /><span /><span />
            </div>
          </div>
        )}

        {/* ── Results ── */}
        {parsedResponse && !loading && (
          <div className="rb-results" ref={resultsRef}>
            <div className="rb-divider">✦</div>
            <div className="rb-results-header">
              <h2 className="rb-results-title">Your <em>AI Results</em></h2>
              <p className="rb-results-sub">Click each section to expand</p>
            </div>

            <ResultCard
              icon="📄" iconClass="blue"
              name="Tailored Cover Letter"
              desc={`Personalised for ${formData.companyName} · ${formData.coverLetterTone} tone`}
              defaultOpen
            >
              {parsedResponse.coverLetter}
            </ResultCard>

            <ResultCard
              icon="📋" iconClass="green"
              name="Updated Resume Content"
              desc="ATS-optimised bullet points & summary"
            >
              {parsedResponse.resumeContent}
            </ResultCard>

            <ResultCard
              icon="🔍" iconClass="amber"
              name="Keyword Match Analysis"
              desc="Missing & matching keywords from the job description"
            >
              {parsedResponse.keywordAnalysis}
            </ResultCard>

            <ResultCard
              icon="📊" iconClass="red"
              name="ATS Score Estimate"
              desc="Estimated compatibility with applicant tracking systems"
            >
              <ATSGauge score={parsedResponse.atsScore} />
              {parsedResponse.atsScore}
            </ResultCard>
          </div>
        )}

      </div>
    </div>
  );
}