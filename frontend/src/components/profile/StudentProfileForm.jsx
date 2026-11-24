import React, { useEffect, useId, useState } from 'react';
import {
  AlertCircle,
  BookOpen,
  ChevronDown,
  GraduationCap,
  Loader2,
  RotateCcw,
  Search,
  ShieldCheck,
  Sparkles,
  User,
  Users,
  Wallet,
} from 'lucide-react';
import Badge from '../common/Badge';
import Button from '../common/Button';
import {
  FINANCIAL_ASSISTANCE_OPTIONS,
  INITIAL_PROFILE_FORM_STATE,
  STUDENT_DEPARTMENTS,
  STUDENT_GENDERS,
  toFormState,
  validateField,
  validateStudentForm,
} from './validation';
import './StudentProfileForm.css';

/**
 * Reusable Student Profile Form component for ScholarMate AI (Module 2).
 *
 * Captures and validates:
 * - Student name
 * - Department (CSE, EEE, CE, BBA, English)
 * - Current CGPA (0.00 - 4.00)
 * - Gender (Male, Female, Other)
 * - Financial assistance requirement (Yes/No -> boolean needBased)
 *
 * Emits a standardized profile object on valid submit:
 * { name: string, department: string, cgpa: number, gender: string, needBased: boolean }
 */
export default function StudentProfileForm({
  onSubmit,
  isLoading = false,
  initialValues = null,
  presetProfiles = [],
  departmentOptions = STUDENT_DEPARTMENTS,
  submitLabel = 'Find Scholarships',
  className = '',
}) {
  const formId = useId();
  const [formValues, setFormValues] = useState(() =>
    initialValues ? toFormState(initialValues) : { ...INITIAL_PROFILE_FORM_STATE }
  );
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [submitAttempted, setSubmitAttempted] = useState(false);
  const [internalSubmitting, setInternalSubmitting] = useState(false);

  useEffect(() => {
    if (initialValues) {
      setFormValues(toFormState(initialValues));
      setErrors({});
      setTouched({});
      setSubmitAttempted(false);
    }
  }, [initialValues]);

  const isFormLoading = Boolean(isLoading || internalSubmitting);

  const handleFieldChange = (fieldName, nextValue) => {
    setFormValues((prev) => ({
      ...prev,
      [fieldName]: nextValue,
    }));

    if (touched[fieldName] || submitAttempted) {
      const fieldError = validateField(fieldName, nextValue, departmentOptions);
      setErrors((prev) => {
        if (!fieldError) {
          const { [fieldName]: _removed, ...rest } = prev;
          return rest;
        }
        return { ...prev, [fieldName]: fieldError };
      });
    }
  };

  const handleFieldBlur = (fieldName) => {
    setTouched((prev) => ({ ...prev, [fieldName]: true }));
    const fieldError = validateField(fieldName, formValues[fieldName], departmentOptions);
    setErrors((prev) => {
      if (!fieldError) {
        const { [fieldName]: _removed, ...rest } = prev;
        return rest;
      }
      return { ...prev, [fieldName]: fieldError };
    });
  };

  const handleApplyPreset = (preset) => {
    if (isFormLoading) return;
    const rawProfile = preset.profile || preset;
    setFormValues(toFormState(rawProfile));
    setErrors({});
    setTouched({});
    setSubmitAttempted(false);
  };

  const handleReset = () => {
    if (isFormLoading) return;
    setFormValues({ ...INITIAL_PROFILE_FORM_STATE });
    setErrors({});
    setTouched({});
    setSubmitAttempted(false);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (isFormLoading) return;

    setSubmitAttempted(true);
    setTouched({
      name: true,
      department: true,
      cgpa: true,
      gender: true,
      needBased: true,
    });

    const { isValid, errors: validationErrors, profile } = validateStudentForm(
      formValues,
      departmentOptions
    );

    if (!isValid || !profile) {
      setErrors(validationErrors);
      const firstInvalidField = ['name', 'department', 'cgpa', 'gender', 'needBased'].find(
        (key) => Boolean(validationErrors[key])
      );
      if (firstInvalidField) {
        const element = document.getElementById(`${formId}-${firstInvalidField}`);
        if (element && typeof element.focus === 'function') {
          element.focus();
        }
      }
      return;
    }

    setErrors({});

    if (typeof onSubmit === 'function') {
      try {
        setInternalSubmitting(true);
        await onSubmit(profile);
      } finally {
        setInternalSubmitting(false);
      }
    }
  };

  const errorCount = Object.keys(errors).length;

  return (
    <div className={`sp-card ${className}`.trim()}>
      {/* Card Header */}
      <div className="sp-header">
        <div className="sp-header-content">
          <div className="sp-header-icon" aria-hidden="true">
            <GraduationCap size={24} />
          </div>
          <div>
            <h3 className="sp-title">Student Profile Information</h3>
            <p className="sp-subtitle">
              Enter your academic details to prepare your profile for scholarship matching.
            </p>
          </div>
        </div>
        <Badge variant="indigo" icon={Sparkles}>
          Student Profile
        </Badge>
      </div>

      {/* Optional Quick-Fill Demo Presets */}
      {Array.isArray(presetProfiles) && presetProfiles.length > 0 && (
        <div className="sp-presets-bar" aria-label="Quick fill profile presets">
          <span className="sp-presets-label">Quick Fill:</span>
          {presetProfiles.map((preset, index) => {
            const label = preset.label || preset.name || `Preset ${index + 1}`;
            return (
              <button
                key={preset.id || label}
                type="button"
                className="sp-preset-chip"
                onClick={() => handleApplyPreset(preset)}
                disabled={isFormLoading}
              >
                {label}
              </button>
            );
          })}
        </div>
      )}

      {/* Main Form */}
      <form className="sp-form-body" onSubmit={handleSubmit} noValidate>
        {submitAttempted && errorCount > 0 && (
          <div className="sp-error-banner" role="alert">
            <AlertCircle size={18} style={{ flexShrink: 0, marginTop: '2px' }} />
            <span>
              Please fix the {errorCount === 1 ? 'highlighted field' : `${errorCount} highlighted fields`} below before continuing.
            </span>
          </div>
        )}

        <div className="sp-grid">
          {/* Student Name */}
          <div className={`sp-field sp-field-full ${errors.name ? 'has-error' : ''}`}>
            <label htmlFor={`${formId}-name`} className="sp-label">
              <span>
                Student Name<span className="sp-required-star">*</span>
              </span>
              <span className="sp-hint">Full legal or academic name</span>
            </label>
            <div className="sp-input-wrap">
              <span className="sp-input-icon" aria-hidden="true">
                <User size={18} />
              </span>
              <input
                id={`${formId}-name`}
                name="name"
                type="text"
                className="sp-input"
                placeholder="e.g., Ayesha Rahman"
                value={formValues.name}
                onChange={(e) => handleFieldChange('name', e.target.value)}
                onBlur={() => handleFieldBlur('name')}
                disabled={isFormLoading}
                autoComplete="name"
                aria-required="true"
                aria-invalid={Boolean(errors.name)}
                aria-describedby={errors.name ? `${formId}-name-error` : undefined}
              />
            </div>
            {errors.name && (
              <div id={`${formId}-name-error`} className="sp-error-text" role="alert">
                <AlertCircle size={14} />
                <span>{errors.name}</span>
              </div>
            )}
          </div>

          {/* Department Dropdown */}
          <div className={`sp-field ${errors.department ? 'has-error' : ''}`}>
            <label htmlFor={`${formId}-department`} className="sp-label">
              <span>
                Department<span className="sp-required-star">*</span>
              </span>
            </label>
            <div className="sp-input-wrap">
              <span className="sp-input-icon" aria-hidden="true">
                <BookOpen size={18} />
              </span>
              <select
                id={`${formId}-department`}
                name="department"
                className={`sp-select ${!formValues.department ? 'is-placeholder' : ''}`}
                value={formValues.department}
                onChange={(e) => handleFieldChange('department', e.target.value)}
                onBlur={() => handleFieldBlur('department')}
                disabled={isFormLoading}
                aria-required="true"
                aria-invalid={Boolean(errors.department)}
                aria-describedby={errors.department ? `${formId}-department-error` : undefined}
              >
                <option value="">Select department...</option>
                {departmentOptions.map((dept) => (
                  <option key={dept.value} value={dept.value}>
                    {dept.label}
                  </option>
                ))}
              </select>
              <span className="sp-select-chevron" aria-hidden="true">
                <ChevronDown size={16} />
              </span>
            </div>
            {errors.department && (
              <div id={`${formId}-department-error`} className="sp-error-text" role="alert">
                <AlertCircle size={14} />
                <span>{errors.department}</span>
              </div>
            )}
          </div>

          {/* Current CGPA */}
          <div className={`sp-field ${errors.cgpa ? 'has-error' : ''}`}>
            <label htmlFor={`${formId}-cgpa`} className="sp-label">
              <span>
                Current CGPA<span className="sp-required-star">*</span>
              </span>
              <span className="sp-hint">0.00 – 4.00 scale</span>
            </label>
            <div className="sp-input-wrap">
              <span className="sp-input-icon" aria-hidden="true">
                <GraduationCap size={18} />
              </span>
              <input
                id={`${formId}-cgpa`}
                name="cgpa"
                type="number"
                inputMode="decimal"
                step="0.01"
                min="0"
                max="4"
                className="sp-input"
                placeholder="e.g., 3.75"
                value={formValues.cgpa}
                onChange={(e) => handleFieldChange('cgpa', e.target.value)}
                onBlur={() => handleFieldBlur('cgpa')}
                disabled={isFormLoading}
                aria-required="true"
                aria-invalid={Boolean(errors.cgpa)}
                aria-describedby={errors.cgpa ? `${formId}-cgpa-error` : undefined}
              />
            </div>
            {errors.cgpa && (
              <div id={`${formId}-cgpa-error`} className="sp-error-text" role="alert">
                <AlertCircle size={14} />
                <span>{errors.cgpa}</span>
              </div>
            )}
          </div>

          {/* Gender Dropdown */}
          <div className={`sp-field ${errors.gender ? 'has-error' : ''}`}>
            <label htmlFor={`${formId}-gender`} className="sp-label">
              <span>
                Gender<span className="sp-required-star">*</span>
              </span>
            </label>
            <div className="sp-input-wrap">
              <span className="sp-input-icon" aria-hidden="true">
                <Users size={18} />
              </span>
              <select
                id={`${formId}-gender`}
                name="gender"
                className={`sp-select ${!formValues.gender ? 'is-placeholder' : ''}`}
                value={formValues.gender}
                onChange={(e) => handleFieldChange('gender', e.target.value)}
                onBlur={() => handleFieldBlur('gender')}
                disabled={isFormLoading}
                aria-required="true"
                aria-invalid={Boolean(errors.gender)}
                aria-describedby={errors.gender ? `${formId}-gender-error` : undefined}
              >
                <option value="">Select gender...</option>
                {STUDENT_GENDERS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
              <span className="sp-select-chevron" aria-hidden="true">
                <ChevronDown size={16} />
              </span>
            </div>
            {errors.gender && (
              <div id={`${formId}-gender-error`} className="sp-error-text" role="alert">
                <AlertCircle size={14} />
                <span>{errors.gender}</span>
              </div>
            )}
          </div>

          {/* Financial Assistance Requirement Dropdown */}
          <div className={`sp-field ${errors.needBased ? 'has-error' : ''}`}>
            <label htmlFor={`${formId}-needBased`} className="sp-label">
              <span>
                Financial Assistance Required?<span className="sp-required-star">*</span>
              </span>
            </label>
            <div className="sp-input-wrap">
              <span className="sp-input-icon" aria-hidden="true">
                <Wallet size={18} />
              </span>
              <select
                id={`${formId}-needBased`}
                name="needBased"
                className={`sp-select ${!formValues.needBased ? 'is-placeholder' : ''}`}
                value={formValues.needBased}
                onChange={(e) => handleFieldChange('needBased', e.target.value)}
                onBlur={() => handleFieldBlur('needBased')}
                disabled={isFormLoading}
                aria-required="true"
                aria-invalid={Boolean(errors.needBased)}
                aria-describedby={errors.needBased ? `${formId}-needBased-error` : undefined}
              >
                <option value="">Select Yes or No...</option>
                {FINANCIAL_ASSISTANCE_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
              <span className="sp-select-chevron" aria-hidden="true">
                <ChevronDown size={16} />
              </span>
            </div>
            {errors.needBased && (
              <div id={`${formId}-needBased-error`} className="sp-error-text" role="alert">
                <AlertCircle size={14} />
                <span>{errors.needBased}</span>
              </div>
            )}
          </div>
        </div>

        {/* Form Actions */}
        <div className="sp-actions">
          <div className="sp-actions-note">
            <ShieldCheck size={16} style={{ color: 'var(--emerald-600)' }} />
            <span>Validated locally before matching</span>
          </div>

          <div className="sp-actions-buttons">
            <Button
              type="button"
              variant="secondary"
              size="md"
              icon={RotateCcw}
              onClick={handleReset}
              disabled={isFormLoading}
              className="sp-reset-btn"
            >
              Reset
            </Button>

            <Button
              type="submit"
              variant="primary"
              size="lg"
              icon={isFormLoading ? Loader2 : Search}
              disabled={isFormLoading}
              className={`sp-submit-btn ${isFormLoading ? 'is-loading' : ''}`}
              aria-busy={isFormLoading}
            >
              {isFormLoading ? 'Finding Scholarships...' : submitLabel}
            </Button>
          </div>
        </div>
      </form>
    </div>
  );
}
