import React, { useEffect, useState } from 'react';
import api from '../api';
import { useSelector } from 'react-redux';
import { RootState } from '../redux/store';
import { useNavigate } from 'react-router-dom';

// Interface for one report as returned by the backend
interface ReportData {
  _id: string;
  jobDescription: string;
  candidateFitScore: number;
}

/*
  PastReports component
  Fetches and displays a list of interview reports for the logged-in user.
  Lets user click through to each full report page.
*/
const PastReports: React.FC = () => {
  // Read user email (for API) from Redux store
  const email = useSelector((state: RootState) => state.auth.email);

  // State to hold fetched reports, and loading status
  const [reports, setReports] = useState<ReportData[]>([]);
  const [loading, setLoading] = useState(true);

  // Navigation hook for programmatic routing
  const navigate = useNavigate();

  // On mount (and whenever email changes), fetch past interview reports for user
  useEffect(() => {
    const fetchReports = async () => {
      try {
        // Send GET request with email as query param to fetch reports
        const res = await api.get<ReportData[]>('/interview/reports', {
          params: { email },
        });
        setReports(res.data);
      } catch (err) {
        console.error('Failed to fetch past reports:', err);
      } finally {
        // Both success and failure will stop 'loading'
        setLoading(false);
      }
    };

    // Only fetch if email exists in redux (user must be logged in)
    if (email) fetchReports();
  }, [email]);

  // Show message if user is not logged in
  if (!email) {
    return (
      <div className="container p-5 text-center text-danger">
        Please log in to view reports.
      </div>
    );
  }

  // Show loading indicator while API call in progress
  if (loading) {
    return (
      <div className="container p-5 text-center">
        Loading past reports...
      </div>
    );
  }

  // Show fallback if no reports are found
  if (reports.length === 0) {
    return (
      <div className="container p-5 text-center text-warning">
        No reports found for {email}.
      </div>
    );
  }

  // Main display: map each report to a card with a 'View Full Report' button
  return (
    <div className="container my-5">
      <h3 className="text-center mb-4">
        Past Interview Reports
      </h3>

      {reports.map((report) => (
        <div key={report._id} className="card shadow-sm mb-4 p-4 border-0">
          <h6 className="text-muted mb-1">Job Description:</h6>
          {/* Show truncated JD, with full text as title on hover */}
          <p className="text-truncate mb-2" title={report.jobDescription}>
            {report.jobDescription}
          </p>

          <h6 className="text-primary mb-3">
            Candidate Fit Score: {report.candidateFitScore} / 100
          </h6>

          <div className="text-end">
            <button
              className="btn btn-outline-primary"
              // Navigate to the detailed report page with this report's id
              onClick={() => navigate(`/report/${report._id}`)}
            >
              View Full Report
            </button>
          </div>
        </div>
      ))}
    </div>
  );
};

export default PastReports;
