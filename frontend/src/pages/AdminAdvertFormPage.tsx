/**
 * Admin: Simplified advertisement creation form with auto-fill.
 *
 * Step 1: Standard Details (engagement type, designation, posts, domain, office, dates)
 * Step 2: Auto-Filled Details (salary, qualification, terms — editable/overridable)
 * Step 3: Review & Submit (summary, creates as DRAFT)
 *
 * When admin selects designation + engagement type, salary, qualification, terms
 * are auto-filled from AI-858/2026 data. Admin can override any auto-filled value.
 */

import React, { useState, useEffect, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { getDomains, getOffices, createAdvert } from '../services/api';
import { AI_858_DESIGNATIONS, getAutoFillValues, FULL_TIME_TERMS, PART_TIME_TERMS, COMMON_GENERAL_CONDITIONS } from '../data/remunerationData';
import type { Domain, NpcOffice } from '../types';

const DESIGNATIONS = AI_858_DESIGNATIONS.map(d => ({ value: d.value, label: d.label }));

const REQUISITION_TYPES = [
  { value: 'PROJECT', label: 'Project / Assignment' },
  { value: 'ADMIN_FINANCE', label: 'Administration / Finance' },
  { value: 'NEW_PROJECT_IDEAS', label: 'New Project Ideas' },
];

export default function AdminAdvertFormPage() {
  const navigate = useNavigate();
  const [domains, setDomains] = useState<Domain[]>([]);
  const [offices, setOffices] = useState<NpcOffice[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [step, setStep] = useState(1);
  const [autoFilled, setAutoFilled] = useState(false);

  const [form, setForm] = useState({
    title: '',
    description: '',
    requisitionType: 'PROJECT',
    projectName: '',
    domainId: '',
    officeId: '',
    designation: 'OFFICE_EXECUTIVE',
    engagementType: 'FULL_TIME',
    numberOfPosts: 1,
    placeOfDeployment: '',
    functionalRole: '',
    workResponsibilities: '',
    eligibilityCriteria: '',
    minQualification: '',
    qualificationDetails: '',
    minExperienceYears: 0,
    maxAge: 65,
    specificRequirements: '',
    desirableSkills: '',
    remunerationMin: 0,
    remunerationMax: 0,
    remunerationBasis: 'MONTHLY',
    remunerationNote: '',
    contractPeriodMonths: 12,
    contractStartDate: '',
    termsAndConditions: FULL_TIME_TERMS,
    workingHoursNote: 'Normal office timings. May be required to work beyond office hours including holidays.',
    travelRequired: false,
    travelNote: 'TA/DA as per NPC rules mapped to equivalent Government Pay Level (7th CPC).',
    lastDateToApply: '',
    applicationEmail: 'ed-admin@npcindia.gov.in',
    generalConditions: COMMON_GENERAL_CONDITIONS,
  });

  useEffect(() => {
    getDomains().then(setDomains).catch(console.error);
    getOffices().then(setOffices).catch(console.error);
  }, []);

  // Auto-fill when designation or engagement type changes
  useEffect(() => {
    const result = getAutoFillValues(form.designation, form.engagementType);
    if (result) {
      setForm(prev => ({
        ...prev,
        remunerationMin: result.remunerationMin,
        remunerationMax: result.remunerationMax,
        remunerationBasis: result.remunerationBasis,
        minQualification: result.minQualification,
        maxAge: result.maxAge,
        minExperienceYears: result.minExperienceYears,
        remunerationNote: result.remunerationNote,
        termsAndConditions: result.termsAndConditions,
        workingHoursNote: result.workingHoursNote,
        generalConditions: result.generalConditions,
      }));
      setAutoFilled(true);
    } else {
      setAutoFilled(false);
    }
  }, [form.designation, form.engagementType]);

  function updateField(field: string, value: any) {
    setForm(prev => ({ ...prev, [field]: value }));
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const payload = {
        ...form,
        numberOfPosts: Number(form.numberOfPosts),
        minExperienceYears: Number(form.minExperienceYears) || undefined,
        maxAge: Number(form.maxAge) || undefined,
        remunerationMin: Number(form.remunerationMin) || undefined,
        remunerationMax: Number(form.remunerationMax) || undefined,
        contractPeriodMonths: Number(form.contractPeriodMonths) || undefined,
        domainId: form.domainId || undefined,
        officeId: form.officeId || undefined,
        lastDateToApply: form.lastDateToApply || undefined,
        contractStartDate: form.contractStartDate || undefined,
      };

      const result = await createAdvert(payload);
      if (result.success) {
        setSuccess(`Advertisement "${form.title}" created successfully as DRAFT. You can preview and publish it from the admin panel.`);
      } else {
        setError(result.error || 'Failed to create advertisement.');
      }
    } catch (err: any) {
      setError(err.response?.data?.error || err.message);
    } finally {
      setLoading(false);
    }
  }

  const currentDesignationLabel = DESIGNATIONS.find(d => d.value === form.designation)?.label || form.designation;
  const STEP_LABELS = ['Standard Details', 'Auto-Filled Details', 'Review & Submit'];

  if (success) {
    return (
      <div style={styles.container}>
        <div style={styles.successBox}>
          <h3 style={{ margin: '0 0 8px', color: '#2e7d32' }}>Advertisement Created</h3>
          <p>{success}</p>
          <div style={{ display: 'flex', gap: 12, marginTop: 16 }}>
            <button onClick={() => { setSuccess(''); setForm(prev => ({ ...prev, title: '' })); setStep(1); }} style={styles.btn}>
              Create Another
            </button>
            <button onClick={() => navigate('/admin')} style={styles.btnOutline}>
              Back to Admin
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <h2 style={{ color: '#1a237e' }}>Create New Advertisement</h2>
      <p style={styles.subtitle}>
        Simplified form — select designation and engagement type to auto-fill salary, qualification, and terms from AI-858/2026.
        You can override any auto-filled value.
      </p>

      {/* Step indicator */}
      <div style={styles.stepBar}>
        {STEP_LABELS.map((label, idx) => (
          <button key={idx} onClick={() => setStep(idx + 1)} style={{
            ...styles.stepBtn,
            background: step === idx + 1 ? '#1a237e' : step > idx + 1 ? '#c5cae9' : '#f5f5f5',
            color: step === idx + 1 ? '#fff' : step > idx + 1 ? '#283593' : '#888',
          }}>
            {idx + 1}. {label}
          </button>
        ))}
      </div>

      {error && <div style={styles.errorBox}>{error}</div>}

      <form onSubmit={handleSubmit}>
        {/* ═══ STEP 1: Standard Details ═══ */}
        {step === 1 && (
          <div style={styles.stepContent}>
            <h3 style={styles.stepTitle}>Step 1: Standard Details</h3>

            <FormField label="Advertisement Title *" help="e.g., 'Engagement of Project Executive on Contract Basis'">
              <input type="text" value={form.title} onChange={e => updateField('title', e.target.value)} required style={styles.input} />
            </FormField>

            <div style={styles.row}>
              <FormField label="Engagement Type *">
                <select value={form.engagementType} onChange={e => updateField('engagementType', e.target.value)} style={styles.input}>
                  <optgroup label="Standard (Auto-fill supported)">
                    <option value="FULL_TIME">Full-Time (Consolidated Monthly)</option>
                    <option value="PART_TIME">Part-Time (Per Day Basis)</option>
                  </optgroup>
                  <optgroup label="Other">
                    <option value="LUMP_SUM">Lump Sum (Milestone-Based)</option>
                    <option value="REVENUE_SHARE">Revenue Sharing</option>
                    <option value="RESOURCE_PERSON">Resource Person</option>
                  </optgroup>
                </select>
              </FormField>
              <FormField label="Designation *">
                <select value={form.designation} onChange={e => updateField('designation', e.target.value)} style={styles.input}>
                  {DESIGNATIONS.map(d => <option key={d.value} value={d.value}>{d.label}</option>)}
                </select>
              </FormField>
            </div>

            <div style={styles.row}>
              <FormField label="Number of Posts *">
                <input type="number" value={form.numberOfPosts} onChange={e => updateField('numberOfPosts', e.target.value)} min={1} style={styles.input} />
              </FormField>
              <FormField label="Requisition Type *">
                <select value={form.requisitionType} onChange={e => updateField('requisitionType', e.target.value)} style={styles.input}>
                  {REQUISITION_TYPES.map(r => <option key={r.value} value={r.value}>{r.label}</option>)}
                </select>
              </FormField>
            </div>

            {form.requisitionType === 'PROJECT' && (
              <FormField label="Project Name">
                <input type="text" value={form.projectName} onChange={e => updateField('projectName', e.target.value)} style={styles.input} />
              </FormField>
            )}

            <div style={styles.row}>
              <FormField label="Domain">
                <select value={form.domainId} onChange={e => updateField('domainId', e.target.value)} style={styles.input}>
                  <option value="">-- Not domain-specific --</option>
                  {domains.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
                </select>
              </FormField>
              <FormField label="NPC Office">
                <select value={form.officeId} onChange={e => updateField('officeId', e.target.value)} style={styles.input}>
                  <option value="">-- Select Office --</option>
                  {offices.map(o => <option key={o.id} value={o.id}>{o.name} ({o.city})</option>)}
                </select>
              </FormField>
            </div>

            <div style={styles.row}>
              <FormField label="Place of Deployment">
                <input type="text" value={form.placeOfDeployment} onChange={e => updateField('placeOfDeployment', e.target.value)} style={styles.input} placeholder="e.g., NPC HQ, New Delhi" />
              </FormField>
              <FormField label="Contract Period (months)">
                <input type="number" value={form.contractPeriodMonths} onChange={e => updateField('contractPeriodMonths', e.target.value)} min={1} style={styles.input} />
              </FormField>
            </div>

            <div style={styles.row}>
              <FormField label="Last Date to Apply">
                <input type="date" value={form.lastDateToApply} onChange={e => updateField('lastDateToApply', e.target.value)} style={styles.input} />
              </FormField>
              <FormField label="Application Email">
                <input type="email" value={form.applicationEmail} onChange={e => updateField('applicationEmail', e.target.value)} style={styles.input} />
              </FormField>
            </div>

            <FormField label="Brief Description" help="2-3 line overview (optional)">
              <textarea value={form.description} onChange={e => updateField('description', e.target.value)} style={styles.textarea} rows={3} />
            </FormField>

            <div style={styles.navRow}>
              <div />
              <button type="button" onClick={() => setStep(2)} style={styles.btn}>Next: Auto-Filled Details &rarr;</button>
            </div>
          </div>
        )}

        {/* ═══ STEP 2: Auto-Filled Details (Editable) ═══ */}
        {step === 2 && (
          <div style={styles.stepContent}>
            <h3 style={styles.stepTitle}>Step 2: Auto-Filled Details</h3>

            {autoFilled ? (
              <div style={styles.autoFillBanner}>
                Values below are auto-filled from <strong>AI-858/2026</strong> for
                <strong> {currentDesignationLabel}</strong> ({form.engagementType === 'FULL_TIME' ? 'Full-Time' : 'Part-Time'}).
                You can edit any field if needed.
              </div>
            ) : (
              <div style={styles.manualBanner}>
                Auto-fill is not available for the selected designation/engagement type combination.
                Please enter values manually.
              </div>
            )}

            <div style={styles.row}>
              <FormField label="Remuneration Min (Rs)">
                <input type="number" value={form.remunerationMin} onChange={e => updateField('remunerationMin', e.target.value)} min={0} style={styles.input} />
              </FormField>
              <FormField label="Remuneration Max (Rs) *">
                <input type="number" value={form.remunerationMax} onChange={e => updateField('remunerationMax', e.target.value)} min={0} style={styles.input} />
              </FormField>
              <FormField label="Basis">
                <select value={form.remunerationBasis} onChange={e => updateField('remunerationBasis', e.target.value)} style={styles.input}>
                  <option value="MONTHLY">Monthly</option>
                  <option value="DAILY">Daily</option>
                  <option value="LUMP_SUM">Lump Sum</option>
                </select>
              </FormField>
            </div>

            <FormField label="Remuneration Note">
              <input type="text" value={form.remunerationNote} onChange={e => updateField('remunerationNote', e.target.value)} style={styles.input} />
            </FormField>

            <div style={styles.row}>
              <FormField label="Minimum Qualification *">
                <input type="text" value={form.minQualification} onChange={e => updateField('minQualification', e.target.value)} style={styles.input} />
              </FormField>
              <FormField label="Minimum Experience (years)">
                <input type="number" value={form.minExperienceYears} onChange={e => updateField('minExperienceYears', e.target.value)} min={0} step={0.5} style={styles.input} />
              </FormField>
              <FormField label="Maximum Age (years)">
                <input type="number" value={form.maxAge} onChange={e => updateField('maxAge', e.target.value)} min={18} max={70} style={styles.input} />
              </FormField>
            </div>

            <FormField label="Functional Role" help="Brief 1-2 line role description">
              <input type="text" value={form.functionalRole} onChange={e => updateField('functionalRole', e.target.value)} style={styles.input} placeholder="e.g., Support NPC projects in data analysis and report preparation" />
            </FormField>

            <FormField label="Work Responsibilities" help="Detailed duties (each line starting with '-' becomes a bullet)">
              <textarea value={form.workResponsibilities} onChange={e => updateField('workResponsibilities', e.target.value)} style={styles.textarea} rows={5} placeholder="- Assist in project execution&#10;- Prepare reports and presentations&#10;- Any other task assigned by NPC" />
            </FormField>

            <FormField label="Eligibility Criteria" help="Detailed eligibility text for applicants">
              <textarea value={form.eligibilityCriteria} onChange={e => updateField('eligibilityCriteria', e.target.value)} style={styles.textarea} rows={4} />
            </FormField>

            <FormField label="Qualification Details" help="Additional qualification info">
              <textarea value={form.qualificationDetails} onChange={e => updateField('qualificationDetails', e.target.value)} style={styles.textarea} rows={3} />
            </FormField>

            <div style={styles.row}>
              <FormField label="Specific Requirements">
                <textarea value={form.specificRequirements} onChange={e => updateField('specificRequirements', e.target.value)} style={styles.textarea} rows={3} />
              </FormField>
              <FormField label="Desirable Skills">
                <textarea value={form.desirableSkills} onChange={e => updateField('desirableSkills', e.target.value)} style={styles.textarea} rows={3} />
              </FormField>
            </div>

            <FormField label="Working Hours Note">
              <input type="text" value={form.workingHoursNote} onChange={e => updateField('workingHoursNote', e.target.value)} style={styles.input} />
            </FormField>

            <div style={styles.checkRow}>
              <label style={styles.checkLabel}>
                <input type="checkbox" checked={form.travelRequired} onChange={e => updateField('travelRequired', e.target.checked)} />
                Travel may be required
              </label>
            </div>
            {form.travelRequired && (
              <FormField label="Travel / TA-DA Note">
                <input type="text" value={form.travelNote} onChange={e => updateField('travelNote', e.target.value)} style={styles.input} />
              </FormField>
            )}

            <FormField label="Terms & Conditions" help={autoFilled ? `Auto-filled for ${form.engagementType === 'FULL_TIME' ? 'full-time' : 'part-time'} engagement. Edit as needed.` : 'Enter terms and conditions.'}>
              <textarea value={form.termsAndConditions} onChange={e => updateField('termsAndConditions', e.target.value)} style={styles.textarea} rows={10} />
            </FormField>

            <FormField label="General Conditions">
              <textarea value={form.generalConditions} onChange={e => updateField('generalConditions', e.target.value)} style={styles.textarea} rows={7} />
            </FormField>

            <div style={styles.navRow}>
              <button type="button" onClick={() => setStep(1)} style={styles.btnOutline}>&larr; Previous</button>
              <button type="button" onClick={() => setStep(3)} style={styles.btn}>Next: Review & Submit &rarr;</button>
            </div>
          </div>
        )}

        {/* ═══ STEP 3: Review & Submit ═══ */}
        {step === 3 && (
          <div style={styles.stepContent}>
            <h3 style={styles.stepTitle}>Step 3: Review & Submit</h3>
            <p style={{ color: '#666', marginBottom: 16 }}>
              Review the advertisement details below. It will be saved as DRAFT.
            </p>

            <div style={styles.reviewGrid}>
              <ReviewItem label="Title" value={form.title} />
              <ReviewItem label="Designation" value={currentDesignationLabel} />
              <ReviewItem label="Engagement Type" value={form.engagementType.replace(/_/g, ' ')} />
              <ReviewItem label="Posts" value={String(form.numberOfPosts)} />
              <ReviewItem label="Location" value={form.placeOfDeployment || offices.find(o => o.id === form.officeId)?.name || '—'} />
              <ReviewItem label="Qualification" value={form.minQualification || '—'} />
              <ReviewItem label="Experience" value={form.minExperienceYears ? `${form.minExperienceYears}+ years` : '—'} />
              <ReviewItem label="Max Age" value={form.maxAge ? `${form.maxAge} years` : '—'} />
              <ReviewItem label="Remuneration" value={
                form.remunerationMax
                  ? form.remunerationMin && form.remunerationMin !== form.remunerationMax
                    ? `Rs ${Number(form.remunerationMin).toLocaleString('en-IN')} – ${Number(form.remunerationMax).toLocaleString('en-IN')}/${form.remunerationBasis === 'DAILY' ? 'day' : 'month'}`
                    : `Rs ${Number(form.remunerationMax).toLocaleString('en-IN')}/${form.remunerationBasis === 'DAILY' ? 'day' : 'month'}`
                  : '—'
              } />
              <ReviewItem label="Contract Period" value={form.contractPeriodMonths ? `${form.contractPeriodMonths} months` : '—'} />
              <ReviewItem label="Last Date" value={form.lastDateToApply ? new Date(form.lastDateToApply).toLocaleDateString('en-IN') : '—'} />
              <ReviewItem label="Email" value={form.applicationEmail || '—'} />
            </div>

            {autoFilled && (
              <div style={{ ...styles.autoFillBanner, marginTop: 12 }}>
                Salary, qualification, and terms were auto-filled from AI-858/2026 for {currentDesignationLabel}.
              </div>
            )}

            {form.workResponsibilities && (
              <div style={styles.reviewSection}>
                <strong>Work Responsibilities:</strong>
                <pre style={styles.reviewPre}>{form.workResponsibilities}</pre>
              </div>
            )}

            <div style={styles.navRow}>
              <button type="button" onClick={() => setStep(2)} style={styles.btnOutline}>&larr; Previous</button>
              <button type="submit" disabled={loading} style={styles.submitBtn}>
                {loading ? 'Creating...' : 'Create Advertisement (as Draft)'}
              </button>
            </div>
          </div>
        )}
      </form>
    </div>
  );
}

function FormField({ label, help, children }: { label: string; help?: string; children: React.ReactNode }) {
  return (
    <div style={styles.formField}>
      <label style={styles.label}>{label}</label>
      {help && <span style={styles.helpText}>{help}</span>}
      {children}
    </div>
  );
}

function ReviewItem({ label, value }: { label: string; value: string }) {
  return (
    <div style={styles.reviewItem}>
      <span style={styles.reviewLabel}>{label}:</span>
      <span style={styles.reviewValue}>{value}</span>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  container: { maxWidth: 900, margin: '0 auto', padding: 24 },
  subtitle: { color: '#666', marginBottom: 24, fontSize: '0.9rem' },
  stepBar: { display: 'flex', gap: 4, marginBottom: 24, flexWrap: 'wrap' as const },
  stepBtn: { flex: 1, minWidth: 150, padding: 10, border: 'none', borderRadius: 6, cursor: 'pointer', fontSize: '0.85rem', fontWeight: 500 },
  stepContent: { background: '#fff', border: '1px solid #e0e0e0', borderRadius: 8, padding: 24 },
  stepTitle: { margin: '0 0 20px', color: '#1a237e', borderBottom: '2px solid #e8eaf6', paddingBottom: 8 },
  formField: { marginBottom: 16 },
  label: { display: 'block', fontWeight: 600, fontSize: '0.9rem', marginBottom: 4, color: '#333' },
  helpText: { display: 'block', fontSize: '0.78rem', color: '#888', marginBottom: 4 },
  input: { display: 'block', width: '100%', padding: '8px 12px', border: '1px solid #ccc', borderRadius: 4, fontSize: '0.95rem', boxSizing: 'border-box' as const },
  textarea: { display: 'block', width: '100%', padding: '8px 12px', border: '1px solid #ccc', borderRadius: 4, fontSize: '0.9rem', boxSizing: 'border-box' as const, fontFamily: 'inherit', lineHeight: '1.5' },
  row: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16 },
  checkRow: { marginBottom: 12 },
  checkLabel: { display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.9rem', cursor: 'pointer' },
  navRow: { display: 'flex', justifyContent: 'space-between', marginTop: 24, gap: 12 },
  btn: { padding: '10px 24px', background: '#1a237e', color: '#fff', border: 'none', borderRadius: 5, cursor: 'pointer', fontSize: '0.9rem', fontWeight: 500 },
  btnOutline: { padding: '10px 24px', background: '#fff', color: '#1a237e', border: '1px solid #1a237e', borderRadius: 5, cursor: 'pointer', fontSize: '0.9rem', fontWeight: 500 },
  submitBtn: { padding: '12px 32px', background: '#2e7d32', color: '#fff', border: 'none', borderRadius: 5, cursor: 'pointer', fontSize: '1rem', fontWeight: 600 },
  errorBox: { background: '#ffebee', color: '#c62828', padding: 12, borderRadius: 6, marginBottom: 16 },
  successBox: { background: '#e8f5e9', border: '1px solid #a5d6a7', padding: 24, borderRadius: 8, marginTop: 24 },
  autoFillBanner: { background: '#e8f5e9', border: '1px solid #a5d6a7', padding: '12px 16px', borderRadius: 6, marginBottom: 20, fontSize: '0.9rem', color: '#2e7d32' },
  manualBanner: { background: '#fff3e0', border: '1px solid #ffe0b2', padding: '12px 16px', borderRadius: 6, marginBottom: 20, fontSize: '0.9rem', color: '#e65100' },
  reviewGrid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px 24px', margin: '16px 0', background: '#fafafa', padding: 16, borderRadius: 6 },
  reviewItem: { padding: '6px 0', borderBottom: '1px solid #eee' },
  reviewLabel: { fontSize: '0.8rem', color: '#888', marginRight: 8 },
  reviewValue: { fontSize: '0.9rem', fontWeight: 500, color: '#333' },
  reviewSection: { margin: '16px 0', padding: 12, background: '#fafafa', borderRadius: 6 },
  reviewPre: { margin: '8px 0 0', fontSize: '0.85rem', whiteSpace: 'pre-wrap' as const, color: '#555', lineHeight: '1.6' },
};
