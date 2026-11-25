import React, { useState, useEffect, useMemo } from 'react';
import {
  Sparkles,
  Award,
  Wallet,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Filter,
  Search,
  ArrowUpDown,
  RotateCcw,
  User,
  GraduationCap,
  Calendar,
  Layers,
  SearchX,
  FileText,
  Loader2,
  ChevronRight,
} from 'lucide-react';
import DashboardCard from './DashboardCard';
import AIExecutiveBriefing from './AIExecutiveBriefing';
import RequirementComparisonModal from '../eligibility/RequirementComparisonModal';
import {
  fetchAiStatus,
  fetchAiBatchExplanations,
  fetchAiAdvisorSummary,
  generateClientFallbackExplanation,
} from '../../api/client';
import './ResultsDashboard.css';

export default function ResultsDashboard({
  studentProfile,
  evaluationResults,
  onEditProfile,
}) {
  const [activeTab, setActiveTab] = useState('eligible'); // 'eligible' | 'almost' | 'all'
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [aiStatus, setAiStatus] = useState(null);
  const [executiveSummary, setExecutiveSummary] = useState(null);
  const [aiExplanationsMap, setAiExplanationsMap] = useState({});
  const [loadingAiBatch, setLoadingAiBatch] = useState(false);

  // Filters & Sorting state
  const [filters, setFilters] = useState({
    search: '',
    category: 'All',
    department: 'All',
    sortBy: 'amount_desc', // default sorting by highest amount as requested
  });

  const { classification, summary } = evaluationResults || {};

  // Load AI Advisor status & executive summary on mount or profile change
  useEffect(() => {
    let isMounted = true;

    async function loadAdvisorData() {
      if (!studentProfile || !evaluationResults) return;

      try {
        const statusData = await fetchAiStatus();
        if (isMounted) setAiStatus(statusData);

        const summaryData = await fetchAiAdvisorSummary(studentProfile, evaluationResults);
        if (isMounted) setExecutiveSummary(summaryData);
      } catch (err) {
        console.warn('AI Advisor briefing initialization error:', err);
      }
    }

    loadAdvisorData();

    return () => {
      isMounted = false;
    };
  }, [studentProfile, evaluationResults]);

  // Pre-load AI explanations for eligible & almost eligible scholarships
  useEffect(() => {
    let isMounted = true;

    async function prefetchExplanations() {
      if (!studentProfile || !classification) return;

      const priorityEligible = (classification.eligible || []).slice(0, 8);
      const priorityAlmost = (classification.potentiallyEligible || []).slice(0, 4);
      const toFetch = [...priorityEligible, ...priorityAlmost];

      if (toFetch.length === 0) return;

      setLoadingAiBatch(true);
      try {
        const batchResults = await fetchAiBatchExplanations(studentProfile, toFetch);
        if (isMounted && Array.isArray(batchResults)) {
          const map = {};
          batchResults.forEach((res) => {
            if (res && res.scholarshipId) {
              map[res.scholarshipId] = res;
            }
          });
          setAiExplanationsMap((prev) => ({ ...prev, ...map }));
        }
      } catch (err) {
        console.warn('Batch AI explanation load error:', err);
      } finally {
        if (isMounted) setLoadingAiBatch(false);
      }
    }

    prefetchExplanations();

    return () => {
      isMounted = false;
    };
  }, [studentProfile, classification]);

  // Determine current active list based on tab
  const rawList = useMemo(() => {
    if (!classification) return [];
    if (activeTab === 'eligible') {
      return classification.eligible || [];
    } else if (activeTab === 'almost') {
      return classification.potentiallyEligible || [];
    } else {
      // All evaluated (136 records)
      return [
        ...(classification.eligible || []),
        ...(classification.potentiallyEligible || []),
        ...(classification.notEligible || []),
      ];
    }
  }, [activeTab, classification]);

  // Extract unique categories for filter dropdown
  const availableCategories = useMemo(() => {
    const set = new Set();
    const all = [
      ...(classification?.eligible || []),
      ...(classification?.potentiallyEligible || []),
      ...(classification?.notEligible || []),
    ];
    all.forEach(({ scholarship }) => {
      if (scholarship?.category) set.add(scholarship.category);
    });
    return Array.from(set).sort();
  }, [classification]);

  // Apply search, category filter, department filter, and sorting
  const filteredAndSortedList = useMemo(() => {
    let list = [...rawList];

    // Search query
    const q = (filters.search || '').trim().toLowerCase();
    if (q) {
      list = list.filter(({ scholarship, explanation }) => {
        return (
          scholarship.name.toLowerCase().includes(q) ||
          scholarship.provider.toLowerCase().includes(q) ||
          (scholarship.description && scholarship.description.toLowerCase().includes(q)) ||
          (explanation?.narrativeExplanation && explanation.narrativeExplanation.toLowerCase().includes(q))
        );
      });
    }

    // Category filter
    if (filters.category && filters.category !== 'All') {
      list = list.filter(
        ({ scholarship }) =>
          scholarship.category && scholarship.category.toLowerCase() === filters.category.toLowerCase()
      );
    }

    // Department filter
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
        case 'deadline_asc':
          return new Date(sA.deadline) - new Date(sB.deadline);
        case 'deadline_desc':
          return new Date(sB.deadline) - new Date(sA.deadline);
        case 'readiness_desc':
          return (b.readinessScore || 0) - (a.readinessScore || 0);
        case 'cgpa_asc':
          return (sA.min_cgpa || 0) - (sB.min_cgpa || 0);
        case 'cgpa_desc':
          return (sB.min_cgpa || 0) - (sA.min_cgpa || 0);
        default:
          return (sB.amount_bdt || 0) - (sA.amount_bdt || 0);
      }
    });

    return list;
  }, [rawList, filters]);

  const handleResetFilters = () => {
    setFilters({
      search: '',
      category: 'All',
      department: 'All',
      sortBy: 'amount_desc',
    });
  };

  const eligibleCount = classification?.eligible?.length || 0;
  const almostCount = classification?.potentiallyEligible?.length || 0;
  const notEligibleCount = classification?.notEligible?.length || 0;
  const totalAid = summary?.totalEligibleAid || 0;
  const highestAward = summary?.highestEligibleAward || (classification?.eligible?.[0]?.scholarship?.amount_bdt) || 0;

  return (
    <div className="dashboard-container" id="results-dashboard-view">
      {/* 1. Student Profile & Metric Summary Strip */}
      <div
        style={{
          background: '#ffffff',
          border: '1px solid var(--slate-200)',
          borderRadius: 'var(--radius-lg)',
          padding: '1.25rem 1.75rem',
          marginBottom: '1.75rem',
          boxShadow: 'var(--shadow-sm)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '1rem',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
          <div
            style={{
              width: 44,
              height: 44,
              borderRadius: 'var(--radius-full)',
              background: 'var(--primary-100)',
              color: 'var(--primary-700)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <User size={22} />
          </div>
          <div>
            <div style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--slate-900)' }}>
              {studentProfile?.name || 'Student Candidate'}
            </div>
            <div style={{ fontSize: '0.85rem', color: 'var(--slate-500)', display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
              <span>Dept: <strong>{studentProfile?.department}</strong></span>
              <span>•</span>
              <span>CGPA: <strong>{typeof studentProfile?.cgpa === 'number' ? studentProfile.cgpa.toFixed(2) : studentProfile?.cgpa}</strong></span>
              <span>•</span>
              <span>Gender: <strong>{studentProfile?.gender}</strong></span>
              <span>•</span>
              <span>Need-Based: <strong>{studentProfile?.needBased ? 'Yes' : 'No'}</strong></span>
            </div>
          </div>
        </div>

        {onEditProfile && (
          <button
            type="button"
            className="button button-secondary button-sm"
            onClick={onEditProfile}
            style={{ fontSize: '0.85rem', display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}
          >
            <RotateCcw size={15} />
            <span>Edit Profile</span>
          </button>
        )}
      </div>

      {/* 2. AI Executive Briefing Banner (Module 5) */}
      <AIExecutiveBriefing
        studentProfile={studentProfile}
        summaryData={executiveSummary}
        aiStatus={aiStatus}
      />

      {/* 3. Metrics Cards */}
      <div className="dashboard-metrics-grid">
        <div className="dash-metric-card">
          <div className="dash-metric-icon emerald">
            <CheckCircle2 size={24} />
          </div>
          <div>
            <div className="dash-metric-val">{eligibleCount}</div>
            <div className="dash-metric-label">Fully Eligible Scholarships</div>
          </div>
        </div>

        <div className="dash-metric-card">
          <div className="dash-metric-icon amber">
            <AlertTriangle size={24} />
          </div>
          <div>
            <div className="dash-metric-val">{almostCount}</div>
            <div className="dash-metric-label">Almost-Eligible Opportunities</div>
          </div>
        </div>

        <div className="dash-metric-card">
          <div className="dash-metric-icon indigo">
            <Wallet size={24} />
          </div>
          <div>
            <div className="dash-metric-val">৳{Number(totalAid).toLocaleString('en-US')}</div>
            <div className="dash-metric-label">Total Eligible Aid Pool</div>
          </div>
        </div>

        <div className="dash-metric-card">
          <div className="dash-metric-icon slate">
            <Award size={24} />
          </div>
          <div>
            <div className="dash-metric-val">৳{Number(highestAward).toLocaleString('en-US')}</div>
            <div className="dash-metric-label">Highest Eligible Award</div>
          </div>
        </div>
      </div>

      {/* 4. Tab Navigation: Eligible vs Almost-Eligible vs All */}
      <div className="dashboard-tabs-container">
        <div className="dashboard-tabs">
          <button
            type="button"
            className={`dash-tab-btn ${activeTab === 'eligible' ? 'active' : ''}`}
            onClick={() => setActiveTab('eligible')}
          >
            <CheckCircle2 size={16} />
            <span>Fully Eligible</span>
            <span className="dash-tab-count">{eligibleCount}</span>
          </button>

          <button
            type="button"
            className={`dash-tab-btn ${activeTab === 'almost' ? 'active' : ''}`}
            onClick={() => setActiveTab('almost')}
          >
            <AlertTriangle size={16} />
            <span>Almost Eligible</span>
            <span className="dash-tab-count">{almostCount}</span>
          </button>

          <button
            type="button"
            className={`dash-tab-btn ${activeTab === 'all' ? 'active' : ''}`}
            onClick={() => setActiveTab('all')}
          >
            <Layers size={16} />
            <span>All Catalog (136)</span>
            <span className="dash-tab-count">136</span>
          </button>
        </div>

        {loadingAiBatch && (
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.8rem', color: 'var(--primary-600)' }}>
            <Loader2 size={14} className="animate-spin" />
            <span>Generating AI personalized insights...</span>
          </div>
        )}
      </div>

      {/* 5. Filter & Sort Bar */}
      <div className="dashboard-controls-bar">
        {/* Search */}
        <div className="dash-search-box">
          <Search size={16} className="dash-search-icon" />
          <input
            type="text"
            className="dash-search-input"
            placeholder="Search by scholarship, provider, or criteria..."
            value={filters.search}
            onChange={(e) => setFilters((prev) => ({ ...prev, search: e.target.value }))}
          />
        </div>

        {/* Dropdowns */}
        <div className="dash-filters-group">
          {/* Sorting */}
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}>
            <ArrowUpDown size={15} style={{ color: 'var(--slate-500)' }} />
            <select
              className="dash-control-select"
              value={filters.sortBy}
              onChange={(e) => setFilters((prev) => ({ ...prev, sortBy: e.target.value }))}
            >
              <option value="amount_desc">Highest Amount (BDT)</option>
              <option value="amount_asc">Lowest Amount (BDT)</option>
              <option value="deadline_asc">Earliest Deadline</option>
              <option value="deadline_desc">Latest Deadline</option>
              <option value="readiness_desc">Highest Readiness Score</option>
              <option value="cgpa_asc">Lowest Min CGPA</option>
              <option value="cgpa_desc">Highest Min CGPA</option>
            </select>
          </div>

          {/* Department */}
          <select
            className="dash-control-select"
            value={filters.department}
            onChange={(e) => setFilters((prev) => ({ ...prev, department: e.target.value }))}
          >
            <option value="All">All Departments</option>
            <option value="CSE">CSE</option>
            <option value="EEE">EEE</option>
            <option value="CE">CE</option>
            <option value="BBA">BBA</option>
            <option value="English">English</option>
          </select>

          {/* Category */}
          <select
            className="dash-control-select"
            value={filters.category}
            onChange={(e) => setFilters((prev) => ({ ...prev, category: e.target.value }))}
          >
            <option value="All">All Categories</option>
            {availableCategories.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>

          {/* Reset Filters */}
          {(filters.search || filters.category !== 'All' || filters.department !== 'All' || filters.sortBy !== 'amount_desc') && (
            <button
              type="button"
              className="dash-reset-btn"
              onClick={handleResetFilters}
              title="Reset all filters"
            >
              <RotateCcw size={14} />
              <span>Reset</span>
            </button>
          )}
        </div>
      </div>

      {/* 6. Scholarship Cards Grid or Empty State */}
      {filteredAndSortedList.length > 0 ? (
        <div className="dashboard-grid">
          {filteredAndSortedList.map((item) => {
            const scholarshipId = item.scholarship.id;
            // Fallback explanation if map hasn't loaded yet
            const defaultExplanation = {
              scholarshipId,
              explanation: generateClientFallbackExplanation(studentProfile, item.scholarship, item),
              source: 'fallback',
              isFallback: true,
            };

            const aiExpl = aiExplanationsMap[scholarshipId] || defaultExplanation;

            return (
              <DashboardCard
                key={`scholarship-${scholarshipId}`}
                item={item}
                studentProfile={studentProfile}
                aiExplanation={aiExpl}
                onOpenDetails={setSelectedRecord}
              />
            );
          })}
        </div>
      ) : (
        <div className="dash-empty-state">
          <div className="dash-empty-icon">
            <SearchX size={32} />
          </div>
          <h4 className="dash-empty-title">No Matching Scholarships Found</h4>
          <p className="dash-empty-desc">
            {filters.search || filters.category !== 'All' || filters.department !== 'All'
              ? 'No opportunities match your current filter and search conditions. Try clearing or relaxing your filters.'
              : activeTab === 'almost'
              ? 'Great news! You have no pending almost-eligible criteria; your qualifying scholarships are listed under Fully Eligible.'
              : 'Your current academic credentials did not match opportunities in this view. Try adjusting your profile parameters.'}
          </p>

          <button
            type="button"
            className="button button-primary"
            onClick={handleResetFilters}
            style={{ margin: '0 auto' }}
          >
            Reset Filters
          </button>
        </div>
      )}

      {/* 7. Module 4 Requirement Comparison Modal */}
      {selectedRecord && (
        <RequirementComparisonModal
          evaluatedRecord={selectedRecord}
          onClose={() => setSelectedRecord(null)}
        />
      )}
    </div>
  );
}
