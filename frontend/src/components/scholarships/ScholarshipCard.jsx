import React from 'react';
import {
  Calendar,
  Building,
  GraduationCap,
  Sparkles,
  AlertTriangle,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
} from 'lucide-react';

export default function ScholarshipCard({
  scholarship,
  matchData = null,
  onViewDetails,
}) {
  const isEligible = matchData?.status === 'ELIGIBLE';
  const isAlmostEligible = matchData?.status === 'ALMOST_ELIGIBLE';

  const formatAmount = (amt) => {
    return `৳${Number(amt).toLocaleString('en-US')} BDT`;
  };

  const getDaysLeft = (deadlineStr) => {
    if (!deadlineStr) return null;
    const diffTime = new Date(deadlineStr) - new Date();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const daysLeft = getDaysLeft(scholarship.deadline);

  return (
    <div
      className={`scholarship-card ${
        isEligible
          ? 'card-fully-eligible'
          : isAlmostEligible
          ? 'card-almost-eligible'
          : ''
      }`}
    >
      <div>
        {/* Top Tag & Match Score */}
        <div className="card-top-row">
          <span className="card-category-tag">{scholarship.category || 'Scholarship'}</span>

          {matchData && (
            <span
              className={`match-score-pill ${
                isEligible ? 'score-high' : 'score-mid'
              }`}
            >
              {isEligible ? (
                <>
                  <CheckCircle2 size={13} />
                  <span>Eligible ({matchData.matchScore}%)</span>
                </>
              ) : (
                <>
                  <AlertTriangle size={13} />
                  <span>Almost ({matchData.matchScore}%)</span>
                </>
              )}
            </span>
          )}
        </div>

        {/* Title & Provider */}
        <h3 className="card-title">{scholarship.name}</h3>
        <div className="card-provider">
          <Building size={14} />
          <span>{scholarship.provider}</span>
        </div>

        {/* Award Amount */}
        <div className="card-amount-box">
          <div>
            <div className="card-amount-val">{formatAmount(scholarship.amount_bdt)}</div>
            <div className="card-amount-sub">{scholarship.funding_type || (scholarship.need_based === 'yes' ? 'Need-Based' : 'Merit-Based')}</div>
          </div>
          <span style={{ fontSize: '0.8rem', color: 'var(--slate-500)', fontWeight: 600 }}>
            Min CGPA: {Number(scholarship.min_cgpa).toFixed(2)}
          </span>
        </div>

        {/* Requirements Details */}
        <div className="card-criteria-list">
          <div className="criteria-item-row">
            <span className="criteria-label">Dept:</span>
            <span>
              {scholarship.department === 'All'
                ? 'All Departments'
                : scholarship.department.replace(/;/g, ', ')}
            </span>
          </div>

          <div className="criteria-item-row">
            <span className="criteria-label">Gender:</span>
            <span>{scholarship.gender === 'All' ? 'All Genders' : scholarship.gender}</span>
          </div>
        </div>

        {/* Almost Eligible Missing Reasons */}
        {isAlmostEligible && matchData?.breakdown?.missingReasons?.length > 0 && (
          <div className="missing-criteria-alert">
            <strong>
              <AlertTriangle size={14} /> Criteria to fulfill:
            </strong>
            <ul style={{ paddingLeft: '1.2rem', marginTop: '0.25rem' }}>
              {matchData.breakdown.missingReasons.map((reason, idx) => (
                <li key={idx}>{reason}</li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {/* Card Actions & Deadline */}
      <div className="card-actions-row">
        <div className="card-deadline">
          <Calendar size={14} />
          <span>
            {scholarship.deadline}
            {daysLeft !== null && daysLeft > 0 ? ` (${daysLeft}d left)` : ''}
          </span>
        </div>

        <button
          type="button"
          className="view-details-btn"
          onClick={() => onViewDetails(scholarship, matchData)}
        >
          <span>Details</span>
          <ArrowRight size={14} />
        </button>
      </div>
    </div>
  );
}
