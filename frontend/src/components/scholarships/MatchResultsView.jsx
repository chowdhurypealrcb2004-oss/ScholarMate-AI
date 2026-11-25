import React, { useState, useMemo } from 'react';
import {
  Award,
  Wallet,
  CheckCircle2,
  AlertTriangle,
  BookOpen,
  Filter,
  User,
  GraduationCap,
  Layers,
  SearchX,
} from 'lucide-react';
import ScholarshipCard from './ScholarshipCard';
import ScholarshipDetailModal from './ScholarshipDetailModal';
import ScholarshipFilters from './ScholarshipFilters';
import rawScholarshipsCatalog from '../../data/scholarships.json';
import './Scholarships.css';

export default function MatchResultsView({
  studentProfile,
  matchResults,
  onEditProfile,
}) {
  const [activeTab, setActiveTab] = useState('eligible'); // 'eligible' | 'almost' | 'all'
  const [selectedScholarship, setSelectedScholarship] = useState(null);
  const [selectedMatchData, setSelectedMatchData] = useState(null);

  const [filters, setFilters] = useState({
    search: '',
    category: 'All',
    department: 'All',
    need_based: 'All',
    gender: 'All',
    sortBy: 'deadline',
  });

  const handleFilterChange = (key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  const handleResetFilters = () => {
    setFilters({
      search: '',
      category: 'All',
      department: 'All',
      need_based: 'All',
      gender: 'All',
      sortBy: 'deadline',
    });
  };

  const handleOpenDetails = (scholarship, matchData = null) => {
    setSelectedScholarship(scholarship);
    setSelectedMatchData(matchData);
  };

  const handleCloseDetails = () => {
    setSelectedScholarship(null);
    setSelectedMatchData(null);
  };

  // Active dataset for current tab
  const tabRecords = useMemo(() => {
    if (activeTab === 'eligible') {
      return (matchResults?.fullyEligible || []).map((m) => ({
        scholarship: m.scholarship,
        matchData: m,
      }));
    } else if (activeTab === 'almost') {
      return (matchResults?.almostEligible || []).map((m) => ({
        scholarship: m.scholarship,
        matchData: m,
      }));
    } else {
      // Browse All 136
      return rawScholarshipsCatalog.map((s) => {
        // Find if evaluated in match results
        const eligibleMatch = matchResults?.fullyEligible?.find((m) => m.scholarship.id === s.id);
        const almostMatch = matchResults?.almostEligible?.find((m) => m.scholarship.id === s.id);
        return {
          scholarship: s,
          matchData: eligibleMatch || almostMatch || null,
        };
      });
    }
  }, [activeTab, matchResults]);

  // Filter and sort the tab records
  const filteredRecords = useMemo(() => {
    let result = [...tabRecords];

    const q = (filters.search || '').trim().toLowerCase();
    if (q) {
      result = result.filter(
        ({ scholarship }) =>
          scholarship.name.toLowerCase().includes(q) ||
          scholarship.provider.toLowerCase().includes(q) ||
          scholarship.description.toLowerCase().includes(q) ||
          (scholarship.category && scholarship.category.toLowerCase().includes(q))
      );
    }

    if (filters.category && filters.category !== 'All') {
      result = result.filter(
        ({ scholarship }) =>
          scholarship.category &&
          scholarship.category.toLowerCase() === filters.category.toLowerCase()
      );
    }

    if (filters.department && filters.department !== 'All') {
      result = result.filter(
        ({ scholarship }) =>
          scholarship.department === 'All' ||
          (scholarship.departments && scholarship.departments.includes(filters.department))
      );
    }

    if (filters.need_based && filters.need_based !== 'All') {
      result = result.filter(
        ({ scholarship }) => scholarship.need_based === filters.need_based
      );
    }

    if (filters.gender && filters.gender !== 'All') {
      result = result.filter(
        ({ scholarship }) =>
          scholarship.gender === 'All' || scholarship.gender === filters.gender
      );
    }

    // Sort
    result.sort((a, b) => {
      const sA = a.scholarship;
      const sB = b.scholarship;

      switch (filters.sortBy) {
        case 'deadline':
          return new Date(sA.deadline) - new Date(sB.deadline);
        case 'deadline_desc':
          return new Date(sB.deadline) - new Date(sA.deadline);
        case 'amount_desc':
          return (sB.amount_bdt || 0) - (sA.amount_bdt || 0);
        case 'amount_asc':
          return (sA.amount_bdt || 0) - (sB.amount_bdt || 0);
        case 'cgpa_asc':
          return (sA.min_cgpa || 0) - (sB.min_cgpa || 0);
        case 'relevance':
          return (b.matchData?.matchScore || 0) - (a.matchData?.matchScore || 0);
        default:
          return sA.id - sB.id;
      }
    });

    return result;
  }, [tabRecords, filters]);

  const fullyEligibleCount = matchResults?.fullyEligible?.length || 0;
  const almostEligibleCount = matchResults?.almostEligible?.length || 0;
  const totalAidAmount = matchResults?.summary?.totalEligibleAid || 0;
  const totalCatalogCount = rawScholarshipsCatalog.length;

  return (
    <div className="scholarships-container" id="matching-results-section">
      {/* 1. Student Profile Summary Pill */}
      {studentProfile && (
        <div className="student-summary-banner">
          <div className="student-summary-left">
            <div className="student-avatar-badge">
              {studentProfile.name ? studentProfile.name.charAt(0).toUpperCase() : 'S'}
            </div>
            <div className="student-summary-info">
              <h4>Matching for {studentProfile.name}</h4>
              <div className="student-meta-chips">
                <span className="student-chip">
                  <GraduationCap size={13} /> {studentProfile.department}
                </span>
                <span className="student-chip">
                  CGPA: <strong>{Number(studentProfile.cgpa).toFixed(2)}</strong>
                </span>
                <span className="student-chip">
                  <User size={13} /> {studentProfile.gender}
                </span>
                <span className="student-chip">
                  <Wallet size={13} />
                  {studentProfile.needBased ? 'Financial Aid Needed' : 'Merit Only'}
                </span>
              </div>
            </div>
          </div>

          {onEditProfile && (
            <button
              type="button"
              className="filter-reset-btn"
              onClick={onEditProfile}
            >
              Modify Profile
            </button>
          )}
        </div>
      )}

      {/* 2. Statistical Metric Highlights */}
      <div className="match-stats-grid">
        <div className="stat-metric-card">
          <div className="stat-metric-icon emerald">
            <CheckCircle2 size={22} />
          </div>
          <div className="stat-metric-info">
            <div className="metric-num">{fullyEligibleCount}</div>
            <div className="metric-label">Fully Qualified Scholarships</div>
          </div>
        </div>

        <div className="stat-metric-card">
          <div className="stat-metric-icon indigo">
            <Wallet size={22} />
          </div>
          <div className="stat-metric-info">
            <div className="metric-num">৳{totalAidAmount.toLocaleString('en-US')}</div>
            <div className="metric-label">Total Potential Aid Pool</div>
          </div>
        </div>

        <div className="stat-metric-card">
          <div className="stat-metric-icon amber">
            <AlertTriangle size={22} />
          </div>
          <div className="stat-metric-info">
            <div className="metric-num">{almostEligibleCount}</div>
            <div className="metric-label">Within Reach (Almost Eligible)</div>
          </div>
        </div>

        <div className="stat-metric-card">
          <div className="stat-metric-icon indigo">
            <Layers size={22} />
          </div>
          <div className="stat-metric-info">
            <div className="metric-num">{totalCatalogCount}</div>
            <div className="metric-label">Official Database Total</div>
          </div>
        </div>
      </div>

      {/* 3. Tab Navigation */}
      <div className="matching-tabs-nav">
        <button
          type="button"
          className={`matching-tab-btn ${activeTab === 'eligible' ? 'active' : ''}`}
          onClick={() => setActiveTab('eligible')}
        >
          <CheckCircle2 size={16} />
          <span>Eligible Matches</span>
          <span className="tab-pill-badge">{fullyEligibleCount}</span>
        </button>

        <button
          type="button"
          className={`matching-tab-btn ${activeTab === 'almost' ? 'active' : ''}`}
          onClick={() => setActiveTab('almost')}
        >
          <AlertTriangle size={16} />
          <span>Almost Eligible</span>
          <span className="tab-pill-badge">{almostEligibleCount}</span>
        </button>

        <button
          type="button"
          className={`matching-tab-btn ${activeTab === 'all' ? 'active' : ''}`}
          onClick={() => setActiveTab('all')}
        >
          <BookOpen size={16} />
          <span>All Scholarships Catalog</span>
          <span className="tab-pill-badge">{totalCatalogCount}</span>
        </button>
      </div>

      {/* 4. Filter & Search Controls */}
      <ScholarshipFilters
        filters={filters}
        onFilterChange={handleFilterChange}
        onReset={handleResetFilters}
        totalResults={filteredRecords.length}
      />

      {/* 5. Results Count & Status Message */}
      <div className="results-summary-bar">
        <span>
          Showing <strong>{filteredRecords.length}</strong> scholarship
          {filteredRecords.length === 1 ? '' : 's'}
          {activeTab === 'eligible' && ' you qualify for'}
          {activeTab === 'almost' && ' you are close to qualifying for'}
          {activeTab === 'all' && ' in verified dataset'}
        </span>

        {activeTab === 'almost' && (
          <span style={{ color: 'var(--amber-700)', fontSize: '0.85rem' }}>
            💡 Check each card for the exact GPA or requirement needed to qualify
          </span>
        )}
      </div>

      {/* 6. Scholarship Cards Grid */}
      {filteredRecords.length > 0 ? (
        <div className="scholarships-grid">
          {filteredRecords.map(({ scholarship, matchData }) => (
            <ScholarshipCard
              key={scholarship.id}
              scholarship={scholarship}
              matchData={matchData}
              onViewDetails={handleOpenDetails}
            />
          ))}
        </div>
      ) : (
        /* Empty State */
        <div className="empty-results-box">
          <SearchX size={44} />
          <h4>No matching scholarships found</h4>
          <p>
            No scholarships match your current search and filter combination in this tab.
            Try adjusting or resetting your filter criteria.
          </p>
          <button
            type="button"
            className="filter-reset-btn"
            onClick={handleResetFilters}
          >
            Clear Search & Filters
          </button>
        </div>
      )}

      {/* 7. Detailed Scholarship Modal */}
      {selectedScholarship && (
        <ScholarshipDetailModal
          scholarship={selectedScholarship}
          matchData={selectedMatchData}
          onClose={handleCloseDetails}
        />
      )}
    </div>
  );
}
