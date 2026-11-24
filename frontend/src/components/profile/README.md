# Student Profile Module (`StudentProfileForm`)

Reusable React component for **Module 2 (Student Profile & Validation)** of **ScholarMate AI**.

## Overview

`StudentProfileForm` collects and validates student information, enforces strict client-side validation rules, displays a loading state while submitting, and passes a standardized JavaScript object to the parent / shared application for the scholarship matching module.

### Collected Fields & Validation Rules

| Field | Control | Validation Rule |
| :--- | :--- | :--- |
| **Student Name** | Text input | Required, non-empty after trimming, max 100 characters |
| **Department** | Dropdown (`<select>`) | Required; options: `CSE`, `EEE`, `CE`, `BBA`, `English` |
| **Current CGPA** | Numeric input (`0.00`–`4.00`) | Required, valid number between `0.00` and `4.00` inclusive |
| **Gender** | Dropdown (`<select>`) | Required; options: `Male`, `Female`, `Other` |
| **Financial Assistance Requirement** | Dropdown (`<select>`) | Required (`Yes` -> `true`, `No` -> `false`) |

---

## Output Data Format

When the user submits a valid form, `onSubmit(profile)` is invoked with an object in this exact shape:

```js
{
  name: "Ayesha Rahman",
  department: "CSE",
  cgpa: 3.75,
  gender: "Female",
  needBased: true
}
```

| Key | Type | Description |
| :--- | :--- | :--- |
| `name` | `string` | Trimmed student full name |
| `department` | `string` | One of `"CSE"`, `"EEE"`, `"CE"`, `"BBA"`, `"English"` |
| `cgpa` | `number` | Numeric CGPA in `[0, 4]` |
| `gender` | `string` | One of `"Male"`, `"Female"`, `"Other"` |
| `needBased` | `boolean` | `true` for Yes, `false` for No |

---

## Installation & Imports

Import from the `profile` module directory (default or named export):

```jsx
import StudentProfileForm from './components/profile';
// or
import { StudentProfileForm, validateStudentForm } from './components/profile';
```

---

## Component Props

| Prop | Type | Default | Description |
| :--- | :--- | :--- | :--- |
| `onSubmit` | `(profile) => void \| Promise<void>` | `undefined` | Called with the validated `StudentProfile` object when the form is submitted. If a Promise is returned, the form automatically shows its loading state until it settles. |
| `isLoading` | `boolean` | `false` | External loading state controlled by the parent/matching module. Disables inputs and displays `"Finding Scholarships..."` with a spinner. |
| `initialValues` | `Partial<StudentProfile> \| null` | `null` | Pre-populates form fields (useful when editing a previously submitted profile). |
| `presetProfiles` | `Array<{ id?: string, label?: string, profile?: StudentProfile }>` | `[]` | Optional quick-fill preset buttons for testing or demos. |
| `departmentOptions` | `Array<{ value: string, label: string }>` | `STUDENT_DEPARTMENTS` | Optional override for department dropdown choices (defaults to `CSE`, `EEE`, `CE`, `BBA`, `English`). |
| `submitLabel` | `string` | `"Find Scholarships"` | Custom label for the submit button when idle. |
| `className` | `string` | `""` | Additional CSS class name applied to the outer card container. |

---

## Usage Examples for Team Members

### 1. Basic Integration in Shared Application (`App.jsx` or Context)

```jsx
import React, { useState } from 'react';
import StudentProfileForm from './components/profile';

export default function App() {
  const [studentProfile, setStudentProfile] = useState(null);
  const [isMatching, setIsMatching] = useState(false);

  const handleMatch = async (profile) => {
    setIsMatching(true);
    try {
      setStudentProfile(profile);
      // Pass `profile` to Module 3/4/5 matching API or matcher utility:
      // const response = await fetch('/api/match', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify(profile),
      // });
    } finally {
      setIsMatching(false);
    }
  };

  return (
    <StudentProfileForm
      onSubmit={handleMatch}
      isLoading={isMatching}
    />
  );
}
```

### 2. Using Quick-Fill Demo Presets & Initial Values

```jsx
const DEMO_PERSONAS = [
  {
    id: 'cse-merit',
    label: 'CSE Merit Student',
    profile: {
      name: 'Nafisa Karim',
      department: 'CSE',
      cgpa: 3.85,
      gender: 'Female',
      needBased: false,
    },
  },
  {
    id: 'eee-need',
    label: 'EEE Need-Based',
    profile: {
      name: 'Tanvir Ahmed',
      department: 'EEE',
      cgpa: 3.15,
      gender: 'Male',
      needBased: true,
    },
  },
];

<StudentProfileForm
  onSubmit={handleMatch}
  isLoading={isMatching}
  presetProfiles={DEMO_PERSONAS}
  initialValues={savedProfile}
/>
```

### 3. Reusing Validation Helpers Directly

```js
import { validateStudentForm, STUDENT_DEPARTMENTS } from './components/profile';

const { isValid, errors, profile } = validateStudentForm({
  name: 'Tariq Hasan',
  department: 'BBA',
  cgpa: '3.60',
  gender: 'Male',
  needBased: 'no',
});
```
