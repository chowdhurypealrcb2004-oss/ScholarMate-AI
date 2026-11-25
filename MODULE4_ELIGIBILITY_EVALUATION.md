# 🎓 Module 4: Eligibility Evaluation System

ScholarMate AI — **Module 4: Eligibility Evaluation** is a deterministic, rule-based evaluation engine and user interface that evaluates student profiles against actual scholarship criteria, classifies them into **Eligible**, **Not Eligible**, and **Potentially Eligible (when incomplete information prevents a reliable decision)**, and provides transparent explanations and structured requirement comparisons.

---

## 🏛️ 1. Architecture & Responsibilities

Module 4 operates as the analytical core bridging Module 2 (Student Profile), Module 3 (Dataset & Matching), and Module 5 (Results Dashboard & AI Advisor):

```
┌────────────────────────┐      ┌───────────────────────────┐
│ Module 2: Profile Form │      │ Module 3: Dataset Ingest  │
│ • Academic Credentials │      │ • 136 Verified Records    │
│ • CGPA, Dept, Need     │      │ • Department/Gender Gates │
└───────────┬────────────┘      └─────────────┬─────────────┘
            │                                 │
            │ Student Profile                 │ Scholarship Catalog
            └───────────────┬─────────────────┘
                            │
                            ▼
     ┌──────────────────────────────────────────────┐
     │ MODULE 4: ELIGIBILITY EVALUATION SYSTEM      │
     │                                              │
     │ 1. Profile Inspector & Completeness Check    │
     │ 2. Requirement Comparison:                   │
     │    - Min CGPA Comparison (Strict Cutoff)     │
     │    - Academic Department Verification        │
     │    - Gender & Demographic Gates              │
     │    - Financial Need Condition Validation     │
     │    - Explicit Prerequisites from Description │
     │      (Software Portfolio, Volunteer Hours,   │
     │       Sports Representation, Disability,     │
     │       First-Generation, Rural Background)    │
     │ 3. 3-Way Deterministic Classification:       │
     │    • ELIGIBLE                                │
     │    • POTENTIALLY_ELIGIBLE                    │
     │    • NOT_ELIGIBLE                            │
     │ 4. Transparent Explanation Generator         │
     │    • Human-Readable Assessment Sentences     │
     │    • Satisfied Conditions Checklist          │
     │    • Missing & Incomplete Requirements List  │
     │    • Structured Comparison Matrix Table      │
     │ 5. AI Advisor Context Package                │
     └──────────────────────┬───────────────────────┘
                            │
                            │ Evaluated Package & AI Context
                            ▼
     ┌──────────────────────────────────────────────┐
     │ Module 5: Results Dashboard & Gemini Advisor │
     │ • Interactive Filters & Visual Cards         │
     │ • Gemini AI Prompt Formulation               │
     └──────────────────────────────────────────────┘
```

---

## 🔍 2. Requirement Comparison Dimensions

Every scholarship is evaluated against the student's profile across its actual criteria:

| Requirement Dimension | Criteria Comparison Rule | Status Values |
| :--- | :--- | :--- |
| **1. Minimum CGPA** | Compares student CGPA against `scholarship.min_cgpa`. Strict cutoff: if `student.cgpa < min_cgpa`, requirement is `FAILED`. If missing, `INCOMPLETE`. | `SATISFIED`, `FAILED`, `INCOMPLETE` |
| **2. Academic Department** | Checks if student department is accepted (`All` or listed in semicolon-separated department codes e.g. `CSE;EEE;CE`). | `SATISFIED`, `FAILED`, `INCOMPLETE` |
| **3. Gender Restriction** | Compares student gender against `All`, `Female`, or `Male` designations. | `SATISFIED`, `FAILED`, `INCOMPLETE` |
| **4. Financial Need** | If `need_based: "yes"`, checks if student requires financial assistance. If profile is merit-only, requirement is `FAILED`. | `SATISFIED`, `FAILED`, `INCOMPLETE` |
| **5. Special Prerequisites** | Identifies specific prerequisites explicitly in description (software project / GitHub portfolio, 100+ volunteer hours, athletic representation, disability support, first-generation learner status, rural background). Unconfirmed status triggers `INCOMPLETE`. | `SATISFIED`, `FAILED`, `INCOMPLETE` |
| **6. Degree Level** | Only evaluated if scholarship explicitly restricts degree level in description (e.g. higher studies / graduate studies). Open otherwise. | `SATISFIED`, `FAILED`, `NOT_APPLICABLE` |
| **7. Regional Restriction** | Only evaluated if scholarship explicitly restricts region in name or description (e.g. Chattogram region). Open otherwise. | `SATISFIED`, `FAILED`, `NOT_APPLICABLE` |

---

## 🏷️ 3. Classification Engine

Scholarships are strictly partitioned into three mutually exclusive categories:

1. **`ELIGIBLE`**:
   - All evaluated mandatory dimensions (CGPA, Department, Gender, Financial Need) are `SATISFIED`.
   - Any applicable prerequisites are confirmed and satisfied.
   - Zero missing requirements or failed prerequisites.

2. **`POTENTIALLY_ELIGIBLE`**:
   - Classified as Potentially Eligible **only when incomplete information prevents a reliable eligibility decision**:
     - *Missing CGPA*: Student profile did not provide CGPA, so eligibility against minimum CGPA cutoffs cannot be decided.
     - *Unconfirmed Specific Prerequisite*: Student satisfies CGPA, department, and gender, but an explicit scholarship prerequisite (e.g., software project portfolio, 100 volunteer hours, sports representation) is unconfirmed in their profile.
     - *Unspecified Department / Gender / Need*: For scholarships restricting these dimensions where the profile has omitted them.

3. **`NOT_ELIGIBLE`**:
   - When one or more mandatory criteria are strictly `FAILED` (e.g. student CGPA is below the minimum required cutoff, department mismatch, gender mismatch, or financial need mismatch).
   - A student whose CGPA is below the minimum is strictly `NOT_ELIGIBLE` (never automatically classified as potentially eligible).

---

## 💬 4. Explanation & Transparency System

Unlike black-box matching algorithms, Module 4 generates structured, natural-language explanations for every evaluation:

- **Narrative Explanation**: A clear assessment highlighting exact values and criteria.
- **Satisfied Conditions**: Explicit list of conditions met.
- **Missing Requirements**: Transparent itemization of disqualifying criteria and deficits.
- **Incomplete Requirements**: Explicit itemization of unconfirmed prerequisites that prevent a final decision.
- **Actionable Guidance**: Practical recommendations on next steps.
- **Comparison Matrix Table**: Tabular side-by-side view (Criteria vs Rule vs Student Value vs Status).

---

## 🔌 5. Integration Contracts & Endpoints

- **`POST /api/evaluate`**:
  - Request: `StudentProfile` payload (`name`, `department`, `cgpa`, `gender`, `needBased`, optional prerequisite flags).
  - Response: Evaluated dataset, `classification: { eligible, potentiallyEligible, notEligible }`, `summary`, and `aiAdvisorContext`.
- **`POST /api/match`**:
  - Existing Module 3 endpoint remains fully functional and unchanged.
