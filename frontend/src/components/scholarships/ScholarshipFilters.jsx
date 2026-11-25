import React from 'react';
import { Search, Filter, RotateCcw, ArrowUpDown } from 'lucide-react';

const CATEGORIES = [
  'All',
  'Academic Merit',
  'Need-Based & Financial Aid',
  'Engineering & Technology',
  'Business & Management',
  'Language & Humanities',
  'Women in STEM & Leadership',
  'Community, Leadership & Arts',
  'Special Inclusion & Regional',
];

const DEPARTMENTS = [
  { value: 'All', label: 'All Departments' },
  { value: 'CSE', label: 'CSE (Computer Science)' },
  { value: 'EEE', label: 'EEE (Electrical Engineering)' },
  { value: 'CE', label: 'CE (Civil Engineering)' },
  { value: 'BBA', label: 'BBA (Business)' },
  { value: 'English', label: 'Department of English' },
];

export default function ScholarshipFilters({
  filters,
  onFilterChange,
  onReset,
  totalResults = 0,
}) {
  return (
    <div className="filter-controls-card">
      {/* Search Bar */}
      <div className="search-input-wrapper">
        <Search size={18} />
        <input
          type="text"
          className="search-input-control"
          placeholder="Search scholarships by name, university, provider, or keywords..."
          value={filters.search || ''}
          onChange={(e) => onFilterChange('search', e.target.value)}
        />
      </div>

      {/* Filter Dropdowns Grid */}
      <div className="filter-selects-row">
        {/* Category */}
        <div className="filter-field-group">
          <select
            className="filter-select"
            value={filters.category || 'All'}
            onChange={(e) => onFilterChange('category', e.target.value)}
          >
            <option value="All">All Categories</option>
            {CATEGORIES.filter((c) => c !== 'All').map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>

        {/* Department */}
        <div className="filter-field-group">
          <select
            className="filter-select"
            value={filters.department || 'All'}
            onChange={(e) => onFilterChange('department', e.target.value)}
          >
            {DEPARTMENTS.map((dept) => (
              <option key={dept.value} value={dept.value}>
                {dept.label}
              </option>
            ))}
          </select>
        </div>

        {/* Funding Type / Need-Based */}
        <div className="filter-field-group">
          <select
            className="filter-select"
            value={filters.need_based || 'All'}
            onChange={(e) => onFilterChange('need_based', e.target.value)}
          >
            <option value="All">All Funding Types</option>
            <option value="no">Merit-Based Only</option>
            <option value="yes">Need-Based Only</option>
          </select>
        </div>

        {/* Gender */}
        <div className="filter-field-group">
          <select
            className="filter-select"
            value={filters.gender || 'All'}
            onChange={(e) => onFilterChange('gender', e.target.value)}
          >
            <option value="All">All Genders</option>
            <option value="Female">Female Candidates Only</option>
          </select>
        </div>

        {/* Sort By */}
        <div className="filter-field-group">
          <select
            className="filter-select"
            value={filters.sortBy || 'deadline'}
            onChange={(e) => onFilterChange('sortBy', e.target.value)}
          >
            <option value="deadline">Sort by Deadline (Earliest)</option>
            <option value="deadline_desc">Sort by Deadline (Latest)</option>
            <option value="amount_desc">Sort by Amount (Highest First)</option>
            <option value="amount_asc">Sort by Amount (Lowest First)</option>
            <option value="cgpa_asc">Sort by Min CGPA (Lowest First)</option>
            <option value="relevance">Sort by Relevance / Match Score</option>
          </select>
        </div>

        {/* Reset Button */}
        <button
          type="button"
          className="filter-reset-btn"
          onClick={onReset}
          title="Reset all search filters"
        >
          <RotateCcw size={14} />
          <span>Reset Filters</span>
        </button>
      </div>
    </div>
  );
}
