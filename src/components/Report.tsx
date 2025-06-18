/**
 * Report.tsx
 * ------------------------------------------------
 * Displays a final summary after the interview:
 * - Job Description (optional)
 * - Questions with audio + transcribed text
 * - Candidate fit score (mocked)
 * - Strengths, improvements, follow-up suggestions
 * ------------------------------------------------
 */

import React from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '../redux/store';

const Report: React.FC = () => {
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

        {/* Job Description */}
        <div className="mb-4">
          <h5 className="text-muted">Job Description</h5>
          <p className="text-secondary">{jd || 'No JD available'}</p>
        </div>

        {/* Questions + Audio + Transcript */}
        <div className="mb-4">
          <h5 className="text-muted mb-3">Interview Questions & Answers</h5>
          {questions.map((question, index) => {
            const answer = answers[index];
            return (
              <div key={index} className="mb-4">
                <strong>Q{index + 1}:</strong> {question}
                <div className="mt-2">
                  {answer ? (
                    <>
                      <audio controls src={answer.audio} className="mb-2" />
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

        {/* Final Message */}
        <div className="text-center mt-4">
          <p className="text-muted">Interview complete. Thank you!</p>
        </div>
      </div>
    </div>
  );
};

export default Report;
