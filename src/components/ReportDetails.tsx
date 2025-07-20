import React, { useEffect, useState, useRef } from 'react';
import { useParams } from 'react-router-dom';
import api from '../api';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import '../css/ReportDetails.css';

interface Answer {
  question: string;
  transcript: string;
  audio: string;
}

interface Report {
  jobDescription: string;
  candidateFitScore: number;
  strengths: string[];
  improvementAreas: string[];
  suggestedFollowUp: string[];
  answers: Answer[];
}

const ReportDetails: React.FC = () => {
  const { id } = useParams();
  const [report, setReport] = useState<Report | null>(null);
  const [loading, setLoading] = useState(true);
  const reportRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchReport = async () => {
      try {
        const res = await api.get<Report>(`/interview/report/${id}`);
        setReport(res.data);
      } catch (err) {
        console.error('Failed to load report:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchReport();
  }, [id]);

  const handleDownload = async () => {
    if (!reportRef.current) return;
    const element = reportRef.current;
    const canvas = await html2canvas(element, { scale: 2 });
    const imgData = canvas.toDataURL('image/png');
    const pdf = new jsPDF({ orientation: 'portrait', unit: 'px', format: [canvas.width, canvas.height] });
    pdf.addImage(imgData, 'PNG', 0, 0, canvas.width, canvas.height);
    pdf.save(`Interview_Report_${id}.pdf`);
  };

  if (loading)
    return <div className="container p-5 text-center text-light">Loading report...</div>;

  if (!report)
    return <div className="container p-5 text-center text-danger">Report not found.</div>;

  return (
    <div className="container d-flex justify-content-center align-items-center min-vh-100"
         style={{ backgroundImage: 'url("/images/bg.png")', backgroundSize: 'cover', backgroundPosition: 'center' }}>
      <div className="shadow p-4 w-100 text-white" style={{ backgroundColor: '#000', borderRadius: '8px', maxWidth: '850px' }} ref={reportRef}>
        <h2 className="text-center mb-4">Full Interview Report</h2>
        <h4>Candidate Fit Score: {report.candidateFitScore} / 100</h4>
        <p><strong>Job Description:</strong> {report.jobDescription}</p>

        <hr />
        <h5 className="mt-4">Q&A</h5>
        {report.answers.map((answer, i) => (
          <div key={i} className="mb-4">
            <p className="report-question"><strong>Q{i + 1}:</strong> {answer.question}</p>
            {answer.audio && <audio controls src={answer.audio} className="d-block my-2" />}
            <p className="report-answer"><strong>Transcript:</strong> {answer.transcript || 'N/A'}</p>
          </div>
        ))}

        <div className="section-box section-strengths mb-4">
          <h5>Strengths</h5>
          <ul>{report.strengths.map((s, i) => <li key={i}>{s}</li>)}</ul>
        </div>
        <div className="section-box section-improvements mb-4">
          <h5>Areas of Improvement</h5>
          <ul>{report.improvementAreas.map((s, i) => <li key={i}>{s}</li>)}</ul>
        </div>
        <div className="section-box section-followup mb-4">
          <h5>Suggested Follow-Ups</h5>
          <ul>{report.suggestedFollowUp.map((s, i) => <li key={i}>{s}</li>)}</ul>
        </div>

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
