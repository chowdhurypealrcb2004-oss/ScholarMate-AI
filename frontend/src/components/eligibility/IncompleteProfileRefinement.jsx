import React from 'react';
import { HelpCircle, Sparkles, Check, ChevronRight } from 'lucide-react';

export default function IncompleteProfileRefinement({
  studentProfile,
  missingFields = [],
  onUpdateField,
}) {
  if (!missingFields || missingFields.length === 0) return null;

  const isDegreeMissing = missingFields.includes('degreeLevel');
  const isCountryMissing = missingFields.includes('countryPreference');

  return (
    <div className="incomplete-refinement-box">
      <div className="incomplete-refinement-header">
        <HelpCircle size={22} style={{ flexShrink: 0, marginTop: '2px' }} />
        <div>
          <div className="incomplete-refinement-title">
            Profile Information Incomplete ({missingFields.length} field{missingFields.length > 1 ? 's' : ''} unconfirmed)
          </div>
          <div className="incomplete-refinement-desc">
            Scholarships requiring degree level or geographic eligibility are currently classified as{' '}
            <strong>Potentially Eligible</strong>. Specify your details below to finalize full eligibility evaluation instantly.
          </div>
        </div>
      </div>

      <div className="incomplete-refinement-controls">
        {isDegreeMissing && (
          <div className="incomplete-control-group">
            <span>Degree Level:</span>
            <select
              className="incomplete-select"
              value={studentProfile.degreeLevel || ''}
              onChange={(e) => onUpdateField('degreeLevel', e.target.value)}
            >
              <option value="">Select Degree Level...</option>
              <option value="Undergraduate">Undergraduate (Bachelor's)</option>
              <option value="Graduate">Graduate (Master's)</option>
              <option value="PhD">Doctorate (Ph.D.)</option>
              <option value="Diploma">Diploma / High School</option>
            </select>
          </div>
        )}

        {isCountryMissing && (
          <div className="incomplete-control-group">
            <span>Country / Region:</span>
            <select
              className="incomplete-select"
              value={studentProfile.countryPreference || ''}
              onChange={(e) => onUpdateField('countryPreference', e.target.value)}
            >
              <option value="">Select Country / Region...</option>
              <option value="Bangladesh">Bangladesh (Domestic)</option>
              <option value="International">International</option>
              <option value="Any">Open to Any Region</option>
            </select>
          </div>
        )}

        {/* 1-Click Complete Button */}
        <button
          type="button"
          className="button button-primary button-sm"
          style={{ marginLeft: 'auto', display: 'inline-flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.8rem' }}
          onClick={() => {
            onUpdateField('degreeLevel', studentProfile.degreeLevel || 'Undergraduate');
            onUpdateField('countryPreference', studentProfile.countryPreference || 'Bangladesh');
          }}
        >
          <Sparkles size={14} />
          <span>Quick Confirm: Undergraduate & Bangladesh</span>
        </button>
      </div>
    </div>
  );
}
