import React from 'react';
import {
  CheckCircle2,
  AlertTriangle,
  XCircle,
  HelpCircle,
  Calendar,
  Wallet,
  GraduationCap,
  ArrowRight,
  Info,
} from 'lucide-react';
import { ELIGIBILITY_STATUS } from '../../utils/eligibilityEvaluator';

export default function EligibilityCard({ evaluatedRecord, onOpenDetails }) {
  const { scholarship, status, readinessScore, explanation } = evaluatedRecord;

  const isEligible = status === ELIGIBILITY_STATUS.ELIGIBLE;
  const isPotentially = status === ELIGIBILITY_STATUS.POTENTIALLY_ELIGIBLE;
  const isIneligible = status === ELIGIBILITY_STATUS.NOT_ELIGIBLE;

  let cardClass = 'eval-card';
  if (isEligible) cardClass += ' is-eligible';
  else if (isPotentially) cardClass += ' is-potentially';
  else cardClass += ' is-ineligible';

  return (
    <div className={cardClass}>
      {/* Header */}
      <div className="eval-card-header">
        <div>
          <div className="eval-card-provider">{scholarship.provider}</div>
          <h4 className="eval-card-title">{scholarship.name}</h4>
        </div>

        {isEligible && (
          <span className="eval-status-badge eligible">
            <CheckCircle2 size={14} />
            <span>Eligible</span>
          </span>
        )}
        {isPotentially && (
          <span className="eval-status-badge potentially">
            <AlertTriangle size={14} />
            <span>Potentially Eligible</span>
          </span>
        )}
        {isIneligible && (
          <span className="eval-status-badge ineligible">
            <XCircle size={14} />
            <span>Not Eligible</span>
          </span>
        )}
      </div>

      {/* Metrics Bar */}
      <div className="eval-card-metrics">
        <div className="eval-metric-item">
          <span className="eval-metric-label">Award Value</span>
          <span className="eval-metric-val">
            BDT {(scholarship.amount_bdt || 0).toLocaleString()}
          </span>
        </div>
        <div className="eval-metric-item">
          <span className="eval-metric-label">Min CGPA</span>
          <span className="eval-metric-val">
            {(scholarship.min_cgpa || 0).toFixed(2)}
          </span>
        </div>
        <div className="eval-metric-item">
          <span className="eval-metric-label">Deadline</span>
          <span className="eval-metric-val" style={{ fontSize: '0.85rem' }}>
            {scholarship.deadline}
          </span>
        </div>
      </div>

      {/* Narrative Explanation Highlight */}
      <div
        className={`eval-card-explanation ${
          isEligible ? 'is-eligible' : isPotentially ? 'is-potentially' : 'is-ineligible'
        }`}
      >
        <strong>Evaluation Summary:</strong> {explanation.narrativeExplanation}
      </div>

      {/* Quick Conditions Snapshot */}
      <div className="eval-conditions-list">
        {/* Satisfied criteria snapshot */}
        {explanation.satisfiedConditions.slice(0, 2).map((sc, idx) => (
          <div key={`sat-${idx}`} className="eval-condition-row satisfied">
            <CheckCircle2 size={13} style={{ flexShrink: 0, marginTop: '2px' }} />
            <span>{sc}</span>
          </div>
        ))}

        {/* Missing or incomplete requirements snapshot */}
        {explanation.missingRequirements.slice(0, 2).map((mr, idx) => (
          <div key={`mis-${idx}`} className="eval-condition-row missing">
            <XCircle size={13} style={{ flexShrink: 0, marginTop: '2px' }} />
            <span>{mr}</span>
          </div>
        ))}

        {explanation.incompleteRequirements.slice(0, 2).map((ir, idx) => (
          <div key={`inc-${idx}`} className="eval-condition-row incomplete">
            <HelpCircle size={13} style={{ flexShrink: 0, marginTop: '2px' }} />
            <span>{ir}</span>
          </div>
        ))}
      </div>

      {/* Footer */}
      <div className="eval-card-footer">
        <span className="eval-score-pill">
          Readiness: {readinessScore}%
        </span>

        <button
          type="button"
          className="button button-secondary button-sm"
          onClick={() => onOpenDetails(evaluatedRecord)}
          style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.8rem' }}
        >
          <span>Requirement Details</span>
          <ArrowRight size={14} />
        </button>
      </div>
    </div>
  );
}
