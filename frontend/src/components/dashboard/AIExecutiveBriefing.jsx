import React, { useState } from 'react';
import {
  Sparkles,
  CheckCircle2,
  ListTodo,
  ChevronUp,
  ChevronDown,
  GraduationCap,
  Award,
  Zap,
} from 'lucide-react';

export default function AIExecutiveBriefing({
  studentProfile,
  summaryData,
  aiStatus,
}) {
  const [isExpanded, setIsExpanded] = useState(true);

  if (!summaryData) return null;

  const { overview, topStrengths = [], recommendedActionPlan = [], isFallback, source } = summaryData;
  const isGemini = source === 'gemini' && !isFallback;

  return (
    <div className="ai-briefing-card">
      <div className="ai-briefing-header">
        <div className="ai-briefing-title-group">
          <Sparkles className="text-indigo-600" size={24} style={{ color: 'var(--primary-600)' }} />
          <div>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 800, margin: 0, color: 'var(--slate-900)' }}>
              AI Scholarship Advisor Briefing
            </h3>
            <span style={{ fontSize: '0.8rem', color: 'var(--slate-500)', fontWeight: 500 }}>
              Tailored academic analysis for {studentProfile?.name || 'Student'}
            </span>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <span className={`ai-sparkle-badge ${isGemini ? 'gemini' : 'fallback'}`}>
            <Sparkles size={13} />
            <span>{isGemini ? 'Gemini 1.5 Flash' : 'AI Advisor Active (Smart Fallback)'}</span>
          </span>

          <button
            type="button"
            className="btn btn-secondary btn-sm"
            style={{
              padding: '0.35rem 0.65rem',
              fontSize: '0.8rem',
              background: '#ffffff',
              border: '1px solid var(--slate-200)',
              borderRadius: 'var(--radius-sm)',
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.25rem',
            }}
            onClick={() => setIsExpanded(!isExpanded)}
          >
            {isExpanded ? (
              <>
                <span>Minimize</span>
                <ChevronUp size={16} />
              </>
            ) : (
              <>
                <span>View Recommendations</span>
                <ChevronDown size={16} />
              </>
            )}
          </button>
        </div>
      </div>

      <p className="ai-briefing-text">{overview}</p>

      {isExpanded && (
        <div className="ai-briefing-columns">
          {/* Top Strengths */}
          <div className="ai-briefing-box">
            <div className="ai-box-title">
              <Award size={16} style={{ color: 'var(--emerald-600)' }} />
              <span>Key Profile Strengths</span>
            </div>
            <ul className="ai-box-list">
              {topStrengths.map((str, idx) => (
                <li key={`str-${idx}`}>
                  <CheckCircle2 size={14} style={{ color: 'var(--emerald-600)' }} />
                  <span>{str}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Action Roadmap */}
          <div className="ai-briefing-box">
            <div className="ai-box-title">
              <ListTodo size={16} style={{ color: 'var(--primary-600)' }} />
              <span>Recommended Application Steps</span>
            </div>
            <ul className="ai-box-list">
              {recommendedActionPlan.map((act, idx) => (
                <li key={`act-${idx}`}>
                  <Zap size={14} style={{ color: 'var(--primary-600)' }} />
                  <span>{act}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
}
