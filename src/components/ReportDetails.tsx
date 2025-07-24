import React, { useEffect, useState, useRef } from 'react';
import { useParams } from 'react-router-dom';
import api from '../api';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import '../css/ReportDetails.css';

// Answer interface - each includes question, transcript and audio URL
interface Answer {
  question: string;
  transcript: string;
  audio: string;
}

// Full report interface from backend
interface Report {
  jobDescription: string;
  candidateFitScore: number;
  strengths: string[];
  improvementAreas: string[];
  suggestedFollowUp: string[];
  answers: Answer[];
  createdAt?: string; // optional date
}

/*
  ReportDetails page shows a detailed report for a given interview session.
  Loads by report ID from the URL, displays results, and allows PDF download.
*/
const ReportDetails: React.FC = () => {
  // Get the report ID from react-router param
  const { id } = useParams();
  
  // Local state for report data and loading status
  const [report, setReport] = useState<Report | null>(null);
  const [loading, setLoading] = useState(true);
  // Ref for PDF export (DOM element)
  const reportRef = useRef<HTMLDivElement>(null);

  // On mount or if ID changes, fetch report from backend
  useEffect(() => {
    const fetchReport = async () => {
      try {
        // Get report by session/report ID
        const res = await api.get(`/interview/report/${id}`);
        setReport(res.data as Report);
      } catch (err) {
        console.error('Failed to load report:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchReport();
  }, [id]);

  /*
    Handle download as PDF:
    - Render current report section as image with html2canvas
    - Insert into jsPDF
    - Trigger PDF download
  */
  const handleDownload = async () => {
    if (!reportRef.current) return;
    const element = reportRef.current;
    const canvas = await html2canvas(element, { scale: 2 });
    const imgData = canvas.toDataURL('image/png');
    const pdf = new jsPDF({ orientation: 'portrait', unit: 'px', format: [canvas.width, canvas.height] });
    pdf.addImage(imgData, 'PNG', 0, 0, canvas.width, canvas.height);
    pdf.save(`Interview_Report_${id}.pdf`);
  };

  // Loading or fetch error states
  if (loading)
    return <div className="container p-5 text-center text-light">Loading report...</div>;

  if (!report)
    return <div className="container p-5 text-center text-danger">Report not found.</div>;

  // Format the date string (if present)
  const formattedDate = report.createdAt
    ? new Date(report.createdAt).toLocaleDateString('en-US', {
        year: 'numeric', month: 'short', day: 'numeric'
      })
    : null;

  // Main report render
  return (
    <div
      className="container d-flex justify-content-center align-items-center min-vh-100"
      style={{
        backgroundImage: 'url("/images/bg.png")',
        backgroundSize: 'cover',
        backgroundPosition: 'center'
      }}
    >
      <div
        className="shadow p-4 w-100 text-white"
        style={{
          backgroundColor: '#000',
          borderRadius: '8px',
          maxWidth: '850px'
        }}
        ref={reportRef}
      >
        <h2 className="text-center mb-4">Full Interview Report</h2>

        {/* Centered score and date */}
        <div style={{
          textAlign: 'center',
          fontWeight: 'bold',
          fontSize: '1.2rem',
          margin: '16px 0 4px 0'
        }}>
          Candidate Fit Score: {report.candidateFitScore} / 100
        </div>
        {formattedDate && (
          <div style={{
            textAlign: 'center',
            color: '#bbb',
            fontSize: '1rem',
            marginBottom: '16px'
          }}>
            Date: {formattedDate}
          </div>
        )}

        {/* Job Description */}
        <p><strong>Job Description:</strong> {report.jobDescription}</p>
        <hr />

        {/* Per question audio & transcript */}
        <h5 className="mt-4">Q&amp;A</h5>
        {report.answers.map((answer, i) => (
          <div key={i} className="mb-4">
            <p className="report-question"><strong>Q{i + 1}:</strong> {answer.question}</p>
            {/* Show audio if available */}
            {answer.audio && <audio controls src={answer.audio} className="d-block my-2" />}
            <p className="report-answer"><strong>Transcript:</strong> {answer.transcript || 'N/A'}</p>
          </div>
        ))}

        {/* Strengths section */}
        <div className="section-box section-strengths mb-4">
          <h5>Strengths</h5>
          <ul>{report.strengths.map((s, i) => <li key={i}>{s}</li>)}</ul>
        </div>

        {/* Improvement areas section */}
        <div className="section-box section-improvements mb-4">
          <h5>Areas of Improvement</h5>
          <ul>{report.improvementAreas.map((s, i) => <li key={i}>{s}</li>)}</ul>
        </div>

        {/* Suggested follow-up questions */}
        <div className="section-box section-followup mb-4">
          <h5>Suggested Follow-Ups</h5>
          <ul>{report.suggestedFollowUp.map((s, i) => <li key={i}>{s}</li>)}</ul>
        </div>

        {/* Download PDF button */}
        <div className="text-center">
          <button onClick={handleDownload} className="btn btn-primary mt-3">
            Download PDF
          </button>
        </div>
      </div>
    </div>
  );
};

export default ReportDetails;
