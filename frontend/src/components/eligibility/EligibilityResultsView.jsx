import React, { useState, useMemo } from 'react';
import {
  User,
  GraduationCap,
  Sparkles,
  Search,
  Filter,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  HelpCircle,
  RotateCcw,
  LayoutDashboard,
  ArrowRight,
  BookOpen,
} from 'lucide-react';
import EligibilityCard from './EligibilityCard';
import RequirementComparisonModal from './RequirementComparisonModal';
import IncompleteProfileRefinement from './IncompleteProfileRefinement';
import EligibilitySummaryBar from './EligibilitySummaryBar';
import { ELIGIBILITY_STATUS } from '../../utils/eligibilityEvaluator';
import './Eligibility.css';

export default function EligibilityResultsView({
  studentProfile,
  evaluationResults,
  onEditProfile,
  onProfileFieldUpdate,
}) {
  const [activeTab, setActiveTab] = useState('eligible'); // 'eligible' | 'potentially' | 'ineligible'
  const [selectedRecord, setSelectedRecord] = useState(null);

  const [filters, setFilters] = useState({
    search: '',
    category: 'All',
    department: 'All',
    sortBy: 'readiness', // 'readiness' | 'amount_desc' | 'amount_asc' | 'deadline' | 'cgpa_asc'
  });

  const { student, classification, summary, missingFields = [], aiAdvisorContext } = evaluationResults || {};

  // Active records by tab
  const activeList = useMemo(() => {
    if (!classification) return [];
    if (activeTab === 'eligible') {
      return classification.eligible || [];
    } else if (activeTab === 'potentially') {
      return classification.potentiallyEligible || [];
    } else {
      return classification.notEligible || [];
    }
  }, [activeTab, classification]);

  // Filtered & sorted records
  const filteredList = useMemo(() => {
    let list = [...activeList];

    // Search
    const q = (filters.search || '').trim().toLowerCase();
    if (q) {
      list = list.filter(({ scholarship, explanation }) => {
        return (
          scholarship.name.toLowerCase().includes(q) ||
          scholarship.provider.toLowerCase().includes(q) ||
          (scholarship.category && scholarship.category.toLowerCase().includes(q)) ||
          explanation.narrativeExplanation.toLowerCase().includes(q)
        );
      });
    }

    // Category
    if (filters.category && filters.category !== 'All') {
      list = list.filter(
        ({ scholarship }) =>
          scholarship.category && scholarship.category.toLowerCase() === filters.category.toLowerCase()
      );
    }

    // Department
    if (filters.department && filters.department !== 'All') {
      list = list.filter(({ scholarship }) => {
        if (scholarship.department === 'All') return true;
        const depts = scholarship.departments || scholarship.department.split(';').map((d) => d.trim());
        return depts.includes(filters.department);
      });
    }

    // Sorting
    list.sort((a, b) => {
      const sA = a.scholarship;
      const sB = b.scholarship;

      switch (filters.sortBy) {
        case 'amount_desc':
          return (sB.amount_bdt || 0) - (sA.amount_bdt || 0);
        case 'amount_asc':
          return (sA.amount_bdt || 0) - (sB.amount_bdt || 0);
        case 'deadline':
          return new Date(sA.deadline) - new Date(sB.deadline);
        case 'cgpa_asc':
          return (sA.min_cgpa || 0) - (sB.min_cgpa || 0);
        case 'readiness':
        default:
          return (b.readinessScore || 0) - (a.readinessScore || 0);
      }
    });

    return list;
  }, [activeList, filters]);

  // Extract unique categories for filter dropdown
  const uniqueCategories = useMemo(() => {
    const set = new Set();
    const all = [
      ...(classification?.eligible || []),
      ...(classification?.potentiallyEligible || []),
      ...(classification?.notEligible || []),
    ];
    all.forEach(({ scholarship }) => {
      if (scholarship.category) set.add(scholarship.category);
    });
    return Array.from(set);
  }, [classification]);

  const handleOpenDetails = (record) => {
    setSelectedRecord(record);
  };

  const handleCloseDetails = () => {
    setSelectedRecord(null);
  };

  return (
    <div className="eligibility-container" id="eligibility-results-view">
      {/* 1. Student Profile Header Bar */}
      <div className="eval-profile-banner">
        <div className="eval-profile-header">
          <div className="eval-profile-title-group">
            <div className="eval-profile-avatar">
              {(student?.name || 'S').charAt(0).toUpperCase()}
            </div>
            <div>
              <h3 className="eval-profile-name">{student?.name || 'Student Profile'}</h3>
              <div className="eval-profile-sub">
                Evaluated against official catalog of {summary?.totalScholarships || 136} verified scholarships
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            {summary?.profileCompletenessPercent !== undefined && (
              <span
                style={{
                  fontSize: '0.8rem',
                  fontWeight: 700,
                  color: summary.profileCompletenessPercent === 100 ? 'var(--emerald-700)' : 'var(--amber-700)',
                  background: summary.profileCompletenessPercent === 100 ? 'var(--emerald-50)' : 'var(--amber-50)',
                  border: `1px solid ${summary.profileCompletenessPercent === 100 ? 'var(--emerald-200)' : 'var(--amber-200)'}`,
                  padding: '0.35rem 0.75rem',
                  borderRadius: 'var(--radius-full)',
                }}
              >
                Profile Completeness: {summary.profileCompletenessPercent}%
              </span>
            )}

            {onEditProfile && (
              <button
                type="button"
                className="button button-secondary button-sm"
                onClick={onEditProfile}
              >
                Edit Profile
              </button>
            )}
          </div>
        </div>

        {/* Profile Chips */}
        <div className="eval-profile-chips">
          <div className="eval-chip highlight">
            <span className="eval-chip-key">CGPA:</span>
            <span>{(student?.cgpa || 0).toFixed(2)}</span>
          </div>
          <div className="eval-chip">
            <span className="eval-chip-key">Dept:</span>
            <span>{student?.department || 'Not selected'}</span>
          </div>
          <div className="eval-chip">
            <span className="eval-chip-key">Degree Level:</span>
            <span>{student?.degreeLevel || 'Not Specified'}</span>
          </div>
          <div className="eval-chip">
            <span className="eval-chip-key">Country:</span>
            <span>{student?.countryPreference || 'Not Specified'}</span>
          </div>
          <div className="eval-chip">
            <span className="eval-chip-key">Gender:</span>
            <span>{student?.gender || 'Not specified'}</span>
          </div>
          <div className="eval-chip">
            <span className="eval-chip-key">Aid Need:</span>
            <span>{student?.needBased ? 'Yes (Need-Based)' : 'No (Merit-Only)'}</span>
          </div>
        </div>
      </div>

      {/* 2. Incomplete Profile Refinement Box (If missing degreeLevel or country) */}
      {missingFields.length > 0 && onProfileFieldUpdate && (
        <IncompleteProfileRefinement
          studentProfile={student || {}}
          missingFields={missingFields}
          onUpdateField={onProfileFieldUpdate}
        />
      )}

      {/* 3. Metric Summary Bar */}
      <EligibilitySummaryBar summary={summary} />

      {/* 4. Tab Switcher (Eligible vs Potentially Eligible vs Not Eligible) */}
      <div className="eval-tabs-bar" role="tablist">
        <button
          type="button"
          className={`eval-tab-btn ${activeTab === 'eligible' ? 'active' : ''}`}
          onClick={() => setActiveTab('eligible')}
          role="tab"
          aria-selected={activeTab === 'eligible'}
        >
          <CheckCircle2 size={18} style={{ color: 'var(--emerald-600)' }} />
          <span>Eligible Scholarships</span>
          <span className="eval-tab-count eligible">{summary?.eligibleCount || 0}</span>
        </button>

        <button
          type="button"
          className={`eval-tab-btn ${activeTab === 'potentially' ? 'active' : ''}`}
          onClick={() => setActiveTab('potentially')}
          role="tab"
          aria-selected={activeTab === 'potentially'}
        >
          <AlertTriangle size={18} style={{ color: 'var(--amber-600)' }} />
          <span>Potentially Eligible</span>
          <span className="eval-tab-count potentially">{summary?.potentiallyEligibleCount || 0}</span>
        </button>

        <button
          type="button"
          className={`eval-tab-btn ${activeTab === 'ineligible' ? 'active' : ''}`}
          onClick={() => setActiveTab('ineligible')}
          role="tab"
          aria-selected={activeTab === 'ineligible'}
        >
          <XCircle size={18} style={{ color: '#ef4444' }} />
          <span>Not Eligible</span>
          <span className="eval-tab-count ineligible">{summary?.notEligibleCount || 0}</span>
        </button>
      </div>

      {/* 5. Toolbar Filters & Sorting */}
      <div className="eval-toolbar">
        <div className="eval-search-input-wrap">
          <Search size={18} className="eval-search-icon" />
          <input
            type="text"
            className="eval-search-input"
            placeholder="Search by name, provider, keyword or requirement..."
            value={filters.search}
            onChange={(e) => setFilters((prev) => ({ ...prev, search: e.target.value }))}
          />
        </div>

        <div className="eval-filters-row">
          <select
            className="eval-filter-select"
            value={filters.category}
            onChange={(e) => setFilters((prev) => ({ ...prev, category: e.target.value }))}
          >
            <option value="All">All Categories ({uniqueCategories.length})</option>
            {uniqueCategories.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>

          <select
            className="eval-filter-select"
            value={filters.department}
            onChange={(e) => setFilters((prev) => ({ ...prev, department: e.target.value }))}
          >
            <option value="All">All Academic Departments</option>
            <option value="CSE">CSE</option>
            <option value="EEE">EEE</option>
            <option value="CE">CE</option>
            <option value="BBA">BBA</option>
            <option value="English">English</option>
          </select>

          <select
            className="eval-filter-select"
            value={filters.sortBy}
            onChange={(e) => setFilters((prev) => ({ ...prev, sortBy: e.target.value }))}
          >
            <option value="readiness">Sort by Readiness Score</option>
            <option value="amount_desc">Highest Aid (BDT)</option>
            <option value="amount_asc">Lowest Aid (BDT)</option>
            <option value="deadline">Nearest Deadline</option>
            <option value="cgpa_asc">Lowest Min CGPA Cutoff</option>
          </select>
        </div>
      </div>

      {/* 6. Active Tab Description Banner */}
      <div
        style={{
          background: 'white',
          padding: '0.85rem 1.25rem',
          borderRadius: 'var(--radius-md)',
          border: '1px solid var(--slate-200)',
          marginBottom: '1.25rem',
          fontSize: '0.875rem',
          color: 'var(--slate-600)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <div>
          {activeTab === 'eligible' && (
            <span>
              Showing <strong>{filteredList.length}</strong> scholarship{filteredList.length === 1 ? '' : 's'} where all eligibility conditions (CGPA, Department, Degree Level, Country, Gender, Need) are 100% satisfied.
            </span>
          )}
          {activeTab === 'potentially' && (
            <span>
              Showing <strong>{filteredList.length}</strong> scholarship{filteredList.length === 1 ? '' : 's'} with reachable criteria, pending document verification, or incomplete profile fields.
            </span>
          )}
          {activeTab === 'ineligible' && (
            <span>
              Showing <strong>{filteredList.length}</strong> scholarship{filteredList.length === 1 ? '' : 's'} that failed mandatory department, CGPA, gender, or degree criteria.
            </span>
          )}
        </div>
        <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--slate-400)' }}>
          Showing {filteredList.length} of {activeList.length}
        </span>
      </div>

      {/* 7. Grid of Evaluated Cards */}
      {filteredList.length === 0 ? (
        <div
          style={{
            background: 'white',
            borderRadius: 'var(--radius-lg)',
            border: '1px solid var(--slate-200)',
            padding: '3rem 1.5rem',
            textAlign: 'center',
          }}
        >
          <BookOpen size={36} color="var(--slate-400)" style={{ margin: '0 auto 1rem' }} />
          <h4 style={{ fontSize: '1.15rem', fontWeight: 700, color: 'var(--slate-800)' }}>
            No scholarships found matching current filter
          </h4>
          <p style={{ fontSize: '0.875rem', color: 'var(--slate-500)', marginTop: '0.35rem' }}>
            Try resetting your search query or department filter.
          </p>
          <button
            type="button"
            className="button button-secondary button-sm"
            style={{ marginTop: '1rem' }}
            onClick={() => setFilters({ search: '', category: 'All', department: 'All', sortBy: 'readiness' })}
          >
            Reset Filters
          </button>
        </div>
      ) : (
        <div className="eval-cards-grid">
          {filteredList.map((record) => (
            <EligibilityCard
              key={record.scholarship.id}
              evaluatedRecord={record}
              onOpenDetails={handleOpenDetails}
            />
          ))}
        </div>
      )}

      {/* 8. Detailed Comparison Modal */}
      {selectedRecord && (
        <RequirementComparisonModal
          evaluatedRecord={selectedRecord}
          onClose={handleCloseDetails}
        />
      )}

      {/* 9. Module 5 Handoff Banner */}
      <div className="module5-handoff-banner" id="module5-handoff">
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div
            style={{
              width: 44,
              height: 44,
              borderRadius: 'var(--radius-md)',
              background: 'white',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--primary-600)',
              boxShadow: 'var(--shadow-sm)',
            }}
          >
            <LayoutDashboard size={22} />
          </div>
          <div>
            <div style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--primary-700)', textTransform: 'uppercase' }}>
              Module 5 Hand-Off Prepared
            </div>
            <h4 style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--slate-900)' }}>
              Evaluated Results Ready for Results Dashboard & AI Advisor
            </h4>
            <p style={{ fontSize: '0.85rem', color: 'var(--slate-600)', margin: '0.2rem 0 0' }}>
              {summary?.eligibleCount || 0} fully qualified awards and {summary?.potentiallyEligibleCount || 0} conditional opportunities formatted for Google Gemini advising.
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--emerald-600)', fontWeight: 700, fontSize: '0.9rem' }}>
          <CheckCircle2 size={18} />
          <span>Module 4 Complete</span>
        </div>
      </div>
    </div>
  );
}
