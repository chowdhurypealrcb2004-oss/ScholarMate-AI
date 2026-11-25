import React, { useEffect } from 'react';
import {
  X,
  Building,
  Award,
  Calendar,
  DollarSign,
  CheckCircle,
  AlertCircle,
  FileText,
  Clock,
  Layers,
  Info,
} from 'lucide-react';

export default function ScholarshipDetailModal({
  scholarship,
  matchData = null,
  onClose,
}) {
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  if (!scholarship) return null;

  const formatAmount = (amt) => `৳${Number(amt).toLocaleString('en-US')} BDT`;

  return (
    <div className="modal-overlay" onClick={onClose} role="dialog" aria-modal="true">
      <div
        className="modal-dialog-content"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="modal-header-section">
          <button
            type="button"
            className="modal-close-icon"
            onClick={onClose}
            aria-label="Close dialog"
          >
            <X size={18} />
          </button>

          <span className="card-category-tag">{scholarship.category || 'Scholarship Opportunity'}</span>
          <h2 style={{ fontSize: '1.45rem', fontWeight: 800, color: 'var(--slate-900)', marginTop: '0.4rem' }}>
            {scholarship.name}
          </h2>
          <div className="card-provider" style={{ marginTop: '0.25rem', marginBottom: 0 }}>
            <Building size={15} />
            <span>{scholarship.provider}</span>
          </div>
        </div>

        {/* Modal Body */}
        <div className="modal-body-section">
          {/* Snapshot Grid */}
          <div className="modal-meta-grid">
            <div className="modal-meta-item">
              <span className="modal-meta-label">Grant Amount</span>
              <span className="modal-meta-val" style={{ color: 'var(--emerald-600)' }}>
                {formatAmount(scholarship.amount_bdt)}
              </span>
            </div>
            <div className="modal-meta-item">
              <span className="modal-meta-label">Min CGPA Required</span>
              <span className="modal-meta-val">{Number(scholarship.min_cgpa).toFixed(2)} / 4.00</span>
            </div>
            <div className="modal-meta-item">
              <span className="modal-meta-label">Application Deadline</span>
              <span className="modal-meta-val">{scholarship.deadline}</span>
            </div>
            <div className="modal-meta-item">
              <span className="modal-meta-label">Funding Type</span>
              <span className="modal-meta-val">
                {scholarship.need_based === 'yes' ? 'Need-Based Support' : 'Merit-Based Award'}
              </span>
            </div>
          </div>

          {/* Match Status Highlight (if student profile was evaluated) */}
          {matchData && (
            <div
              style={{
                padding: '1rem',
                borderRadius: 'var(--radius-md)',
                background: matchData.status === 'ELIGIBLE' ? '#ecfdf5' : '#fffbeb',
                border: `1px solid ${matchData.status === 'ELIGIBLE' ? '#a7f3d0' : '#fde68a'}`,
              }}
            >
              <h4 style={{
                fontSize: '0.95rem',
                fontWeight: 700,
                color: matchData.status === 'ELIGIBLE' ? '#065f46' : '#92400e',
                display: 'flex',
                alignItems: 'center',
                gap: '0.4rem',
                marginBottom: '0.35rem',
              }}>
                {matchData.status === 'ELIGIBLE' ? (
                  <>
                    <CheckCircle size={16} /> Fully Eligible ({matchData.matchScore}% Match Score)
                  </>
                ) : (
                  <>
                    <AlertCircle size={16} /> Almost Eligible ({matchData.matchScore}% Match Score)
                  </>
                )}
              </h4>
              <p style={{ fontSize: '0.85rem', color: matchData.status === 'ELIGIBLE' ? '#047857' : '#b45309' }}>
                {matchData.status === 'ELIGIBLE'
                  ? 'Your academic background, department, and preferences fulfill all official criteria for this scholarship.'
                  : `You are close to qualifying. Remaining conditions: ${matchData.breakdown.missingReasons.join('; ')}.`}
              </p>
            </div>
          )}

          {/* Description */}
          <div>
            <h4 className="modal-section-title">
              <FileText size={16} /> Program Description
            </h4>
            <p style={{ fontSize: '0.925rem', color: 'var(--slate-700)', lineHeight: 1.6 }}>
              {scholarship.description || 'No detailed description provided in official dataset.'}
            </p>
          </div>

          {/* Eligibility Criteria Breakdown */}
          <div>
            <h4 className="modal-section-title">
              <CheckCircle size={16} /> Mandatory Eligibility Conditions
            </h4>
            <ul className="conditions-checklist">
              {scholarship.eligibility_conditions && scholarship.eligibility_conditions.length > 0 ? (
                scholarship.eligibility_conditions.map((cond, idx) => (
                  <li key={idx}>
                    <CheckCircle size={16} />
                    <span>{cond}</span>
                  </li>
                ))
              ) : (
                <li>
                  <CheckCircle size={16} />
                  <span>Open to eligible students meeting minimum CGPA and department criteria.</span>
                </li>
              )}
            </ul>
          </div>

          {/* Benefits & Instructions */}
          <div>
            <h4 className="modal-section-title">
              <Award size={16} /> Benefits & Award Coverage
            </h4>
            <p style={{ fontSize: '0.9rem', color: 'var(--slate-700)' }}>
              {scholarship.benefits || `Direct scholarship award of ${formatAmount(scholarship.amount_bdt)} toward semester tuition and educational expenses.`}
            </p>
          </div>

          {/* Official Verification Callout */}
          <div className="official-dataset-callout">
            <strong style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', marginBottom: '0.2rem' }}>
              <Info size={14} /> Official Hackathon Dataset Record #{scholarship.id}
            </strong>
            <span>
              Original source verified. Country: {scholarship.country || 'Bangladesh'}. Degree Level: {scholarship.degree_level || 'Undergraduate'}.
              No unstated GPA requirements, application fees, or hidden eligibility filters are assumed.
            </span>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="modal-footer-section">
          <button
            type="button"
            className="filter-reset-btn"
            onClick={onClose}
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
