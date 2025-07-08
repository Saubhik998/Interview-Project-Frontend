import React, { useEffect, useState } from 'react';
import axios from 'axios';
import html2pdf from 'html2pdf.js';

interface Answer {
  question: string;
  transcript?: string;
  audio?: string;
}

interface ReportData {
  jd: string;
  score: number;
  questions: string[];
  answers: Answer[];
  strengths: string[];
  improvements: string[];
  followUps: string[];
}

const Report: React.FC = () => {
  const [report, setReport] = useState<ReportData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchReport = async () => {
      try {
        const res = await axios.get<ReportData>('/api/interview/report');
        setReport(res.data);
      } catch (err) {
        console.error('Error fetching report:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchReport();
  }, []);

  const downloadPDF = () => {
    const element = document.getElementById('report-content');
    if (!element) return;

    const options = {
      margin:       0.5,
      filename:     'interview_report.pdf',
      image:        { type: 'jpeg', quality: 0.98 },
      html2canvas:  { scale: 2 },
      jsPDF:        { unit: 'in', format: 'letter', orientation: 'portrait' }
    };

    html2pdf().set(options).from(element).save();
  };

  if (loading) {
    return <div className="container p-5 text-center">Loading report...</div>;
  }

  if (!report) {
    return <div className="container p-5 text-center text-danger">Failed to load report.</div>;
  }

  return (
    <div className="container my-5">
      <div id="report-content" className="card shadow p-4">
        <h2 className="text-center mb-4">Interview Summary Report</h2>

        {/* Candidate Fit Score */}
        <div className="text-center mb-4">
          <h4>Candidate Fit Score</h4>
          <h1 className={`fw-bold ${report.score >= 75 ? 'text-success' : 'text-warning'}`}>
            {report.score} / 100
          </h1>
        </div>

        {/* Job Description */}
        <div className="mb-4">
          <h5 className="text-muted">Job Description</h5>
          <p className="text-secondary">{report.jd || 'No JD available'}</p>
        </div>

        {/* Questions + Audio + Transcript */}
        <div className="mb-4">
          <h5 className="text-muted mb-3">Interview Questions & Answers</h5>
          {report.questions.map((question, index) => {
            const answer = report.answers.find(a => a.question === question);
            return (
              <div key={index} className="mb-4">
                <strong>Q{index + 1}:</strong> {question}
                <div className="mt-2">
                  {answer ? (
                    <>
                      {answer.audio ? (
                        <audio controls src={answer.audio} className="mb-2" />
                      ) : (
                        <div className="text-muted">No audio available.</div>
                      )}
                      <p className="text-secondary">
                        <strong>Transcript:</strong>{' '}
                        {answer.transcript ? (
                          <span>{answer.transcript}</span>
                        ) : (
                          <span className="text-muted fst-italic">No transcript available.</span>
                        )}
                      </p>
                    </>
                  ) : (
                    <span className="text-danger small">No answer recorded.</span>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Strengths */}
        <div className="mb-3">
          <h5 className="text-muted">Strengths</h5>
          <ul className="list-group">
            {report.strengths?.map((item, idx) => (
              <li key={idx} className="list-group-item list-group-item-success">{item}</li>
            ))}
          </ul>
        </div>

        {/* Scope for Improvement */}
        <div className="mb-3">
          <h5 className="text-muted">Scope for Improvement</h5>
          <ul className="list-group">
            {report.improvements?.map((item, idx) => (
              <li key={idx} className="list-group-item list-group-item-warning">{item}</li>
            ))}
          </ul>
        </div>

        {/* Suggested Follow-Ups */}
        <div className="mb-3">
          <h5 className="text-muted">Suggested Follow-Ups</h5>
          <ul className="list-group">
            {report.followUps?.map((item, idx) => (
              <li key={idx} className="list-group-item list-group-item-info">{item}</li>
            ))}
          </ul>
        </div>

        {/* Final Message */}
        <div className="text-center mt-4">
          <p className="text-muted">Interview complete. Thank you!</p>
        </div>
      </div>

      {/* PDF Download Button */}
      <div className="text-center mt-4">
        <button className="btn btn-outline-primary" onClick={downloadPDF}>
          Download Report as PDF
        </button>
      </div>
    </div>
  );
};

export default Report;
