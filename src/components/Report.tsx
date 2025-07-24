import React, { useEffect, useState } from 'react';
import api from '../api';
import html2pdf from 'html2pdf.js';

// Interface for one answer (question plus transcript)
interface Answer {
  question: string;
  transcript?: string;
}

// Interface for the whole report document returned by backend
interface ReportData {
  jd: string;            // job description string
  score: number;         // fit score
  questions: string[];   // all interview questions
  answers: Answer[];     // answers (transcripts) per question
  strengths: string[];   // top candidate strengths
  improvements: string[];// suggested improvements
  followUps: string[];   // follow-up questions
}

// Main Report page component.
// Loads session's report from backend on mount.
// Can download view as PDF.
const Report: React.FC = () => {
  // Report state: null until loaded; loading boolean
  const [report, setReport] = useState<ReportData | null>(null);
  const [loading, setLoading] = useState(true);

  // On mount, fetch report data for this session
  useEffect(() => {
    (async () => {
      // Session ID is stored in localStorage from interview
      const sessionId = localStorage.getItem('sessionId');
      if (!sessionId) {
        // Defensive: failed session, show error later
        console.error('Session ID not found in localStorage');
        setLoading(false);
        return;
      }
      try {
        // GET the report for this session
        const res = await api.get<ReportData>('/interview/report', {
          params: { sessionId }
        });
        setReport(res.data);
      } catch (err) {
        console.error('Error fetching report:', err);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  // Download button handler: saves visible report as a styled PDF using html2pdf.js
  const downloadPDF = () => {
    const element = document.getElementById('report-content');
    if (!element) return;
    html2pdf()
      .set({
        margin: 0.5,
        filename: 'interview_report.pdf',
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { scale: 2 },
        jsPDF: { unit: 'in', format: 'letter', orientation: 'portrait' }
      })
      .from(element)
      .save();
  };

  // While waiting for API, show a loading spinner
  if (loading) {
    return <div className="container p-5 text-center">Loading report...</div>;
  }
  // Defensive: null report or fetch failure
  if (!report) {
    return <div className="container p-5 text-center text-danger">Failed to load report.</div>;
  }

  // Destructure with safe defaults - prevents undefined crashes
  const {
    jd,
    score,
    questions = [],
    answers = [],
    strengths = [],
    improvements = [],
    followUps = []
  } = report;

  // Main report UI block
  return (
    <div className="container my-5">
      <div id="report-content" className="card shadow p-4">
        <h2 className="text-center mb-4">Interview Summary Report</h2>

        {/* Candidate score display */}
        <div className="text-center mb-4">
          <h4>Candidate Fit Score</h4>
          <h1 className={`fw-bold ${score >= 75 ? 'text-success' : 'text-warning'}`}>
            {score} / 100
          </h1>
        </div>

        {/* Job Description section */}
        <div className="mb-4">
          <h5 className="text-muted">Job Description</h5>
          <p className="text-secondary">{jd}</p>
        </div>

        {/* Q & A + transcript per question */}
        <div className="mb-4">
          <h5 className="text-muted mb-3">Interview Questions & Transcripts</h5>
          {questions.map((q, i) => (
            <div key={i} className="mb-4">
              <strong>Q{i + 1}:</strong> {q}
              <p className="text-secondary mt-2">
                <strong>Transcript:</strong>{' '}
                {answers[i]?.transcript ?? (
                  <span className="text-muted fst-italic">No transcript available.</span>
                )}
              </p>
            </div>
          ))}
        </div>

        {/* List of candidate strengths */}
        <div className="mb-3">
          <h5 className="text-muted">Strengths</h5>
          <ul className="list-group">
            {strengths.map((s, i) => (
              <li key={i} className="list-group-item list-group-item-success">{s}</li>
            ))}
          </ul>
        </div>

        {/* List of improvement suggestions */}
        <div className="mb-3">
          <h5 className="text-muted">Scope for Improvement</h5>
          <ul className="list-group">
            {improvements.map((imp, i) => (
              <li key={i} className="list-group-item list-group-item-warning">{imp}</li>
            ))}
          </ul>
        </div>

        {/* List of suggested follow up questions */}
        <div className="mb-3">
          <h5 className="text-muted">Suggested Follow-Ups</h5>
          <ul className="list-group">
            {followUps.map((f, i) => (
              <li key={i} className="list-group-item list-group-item-info">{f}</li>
            ))}
          </ul>
        </div>

        {/* Completion footer */}
        <div className="text-center mt-4">
          <p className="text-muted">Interview complete. Thank you!</p>
        </div>
      </div>

      {/* PDF Download button */}
      <div className="text-center mt-4">
        <button className="btn btn-outline-primary" onClick={downloadPDF}>
          Download Report as PDF
        </button>
      </div>
    </div>
  );
};

export default Report;
