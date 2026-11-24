import React, { useState } from 'react';
import {
  UserCircle2,
  LayoutDashboard,
  Cpu,
  CheckCircle,
} from 'lucide-react';

import Badge from '../common/Badge';
import StudentProfileForm from '../profile';

export default function PlaceholderSection({ onGetStarted }) {
  const [studentProfile, setStudentProfile] = useState(null);

  const handleMatch = async (profile) => {
    setStudentProfile(profile);
    console.log('Student Profile Submitted:', profile);
  };

  return (
    <section className="placeholder-section" id="finder">
      <div className="container">

        <div className="section-header">
          <span className="section-tag">Scholarship Finder</span>
          <h2 className="section-title">Student Matching Platform</h2>
          <p className="section-desc">
            Enter your academic information to find suitable scholarships.
          </p>
        </div>

        {/* MODULE 2: STUDENT PROFILE FORM */}
        <div id="profile-module-slot">
          <StudentProfileForm
            onSubmit={handleMatch}
            submitLabel="Find Scholarships"
          />
        </div>

        {studentProfile && (
          <div style={{
            marginTop: '1.5rem',
            padding: '1rem',
            background: '#ecfdf5',
            borderRadius: '12px',
            textAlign: 'center'
          }}>
            <CheckCircle size={20} />
            <h3>Profile Submitted Successfully!</h3>
            <p>Your information has been received.</p>
          </div>
        )}

        {/* MODULE 5: FUTURE INTEGRATION POINT */}
        <div
          className="module-placeholder-box"
          id="dashboard-module-slot"
          style={{
            borderStyle: 'solid',
            borderColor: 'var(--slate-200)',
            marginTop: '3rem'
          }}
        >
          <Badge variant="emerald" icon={LayoutDashboard}>
            MODULE 5 INTEGRATION POINT
          </Badge>

          <h3 style={{
            fontSize: '1.45rem',
            fontWeight: 800,
            marginTop: '1rem'
          }}>
            Scholarship Results Dashboard & Gemini AI Advisor
          </h3>

          <p style={{ maxWidth: '640px', margin: '1rem auto' }}>
            This section will display eligible scholarships,
            almost-eligible scholarships and AI-generated explanations.
          </p>

          <CheckCircle size={20} />
          <p>Waiting for dashboard integration.</p>
        </div>

      </div>
    </section>
  );
}