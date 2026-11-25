import React from 'react';
import { CheckCircle2, AlertTriangle, XCircle, Award } from 'lucide-react';

export default function EligibilitySummaryBar({ summary }) {
  if (!summary) return null;

  return (
    <div className="eval-summary-grid">
      {/* 1. Fully Eligible */}
      <div className="eval-summary-card">
        <div className="eval-summary-icon-box eligible">
          <CheckCircle2 size={24} />
        </div>
        <div>
          <div className="eval-summary-value">{summary.eligibleCount}</div>
          <div className="eval-summary-label">Eligible Scholarships</div>
          <div className="eval-summary-sub">
            BDT {(summary.totalEligibleAid || 0).toLocaleString()} aid qualified
          </div>
        </div>
      </div>

      {/* 2. Potentially Eligible */}
      <div className="eval-summary-card">
        <div className="eval-summary-icon-box potentially">
          <AlertTriangle size={24} />
        </div>
        <div>
          <div className="eval-summary-value">{summary.potentiallyEligibleCount}</div>
          <div className="eval-summary-label">Potentially Eligible</div>
          <div className="eval-summary-sub">
            Pending info / reachable deficit
          </div>
        </div>
      </div>

      {/* 3. Ineligible */}
      <div className="eval-summary-card">
        <div className="eval-summary-icon-box ineligible">
          <XCircle size={24} />
        </div>
        <div>
          <div className="eval-summary-value">{summary.notEligibleCount}</div>
          <div className="eval-summary-label">Not Eligible</div>
          <div className="eval-summary-sub">Mandatory criteria unmet</div>
        </div>
      </div>

      {/* 4. Total Catalog Evaluated */}
      <div className="eval-summary-card">
        <div className="eval-summary-icon-box total">
          <Award size={24} />
        </div>
        <div>
          <div className="eval-summary-value">{summary.totalScholarships}</div>
          <div className="eval-summary-label">Total Evaluated</div>
          <div className="eval-summary-sub">100% Deterministic match</div>
        </div>
      </div>
    </div>
  );
}
