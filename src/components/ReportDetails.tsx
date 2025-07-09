import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';

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

  useEffect(() => {
    const fetchReport = async () => {
      try {
        const res = await axios.get<Report>(`/api/interview/report/${id}`);
        setReport(res.data);
      } catch (err) {
        console.error('Failed to load report:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchReport();
  }, [id]);

  if (loading) return <div className="container p-5 text-center">Loading report...</div>;
  if (!report) return <div className="container p-5 text-danger">Report not found.</div>;

  return (
    <div className="container my-5">
      <h2 className="text-center mb-4">Full Interview Report</h2>
      <h4>Candidate Fit Score: {report.candidateFitScore}/100</h4>
      <p><strong>Job Description:</strong> {report.jobDescription}</p>

      <hr />
      <h5>Q&A</h5>
      {report.answers.map((answer, i) => (
        <div key={i} className="mb-3">
          <strong>Q{i + 1}:</strong> {answer.question}
          {answer.audio && <audio controls src={answer.audio} className="d-block my-2" />}
          <p><strong>Transcript:</strong> {answer.transcript || "N/A"}</p>
        </div>
      ))}

      <hr />
      <h5>Strengths</h5>
      <ul>{report.strengths.map((s, i) => <li key={i}>{s}</li>)}</ul>

      <h5>Improvements</h5>
      <ul>{report.improvementAreas.map((s, i) => <li key={i}>{s}</li>)}</ul>

      <h5>Suggested Follow-Ups</h5>
      <ul>{report.suggestedFollowUp.map((s, i) => <li key={i}>{s}</li>)}</ul>
    </div>
  );
};

export default ReportDetails;
