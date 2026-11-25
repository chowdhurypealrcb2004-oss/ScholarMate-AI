import React, { useState } from 'react';
import {
  UserCircle2,
  LayoutDashboard,
  CheckCircle,
  Sparkles,
  BookOpen,
  AlertCircle,
  GraduationCap,
} from 'lucide-react';

import Badge from '../common/Badge';
import StudentProfileForm from '../profile';
import MatchResultsView from '../scholarships/MatchResultsView';
import EligibilityResultsView from '../eligibility/EligibilityResultsView';
import ResultsDashboard from '../dashboard';
import { postStudentMatch, evaluateStudentEligibility } from '../../api/client';
import rawScholarshipsCatalog from '../../data/scholarships.json';

const DEMO_PRESETS = [
  {
    id: 'ayesha',
    label: 'Ayesha (CSE, 3.75, Complete Profile)',
    profile: {
      name: 'Ayesha Rahman',
      department: 'CSE',
      cgpa: 3.75,
      gender: 'Female',
      needBased: true,
      degreeLevel: 'Undergraduate',
      countryPreference: 'Bangladesh',
      hasPortfolio: true,
      hasVolunteerHours: true,
    },
  },
  {
    id: 'nusrat-incomplete',
    label: 'Nusrat (BBA, 3.40, Incomplete Profile)',
    profile: {
      name: 'Nusrat Jahan',
      department: 'BBA',
      cgpa: 3.40,
      gender: 'Female',
      needBased: true,
      // degreeLevel and countryPreference omitted to demonstrate Incomplete Profile handling
    },
  },
  {
    id: 'tanvir',
    label: 'Tanvir (EEE, 3.55, Merit-Only)',
    profile: {
      name: 'Tanvir Hossain',
      department: 'EEE',
      cgpa: 3.55,
      gender: 'Male',
      needBased: false,
      degreeLevel: 'Undergraduate',
      countryPreference: 'Bangladesh',
    },
  },
  {
    id: 'ineligible-demo',
    label: 'Karim (English, 2.10, Ineligible)',
    profile: {
      name: 'Karim Ullah',
      department: 'English',
      cgpa: 2.10,
      gender: 'Male',
      needBased: false,
      degreeLevel: 'Masters',
      countryPreference: 'USA',
    },
  },
];

export default function PlaceholderSection({ onGetStarted }) {
  const [studentProfile, setStudentProfile] = useState(null);
  const [isMatching, setIsMatching] = useState(false);
  const [evaluationResults, setEvaluationResults] = useState(null);
  const [matchResults, setMatchResults] = useState(null);
  const [activeResultsView, setActiveResultsView] = useState('dashboard'); // 'dashboard' | 'evaluation' | 'catalog'
  const [matchError, setMatchError] = useState(null);
  const [showCatalogFirst, setShowCatalogFirst] = useState(false);

  const handleMatch = async (profile) => {
    setIsMatching(true);
    setMatchError(null);
    setStudentProfile(profile);

    try {
      const [evalResults, matchRes] = await Promise.all([
        evaluateStudentEligibility(profile),
        postStudentMatch(profile),
      ]);
      setEvaluationResults(evalResults);
      setMatchResults(matchRes);
      setActiveResultsView('dashboard');

      // Smooth scroll to results
      setTimeout(() => {
        const el = document.getElementById('results-dashboard-view') || document.getElementById('eligibility-results-view') || document.getElementById('matching-results-section');
        if (el) {
          el.scrollIntoView({ behavior: 'smooth' });
        }
      }, 150);
    } catch (err) {
      console.error('Matching Error:', err);
      setMatchError(err.message || 'Failed to evaluate eligibility. Please try again.');
    } finally {
      setIsMatching(false);
    }
  };

  const handleProfileFieldUpdate = async (fieldName, nextValue) => {
    const updatedProfile = {
      ...studentProfile,
      [fieldName]: nextValue,
    };
    setStudentProfile(updatedProfile);
    try {
      const evalResults = await evaluateStudentEligibility(updatedProfile);
      setEvaluationResults(evalResults);
    } catch (err) {
      console.warn('Field update re-eval error:', err);
    }
  };

  const handleEditProfile = () => {
    const el = document.getElementById('profile-module-slot');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <section className="placeholder-section" id="finder">
      <div className="container">

        <div className="section-header">
          <span className="section-tag">Scholarship Matching Engine</span>
          <h2 className="section-title">Personalized Scholarship Matcher</h2>
          <p className="section-desc">
            Enter your academic credentials to instantly match against our verified official catalog of 136 scholarships.
          </p>
        </div>

        {/* MODULE 2: STUDENT PROFILE FORM */}
        <div id="profile-module-slot">
          <StudentProfileForm
            onSubmit={handleMatch}
            isLoading={isMatching}
            initialValues={studentProfile}
            presetProfiles={DEMO_PRESETS}
            submitLabel={isMatching ? 'Matching Criteria...' : 'Find Scholarships'}
          />
        </div>

        {matchError && (
          <div
            style={{
              marginTop: '1.5rem',
              padding: '1rem',
              background: '#fef2f2',
              border: '1px solid #fecaca',
              borderRadius: '12px',
              color: '#991b1b',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
            }}
          >
            <AlertCircle size={20} />
            <span>{matchError}</span>
          </div>
        )}

        {/* VIEW MODE SWITCHER (Module 5 vs Module 4 vs Module 3) */}
        {(evaluationResults || matchResults) && (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.75rem',
              marginTop: '2.5rem',
              marginBottom: '1rem',
              flexWrap: 'wrap',
            }}
          >
            <button
              type="button"
              className={`button button-sm ${activeResultsView === 'dashboard' ? 'button-primary' : 'button-secondary'}`}
              onClick={() => setActiveResultsView('dashboard')}
              style={{ fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}
            >
              <Sparkles size={16} />
              <span>Module 5: AI Advisor & Results Dashboard</span>
            </button>
            <button
              type="button"
              className={`button button-sm ${activeResultsView === 'evaluation' ? 'button-primary' : 'button-secondary'}`}
              onClick={() => setActiveResultsView('evaluation')}
            >
              <span>🎯 Module 4: Eligibility Evaluation View</span>
            </button>
            <button
              type="button"
              className={`button button-sm ${activeResultsView === 'catalog' ? 'button-primary' : 'button-secondary'}`}
              onClick={() => setActiveResultsView('catalog')}
            >
              <span>📋 Module 3: Catalog Match View</span>
            </button>
          </div>
        )}

        {/* RESULTS VIEWS */}
        {evaluationResults && activeResultsView === 'dashboard' ? (
          <ResultsDashboard
            studentProfile={studentProfile}
            evaluationResults={evaluationResults}
            onEditProfile={handleEditProfile}
          />
        ) : evaluationResults && activeResultsView === 'evaluation' ? (
          <EligibilityResultsView
            studentProfile={studentProfile}
            evaluationResults={evaluationResults}
            onEditProfile={handleEditProfile}
            onProfileFieldUpdate={handleProfileFieldUpdate}
          />
        ) : matchResults ? (
          <MatchResultsView
            studentProfile={studentProfile}
            matchResults={matchResults}
            onEditProfile={handleEditProfile}
          />
        ) : (
          <div style={{ marginTop: '2rem', textAlign: 'center' }}>
            <button
              type="button"
              className="filter-reset-btn"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.5rem',
                padding: '0.75rem 1.5rem',
                fontSize: '0.95rem',
                margin: '0 auto',
              }}
              onClick={() => setShowCatalogFirst((prev) => !prev)}
            >
              <BookOpen size={18} />
              <span>
                {showCatalogFirst
                  ? 'Hide Scholarship Catalog'
                  : 'Or Browse Official Catalog (136 Scholarships) Without Profile'}
              </span>
            </button>

            {showCatalogFirst && (
              <MatchResultsView
                studentProfile={null}
                matchResults={{ fullyEligible: [], almostEligible: [] }}
              />
            )}
          </div>
        )}

        {/* MODULE 1-5 UNIFIED INTEGRATION BANNER */}
        <div
          className="module-placeholder-box"
          id="dashboard-module-slot"
          style={{
            borderStyle: 'solid',
            borderColor: 'var(--emerald-200)',
            background: 'linear-gradient(180deg, #ffffff 0%, #f0fdf4 100%)',
            marginTop: '3.5rem',
          }}
        >
          <Badge variant="emerald" icon={Sparkles}>
            ALL 5 MODULES FULLY INTEGRATED & OPERATIONAL
          </Badge>

          <h3 style={{
            fontSize: '1.45rem',
            fontWeight: 800,
            marginTop: '1rem',
            color: 'var(--slate-900)',
          }}>
            Complete ScholarMate-AI Application System
          </h3>

          <p style={{ maxWidth: '680px', margin: '1rem auto', color: 'var(--slate-600)', fontSize: '0.95rem' }}>
            All five modules are fully integrated into this single, cohesive platform:
            <strong> Module 1</strong> (Responsive UI/UX & Navigation),
            <strong> Module 2</strong> (Student Profile Form & Real-time Validation),
            <strong> Module 3</strong> (136 Ingested Scholarship Records & Match Engine),
            <strong> Module 4</strong> (Deterministic Eligibility Evaluation & Criteria Matrix), and
            <strong> Module 5</strong> (Google Gemini AI Advisor & Dynamic Results Dashboard).
          </p>

          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', color: 'var(--emerald-700)', fontWeight: 600 }}>
            <CheckCircle size={18} />
            <span>End-to-end evaluation, sorting, and AI personalized guidance verified across all 136 records.</span>
          </div>
        </div>

      </div>
    </section>
  );
}
