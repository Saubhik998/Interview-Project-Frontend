import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import api from '../api';

// Define the structure of each answer in the report
interface Answer {
  question: string;
  transcript: string;
  audio: string;
}

// Define the structure of the full report
interface Report {
  jobDescription: string;
  candidateFitScore: number;
  strengths: string[];
  improvementAreas: string[];
  suggestedFollowUp: string[];
  answers: Answer[];
}

const ReportDetails: React.FC = () => {
  // Extract the report ID from the URL params
  const { id } = useParams();

  // State to store the fetched report data
  const [report, setReport] = useState<Report | null>(null);

  // Loading state to handle asynchronous fetch status
  const [loading, setLoading] = useState(true);

  // Fetch the report when the component mounts or the ID changes
  useEffect(() => {
    const fetchReport = async () => {
      try {
        // API call to fetch report by ID
        const res = await api.get<Report>(`/interview/report/${id}`);
        setReport(res.data); // Save the report data to state
      } catch (err) {
        console.error('Failed to load report:', err); // Log any errors
      } finally {
        setLoading(false); // Always stop loading indicator
      }
    };

    fetchReport();
  }, [id]);

  // Show loading message while fetching data
  if (loading) return <div className="container p-5 text-center">Loading report...</div>;

  // Show error message if no report is found
  if (!report) return <div className="container p-5 text-danger">Report not found.</div>;

  // Render the full report
  return (
    <div className="container my-5">
      <h2 className="text-center mb-4">Full Interview Report</h2>

      {/* Candidate's evaluation score */}
      <h4>Candidate Fit Score: {report.candidateFitScore}/100</h4>

      {/* Job description used for interview */}
      <p><strong>Job Description:</strong> {report.jobDescription}</p>

      <hr />
      {/* List of all questions and answers */}
      <h5>Q&A</h5>
      {report.answers.map((answer, i) => (
        <div key={i} className="mb-3">
          <strong>Q{i + 1}:</strong> {answer.question}
          
          {/* Play recorded audio if available */}
          {answer.audio && <audio controls src={answer.audio} className="d-block my-2" />}

          {/* Transcript of the user's answer */}
          <p><strong>Transcript:</strong> {answer.transcript || "N/A"}</p>
        </div>
      ))}

      <hr />
      {/* List of strengths detected by AI */}
      <h5>Strengths</h5>
      <ul>{report.strengths.map((s, i) => <li key={i}>{s}</li>)}</ul>

      {/* Areas where improvement is needed */}
      <h5>Improvements</h5>
      <ul>{report.improvementAreas.map((s, i) => <li key={i}>{s}</li>)}</ul>

      {/* Follow-up questions recommended for further evaluation */}
      <h5>Suggested Follow-Ups</h5>
      <ul>{report.suggestedFollowUp.map((s, i) => <li key={i}>{s}</li>)}</ul>
    </div>
  );
};

export default ReportDetails;
