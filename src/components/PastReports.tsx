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
  createdAt?: string; // Optional in case of legacy data
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
        setLoading(false);
      }
    };
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

  // Main display: map each report to a card with a 'View Full Report' button,
  // and sort so the most recent (largest createdAt) is first.
  return (
    <div className="container my-5">
      <h3 className="text-center mb-4">
        Past Interview Reports
      </h3>

      {[...reports]
        .sort((a, b) => {
          // Sort by createdAt descending. Legacy with no createdAt stay in original order after newest.
          if (!a.createdAt && !b.createdAt) return 0;
          if (!a.createdAt) return 1;
          if (!b.createdAt) return -1;
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        })
        .map((report) => {
          // Handle the case where createdAt might not be present (legacy data)
          let dateInfo = null;
          if (report.createdAt) {
            const dateObj = new Date(report.createdAt);
            const formattedDate = dateObj.toLocaleDateString();
            const formattedTime = dateObj.toLocaleTimeString();
            dateInfo = (
              <div className="mb-2 text-secondary fw-light small">
                <strong>Date:</strong> {formattedDate} &nbsp;|&nbsp;
                <strong>Time:</strong> {formattedTime}
              </div>
            );
          } else {
            dateInfo = (
              <div className="mb-2 text-secondary fw-light small">
                <strong>Date:</strong> Not Available
              </div>
            );
          }

          return (
            <div key={report._id} className="card shadow-sm mb-4 p-4 border-0">
              {dateInfo}

              <h6 className="text-muted mb-1">Job Description:</h6>
              <p className="text-truncate mb-2" title={report.jobDescription}>
                {report.jobDescription}
              </p>

              <h6 className="text-primary mb-3">
                Candidate Fit Score: {report.candidateFitScore} / 100
              </h6>

              <div className="text-end">
                <button
                  className="btn btn-outline-primary"
                  onClick={() => navigate(`/report/${report._id}`)}
                >
                  View Full Report
                </button>
              </div>
            </div>
          );
        })}
    </div>
  );
};

export default PastReports;
