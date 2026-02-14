/**
 * Empanelment application form.
 *
 * Features:
 * - Pre-fills from existing profile (returning applicant skips re-entry)
 * - Documents inline with each education & experience entry (auto-numbered EDU-1, EXP-1)
 * - Professional certifications with inline docs (CERT-1, CERT-2)
 * - Photo, ID proof in personal details step
 *
 * On submit, creates/updates profile + application with auto-screening per Empanelment AI §2.3.
 */

import React, { useState, useEffect, useRef, type FormEvent } from 'react';
import { useAuth } from '../services/AuthContext';
import { getDomains, getOffices, getProfile, submitEmpanelmentFull, uploadDocument } from '../services/api';
import ScreeningResultCard from '../components/ScreeningResultCard';
import type { Domain, NpcOffice, EmpanelmentArea, ScreeningResult, Certification } from '../types';

const BG_TYPE_OPTIONS: { value: string; label: string }[] = [
  { value: 'GOVERNMENT_GROUP_A', label: 'Government (Group A) — Serving/Retired' },
  { value: 'GOVERNMENT_OTHER', label: 'Government (Other)' },
  { value: 'CPSE', label: 'Central Public Sector Enterprise' },
  { value: 'AUTONOMOUS_BODY', label: 'Autonomous Body' },
  { value: 'PRIVATE_SECTOR', label: 'Private Sector' },
  { value: 'ACADEMIC', label: 'Academic / Research Institution' },
  { value: 'SELF_EMPLOYED', label: 'Self Employed / Consultant' },
  { value: 'FRESH_GRADUATE', label: 'Fresh Graduate' },
];

const EMPANELMENT_AREAS: { value: EmpanelmentArea; label: string }[] = [
  { value: 'CONSULTANCY' as EmpanelmentArea, label: 'Consultancy / Action Research Services' },
  { value: 'TRAINING' as EmpanelmentArea, label: 'Training & Capacity Building Services' },
  { value: 'BOTH' as EmpanelmentArea, label: 'Both Consultancy & Training' },
];

const GENDER_OPTIONS = ['Male', 'Female', 'Other'];

interface EduEntry {
  degree: string; field: string; institution: string; university: string;
  yearOfPassing: number; grade: string;
  isPremierInstitute: boolean; isDoctorate: boolean; isPostGraduation: boolean;
  docFile: File | null; docName: string;
}

interface ExpEntry {
  organization: string; designation: string; startDate: string; endDate: string;
  isCurrent: boolean; isGroupAService: boolean; isLevel12OrAbove: boolean;
  dutiesDescription: string; payBandOrRemuneration: string; payLevel: string;
  docFile: File | null; docName: string;
}

interface CertEntry extends Certification {
  docFile: File | null; docName: string;
}

export default function EmpanelmentApplicationPage() {
  const { user } = useAuth();
  const [domains, setDomains] = useState<Domain[]>([]);
  const [offices, setOffices] = useState<NpcOffice[]>([]);
  const [loading, setLoading] = useState(false);
  const [profileLoading, setProfileLoading] = useState(true);
  const [profileLoaded, setProfileLoaded] = useState(false);
  const [error, setError] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [screeningResult, setScreeningResult] = useState<ScreeningResult | null>(null);
  const [step, setStep] = useState(1);
  const photoInputRef = useRef<HTMLInputElement>(null);
  const idProofRef = useRef<HTMLInputElement>(null);

  // Personal Details
  const [fullName, setFullName] = useState(user?.name || '');
  const [dob, setDob] = useState('');
  const [gender, setGender] = useState('');
  const [fatherSpouseName, setFatherSpouseName] = useState('');
  const [backgroundType, setBackgroundType] = useState('PRIVATE_SECTOR');
  const [correspondenceAddress, setCorrespondenceAddress] = useState('');
  const [permanentAddress, setPermanentAddress] = useState('');
  const [mobile, setMobile] = useState('');
  const [altPhone, setAltPhone] = useState('');
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [idProofFile, setIdProofFile] = useState<File | null>(null);
  const [idProofName, setIdProofName] = useState('');

  // Education (with inline doc)
  const [educations, setEducations] = useState<EduEntry[]>([mkEdu()]);

  // Experience (with inline doc)
  const [experiences, setExperiences] = useState<ExpEntry[]>([mkExp()]);

  // Certifications (with inline doc)
  const [certifications, setCertifications] = useState<CertEntry[]>([]);

  // Domain & Preferences
  const [domainId, setDomainId] = useState('');
  const [subDomainId, setSubDomainId] = useState('');
  const [empanelmentArea, setEmpanelmentArea] = useState('BOTH');
  const [selectedOffices, setSelectedOffices] = useState<string[]>([]);

  function mkEdu(): EduEntry {
    return { degree: '', field: '', institution: '', university: '', yearOfPassing: 2020, grade: '', isPremierInstitute: false, isDoctorate: false, isPostGraduation: false, docFile: null, docName: '' };
  }
  function mkExp(): ExpEntry {
    return { organization: '', designation: '', startDate: '', endDate: '', isCurrent: false, isGroupAService: false, isLevel12OrAbove: false, dutiesDescription: '', payBandOrRemuneration: '', payLevel: '', docFile: null, docName: '' };
  }
  function mkCert(): CertEntry {
    return { name: '', issuingBody: '', yearObtained: undefined, certificateNumber: '', docFile: null, docName: '' };
  }

  // ── Pre-fill from existing profile ──
  useEffect(() => {
    getDomains().then(setDomains).catch(console.error);
    getOffices().then(setOffices).catch(console.error);

    if (user) {
      getProfile().then(res => {
        if (res.success && res.data) {
          const p = res.data;
          setFullName(p.fullName || user.name || '');
          if (p.dateOfBirth) setDob(p.dateOfBirth.slice(0, 10));
          if (p.gender) setGender(p.gender);
          if (p.fatherOrMotherOrSpouseName) setFatherSpouseName(p.fatherOrMotherOrSpouseName);
          if (p.backgroundType) setBackgroundType(p.backgroundType);
          if (p.correspondenceAddress) setCorrespondenceAddress(p.correspondenceAddress);
          if (p.permanentAddress) setPermanentAddress(p.permanentAddress);
          if (p.contactNumbers?.length) { setMobile(p.contactNumbers[0] || ''); setAltPhone(p.contactNumbers[1] || ''); }
          if (p.photoUrl) setPhotoPreview(p.photoUrl);

          if (p.educations?.length) {
            setEducations(p.educations.map((e: any) => ({
              degree: e.degree, field: e.field, institution: e.institution,
              university: e.university || '', yearOfPassing: e.yearOfPassing, grade: e.grade || '',
              isPremierInstitute: e.isPremierInstitute, isDoctorate: e.isDoctorate, isPostGraduation: e.isPostGraduation,
              docFile: null, docName: '',
            })));
          }
          if (p.experiences?.length) {
            setExperiences(p.experiences.map((e: any) => ({
              organization: e.organization, designation: e.designation,
              startDate: e.startDate?.slice(0, 10) || '', endDate: e.endDate?.slice(0, 10) || '',
              isCurrent: e.isCurrent, isGroupAService: e.isGroupAService, isLevel12OrAbove: e.isLevel12OrAbove,
              dutiesDescription: e.dutiesDescription || '', payBandOrRemuneration: e.payBandOrRemuneration || '',
              payLevel: e.payLevel || '', docFile: null, docName: '',
            })));
          }
          if (p.certifications?.length) {
            setCertifications(p.certifications.map((c: any) => ({
              name: c.name, issuingBody: c.issuingBody, yearObtained: c.yearObtained,
              certificateNumber: c.certificateNumber || '', docFile: null, docName: '',
            })));
          }
          setProfileLoaded(true);
        }
      }).catch(() => {}).finally(() => setProfileLoading(false));
    } else {
      setProfileLoading(false);
    }
  }, [user]);

  const selectedDomain = domains.find(d => d.id === domainId);

  // helpers
  function updateEdu(idx: number, f: string, v: any) { const u = [...educations]; (u[idx] as any)[f] = v; setEducations(u); }
  function updateExp(idx: number, f: string, v: any) { const u = [...experiences]; (u[idx] as any)[f] = v; setExperiences(u); }
  function updateCert(idx: number, f: string, v: any) { const u = [...certifications]; (u[idx] as any)[f] = v; setCertifications(u); }
  function toggleOffice(id: string) { setSelectedOffices(p => p.includes(id) ? p.filter(x => x !== id) : [...p, id]); }

  function handlePhotoChange(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0]; if (!f) return;
    setPhotoFile(f); const r = new FileReader(); r.onload = () => setPhotoPreview(r.result as string); r.readAsDataURL(f);
  }

  function validateStep(s: number): string | null {
    if (s === 1) { if (!fullName.trim()) return 'Full Name is required.'; if (!dob) return 'Date of Birth is required.'; }
    if (s === 2) { for (let i = 0; i < educations.length; i++) { const e = educations[i]; if (!e.degree.trim() || !e.field.trim() || !e.institution.trim()) return `EDU-${i+1}: Degree, Field, and Institution are required.`; } }
    if (s === 3) { for (let i = 0; i < experiences.length; i++) { const e = experiences[i]; if (!e.organization.trim() || !e.designation.trim() || !e.startDate) return `EXP-${i+1}: Organization, Designation, and Start Date are required.`; } }
    if (s === 5) { if (!domainId) return 'Please select a domain.'; if (!selectedOffices.length) return 'Please select at least one NPC office.'; }
    return null;
  }

  function goNext() { const e = validateStep(step); if (e) { setError(e); return; } setError(''); setStep(step + 1); }
  function goBack() { setError(''); setStep(step - 1); }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const err = validateStep(step); if (err) { setError(err); return; }
    setError(''); setLoading(true);

    try {
      const profileData = {
        fullName, dateOfBirth: dob, gender, fatherOrMotherOrSpouseName: fatherSpouseName,
        backgroundType, correspondenceAddress, permanentAddress,
        contactNumbers: [mobile, altPhone].filter(Boolean),
        educations: educations.map(e => ({ degree: e.degree, field: e.field, institution: e.institution, university: e.university, yearOfPassing: e.yearOfPassing, grade: e.grade, isPremierInstitute: e.isPremierInstitute, isDoctorate: e.isDoctorate, isPostGraduation: e.isPostGraduation })),
        experiences: experiences.map(e => ({ organization: e.organization, designation: e.designation, startDate: e.startDate, endDate: e.isCurrent ? undefined : e.endDate, isCurrent: e.isCurrent, isGroupAService: e.isGroupAService, payLevel: e.payLevel, isLevel12OrAbove: e.isLevel12OrAbove, payBandOrRemuneration: e.payBandOrRemuneration, dutiesDescription: e.dutiesDescription })),
        certifications: certifications.filter(c => c.name.trim()).map(c => ({ name: c.name, issuingBody: c.issuingBody, yearObtained: c.yearObtained, certificateNumber: c.certificateNumber })),
      };

      const result = await submitEmpanelmentFull({
        profile: profileData, domainId, subDomainId: subDomainId || undefined,
        empanelmentArea, officePreferenceIds: selectedOffices,
      });

      // Upload documents with auto-numbered types
      const uploadErrors: string[] = [];
      const tryUpload = async (file: File, type: string) => {
        try { await uploadDocument(file, type); } catch (e: any) {
          console.error(`Document upload failed (${type}):`, e);
          uploadErrors.push(type);
        }
      };
      if (photoFile) await tryUpload(photoFile, 'PHOTO');
      if (idProofFile) await tryUpload(idProofFile, 'ID-PROOF');
      for (let i = 0; i < educations.length; i++) {
        if (educations[i].docFile) await tryUpload(educations[i].docFile!, `EDU-${i+1}`);
      }
      for (let i = 0; i < experiences.length; i++) {
        if (experiences[i].docFile) await tryUpload(experiences[i].docFile!, `EXP-${i+1}`);
      }
      for (let i = 0; i < certifications.length; i++) {
        if (certifications[i].docFile) await tryUpload(certifications[i].docFile!, `CERT-${i+1}`);
      }
      if (uploadErrors.length > 0) {
        setError(`Application submitted but ${uploadErrors.length} document(s) failed to upload (${uploadErrors.join(', ')}). Please re-upload from your profile.`);
      }

      if (result.success) { setSubmitted(true); setScreeningResult(result.data.screeningResult); }
      else setError(result.error || 'Submission failed.');
    } catch (err: any) {
      setError(err.response?.data?.error || err.message || 'Submission failed.');
    } finally { setLoading(false); }
  }

  if (!user) return <div style={S.container}><h2>Apply for Empanelment</h2><div style={S.error}>Please <a href="/login">login</a> or <a href="/register">register</a> to apply.</div></div>;
  if (profileLoading) return <div style={S.container}><p>Loading your profile...</p></div>;

  if (submitted && screeningResult) {
    return (
      <div style={S.container}>
        <h2 style={{ color: '#1a237e' }}>Application Submitted Successfully</h2>
        <ScreeningResultCard type="empanelment" empanelmentResult={screeningResult} />
        <p style={{ marginTop: 16, color: '#555' }}>Your application has been submitted for Screening Committee review.</p>
      </div>
    );
  }

  const STEPS = ['Personal Details', 'Education & Docs', 'Experience & Docs', 'Certifications', 'Domain & Submit'];

  return (
    <div className="page-container" style={S.container}>
      <h2 style={{ color: '#1a237e', marginBottom: 4 }}>Apply for Empanelment</h2>
      <p style={S.subtitle}>Empanelment as External Expert / Associate — continuous basis</p>

      {profileLoaded && (
        <div style={S.prefillBanner}>
          Your previous profile data has been pre-filled. Review and update if needed, or proceed directly.
        </div>
      )}

      {/* Step indicator */}
      <div style={S.stepBar}>
        {STEPS.map((label, i) => (
          <div key={i} style={{ ...S.stepItem, background: step === i+1 ? '#1a237e' : step > i+1 ? '#4caf50' : '#e0e0e0', color: step >= i+1 ? '#fff' : '#666' }}>
            <span style={{ fontWeight: 'bold', marginRight: 6 }}>{i+1}</span>{label}
          </div>
        ))}
      </div>

      {error && <div style={S.error}>{error}</div>}

      <form onSubmit={handleSubmit}>

        {/* ═══ STEP 1: Personal Details ═══ */}
        {step === 1 && (
          <fieldset style={S.fieldset}>
            <legend style={S.legend}>Personal Details</legend>
            <div className="form-row" style={S.row}>
              <label style={S.label}>Full Name *<input type="text" value={fullName} onChange={e => setFullName(e.target.value)} required style={S.input} /></label>
              <label style={S.label}>Date of Birth *<input type="date" value={dob} onChange={e => setDob(e.target.value)} required style={S.input} /></label>
            </div>
            <div className="form-row" style={S.row}>
              <label style={S.label}>Gender<select value={gender} onChange={e => setGender(e.target.value)} style={S.input}><option value="">-- Select --</option>{GENDER_OPTIONS.map(g => <option key={g}>{g}</option>)}</select></label>
              <label style={S.label}>Father / Mother / Spouse Name<input type="text" value={fatherSpouseName} onChange={e => setFatherSpouseName(e.target.value)} style={S.input} /></label>
            </div>
            <label style={S.label}>Background Type *<select value={backgroundType} onChange={e => setBackgroundType(e.target.value)} style={S.input}>{BG_TYPE_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}</select></label>
            <div className="form-row" style={S.row}>
              <label style={S.label}>Mobile *<input type="tel" value={mobile} onChange={e => setMobile(e.target.value)} required style={S.input} placeholder="9876543210" /></label>
              <label style={S.label}>Alternate Phone<input type="tel" value={altPhone} onChange={e => setAltPhone(e.target.value)} style={S.input} /></label>
            </div>
            <label style={S.label}>Correspondence Address<textarea value={correspondenceAddress} onChange={e => setCorrespondenceAddress(e.target.value)} style={{ ...S.input, height: 60, resize: 'vertical' as const }} /></label>
            <label style={S.label}>Permanent Address<textarea value={permanentAddress} onChange={e => setPermanentAddress(e.target.value)} style={{ ...S.input, height: 60, resize: 'vertical' as const }} /></label>
            <div className="form-row" style={S.row}>
              <div>
                <strong style={{ fontSize: '0.9rem' }}>Passport Photo</strong>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginTop: 4 }}>
                  <button type="button" onClick={() => photoInputRef.current?.click()} style={S.addBtn}>{photoFile ? 'Change' : 'Upload'}</button>
                  <input ref={photoInputRef} type="file" accept="image/*" onChange={handlePhotoChange} style={{ display: 'none' }} />
                  {photoPreview && <img src={photoPreview} alt="Photo" style={{ width: 60, height: 75, objectFit: 'cover', border: '1px solid #ccc', borderRadius: 4 }} />}
                  {photoFile && <span style={S.fileTag}>PHOTO: {photoFile.name}</span>}
                </div>
              </div>
              <div>
                <strong style={{ fontSize: '0.9rem' }}>ID Proof (Aadhaar / PAN)</strong>
                <div style={{ marginTop: 4 }}>
                  <input ref={idProofRef} type="file" accept=".pdf,.jpg,.jpeg,.png" onChange={e => { const f = e.target.files?.[0]; if (f) { setIdProofFile(f); setIdProofName(f.name); } }} style={{ fontSize: '0.8rem' }} />
                  {idProofName && <span style={S.fileTag}>ID-PROOF: {idProofName}</span>}
                </div>
              </div>
            </div>
          </fieldset>
        )}

        {/* ═══ STEP 2: Education with inline docs ═══ */}
        {step === 2 && (
          <fieldset style={S.fieldset}>
            <legend style={S.legend}>Educational Qualifications</legend>
            <p style={S.hint}>Add all qualifications. Attach the degree/certificate for each entry.</p>
            {educations.map((edu, idx) => {
              const tag = `EDU-${idx + 1}`;
              return (
                <div key={idx} style={S.entryBlock}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                    <strong style={{ color: '#1a237e' }}><span style={S.docTag}>{tag}</span> Qualification #{idx + 1}</strong>
                    {educations.length > 1 && <button type="button" onClick={() => setEducations(educations.filter((_, i) => i !== idx))} style={S.removeBtn}>Remove</button>}
                  </div>
                  <div className="form-row" style={S.row}>
                    <label style={S.label}>Degree *<input type="text" value={edu.degree} onChange={e => updateEdu(idx, 'degree', e.target.value)} required style={S.input} placeholder="e.g., B.Tech, MBA, Ph.D." /></label>
                    <label style={S.label}>Subject / Field *<input type="text" value={edu.field} onChange={e => updateEdu(idx, 'field', e.target.value)} required style={S.input} /></label>
                  </div>
                  <div className="form-row" style={S.row}>
                    <label style={S.label}>Institution *<input type="text" value={edu.institution} onChange={e => updateEdu(idx, 'institution', e.target.value)} required style={S.input} /></label>
                    <label style={S.label}>University / Board<input type="text" value={edu.university} onChange={e => updateEdu(idx, 'university', e.target.value)} style={S.input} placeholder="e.g., Delhi University" /></label>
                  </div>
                  <div className="form-row" style={S.row}>
                    <label style={S.label}>Year of Passing *<input type="number" value={edu.yearOfPassing} onChange={e => updateEdu(idx, 'yearOfPassing', parseInt(e.target.value))} required style={S.input} min={1950} max={2030} /></label>
                    <label style={S.label}>Marks (%) / CGPA<input type="text" value={edu.grade} onChange={e => updateEdu(idx, 'grade', e.target.value)} style={S.input} placeholder="e.g., 78% or 8.5" /></label>
                  </div>
                  <div style={S.checkRow}>
                    <label style={S.checkLabel}><input type="checkbox" checked={edu.isPostGraduation} onChange={e => updateEdu(idx, 'isPostGraduation', e.target.checked)} /> Post-Graduation</label>
                    <label style={S.checkLabel}><input type="checkbox" checked={edu.isDoctorate} onChange={e => updateEdu(idx, 'isDoctorate', e.target.checked)} /> Doctorate</label>
                    <label style={S.checkLabel}><input type="checkbox" checked={edu.isPremierInstitute} onChange={e => updateEdu(idx, 'isPremierInstitute', e.target.checked)} /> Premier Institute</label>
                  </div>
                  {/* Inline document upload */}
                  <div style={S.docRow}>
                    <span style={S.docLabel}>{tag}: Attach Certificate/Degree</span>
                    <input type="file" accept=".pdf,.jpg,.jpeg,.png,.doc,.docx" onChange={e => { const f = e.target.files?.[0]; if (f) { updateEdu(idx, 'docFile', f); updateEdu(idx, 'docName', f.name); } }} style={{ fontSize: '0.8rem' }} />
                    {edu.docName && <span style={S.fileTag}>{tag}: {edu.docName}</span>}
                  </div>
                </div>
              );
            })}
            <button type="button" onClick={() => setEducations([...educations, mkEdu()])} style={S.addBtn}>+ Add Education</button>
          </fieldset>
        )}

        {/* ═══ STEP 3: Experience with inline docs ═══ */}
        {step === 3 && (
          <fieldset style={S.fieldset}>
            <legend style={S.legend}>Professional Experience</legend>
            <p style={S.hint}>Include job profile/duties. Attach experience/relieving certificate for each.</p>
            {experiences.map((exp, idx) => {
              const tag = `EXP-${idx + 1}`;
              return (
                <div key={idx} style={S.entryBlock}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                    <strong style={{ color: '#1a237e' }}><span style={S.docTag}>{tag}</span> Experience #{idx + 1}</strong>
                    {experiences.length > 1 && <button type="button" onClick={() => setExperiences(experiences.filter((_, i) => i !== idx))} style={S.removeBtn}>Remove</button>}
                  </div>
                  <div className="form-row" style={S.row}>
                    <label style={S.label}>Organization *<input type="text" value={exp.organization} onChange={e => updateExp(idx, 'organization', e.target.value)} required style={S.input} /></label>
                    <label style={S.label}>Designation *<input type="text" value={exp.designation} onChange={e => updateExp(idx, 'designation', e.target.value)} required style={S.input} /></label>
                  </div>
                  <div className="form-row" style={S.row}>
                    <label style={S.label}>Start Date *<input type="date" value={exp.startDate} onChange={e => updateExp(idx, 'startDate', e.target.value)} required style={S.input} /></label>
                    <label style={S.label}>End Date {exp.isCurrent ? '(Current)' : ''}<input type="date" value={exp.endDate} onChange={e => updateExp(idx, 'endDate', e.target.value)} disabled={exp.isCurrent} style={S.input} /></label>
                  </div>
                  <div className="form-row" style={S.row}>
                    <label style={S.label}>Pay Band / CTC<input type="text" value={exp.payBandOrRemuneration} onChange={e => updateExp(idx, 'payBandOrRemuneration', e.target.value)} style={S.input} placeholder="e.g., Level 11 / Rs 80,000" /></label>
                    <label style={S.label}>Pay Level (7th CPC)<input type="text" value={exp.payLevel} onChange={e => updateExp(idx, 'payLevel', e.target.value)} style={S.input} placeholder="e.g., 10, 12" /></label>
                  </div>
                  <label style={S.label}>Job Profile / Duties<textarea value={exp.dutiesDescription} onChange={e => updateExp(idx, 'dutiesDescription', e.target.value)} style={{ ...S.input, height: 70, resize: 'vertical' as const }} placeholder="Key responsibilities, projects, achievements..." /></label>
                  <div style={S.checkRow}>
                    <label style={S.checkLabel}><input type="checkbox" checked={exp.isCurrent} onChange={e => updateExp(idx, 'isCurrent', e.target.checked)} /> Currently working</label>
                    <label style={S.checkLabel}><input type="checkbox" checked={exp.isGroupAService} onChange={e => updateExp(idx, 'isGroupAService', e.target.checked)} /> Group-A Service</label>
                    <label style={S.checkLabel}><input type="checkbox" checked={exp.isLevel12OrAbove} onChange={e => updateExp(idx, 'isLevel12OrAbove', e.target.checked)} /> Pay Level 12+</label>
                  </div>
                  <div style={S.docRow}>
                    <span style={S.docLabel}>{tag}: Attach Experience / Relieving Certificate</span>
                    <input type="file" accept=".pdf,.jpg,.jpeg,.png,.doc,.docx" onChange={e => { const f = e.target.files?.[0]; if (f) { updateExp(idx, 'docFile', f); updateExp(idx, 'docName', f.name); } }} style={{ fontSize: '0.8rem' }} />
                    {exp.docName && <span style={S.fileTag}>{tag}: {exp.docName}</span>}
                  </div>
                </div>
              );
            })}
            <button type="button" onClick={() => setExperiences([...experiences, mkExp()])} style={S.addBtn}>+ Add Experience</button>
          </fieldset>
        )}

        {/* ═══ STEP 4: Certifications with inline docs ═══ */}
        {step === 4 && (
          <fieldset style={S.fieldset}>
            <legend style={S.legend}>Professional Certifications</legend>
            <p style={S.hint}>Add professional certifications (PMP, Six Sigma, ISO Lead Auditor, etc.) with supporting documents.</p>
            {certifications.length === 0 && <p style={{ color: '#999', fontStyle: 'italic', fontSize: '0.85rem' }}>No certifications added yet. Click below to add.</p>}
            {certifications.map((cert, idx) => {
              const tag = `CERT-${idx + 1}`;
              return (
                <div key={idx} style={S.entryBlock}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                    <strong style={{ color: '#1a237e' }}><span style={S.docTag}>{tag}</span> Certification #{idx + 1}</strong>
                    <button type="button" onClick={() => setCertifications(certifications.filter((_, i) => i !== idx))} style={S.removeBtn}>Remove</button>
                  </div>
                  <div className="form-row" style={S.row}>
                    <label style={S.label}>Name *<input type="text" value={cert.name} onChange={e => updateCert(idx, 'name', e.target.value)} style={S.input} placeholder="e.g., PMP" /></label>
                    <label style={S.label}>Issuing Body *<input type="text" value={cert.issuingBody} onChange={e => updateCert(idx, 'issuingBody', e.target.value)} style={S.input} placeholder="e.g., PMI" /></label>
                  </div>
                  <div className="form-row" style={S.row}>
                    <label style={S.label}>Year<input type="number" value={cert.yearObtained || ''} onChange={e => updateCert(idx, 'yearObtained', parseInt(e.target.value) || undefined)} style={S.input} /></label>
                    <label style={S.label}>Certificate No.<input type="text" value={cert.certificateNumber || ''} onChange={e => updateCert(idx, 'certificateNumber', e.target.value)} style={S.input} /></label>
                  </div>
                  <div style={S.docRow}>
                    <span style={S.docLabel}>{tag}: Attach Certificate</span>
                    <input type="file" accept=".pdf,.jpg,.jpeg,.png,.doc,.docx" onChange={e => { const f = e.target.files?.[0]; if (f) { updateCert(idx, 'docFile', f); updateCert(idx, 'docName', f.name); } }} style={{ fontSize: '0.8rem' }} />
                    {cert.docName && <span style={S.fileTag}>{tag}: {cert.docName}</span>}
                  </div>
                </div>
              );
            })}
            <button type="button" onClick={() => setCertifications([...certifications, mkCert()])} style={S.addBtn}>+ Add Certification</button>
          </fieldset>
        )}

        {/* ═══ STEP 5: Domain & Submit ═══ */}
        {step === 5 && (
          <>
            <fieldset style={S.fieldset}>
              <legend style={S.legend}>Domain & Empanelment Area</legend>
              <div className="form-row" style={S.row}>
                <label style={S.label}>Domain *<select value={domainId} onChange={e => { setDomainId(e.target.value); setSubDomainId(''); }} required style={S.input}><option value="">-- Select --</option>{domains.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}</select></label>
                <label style={S.label}>Sub-Domain<select value={subDomainId} onChange={e => setSubDomainId(e.target.value)} style={S.input} disabled={!selectedDomain}><option value="">-- Select --</option>{selectedDomain?.subDomains.map(sd => <option key={sd.id} value={sd.id}>{sd.name}</option>)}</select></label>
              </div>
              <label style={S.label}>Empanelment Area *<select value={empanelmentArea} onChange={e => setEmpanelmentArea(e.target.value)} required style={S.input}>{EMPANELMENT_AREAS.map(ea => <option key={ea.value} value={ea.value}>{ea.label}</option>)}</select></label>
            </fieldset>

            <fieldset style={S.fieldset}>
              <legend style={S.legend}>Preferred NPC Office(s) *</legend>
              <div className="checkbox-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 250px), 1fr))', gap: 4 }}>
                {offices.map(o => <label key={o.id} style={S.checkLabel}><input type="checkbox" checked={selectedOffices.includes(o.id)} onChange={() => toggleOffice(o.id)} />{o.name} ({o.city})</label>)}
              </div>
            </fieldset>

            {/* Document Summary */}
            <fieldset style={S.fieldset}>
              <legend style={S.legend}>Attached Documents Summary</legend>
              <div className="table-responsive" style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', fontSize: '0.85rem', borderCollapse: 'collapse' }}>
                  <thead><tr style={{ background: '#e8eaf6', textAlign: 'left' }}><th style={S.th}>Ref No.</th><th style={S.th}>Description</th><th style={S.th}>File</th></tr></thead>
                  <tbody>
                    {photoFile && <tr><td style={S.td}>PHOTO</td><td style={S.td}>Passport Photo</td><td style={S.td}>{photoFile.name}</td></tr>}
                    {idProofFile && <tr><td style={S.td}>ID-PROOF</td><td style={S.td}>ID Proof</td><td style={S.td}>{idProofName}</td></tr>}
                    {educations.map((e, i) => e.docFile && <tr key={`e${i}`}><td style={S.td}>EDU-{i+1}</td><td style={S.td}>{e.degree} — {e.institution}</td><td style={S.td}>{e.docName}</td></tr>)}
                    {experiences.map((e, i) => e.docFile && <tr key={`x${i}`}><td style={S.td}>EXP-{i+1}</td><td style={S.td}>{e.designation} — {e.organization}</td><td style={S.td}>{e.docName}</td></tr>)}
                    {certifications.map((c, i) => c.docFile && <tr key={`c${i}`}><td style={S.td}>CERT-{i+1}</td><td style={S.td}>{c.name} — {c.issuingBody}</td><td style={S.td}>{c.docName}</td></tr>)}
                    {!photoFile && !idProofFile && !educations.some(e => e.docFile) && !experiences.some(e => e.docFile) && !certifications.some(c => c.docFile) && (
                      <tr><td colSpan={3} style={{ ...S.td, color: '#999', fontStyle: 'italic' }}>No documents attached. You can go back to add them.</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            </fieldset>

            <div style={S.note}>By submitting, I confirm the information is accurate and consent to auto-screening per NPC Empanelment AI.</div>
          </>
        )}

        {/* Navigation */}
        <div style={S.navRow}>
          {step > 1 && <button type="button" onClick={goBack} style={S.backBtn}>Previous</button>}
          <div style={{ flex: 1 }} />
          {step < 5
            ? <button type="button" onClick={goNext} style={S.nextBtn}>Next</button>
            : <button type="submit" disabled={loading} style={S.submitBtn}>{loading ? 'Submitting...' : 'Submit Application'}</button>
          }
        </div>
      </form>
    </div>
  );
}

const S: Record<string, React.CSSProperties> = {
  container: { maxWidth: 960, margin: '0 auto', padding: 24 },
  subtitle: { color: '#666', marginBottom: 20, fontSize: '0.95rem' },
  prefillBanner: { background: '#e8f5e9', border: '1px solid #a5d6a7', padding: '10px 14px', borderRadius: 4, marginBottom: 16, fontSize: '0.9rem', color: '#2e7d32' },
  stepBar: { display: 'flex', gap: 4, marginBottom: 20, flexWrap: 'wrap' as const },
  stepItem: { padding: '8px 14px', borderRadius: 20, fontSize: '0.8rem', whiteSpace: 'nowrap' as const },
  fieldset: { border: '1px solid #ddd', borderRadius: 8, padding: '16px 20px', marginBottom: 20, background: '#fff' },
  legend: { fontWeight: 'bold', fontSize: '1rem', padding: '0 8px', color: '#1a237e' },
  row: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 },
  label: { display: 'block', marginBottom: 12, fontSize: '0.9rem', fontWeight: 500 },
  input: { display: 'block', width: '100%', padding: '8px 12px', marginTop: 4, border: '1px solid #ccc', borderRadius: 4, fontSize: '0.95rem', boxSizing: 'border-box' as const },
  checkRow: { display: 'flex', gap: 16, flexWrap: 'wrap' as const, marginTop: 8, alignItems: 'center' },
  checkLabel: { display: 'flex', alignItems: 'center', gap: 4, fontSize: '0.85rem' },
  entryBlock: { border: '1px solid #e0e0e0', borderRadius: 6, padding: 14, marginBottom: 12, background: '#fafafa' },
  addBtn: { background: '#e8eaf6', border: '1px solid #9fa8da', padding: '8px 18px', borderRadius: 4, cursor: 'pointer', fontSize: '0.85rem', fontWeight: 500 },
  removeBtn: { background: '#ffebee', border: '1px solid #ef9a9a', padding: '8px 16px', borderRadius: 4, cursor: 'pointer', fontSize: '0.8rem', color: '#c62828' },
  docRow: { marginTop: 10, padding: '8px 12px', background: '#e3f2fd', borderRadius: 4, border: '1px dashed #90caf9', display: 'flex', flexWrap: 'wrap' as const, alignItems: 'center', gap: 10 },
  docLabel: { fontSize: '0.85rem', fontWeight: 600, color: '#1565c0' },
  docTag: { background: '#1a237e', color: '#fff', padding: '2px 8px', borderRadius: 10, fontSize: '0.75rem', marginRight: 6 },
  fileTag: { fontSize: '0.8rem', color: '#2e7d32', fontStyle: 'italic' },
  navRow: { display: 'flex', gap: 12, marginTop: 8 },
  backBtn: { padding: '10px 24px', background: '#f5f5f5', border: '1px solid #ccc', borderRadius: 4, cursor: 'pointer', fontSize: '0.95rem' },
  nextBtn: { padding: '10px 32px', background: '#1a237e', color: '#fff', border: 'none', borderRadius: 4, cursor: 'pointer', fontSize: '0.95rem' },
  submitBtn: { padding: '12px 40px', background: '#1a237e', color: '#fff', border: 'none', borderRadius: 4, cursor: 'pointer', fontSize: '1rem', fontWeight: 'bold' },
  error: { background: '#ffebee', color: '#c62828', padding: '10px 14px', borderRadius: 4, marginBottom: 16, fontSize: '0.9rem' },
  note: { background: '#fff3e0', padding: 12, borderRadius: 4, border: '1px solid #ffe0b2', fontSize: '0.9rem', marginBottom: 12 },
  hint: { fontSize: '0.85rem', color: '#666', margin: '0 0 12px' },
  th: { padding: '8px 10px', borderBottom: '2px solid #c5cae9' },
  td: { padding: '6px 10px', borderBottom: '1px solid #eee' },
};
