import React, { useEffect, useState } from 'react';
import api from '../api';
import html2pdf from 'html2pdf.js';

interface Answer {
  question: string;
  transcript?: string;
}

interface ReportData {
  jd: string;               // matches backend “jd”
  score: number;            // matches backend “score”
  questions: string[];      // matches backend “questions”
  answers: Answer[];        // matches backend “answers”
  strengths: string[];      // matches backend “strengths”
  improvements: string[];   // matches backend “improvements”
  followUps: string[];      // matches backend “followUps”
}

const Report: React.FC = () => {
  const [report, setReport] = useState<ReportData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const sessionId = localStorage.getItem('sessionId');
      if (!sessionId) {
        console.error('Session ID not found in localStorage');
        setLoading(false);
        return;
      }
      try {
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

  if (loading) {
    return <div className="container p-5 text-center">Loading report...</div>;
  }
  if (!report) {
    return <div className="container p-5 text-center text-danger">Failed to load report.</div>;
  }

  // Safe defaults
  const {
    jd,
    score,
    questions = [],
    answers = [],
    strengths = [],
    improvements = [],
    followUps = []
  } = report;

  return (
    <div className="container my-5">
      <div id="report-content" className="card shadow p-4">
        <h2 className="text-center mb-4">Interview Summary Report</h2>

        <div className="text-center mb-4">
          <h4>Candidate Fit Score</h4>
          <h1 className={`fw-bold ${score >= 75 ? 'text-success' : 'text-warning'}`}>
            {score} / 100
          </h1>
        </div>

        <div className="mb-4">
          <h5 className="text-muted">Job Description</h5>
          <p className="text-secondary">{jd}</p>
        </div>

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

        <div className="mb-3">
          <h5 className="text-muted">Strengths</h5>
          <ul className="list-group">
            {strengths.map((s, i) => (
              <li key={i} className="list-group-item list-group-item-success">{s}</li>
            ))}
          </ul>
        </div>

        <div className="mb-3">
          <h5 className="text-muted">Scope for Improvement</h5>
          <ul className="list-group">
            {improvements.map((imp, i) => (
              <li key={i} className="list-group-item list-group-item-warning">{imp}</li>
            ))}
          </ul>
        </div>

        <div className="mb-3">
          <h5 className="text-muted">Suggested Follow‑Ups</h5>
          <ul className="list-group">
            {followUps.map((f, i) => (
              <li key={i} className="list-group-item list-group-item-info">{f}</li>
            ))}
          </ul>
        </div>

        <div className="text-center mt-4">
          <p className="text-muted">Interview complete. Thank you!</p>
        </div>
      </div>

      <div className="text-center mt-4">
        <button className="btn btn-outline-primary" onClick={downloadPDF}>
          Download Report as PDF
        </button>
      </div>
    </div>
  );
};

export default Report;
