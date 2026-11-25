import React from 'react';
import {
  X,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  HelpCircle,
  Award,
  Calendar,
  Building,
  GraduationCap,
  Compass,
} from 'lucide-react';
import { ELIGIBILITY_STATUS } from '../../utils/eligibilityEvaluator';

export default function RequirementComparisonModal({ evaluatedRecord, onClose }) {
  if (!evaluatedRecord) return null;

  const { scholarship, status, readinessScore, explanation } = evaluatedRecord;
  const isEligible = status === ELIGIBILITY_STATUS.ELIGIBLE;
  const isPotentially = status === ELIGIBILITY_STATUS.POTENTIALLY_ELIGIBLE;

  return (
    <div className="eval-modal-overlay" onClick={onClose} role="dialog" aria-modal="true">
      <div className="eval-modal-content" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="eval-modal-header">
          <div>
            <div style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--slate-500)', textTransform: 'uppercase' }}>
              {scholarship.provider}
            </div>
            <h3 style={{ fontSize: '1.35rem', fontWeight: 800, color: 'var(--slate-900)', marginTop: '0.2rem' }}>
              {scholarship.name}
            </h3>
          </div>

          <button
            type="button"
            className="eval-modal-close-btn"
            onClick={onClose}
            aria-label="Close modal"
          >
            <X size={20} />
          </button>
        </div>

        {/* Body */}
        <div className="eval-modal-body">
          {/* Status Alert Banner */}
          <div
            className={`eval-card-explanation ${
              isEligible ? 'is-eligible' : isPotentially ? 'is-potentially' : 'is-ineligible'
            }`}
            style={{ borderRadius: 'var(--radius-md)', padding: '1rem 1.25rem' }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.35rem' }}>
              {isEligible && <CheckCircle2 size={20} color="var(--emerald-600)" />}
              {isPotentially && <AlertTriangle size={20} color="var(--amber-600)" />}
              {!isEligible && !isPotentially && <XCircle size={20} color="#ef4444" />}
              <span style={{ fontSize: '1rem', fontWeight: 800 }}>
                {isEligible
                  ? 'Eligible — All Requirements Met'
                  : isPotentially
                  ? 'Potentially Eligible — Pending Verifications or Reachable Cutoff'
                  : 'Not Eligible — Mandatory Criteria Unmet'}
              </span>
            </div>
            <p style={{ margin: 0 }}>{explanation.narrativeExplanation}</p>
            {explanation.actionableGuidance && (
              <p style={{ marginTop: '0.5rem', fontWeight: 600, fontSize: '0.825rem' }}>
                💡 Action Item: {explanation.actionableGuidance}
              </p>
            )}
          </div>

          {/* Quick Metrics */}
          <div className="eval-card-metrics" style={{ gridTemplateColumns: 'repeat(4, 1fr)' }}>
            <div className="eval-metric-item">
              <span className="eval-metric-label">Award Value</span>
              <span className="eval-metric-val">BDT {(scholarship.amount_bdt || 0).toLocaleString()}</span>
            </div>
            <div className="eval-metric-item">
              <span className="eval-metric-label">Min CGPA</span>
              <span className="eval-metric-val">{(scholarship.min_cgpa || 0).toFixed(2)}</span>
            </div>
            <div className="eval-metric-item">
              <span className="eval-metric-label">Deadline</span>
              <span className="eval-metric-val">{scholarship.deadline}</span>
            </div>
            <div className="eval-metric-item">
              <span className="eval-metric-label">Readiness Score</span>
              <span className="eval-metric-val">{readinessScore}%</span>
            </div>
          </div>

          {/* Detailed Requirement Comparison Matrix Table */}
          <div>
            <h4 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--slate-900)', marginBottom: '0.75rem' }}>
              Requirement Comparison System
            </h4>
            <div className="eval-table-wrap">
              <table className="eval-table">
                <thead>
                  <tr>
                    <th>Requirement Dimension</th>
                    <th>Scholarship Criteria</th>
                    <th>Student Profile</th>
                    <th>Evaluation Status</th>
                  </tr>
                </thead>
                <tbody>
                  {explanation.comparisonTable.map((row, idx) => {
                    let tagClass = 'eval-status-tag ';
                    let label = row.status;
                    if (row.status === 'SATISFIED') {
                      tagClass += 'satisfied';
                      label = 'Satisfied';
                    } else if (row.status === 'DEFICIT_REACHABLE') {
                      tagClass += 'deficit';
                      label = 'Deficit (Reachable)';
                    } else if (row.status === 'FAILED') {
                      tagClass += 'failed';
                      label = 'Unmet';
                    } else if (row.status === 'INCOMPLETE') {
                      tagClass += 'incomplete';
                      label = 'Incomplete';
                    } else {
                      tagClass += 'deficit';
                      label = 'Conditional';
                    }

                    return (
                      <tr key={`comp-${idx}`}>
                        <td style={{ fontWeight: 600 }}>{row.criteria}</td>
                        <td style={{ color: 'var(--slate-600)' }}>{row.requirement}</td>
                        <td style={{ fontWeight: 600 }}>{row.studentValue}</td>
                        <td>
                          <span className={tagClass}>{label}</span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Satisfied vs Missing Lists */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.25rem' }}>
            {/* Satisfied */}
            <div style={{ background: 'var(--emerald-50)', padding: '1rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--emerald-100)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--emerald-800)', fontWeight: 700, marginBottom: '0.5rem', fontSize: '0.9rem' }}>
                <CheckCircle2 size={16} />
                <span>Satisfied Conditions ({explanation.satisfiedConditions.length})</span>
              </div>
              <ul style={{ margin: 0, paddingLeft: '1.25rem', fontSize: '0.825rem', color: 'var(--emerald-900)', display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                {explanation.satisfiedConditions.map((sc, i) => (
                  <li key={`sc-${i}`}>{sc}</li>
                ))}
              </ul>
            </div>

            {/* Missing or Incomplete */}
            <div style={{ background: explanation.missingRequirements.length > 0 ? '#fef2f2' : '#fffbeb', padding: '1rem', borderRadius: 'var(--radius-md)', border: `1px solid ${explanation.missingRequirements.length > 0 ? '#fecaca' : '#fde68a'}` }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: explanation.missingRequirements.length > 0 ? '#991b1b' : '#92400e', fontWeight: 700, marginBottom: '0.5rem', fontSize: '0.9rem' }}>
                <AlertTriangle size={16} />
                <span>Missing / Pending Requirements ({explanation.missingRequirements.length + explanation.incompleteRequirements.length})</span>
              </div>
              {explanation.missingRequirements.length === 0 && explanation.incompleteRequirements.length === 0 ? (
                <p style={{ margin: 0, fontSize: '0.825rem', color: 'var(--slate-600)' }}>
                  None! All eligibility conditions have been verified.
                </p>
              ) : (
                <ul style={{ margin: 0, paddingLeft: '1.25rem', fontSize: '0.825rem', color: explanation.missingRequirements.length > 0 ? '#7f1d1d' : '#78350f', display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                  {explanation.missingRequirements.map((mr, i) => (
                    <li key={`mr-${i}`}>{mr}</li>
                  ))}
                  {explanation.incompleteRequirements.map((ir, i) => (
                    <li key={`ir-${i}`}>{ir}</li>
                  ))}
                </ul>
              )}
            </div>
          </div>

          {/* Description & Application note */}
          {scholarship.description && (
            <div style={{ background: 'var(--slate-50)', padding: '1rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--slate-200)', fontSize: '0.85rem' }}>
              <strong>Official Scholarship Details:</strong>
              <p style={{ marginTop: '0.25rem', color: 'var(--slate-600)', margin: 0 }}>{scholarship.description}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
