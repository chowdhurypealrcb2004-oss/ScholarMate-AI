import React from 'react';
import { UserCheck, Sliders, Sparkles, ClipboardCheck } from 'lucide-react';

export default function HowItWorks() {
  const steps = [
    {
      number: '1',
      icon: UserCheck,
      title: 'Enter Academic Profile',
      desc: 'Provide your name, department, current CGPA (0.00 - 4.00), gender, and financial assistance requirement.',
    },
    {
      number: '2',
      icon: Sliders,
      title: 'Structured Matching',
      desc: 'Our deterministic JavaScript engine verifies every requirement against all 136 scholarship criteria with zero hallucination.',
    },
    {
      number: '3',
      icon: Sparkles,
      title: 'AI Scholarship Advisor',
      desc: 'Google Gemini generates tailored matching summaries explaining why the award matches your specific academic background.',
    },
    {
      number: '4',
      icon: ClipboardCheck,
      title: 'Apply & Track',
      desc: 'Sort by deadline or grant amount, review missing criteria on almost-eligible awards, and export your application checklist.',
    },
  ];

  return (
    <section className="placeholder-section" id="how-it-works" style={{ background: '#ffffff', borderBottom: '1px solid var(--slate-200)' }}>
      <div className="container">
        <div className="section-header">
          <span className="section-tag">Seamless Journey</span>
          <h2 className="section-title">How ScholarMate AI Works</h2>
          <p className="section-desc">
            A transparent 4-stage pipeline that combines rigorous eligibility verification with helpful AI guidance.
          </p>
        </div>

        <div className="steps-grid">
          {steps.map((step) => {
            const Icon = step.icon;
            return (
              <div key={step.number} className="step-card">
                <div className="step-number">{step.number}</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
                  <Icon size={20} style={{ color: 'var(--primary-600)' }} />
                  <h4 className="step-title" style={{ margin: 0 }}>{step.title}</h4>
                </div>
                <p className="step-desc">{step.desc}</p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
