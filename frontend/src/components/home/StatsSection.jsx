import React from 'react';
import {
  BookOpen,
  DollarSign,
  GraduationCap,
  Users,
  Building2,
  Award,
  Layers,
  Sparkles,
} from 'lucide-react';
import Card from '../common/Card';
import Badge from '../common/Badge';

export default function StatsSection() {
  const departmentStats = [
    { name: 'Computer Science & Engineering', code: 'CSE', count: 48, percentage: 35, color: '#4f46e5' },
    { name: 'Electrical & Electronic Engineering', code: 'EEE', count: 32, percentage: 24, color: '#06b6d4' },
    { name: 'Civil Engineering', code: 'CE', count: 28, percentage: 21, color: '#10b981' },
    { name: 'Business Administration', code: 'BBA', count: 30, percentage: 22, color: '#f59e0b' },
    { name: 'Department of English', code: 'English', count: 24, percentage: 18, color: '#ec4899' },
    { name: 'All Departments / Open Grants', code: 'All', count: 64, percentage: 47, color: '#8b5cf6' },
  ];

  return (
    <section className="stats-section-wrapper" id="stats">
      <div className="container">
        {/* Section Header */}
        <div className="section-header">
          <span className="section-tag">Comprehensive Coverage</span>
          <h2 className="section-title">Verified Scholarship Dataset</h2>
          <p className="section-desc">
            ScholarMate AI indexes authentic scholarship opportunities across leading Bangladeshi public & private
            universities, charitable foundations, and technology trusts.
          </p>
        </div>

        {/* 4 Main Metrics */}
        <div className="stats-grid">
          {/* Stat 1 */}
          <div className="stat-card">
            <div
              className="stat-card-icon"
              style={{ background: 'var(--primary-50)', color: 'var(--primary-600)' }}
            >
              <Award size={24} />
            </div>
            <div className="stat-card-value">136</div>
            <div className="stat-card-label">Available Scholarships</div>
            <div className="stat-card-subtext">Verified records directly loaded from dataset</div>
          </div>

          {/* Stat 2 */}
          <div className="stat-card">
            <div
              className="stat-card-icon"
              style={{ background: 'var(--emerald-50)', color: 'var(--emerald-600)' }}
            >
              <DollarSign size={24} />
            </div>
            <div className="stat-card-value">৳4.0M+</div>
            <div className="stat-card-label">Total Aid Volume</div>
            <div className="stat-card-subtext">Grants ranging from ৳10,000 to ৳50,000 BDT</div>
          </div>

          {/* Stat 3 */}
          <div className="stat-card">
            <div
              className="stat-card-icon"
              style={{ background: 'var(--amber-50)', color: 'var(--amber-600)' }}
            >
              <Building2 size={24} />
            </div>
            <div className="stat-card-value">45+</div>
            <div className="stat-card-label">Trusted Providers</div>
            <div className="stat-card-subtext">Universities, trusts, and corporate foundations</div>
          </div>

          {/* Stat 4 */}
          <div className="stat-card">
            <div
              className="stat-card-icon"
              style={{ background: 'var(--slate-100)', color: 'var(--slate-700)' }}
            >
              <Users size={24} />
            </div>
            <div className="stat-card-value">100%</div>
            <div className="stat-card-label">Deterministic Matching</div>
            <div className="stat-card-subtext">Zero guesswork, strictly rule-validated</div>
          </div>
        </div>

        {/* Department Distribution Section */}
        <div style={{ marginTop: '4rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
            <div>
              <h3 style={{ fontSize: '1.45rem', fontWeight: 800, color: 'var(--slate-900)' }}>
                Supported Academic Departments
              </h3>
              <p style={{ fontSize: '0.925rem', color: 'var(--slate-500)', marginTop: '0.25rem' }}>
                Scholarships support single majors, multi-engineering pools, and open university-wide opportunities.
              </p>
            </div>
            <Badge variant="indigo" icon={Sparkles}>
              Multi-Major Recognition
            </Badge>
          </div>

          <div className="department-grid">
            {departmentStats.map((dept) => (
              <div key={dept.code} className="dept-pill-card">
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.35rem' }}>
                    <span
                      style={{
                        display: 'inline-block',
                        width: '8px',
                        height: '8px',
                        borderRadius: '50%',
                        backgroundColor: dept.color,
                      }}
                    />
                    <strong style={{ fontSize: '0.95rem', color: 'var(--slate-900)' }}>
                      {dept.code}
                    </strong>
                  </div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--slate-500)' }}>
                    {dept.name}
                  </div>
                </div>

                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--slate-900)' }}>
                    {dept.count}
                  </div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--slate-500)' }}>
                    grants
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
