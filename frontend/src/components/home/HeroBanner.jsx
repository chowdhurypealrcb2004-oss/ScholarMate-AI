import React from 'react';
import {
  GraduationCap,
  Sparkles,
  ArrowRight,
  CheckCircle2,
  TrendingUp,
  Award,
  Calendar,
  Building,
} from 'lucide-react';
import Button from '../common/Button';
import Badge from '../common/Badge';

export default function HeroBanner({ onGetStarted }) {
  return (
    <section className="hero-wrapper" id="home">
      <div className="container">
        <div className="hero-grid">
          {/* Left Column: Hero Content */}
          <div>
            <div className="hero-badge-pill">
              <Sparkles size={16} style={{ color: '#4f46e5' }} />
              <span>Smart Eligibility Engine & AI Advisor</span>
            </div>

            <h1 className="hero-title">
              Unlock Your Education with <span className="hero-highlight">ScholarMate AI</span>
            </h1>

            <p className="hero-subtitle">
              Thousands of students miss financial grants simply because criteria are scattered across universities,
              foundations, and corporate trusts. Enter your academic background and let our deterministic engine find your
              ideal scholarship in seconds.
            </p>

            <div className="hero-cta-group">
              <Button
                variant="primary"
                size="lg"
                icon={ArrowRight}
                iconPosition="right"
                onClick={onGetStarted}
              >
                Get Started Now
              </Button>

              <Button
                variant="secondary"
                size="lg"
                onClick={() => {
                  const statsEl = document.getElementById('stats');
                  if (statsEl) statsEl.scrollIntoView({ behavior: 'smooth' });
                }}
              >
                Explore Statistics
              </Button>
            </div>

            {/* Micro Highlights */}
            <div
              style={{
                display: 'flex',
                flexWrap: 'wrap',
                gap: '1.5rem',
                marginTop: '2.5rem',
                paddingTop: '1.5rem',
                borderTop: '1px solid var(--slate-200)',
                fontSize: '0.875rem',
                color: 'var(--slate-600)',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <CheckCircle2 size={16} style={{ color: 'var(--emerald-600)' }} />
                <span>136 Real Scholarships</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <CheckCircle2 size={16} style={{ color: 'var(--emerald-600)' }} />
                <span>Zero Guesswork Matching</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <CheckCircle2 size={16} style={{ color: 'var(--emerald-600)' }} />
                <span>Powered by Google Gemini</span>
              </div>
            </div>
          </div>

          {/* Right Column: Interactive Visual Showcase Card */}
          <div style={{ position: 'relative' }}>
            {/* Floating Top Badge */}
            <div className="hero-floating-stat">
              <div
                style={{
                  width: '2.25rem',
                  height: '2.25rem',
                  borderRadius: '8px',
                  background: 'var(--emerald-50)',
                  color: 'var(--emerald-600)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <TrendingUp size={20} />
              </div>
              <div>
                <div style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--slate-900)' }}>৳50,000</div>
                <div style={{ fontSize: '0.75rem', color: 'var(--slate-500)', fontWeight: 600 }}>Max Grant per Award</div>
              </div>
            </div>

            {/* Dashboard Sample Card */}
            <div className="hero-visual-card">
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <div
                    style={{
                      width: '2.5rem',
                      height: '2.5rem',
                      borderRadius: '10px',
                      background: 'var(--primary-100)',
                      color: 'var(--primary-700)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <Award size={20} />
                  </div>
                  <div>
                    <h4 style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--slate-900)' }}>
                      Merit Excellence Award
                    </h4>
                    <span style={{ fontSize: '0.8rem', color: 'var(--slate-500)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <Building size={12} /> Bayview University
                    </span>
                  </div>
                </div>
                <Badge variant="emerald">Eligible Match</Badge>
              </div>

              <div
                style={{
                  background: 'var(--slate-50)',
                  borderRadius: 'var(--radius-md)',
                  padding: '1rem',
                  marginBottom: '1rem',
                  border: '1px solid var(--slate-200)',
                }}
              >
                <div style={{ display: 'grid', gridTo: 'repeat(3, 1fr)', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.75rem', textAlign: 'center' }}>
                  <div>
                    <span style={{ fontSize: '0.7rem', color: 'var(--slate-500)', textTransform: 'uppercase', fontWeight: 700 }}>Min CGPA</span>
                    <div style={{ fontSize: '0.95rem', fontWeight: 800, color: 'var(--slate-900)' }}>3.80</div>
                  </div>
                  <div>
                    <span style={{ fontSize: '0.7rem', color: 'var(--slate-500)', textTransform: 'uppercase', fontWeight: 700 }}>Amount</span>
                    <div style={{ fontSize: '0.95rem', fontWeight: 800, color: 'var(--emerald-600)' }}>৳30,000</div>
                  </div>
                  <div>
                    <span style={{ fontSize: '0.7rem', color: 'var(--slate-500)', textTransform: 'uppercase', fontWeight: 700 }}>Deadline</span>
                    <div style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--slate-800)' }}>Feb 15, 2027</div>
                  </div>
                </div>
              </div>

              {/* AI Advisor Preview Snippet */}
              <div
                style={{
                  background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.06), rgba(16, 185, 129, 0.06))',
                  border: '1px solid var(--primary-200)',
                  borderRadius: 'var(--radius-md)',
                  padding: '0.85rem 1rem',
                  fontSize: '0.825rem',
                  color: 'var(--slate-700)',
                  lineHeight: '1.45',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontWeight: 700, color: 'var(--primary-700)', marginBottom: '0.25rem' }}>
                  <Sparkles size={14} /> AI Advisor Insight
                </div>
                Your CGPA meets the university's academic cutoff and your major qualifies across all departments.
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
