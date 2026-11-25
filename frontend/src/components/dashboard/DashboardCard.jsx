import React, { useState } from 'react';
import {
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Calendar,
  Building,
  GraduationCap,
  Sparkles,
  ArrowRight,
  Clock,
  Wallet,
  Loader2,
  HelpCircle,
  RefreshCw,
} from 'lucide-react';
import { fetchAiScholarshipExplanation } from '../../api/client';

export default function DashboardCard({
  item,
  studentProfile,
  aiExplanation: initialAiExplanation,
  onOpenDetails,
}) {
  const { scholarship, status, readinessScore, explanation, breakdown } = item;
  
  const [aiData, setAiData] = useState(initialAiExplanation || null);
  const [loadingAi, setLoadingAi] = useState(false);

  const isEligible = status === 'ELIGIBLE';
  const isAlmost = status === 'POTENTIALLY_ELIGIBLE' || status === 'ALMOST_ELIGIBLE';
  const isIneligible = status === 'NOT_ELIGIBLE';

  const formatAmount = (amt) => {
    return `৳${Number(amt || 0).toLocaleString('en-US')} BDT`;
  };

  const getDaysRemaining = (deadlineStr) => {
    if (!deadlineStr) return null;
    const diffTime = new Date(deadlineStr) - new Date();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const daysLeft = getDaysRemaining(scholarship.deadline);

  const handleRequestAi = async () => {
    setLoadingAi(true);
    try {
      const result = await fetchAiScholarshipExplanation(studentProfile, scholarship, item);
      setAiData(result);
    } catch (err) {
      console.warn('Failed to fetch individual AI advice:', err);
    } finally {
      setLoadingAi(false);
    }
  };

  // Missing criteria list for almost eligible
  const missingItems = explanation?.missingRequirements?.length
    ? explanation.missingRequirements
    : breakdown?.missingReasons || explanation?.incompleteRequirements || [];

  return (
    <div
      className={`dash-card ${
        isEligible ? 'is-eligible' : isAlmost ? 'is-almost' : 'is-ineligible'
      }`}
    >
      <div>
        {/* Header: Provider & Status Pill */}
        <div className="dash-card-header">
          <div className="dash-card-provider">
            <Building size={14} />
            <span>{scholarship.provider}</span>
          </div>

          <span
            className={`dash-status-pill ${
              isEligible ? 'eligible' : isAlmost ? 'almost' : 'ineligible'
            }`}
          >
            {isEligible ? (
              <>
                <CheckCircle2 size={13} />
                <span>Eligible</span>
              </>
            ) : isAlmost ? (
              <>
                <AlertTriangle size={13} />
                <span>Almost Eligible</span>
              </>
            ) : (
              <>
                <XCircle size={13} />
                <span>Not Eligible</span>
              </>
            )}
          </span>
        </div>

        {/* Title */}
        <h4 className="dash-card-title">{scholarship.name}</h4>

        {/* Specs Box: Amount & Min CGPA */}
        <div className="dash-card-specs">
          <div className="dash-spec-item">
            <span className="dash-spec-label">Scholarship Amount</span>
            <span className="dash-spec-value amount">{formatAmount(scholarship.amount_bdt)}</span>
          </div>
          <div className="dash-spec-item">
            <span className="dash-spec-label">Minimum CGPA</span>
            <span className="dash-spec-value">
              {Number(scholarship.min_cgpa || 0).toFixed(2)}
            </span>
          </div>
        </div>

        {/* Metadata: Category, Department, Deadline */}
        <div className="dash-card-metadata">
          <span className="dash-meta-item">
            <GraduationCap size={14} />
            <span>
              {scholarship.department === 'All'
                ? 'All Departments'
                : scholarship.department.replace(/;/g, ', ')}
            </span>
          </span>

          <span className="dash-meta-item">
            <Calendar size={14} />
            <span>{scholarship.deadline}</span>
            {daysLeft !== null && daysLeft > 0 && (
              <span style={{ color: daysLeft <= 14 ? '#ef4444' : 'var(--slate-500)', fontSize: '0.75rem' }}>
                ({daysLeft}d left)
              </span>
            )}
          </span>
        </div>

        {/* Deterministic Module 4 Explanation */}
        {explanation?.narrativeExplanation && (
          <div className="dash-deterministic-box">
            <strong>Eligibility Check:</strong> {explanation.narrativeExplanation}
          </div>
        )}

        {/* Missing Requirements for Almost Eligible */}
        {isAlmost && missingItems.length > 0 && (
          <div className="dash-missing-box">
            <div className="dash-missing-header">
              <AlertTriangle size={14} />
              <span>Missing Criteria to Bridge</span>
            </div>
            <ul className="dash-missing-list">
              {missingItems.map((reason, idx) => (
                <li key={`miss-${idx}`} className="dash-missing-item">
                  <XCircle size={13} style={{ color: 'var(--amber-700)' }} />
                  <span>{reason}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* AI Advisor Explanation */}
        <div className={`dash-ai-box ${aiData?.isFallback ? 'is-fallback' : ''}`}>
          <div className="dash-ai-header">
            <div className="dash-ai-tag">
              <Sparkles size={14} style={{ color: 'var(--primary-600)' }} />
              <span>AI Advisor Explanation</span>
            </div>
            {aiData && (
              <span className="dash-ai-source-badge">
                {aiData.source === 'gemini' ? 'Gemini 1.5' : 'Smart Fallback'}
              </span>
            )}
          </div>

          {loadingAi ? (
            <div className="dash-ai-loading">
              <Loader2 size={16} className="animate-spin" />
              <span>Consulting Gemini AI Advisor...</span>
            </div>
          ) : aiData?.explanation ? (
            <p className="dash-ai-text">{aiData.explanation}</p>
          ) : (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: '0.25rem' }}>
              <span style={{ fontSize: '0.825rem', color: 'var(--slate-500)' }}>
                Personalized advice ready to generate.
              </span>
              <button
                type="button"
                onClick={handleRequestAi}
                className="btn btn-sm"
                style={{
                  fontSize: '0.75rem',
                  padding: '0.25rem 0.6rem',
                  background: '#ffffff',
                  border: '1px solid var(--primary-300)',
                  color: 'var(--primary-700)',
                  borderRadius: 'var(--radius-sm)',
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.3rem',
                }}
              >
                <Sparkles size={12} />
                <span>Get AI Advice</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Footer: Readiness score & Requirement comparison modal link */}
      <div className="dash-card-footer">
        <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--slate-500)' }}>
          Funding: {scholarship.funding_type || (scholarship.need_based === 'yes' ? 'Need-Based' : 'Merit-Based')}
        </span>

        <button
          type="button"
          className="button button-secondary button-sm"
          onClick={() => onOpenDetails(item)}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.35rem',
            fontSize: '0.8rem',
            padding: '0.45rem 0.8rem',
          }}
        >
          <span>Criteria Matrix</span>
          <ArrowRight size={14} />
        </button>
      </div>
    </div>
  );
}
