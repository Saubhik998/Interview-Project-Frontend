import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import api from '../api';

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

  if (loading)
    return <div className="container p-5 text-center text-light">Loading report...</div>;

  if (!report)
    return <div className="container p-5 text-center text-danger">Report not found.</div>;

  return (
    <div
      className="container d-flex justify-content-center align-items-center min-vh-100"
      style={{
        backgroundImage: 'url("/images/bg.png")',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      }}
    >
      <div
        className="shadow p-4 w-100 text-white"
        style={{
          backgroundColor: '#000000', // solid black background
          borderRadius: '8px',
          maxWidth: '850px',
        }}
      >
        <h2 className="text-center mb-4">Full Interview Report</h2>

        <h4>Candidate Fit Score: {report.candidateFitScore} / 100</h4>
        <p><strong>Job Description:</strong> {report.jobDescription}</p>

        <hr />
        <h5 className="mt-4">Q&A</h5>
        {report.answers.map((answer, i) => (
          <div key={i} className="mb-4">
            <p><strong>Q{i + 1}:</strong> {answer.question}</p>
            {answer.audio && (
              <audio controls src={answer.audio} className="d-block my-2" />
            )}
            <p><strong>Transcript:</strong> {answer.transcript || "N/A"}</p>
          </div>
        ))}

        <hr />
        <h5>Strengths</h5>
        <ul>
          {report.strengths.map((s, i) => (
            <li key={i}>{s}</li>
          ))}
        </ul>

        <h5>Areas of Improvement</h5>
        <ul>
          {report.improvementAreas.map((s, i) => (
            <li key={i}>{s}</li>
          ))}
        </ul>

        <h5>Suggested Follow-Ups</h5>
        <ul>
          {report.suggestedFollowUp.map((s, i) => (
            <li key={i}>{s}</li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default ReportDetails;
