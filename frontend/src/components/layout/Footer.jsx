import React from 'react';
import { GraduationCap, Heart, ShieldCheck, Database, Sparkles, ExternalLink } from 'lucide-react';

export default function Footer({ onNavigate }) {
  const handleNavClick = (sectionId) => {
    if (onNavigate) {
      onNavigate(sectionId);
    } else {
      const element = document.getElementById(sectionId);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
      }
    }
  };

  return (
    <footer className="footer-wrapper">
      <div className="container">
        <div className="footer-grid">
          {/* Brand Info */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
              <div
                style={{
                  width: '2.25rem',
                  height: '2.25rem',
                  borderRadius: '10px',
                  background: 'linear-gradient(135deg, var(--primary-600), var(--primary-800))',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'white',
                }}
              >
                <GraduationCap size={18} />
              </div>
              <span className="footer-brand-title">ScholarMate AI</span>
            </div>
            <p className="footer-desc">
              Your Personalized Scholarship Finder. Helping Bangladeshi students discover matching university waivers,
              trust funds, and foundation awards using structured deterministic criteria and AI-assisted advising.
            </p>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '1.25rem' }}>
              <span className="badge badge-indigo" style={{ background: '#1e293b', color: '#93c5fd', borderColor: '#334155' }}>
                <Database size={12} />
                136 Verified Grants
              </span>
              <span className="badge badge-emerald" style={{ background: '#1e293b', color: '#6ee7b7', borderColor: '#334155' }}>
                <Sparkles size={12} />
                Gemini AI Advisor
              </span>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="footer-heading">Navigation</h4>
            <ul className="footer-link-list">
              <li className="footer-link" onClick={() => handleNavClick('home')}>
                Home
              </li>
              <li className="footer-link" onClick={() => handleNavClick('stats')}>
                Dataset Statistics
              </li>
              <li className="footer-link" onClick={() => handleNavClick('how-it-works')}>
                Matching Process
              </li>
              <li className="footer-link" onClick={() => handleNavClick('finder')}>
                Student Profile Form
              </li>
            </ul>
          </div>

          {/* Supported Departments */}
          <div>
            <h4 className="footer-heading">Departments</h4>
            <ul className="footer-link-list">
              <li className="footer-link">Computer Science & Engineering</li>
              <li className="footer-link">Electrical & Electronic Eng.</li>
              <li className="footer-link">Civil Engineering</li>
              <li className="footer-link">Business Administration (BBA)</li>
              <li className="footer-link">Department of English</li>
              <li className="footer-link">All Disciplines</li>
            </ul>
          </div>

          {/* Platform Standards */}
          <div>
            <h4 className="footer-heading">Integrity & Quality</h4>
            <ul className="footer-link-list">
              <li className="footer-link" style={{ cursor: 'default' }}>
                <ShieldCheck size={14} style={{ display: 'inline', marginRight: '6px', color: '#10b981' }} />
                Deterministic Rule Matching
              </li>
              <li className="footer-link" style={{ cursor: 'default' }}>
                <ShieldCheck size={14} style={{ display: 'inline', marginRight: '6px', color: '#10b981' }} />
                Zero-Hallucination Criteria
              </li>
              <li className="footer-link" style={{ cursor: 'default' }}>
                <ShieldCheck size={14} style={{ display: 'inline', marginRight: '6px', color: '#10b981' }} />
                Offline-Safe AI Fallback
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="footer-bottom">
          <div>
            © {new Date().getFullYear()} ScholarMate AI. Built for students seeking higher education opportunities.
          </div>
          <div>
            Crafted with React, Vite & Express • Shared Team Project
          </div>
        </div>
      </div>
    </footer>
  );
}
