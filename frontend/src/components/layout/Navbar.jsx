import React, { useState } from 'react';
import {
  GraduationCap,
  Sparkles,
  Menu,
  X,
  Compass,
  BarChart3,
  Layers,
  ArrowRight,
} from 'lucide-react';
import Button from '../common/Button';

export default function Navbar({ activeSection = 'home', onNavigate }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleNavClick = (sectionId) => {
    setMobileMenuOpen(false);
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
    <header className="navbar-wrapper">
      <div className="container nav-container">
        {/* Logo and Brand Title */}
        <div
          className="brand-logo-group"
          onClick={() => handleNavClick('home')}
          role="button"
          tabIndex={0}
        >
          <div className="brand-icon-box">
            <GraduationCap size={24} />
          </div>
          <div>
            <div className="brand-title">ScholarMate AI</div>
            <span className="brand-subtitle-tag">Personalized Scholarship Finder</span>
          </div>
        </div>

        {/* Desktop Navigation Links */}
        <nav className="nav-links">
          <li
            className={`nav-link-item ${activeSection === 'home' ? 'active' : ''}`}
            onClick={() => handleNavClick('home')}
          >
            Home
          </li>
          <li
            className={`nav-link-item ${activeSection === 'stats' ? 'active' : ''}`}
            onClick={() => handleNavClick('stats')}
          >
            Statistics
          </li>
          <li
            className={`nav-link-item ${activeSection === 'how-it-works' ? 'active' : ''}`}
            onClick={() => handleNavClick('how-it-works')}
          >
            How It Works
          </li>
          <li
            className={`nav-link-item ${activeSection === 'finder' ? 'active' : ''}`}
            onClick={() => handleNavClick('finder')}
          >
            Eligibility Matcher
          </li>
        </nav>

        {/* Action Button & Mobile Toggle */}
        <div className="nav-actions">
          <Button
            variant="primary"
            size="md"
            icon={ArrowRight}
            iconPosition="right"
            onClick={() => handleNavClick('finder')}
          >
            Get Started
          </Button>

          {/* Mobile Menu Hamburger */}
          <button
            type="button"
            className="btn btn-secondary btn-sm"
            style={{ display: 'none', padding: '0.5rem' }}
            aria-label="Toggle menu"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div
          style={{
            background: '#ffffff',
            borderBottom: '1px solid var(--slate-200)',
            padding: '1rem 1.5rem',
            display: 'flex',
            flexDirection: 'column',
            gap: '1rem',
          }}
        >
          <div
            className="nav-link-item"
            style={{ padding: '0.5rem 0' }}
            onClick={() => handleNavClick('home')}
          >
            Home
          </div>
          <div
            className="nav-link-item"
            style={{ padding: '0.5rem 0' }}
            onClick={() => handleNavClick('stats')}
          >
            Statistics
          </div>
          <div
            className="nav-link-item"
            style={{ padding: '0.5rem 0' }}
            onClick={() => handleNavClick('how-it-works')}
          >
            How It Works
          </div>
          <div
            className="nav-link-item"
            style={{ padding: '0.5rem 0' }}
            onClick={() => handleNavClick('finder')}
          >
            Eligibility Matcher
          </div>
        </div>
      )}
    </header>
  );
}
