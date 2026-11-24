import React from 'react';
import {
  UserCircle2,
  LayoutDashboard,
  Code2,
  Cpu,
  Sparkles,
  ArrowRight,
  CheckCircle,
} from 'lucide-react';
import Button from '../common/Button';
import Badge from '../common/Badge';

/**
 * Team Integration Placeholder Component
 * Houses the dedicated mount points for:
 * - Module 2: Student Profile Form (Team Member 2)
 * - Module 5: Results Dashboard & AI Advisor (Team Members 3, 4 & 5)
 */
export default function PlaceholderSection({ onGetStarted }) {
  return (
    <section className="placeholder-section" id="finder">
      <div className="container">
        <div className="section-header">
          <span className="section-tag">Integration Hub</span>
          <h2 className="section-title">Student Matching Platform</h2>
          <p className="section-desc">
            The workspace below is partitioned for team module integration, keeping boundaries modular and collision-free.
          </p>
        </div>

        {/* ========================================================
            MODULE 2 MOUNT POINT: Student Profile Form
           ======================================================== */}
        <div className="module-placeholder-box" id="profile-module-slot">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
            <span className="module-badge-id">MODULE 2 INTEGRATION POINT</span>
            <Badge variant="indigo" icon={UserCircle2}>
              Team Member 2: Student Profile Form
            </Badge>
          </div>

          <h3 style={{ fontSize: '1.45rem', fontWeight: 800, color: 'var(--slate-900)', marginBottom: '0.5rem' }}>
            Student Profile & Academic Requirements Form
          </h3>

          <p style={{ maxWidth: '640px', margin: '0 auto 1.5rem auto', color: 'var(--slate-600)', fontSize: '0.925rem' }}>
            Collects student full name, department dropdown (CSE, EEE, CE, BBA, English, Other), CGPA (0.00 – 4.00), gender selection, and financial need toggle with client-side validation.
          </p>

          {/* Interface Contract Card */}
          <div
            style={{
              background: 'var(--slate-50)',
              borderRadius: 'var(--radius-lg)',
              border: '1px solid var(--slate-200)',
              padding: '1.25rem',
              maxWidth: '680px',
              margin: '0 auto 1.5rem auto',
              textAlign: 'left',
              fontSize: '0.85rem',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 700, color: 'var(--slate-800)', marginBottom: '0.5rem' }}>
              <Code2 size={16} style={{ color: 'var(--primary-600)' }} /> Component Interface Contract:
            </div>
            <pre style={{ margin: 0, color: 'var(--slate-700)', fontFamily: 'monospace', overflowX: 'auto', background: '#ffffff', padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--slate-200)' }}>
{`<StudentProfileForm 
  onSubmit={(studentProfile) => handleMatch(studentProfile)} 
  isLoading={isMatching}
  presetProfiles={DEMO_PERSONAS} 
/>`}
            </pre>
          </div>

          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', color: 'var(--slate-500)', fontSize: '0.85rem' }}>
            <CheckCircle size={16} style={{ color: 'var(--emerald-600)' }} />
            Ready for `StudentProfileForm.jsx` drop-in replacement.
          </div>
        </div>

        {/* ========================================================
            MODULE 5 MOUNT POINT: Results Dashboard & AI Advisor
           ======================================================== */}
        <div className="module-placeholder-box" id="dashboard-module-slot" style={{ borderStyle: 'solid', borderColor: 'var(--slate-200)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
            <span className="module-badge-id" style={{ background: 'var(--emerald-50)', color: 'var(--emerald-700)' }}>
              MODULE 5 INTEGRATION POINT
            </span>
            <Badge variant="emerald" icon={LayoutDashboard}>
              Team Members 3, 4 & 5: Results & AI Advisor
            </Badge>
          </div>

          <h3 style={{ fontSize: '1.45rem', fontWeight: 800, color: 'var(--slate-900)', marginBottom: '0.5rem' }}>
            Scholarship Results Dashboard & Gemini AI Advisor
          </h3>

          <p style={{ maxWidth: '640px', margin: '0 auto 1.5rem auto', color: 'var(--slate-600)', fontSize: '0.925rem' }}>
            Displays fully eligible scholarships and almost-eligible scholarships with missing criteria badges, sorting controls (earliest deadline, highest amount), Gemini AI explanations, and application checklist.
          </p>

          {/* Interface Contract Card */}
          <div
            style={{
              background: 'var(--slate-50)',
              borderRadius: 'var(--radius-lg)',
              border: '1px solid var(--slate-200)',
              padding: '1.25rem',
              maxWidth: '680px',
              margin: '0 auto 1.5rem auto',
              textAlign: 'left',
              fontSize: '0.85rem',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 700, color: 'var(--slate-800)', marginBottom: '0.5rem' }}>
              <Cpu size={16} style={{ color: 'var(--emerald-600)' }} /> Component Interface Contract:
            </div>
            <pre style={{ margin: 0, color: 'var(--slate-700)', fontFamily: 'monospace', overflowX: 'auto', background: '#ffffff', padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--slate-200)' }}>
{`<ResultsDashboard 
  fullyEligible={matchedResults.fullyEligible}
  almostEligible={matchedResults.almostEligible}
  sortBy="deadline" // "deadline" | "amount"
  onGenerateAIExplanation={(scholarshipId) => fetchAI(scholarshipId)}
  onExportReport={() => exportResults()} 
/>`}
            </pre>
          </div>

          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', color: 'var(--slate-500)', fontSize: '0.85rem' }}>
            <CheckCircle size={16} style={{ color: 'var(--emerald-600)' }} />
            Ready for `ResultsDashboard.jsx` and `ScholarshipCard.jsx` drop-in replacement.
          </div>
        </div>
      </div>
    </section>
  );
}
