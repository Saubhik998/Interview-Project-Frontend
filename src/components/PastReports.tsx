// PastReports component: Displays a list of previous interview reports for the logged-in user

import React, { useEffect, useState } from 'react';
import api from '../api'; // Custom axios instance
import { useSelector } from 'react-redux';
import { RootState } from '../redux/store';
import { useNavigate } from 'react-router-dom';

// Define the expected structure of each report
interface ReportData {
  _id: string;
  jobDescription: string;
  candidateFitScore: number;
}

const PastReports: React.FC = () => {
  const email = useSelector((state: RootState) => state.auth.email);
  const [reports, setReports] = useState<ReportData[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // Fetch past reports for the logged-in user
  useEffect(() => {
    const fetchReports = async () => {
      try {
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

  // Handle edge case: not logged in
  if (!email) {
    return (
      <div className="container p-5 text-danger text-center">
        Please log in to view reports.
      </div>
    );
  }

  // Handle loading state
  if (loading) {
    return (
      <div className="container p-5 text-center">
        Loading past reports...
      </div>
    );
  }

  // Handle empty report list
  if (reports.length === 0) {
    return (
      <div className="container p-5 text-center text-warning">
        No reports found for {email}.
      </div>
    );
  }

  // Render list of reports
  return (
    <div className="container my-5">
      <h2 className="text-center mb-4">
        Past Interview Reports for {email}
      </h2>

      {reports.map((report) => (
        <div key={report._id} className="card shadow mb-4 p-4">
          <h6 className="text-muted">Job Description:</h6>
          <p className="text-truncate" title={report.jobDescription}>
            {report.jobDescription}
          </p>

          <h6 className="text-primary">
            Candidate Fit Score: {report.candidateFitScore} / 100
          </h6>

          <div className="text-end mt-3">
            <button
              className="btn btn-outline-primary"
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
