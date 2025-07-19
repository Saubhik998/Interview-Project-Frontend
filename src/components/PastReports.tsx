import React, { useEffect, useState } from 'react';
import api from '../api';
import { useSelector } from 'react-redux';
import { RootState } from '../redux/store';
import { useNavigate } from 'react-router-dom';

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

  if (!email) {
    return (
      <div className="container p-5 text-center text-danger">
        Please log in to view reports.
      </div>
    );
  }

  if (loading) {
    return (
      <div className="container p-5 text-center">
        Loading past reports...
      </div>
    );
  }

  if (reports.length === 0) {
    return (
      <div className="container p-5 text-center text-warning">
        No reports found for {email}.
      </div>
    );
  }

  return (
    <div className="container my-5">
      <h3 className="text-center mb-4">
        Past Interview Reports
      </h3>

      {reports.map((report) => (
        <div key={report._id} className="card shadow-sm mb-4 p-4 border-0">
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
      ))}
    </div>
  );
};

export default PastReports;
