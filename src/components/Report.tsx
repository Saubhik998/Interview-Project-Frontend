/**
 * Report.tsx
 * ------------------------------------------------
 * Displays a final summary after the interview:
 * - Job Description (optional)
 * - Questions with audio answers
 * - Candidate fit score (mocked)
 * - Strengths, improvements, follow-up suggestions
 * ------------------------------------------------
 * Technologies: React, TypeScript, Bootstrap 5
 */

import React from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '../redux/store';

const Report: React.FC = () => {
  // Get data from Redux
  const { jd, questions, answers } = useSelector((state: RootState) => state.interview);

  // Mocked scoring and feedback
  const score = Math.floor(Math.random() * 41) + 60; // 60–100
  const strengths = ['Clear communication', 'Relevant experience', 'Positive tone'];
  const improvements = ['More structured answers', 'Add specific examples', 'Speak slightly slower'];
  const followUps = ['Ask about team collaboration', 'Clarify hands-on skills with tools'];

  return (
    <div className="container my-5">
      <div className="card shadow p-4">
        <h2 className="text-center mb-4">Interview Summary Report</h2>

        {/* Candidate Fit Score */}
        <div className="text-center mb-4">
          <h4>Candidate Fit Score</h4>
          <h1 className={`fw-bold ${score >= 75 ? 'text-success' : 'text-warning'}`}>{score} / 100</h1>
        </div>

        {/* Job Description (optional) */}
        <div className="mb-4">
          <h5 className="text-muted">Job Description</h5>
          <p className="text-secondary">{jd || 'No JD available'}</p>
        </div>

        {/* Questions and Answers with Audio */}
        <div className="mb-4">
          <h5 className="text-muted mb-3">Interview Questions & Answers</h5>
          {questions.map((question, index) => (
            <div key={index} className="mb-3">
              <strong>Q{index + 1}:</strong> {question}
              <div className="mt-2">
                {answers[index] ? (
                  <audio controls src={answers[index]} />
                ) : (
                  <span className="text-danger small">No answer recorded.</span>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Strengths */}
        <div className="mb-3">
          <h5 className="text-muted">Strengths</h5>
          <ul className="list-group">
            {strengths.map((item, idx) => (
              <li key={idx} className="list-group-item list-group-item-success">
                {item}
              </li>
            ))}
          </ul>
        </div>

        {/* Scope for Improvement */}
        <div className="mb-3">
          <h5 className="text-muted">Scope for Improvement</h5>
          <ul className="list-group">
            {improvements.map((item, idx) => (
              <li key={idx} className="list-group-item list-group-item-warning">
                {item}
              </li>
            ))}
          </ul>
        </div>

        {/* Suggested Follow-Ups */}
        <div className="mb-3">
          <h5 className="text-muted">Suggested Follow-Ups</h5>
          <ul className="list-group">
            {followUps.map((item, idx) => (
              <li key={idx} className="list-group-item list-group-item-info">
                {item}
              </li>
            ))}
          </ul>
        </div>

        {/* End Message */}
        <div className="text-center mt-4">
          <p className="text-muted">Interview complete. Thank you!</p>
        </div>
      </div>
    </div>
  );
};

export default Report;
