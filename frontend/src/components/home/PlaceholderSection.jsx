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
import { postStudentMatch } from '../../api/client';
import rawScholarshipsCatalog from '../../data/scholarships.json';

const DEMO_PRESETS = [
  {
    id: 'ayesha',
    label: 'Ayesha (CSE, 3.75, Need-Based)',
    profile: {
      name: 'Ayesha Rahman',
      department: 'CSE',
      cgpa: 3.75,
      gender: 'Female',
      needBased: true,
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
    },
  },
  {
    id: 'nusrat',
    label: 'Nusrat (BBA, 3.40, Need-Based)',
    profile: {
      name: 'Nusrat Jahan',
      department: 'BBA',
      cgpa: 3.40,
      gender: 'Female',
      needBased: true,
    },
  },
];

export default function PlaceholderSection({ onGetStarted }) {
  const [studentProfile, setStudentProfile] = useState(null);
  const [isMatching, setIsMatching] = useState(false);
  const [matchResults, setMatchResults] = useState(null);
  const [matchError, setMatchError] = useState(null);
  const [showCatalogFirst, setShowCatalogFirst] = useState(false);

  const handleMatch = async (profile) => {
    setIsMatching(true);
    setMatchError(null);
    setStudentProfile(profile);

    try {
      const results = await postStudentMatch(profile);
      setMatchResults(results);

      // Smooth scroll to results
      setTimeout(() => {
        const el = document.getElementById('matching-results-section');
        if (el) {
          el.scrollIntoView({ behavior: 'smooth' });
        }
      }, 150);
    } catch (err) {
      console.error('Matching Error:', err);
      setMatchError(err.message || 'Failed to match scholarships. Please try again.');
    } finally {
      setIsMatching(false);
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

        {/* MODULE 3: SCHOLARSHIP MATCHING & CATALOG RESULTS */}
        {matchResults ? (
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

        {/* MODULE 5: FUTURE INTEGRATION POINT */}
        <div
          className="module-placeholder-box"
          id="dashboard-module-slot"
          style={{
            borderStyle: 'solid',
            borderColor: 'var(--slate-200)',
            marginTop: '3.5rem',
          }}
        >
          <Badge variant="emerald" icon={LayoutDashboard}>
            MODULE 5 INTEGRATION POINT
          </Badge>

          <h3 style={{
            fontSize: '1.45rem',
            fontWeight: 800,
            marginTop: '1rem',
          }}>
            Scholarship Results Dashboard & Gemini AI Advisor
          </h3>

          <p style={{ maxWidth: '640px', margin: '1rem auto' }}>
            This section will display advanced AI-generated contextual advice, application preparation checklists,
            and exportable eligibility reports (Module 4 & Module 5).
          </p>

          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', color: 'var(--emerald-600)', fontWeight: 600 }}>
            <CheckCircle size={18} />
            <span>Module 3 Matching & Data Engine is ready for Module 4 AI Advisor integration.</span>
          </div>
        </div>

      </div>
    </section>
  );
}
