/**
 * Contractual application form — apply against a specific advert.
 *
 * Features:
 * - Pre-fills from existing profile (returning applicant skips re-entry)
 * - Advert details summary at top
 * - Documents inline with each education & experience entry (auto-numbered EDU-1, EXP-1)
 * - Professional certifications with inline docs (CERT-1, CERT-2)
 * - Photo, ID proof in personal details step
 *
 * Auto-screening runs on submit per AI-858 Annex-II-A/B.
 */

import React, { useState, useEffect, useRef, type FormEvent } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAuth } from '../services/AuthContext';
import { getAdvertById, getProfile, getDomains, getOffices, submitContractualFull, uploadDocument } from '../services/api';
import ScreeningResultCard from '../components/ScreeningResultCard';
import type { Advert, ContractualScreeningResult, Certification, Domain, NpcOffice, EmpanelmentArea } from '../types';

const EMPANELMENT_AREAS: { value: EmpanelmentArea; label: string }[] = [
  { value: 'CONSULTANCY' as EmpanelmentArea, label: 'Consultancy / Action Research Services' },
  { value: 'TRAINING' as EmpanelmentArea, label: 'Training & Capacity Building Services' },
  { value: 'BOTH' as EmpanelmentArea, label: 'Both Consultancy & Training' },
];

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

function mkEdu(): EduEntry {
  return { degree: '', field: '', institution: '', university: '', yearOfPassing: 2020, grade: '', isPremierInstitute: false, isDoctorate: false, isPostGraduation: false, docFile: null, docName: '' };
}
function mkExp(): ExpEntry {
  return { organization: '', designation: '', startDate: '', endDate: '', isCurrent: false, isGroupAService: false, isLevel12OrAbove: false, dutiesDescription: '', payBandOrRemuneration: '', payLevel: '', docFile: null, docName: '' };
}
function mkCert(): CertEntry {
  return { name: '', issuingBody: '', yearObtained: undefined, certificateNumber: '', docFile: null, docName: '' };
}

export default function ContractualApplicationPage() {
  const { advertId } = useParams<{ advertId: string }>();
  const { user } = useAuth();
  const [advert, setAdvert] = useState<Advert | null>(null);
  const [loadingAdvert, setLoadingAdvert] = useState(true);
  const [loading, setLoading] = useState(false);
  const [profileLoading, setProfileLoading] = useState(true);
  const [profileLoaded, setProfileLoaded] = useState(false);
  const [error, setError] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [screeningResult, setScreeningResult] = useState<ContractualScreeningResult | null>(null);
  const [step, setStep] = useState(0); // 0 = advert view, 1..4 = form steps
  const photoInputRef = useRef<HTMLInputElement>(null);

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

  // Empanelment opt-in
  const [empanelOptIn, setEmpanelOptIn] = useState(false);
  const [domains, setDomains] = useState<Domain[]>([]);
  const [allOffices, setAllOffices] = useState<NpcOffice[]>([]);
  const [empDomainId, setEmpDomainId] = useState('');
  const [empSubDomainId, setEmpSubDomainId] = useState('');
  const [empArea, setEmpArea] = useState('BOTH');
  const [empOfficeIds, setEmpOfficeIds] = useState<string[]>([]);

  // Confirmation
  const [confirmed, setConfirmed] = useState(false);

  // Load advert
  useEffect(() => {
    if (advertId) {
      getAdvertById(advertId)
        .then(a => { setAdvert(a); setLoadingAdvert(false); })
        .catch(() => setLoadingAdvert(false));
    }
  }, [advertId]);

  // Load domains and offices for empanelment opt-in
  useEffect(() => {
    getDomains().then(setDomains).catch(console.error);
    getOffices().then(setAllOffices).catch(console.error);
  }, []);

  // Pre-fill from existing profile
  useEffect(() => {
    if (!user) { setProfileLoading(false); return; }
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
  }, [user]);

  // helpers
  function updateEdu(idx: number, f: string, v: any) { const u = [...educations]; (u[idx] as any)[f] = v; setEducations(u); }
  function updateExp(idx: number, f: string, v: any) { const u = [...experiences]; (u[idx] as any)[f] = v; setExperiences(u); }
  function updateCert(idx: number, f: string, v: any) { const u = [...certifications]; (u[idx] as any)[f] = v; setCertifications(u); }

  function handlePhotoChange(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0]; if (!f) return;
    setPhotoFile(f); const r = new FileReader(); r.onload = () => setPhotoPreview(r.result as string); r.readAsDataURL(f);
  }

  function validateStep(s: number): string | null {
    if (s === 1) { if (!fullName.trim()) return 'Full Name is required.'; if (!dob) return 'Date of Birth is required.'; }
    if (s === 2) { for (let i = 0; i < educations.length; i++) { const e = educations[i]; if (!e.degree.trim() || !e.field.trim() || !e.institution.trim()) return `EDU-${i+1}: Degree, Field, and Institution are required.`; } }
    if (s === 3) { for (let i = 0; i < experiences.length; i++) { const e = experiences[i]; if (!e.organization.trim() || !e.designation.trim() || !e.startDate) return `EXP-${i+1}: Organization, Designation, and Start Date are required.`; } }
    if (s === 4) { if (!confirmed) return 'Please confirm the declaration before submitting.'; }
    return null;
  }

  function goNext() { const e = validateStep(step); if (e) { setError(e); return; } setError(''); setStep(step + 1); }
  function goBack() { setError(''); setStep(step - 1); }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const err = validateStep(step);
    if (err) { setError(err); return; }
    setError(''); setLoading(true);

    try {
      const profileData = {
        fullName, dateOfBirth: dob, gender, fatherOrMotherOrSpouseName: fatherSpouseName,
        backgroundType, correspondenceAddress, permanentAddress,
        contactNumbers: [mobile, altPhone].filter(Boolean),
        educations: educations.map(e => ({
          degree: e.degree, field: e.field, institution: e.institution, university: e.university,
          yearOfPassing: e.yearOfPassing, grade: e.grade,
          isPremierInstitute: e.isPremierInstitute, isDoctorate: e.isDoctorate, isPostGraduation: e.isPostGraduation,
        })),
        experiences: experiences.map(e => ({
          organization: e.organization, designation: e.designation,
          startDate: e.startDate, endDate: e.isCurrent ? undefined : e.endDate,
          isCurrent: e.isCurrent, isGroupAService: e.isGroupAService,
          payLevel: e.payLevel, isLevel12OrAbove: e.isLevel12OrAbove,
          payBandOrRemuneration: e.payBandOrRemuneration, dutiesDescription: e.dutiesDescription,
        })),
        certifications: certifications.filter(c => c.name.trim()).map(c => ({
          name: c.name, issuingBody: c.issuingBody, yearObtained: c.yearObtained, certificateNumber: c.certificateNumber,
        })),
      };

      const empanelmentOptIn = empanelOptIn && empDomainId && empOfficeIds.length
        ? { domainId: empDomainId, subDomainId: empSubDomainId || undefined, empanelmentArea: empArea, officePreferenceIds: empOfficeIds }
        : undefined;

      const result = await submitContractualFull({ profile: profileData, advertId, empanelmentOptIn });

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

      if (result.success) {
        setSubmitted(true);
        setScreeningResult(result.data.screeningResult);
      } else {
        setError(result.error || 'Submission failed.');
      }
    } catch (err: any) {
      setError(err.response?.data?.error || err.message || 'Submission failed.');
    } finally {
      setLoading(false);
    }
  }

  // ── Loading / Error states ──
  if (loadingAdvert) return <div style={S.container}><p>Loading advertisement details...</p></div>;
  if (!advert) return <div style={S.container}><div style={S.error}>Advertisement not found. <Link to="/adverts">Browse all advertisements</Link></div></div>;

  if (!user) {
    return (
      <div style={S.container}>
        <h2>Apply for Contractual Position</h2>
        <div style={S.error}>Please <a href="/login">login</a> or <a href="/register">register</a> to apply.</div>
      </div>
    );
  }

  if (profileLoading) return <div style={S.container}><p>Loading your profile...</p></div>;

  if (submitted && screeningResult) {
    return (
      <div style={S.container}>
        <h2 style={{ color: '#1a237e' }}>Application Submitted</h2>
        <p>Applied for: <strong>{advert.title}</strong></p>
        <ScreeningResultCard type="contractual" contractualResult={screeningResult} />
        <p style={{ marginTop: 16, color: '#555' }}>
          {screeningResult.eligible
            ? 'Your application will be reviewed by the Screening Committee.'
            : 'You may not meet the eligibility criteria. The committee will make the final determination.'}
        </p>
        {empanelOptIn && (
          <div style={{ background: '#e8f5e9', border: '1px solid #a5d6a7', padding: '12px 16px', borderRadius: 6, marginTop: 16, fontSize: '0.9rem', color: '#2e7d32' }}>
            Your empanelment application has also been submitted using the same profile. It will be reviewed separately by the Screening and Empanelment Committees.
          </div>
        )}
      </div>
    );
  }

  const daysLeft = advert.lastDateToApply ? Math.max(0, Math.ceil((new Date(advert.lastDateToApply).getTime() - Date.now()) / 86400000)) : null;
  const STEP_LABELS = ['Advertisement', 'Personal Details', 'Education & Docs', 'Experience & Certs', 'Review & Submit'];

  return (
    <div className="page-container" style={S.container}>
      <h2 style={{ color: '#1a237e', marginBottom: 4 }}>Apply for Contractual Position</h2>

      {profileLoaded && (
        <div style={S.prefillBanner}>
          Your previous profile data has been pre-filled. Review and update if needed, or proceed directly.
        </div>
      )}

      {/* Step indicator */}
      <div style={S.stepBar}>
        {STEP_LABELS.map((label, idx) => (
          <div key={idx} style={{
            ...S.stepItem,
            background: step === idx ? '#1a237e' : step > idx ? '#4caf50' : '#e0e0e0',
            color: step >= idx ? '#fff' : '#666',
          }}>
            <span style={{ fontWeight: 'bold', marginRight: 6 }}>{idx + 1}</span>
            {label}
          </div>
        ))}
      </div>

      {error && <div style={S.error}>{error}</div>}

      <form onSubmit={handleSubmit}>
        {/* ═══ Step 0: Advert Details ═══ */}
        {step === 0 && (
          <div>
            <div style={S.advertBox}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
                <h3 style={{ margin: 0, color: '#1a237e' }}>{advert.title}</h3>
                {daysLeft !== null && (
                  <span style={{ background: daysLeft <= 5 ? '#c62828' : '#ff9800', color: '#fff', padding: '4px 10px', borderRadius: 12, fontSize: '0.8rem', whiteSpace: 'nowrap' as const }}>
                    {daysLeft > 0 ? `${daysLeft} days left` : 'Deadline passed'}
                  </span>
                )}
              </div>
              <p style={{ fontSize: '0.85rem', color: '#888', marginBottom: 12 }}>Advert No: {advert.advertNumber}</p>

              <div className="form-row" style={S.detailGrid}>
                <div><strong>Designation:</strong> {advert.designation?.replace(/_/g, ' ')}</div>
                <div><strong>Engagement:</strong> {advert.engagementType?.replace(/_/g, ' ')}</div>
                <div><strong>No. of Posts:</strong> {advert.numberOfPosts}</div>
                <div><strong>Location:</strong> {advert.placeOfDeployment || 'As specified'}</div>
                {advert.minExperienceYears != null && <div><strong>Min Experience:</strong> {advert.minExperienceYears} years</div>}
                {advert.maxAge && <div><strong>Max Age:</strong> {advert.maxAge} years</div>}
                {advert.minQualification && <div><strong>Qualification:</strong> {advert.minQualification}</div>}
                {advert.contractPeriodMonths && <div><strong>Duration:</strong> {advert.contractPeriodMonths} months</div>}
              </div>

              {(advert.remunerationMin || advert.remunerationMax) && (
                <div style={{ background: '#e8f5e9', padding: '10px 14px', borderRadius: 4, marginTop: 12 }}>
                  <strong>Remuneration:</strong>{' '}
                  {advert.remunerationMin && advert.remunerationMax
                    ? `Rs ${advert.remunerationMin.toLocaleString('en-IN')} - ${advert.remunerationMax.toLocaleString('en-IN')}/month`
                    : advert.remunerationMax ? `Up to Rs ${advert.remunerationMax.toLocaleString('en-IN')}/month` : ''}
                  {advert.remunerationNote && <span style={{ fontSize: '0.85rem', color: '#555' }}> ({advert.remunerationNote})</span>}
                </div>
              )}

              {advert.eligibilityCriteria && (
                <div style={{ marginTop: 12 }}>
                  <strong>Eligibility Criteria:</strong>
                  <div style={{ fontSize: '0.9rem', marginTop: 4, whiteSpace: 'pre-line' as const }}>{advert.eligibilityCriteria}</div>
                </div>
              )}

              {advert.description && (
                <p style={{ marginTop: 12, fontSize: '0.9rem', color: '#333' }}>{advert.description}</p>
              )}
            </div>

            <div style={S.note}>
              Please fill in all details in the following steps. Your profile will be auto-screened against
              the eligibility criteria of this advertisement as per AI-858/2026.
            </div>
          </div>
        )}

        {/* ═══ Step 1: Personal Details ═══ */}
        {step === 1 && (
          <fieldset style={S.fieldset}>
            <legend style={S.legend}>Personal Details</legend>
            <div className="form-row" style={S.row}>
              <label style={S.label}>Full Name *<input type="text" value={fullName} onChange={e => setFullName(e.target.value)} required style={S.input} /></label>
              <label style={S.label}>Date of Birth *<input type="date" value={dob} onChange={e => setDob(e.target.value)} required style={S.input} /></label>
            </div>
            <div className="form-row" style={S.row}>
              <label style={S.label}>Gender
                <select value={gender} onChange={e => setGender(e.target.value)} style={S.input}>
                  <option value="">-- Select --</option>
                  {GENDER_OPTIONS.map(g => <option key={g} value={g}>{g}</option>)}
                </select>
              </label>
              <label style={S.label}>Father / Mother / Spouse Name<input type="text" value={fatherSpouseName} onChange={e => setFatherSpouseName(e.target.value)} style={S.input} /></label>
            </div>
            <label style={S.label}>Background Type *
              <select value={backgroundType} onChange={e => setBackgroundType(e.target.value)} style={S.input}>
                {BG_TYPE_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
              </select>
            </label>
            <div className="form-row" style={S.row}>
              <label style={S.label}>Mobile Number *<input type="tel" value={mobile} onChange={e => setMobile(e.target.value)} required style={S.input} placeholder="9876543210" /></label>
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
                  <input type="file" accept=".pdf,.jpg,.jpeg,.png" onChange={e => { const f = e.target.files?.[0]; if (f) { setIdProofFile(f); setIdProofName(f.name); } }} style={{ fontSize: '0.8rem' }} />
                  {idProofName && <span style={S.fileTag}>ID-PROOF: {idProofName}</span>}
                </div>
              </div>
            </div>
          </fieldset>
        )}

        {/* ═══ Step 2: Education with inline docs ═══ */}
        {step === 2 && (
          <fieldset style={S.fieldset}>
            <legend style={S.legend}>Educational Qualifications</legend>
            <p style={S.hint}>Add all qualifications. Attach the degree/certificate for each entry. Marks/CGPA helps in auto-screening.</p>
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

        {/* ═══ Step 3: Experience & Certifications with inline docs ═══ */}
        {step === 3 && (
          <>
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
                    <label style={S.label}>Job Profile / Duties
                      <textarea value={exp.dutiesDescription} onChange={e => updateExp(idx, 'dutiesDescription', e.target.value)} style={{ ...S.input, height: 70, resize: 'vertical' as const }} placeholder="Key responsibilities, projects, achievements..." />
                    </label>
                    <div style={S.checkRow}>
                      <label style={S.checkLabel}><input type="checkbox" checked={exp.isCurrent} onChange={e => updateExp(idx, 'isCurrent', e.target.checked)} /> Currently working</label>
                      <label style={S.checkLabel}><input type="checkbox" checked={exp.isGroupAService} onChange={e => updateExp(idx, 'isGroupAService', e.target.checked)} /> Group-A Service</label>
                      <label style={S.checkLabel}><input type="checkbox" checked={exp.isLevel12OrAbove} onChange={e => updateExp(idx, 'isLevel12OrAbove', e.target.checked)} /> Pay Level 12+</label>
                    </div>
                    {/* Inline document upload */}
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
          </>
        )}

        {/* ═══ Step 4: Review & Submit ═══ */}
        {step === 4 && (
          <>
            {/* Application Summary */}
            <fieldset style={S.fieldset}>
              <legend style={S.legend}>Application Summary</legend>
              <div className="form-row" style={S.detailGrid}>
                <div><strong>Applying for:</strong> {advert.title}</div>
                <div><strong>Advert No:</strong> {advert.advertNumber}</div>
                <div><strong>Applicant:</strong> {fullName}</div>
                <div><strong>DOB:</strong> {dob}</div>
                <div><strong>Gender:</strong> {gender || 'Not specified'}</div>
                <div><strong>Background:</strong> {BG_TYPE_OPTIONS.find(o => o.value === backgroundType)?.label}</div>
                <div><strong>Qualifications:</strong> {educations.map(e => e.degree).filter(Boolean).join(', ') || 'None'}</div>
                <div><strong>Experience entries:</strong> {experiences.length}</div>
                <div><strong>Certifications:</strong> {certifications.length}</div>
              </div>
            </fieldset>

            {/* Document Summary Table */}
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

            {/* Empanelment Opt-In */}
            <fieldset style={{ ...S.fieldset, border: '2px solid #c5cae9', background: '#f3f4fb' }}>
              <legend style={S.legend}>Also Apply for Empanelment?</legend>
              <label style={{ fontSize: '0.9rem', display: 'flex', alignItems: 'flex-start', gap: 8, marginBottom: 12 }}>
                <input type="checkbox" checked={empanelOptIn} onChange={e => setEmpanelOptIn(e.target.checked)} style={{ marginTop: 3 }} />
                <span>
                  <strong>Yes, I would also like to be empaneled with NPC.</strong> Your same profile will be registered
                  for empanelment too, allowing NPC to engage you on short notice for future assignments without a
                  fresh application. Empanelment is valid for 3 years.
                </span>
              </label>

              {empanelOptIn && (
                <div style={{ padding: '12px 0 0', borderTop: '1px solid #ddd' }}>
                  <div className="form-row" style={S.row}>
                    <label style={S.label}>Domain *
                      <select value={empDomainId} onChange={e => { setEmpDomainId(e.target.value); setEmpSubDomainId(''); }} style={S.input}>
                        <option value="">-- Select Domain --</option>
                        {domains.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
                      </select>
                    </label>
                    <label style={S.label}>Sub-Domain
                      <select value={empSubDomainId} onChange={e => setEmpSubDomainId(e.target.value)} style={S.input} disabled={!empDomainId}>
                        <option value="">-- Select --</option>
                        {domains.find(d => d.id === empDomainId)?.subDomains.map(sd => <option key={sd.id} value={sd.id}>{sd.name}</option>)}
                      </select>
                    </label>
                  </div>
                  <label style={S.label}>Empanelment Area *
                    <select value={empArea} onChange={e => setEmpArea(e.target.value)} style={S.input}>
                      {EMPANELMENT_AREAS.map(ea => <option key={ea.value} value={ea.value}>{ea.label}</option>)}
                    </select>
                  </label>
                  <div style={{ marginTop: 8 }}>
                    <strong style={{ fontSize: '0.9rem' }}>Preferred NPC Office(s) *</strong>
                    <div className="checkbox-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 250px), 1fr))', gap: 4, marginTop: 6 }}>
                      {allOffices.map(o => (
                        <label key={o.id} style={S.checkLabel}>
                          <input type="checkbox" checked={empOfficeIds.includes(o.id)} onChange={() => setEmpOfficeIds(prev => prev.includes(o.id) ? prev.filter(x => x !== o.id) : [...prev, o.id])} />
                          {o.name} ({o.city})
                        </label>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </fieldset>

            <div style={{ marginBottom: 16 }}>
              <label style={{ fontSize: '0.9rem', display: 'flex', alignItems: 'flex-start', gap: 8 }}>
                <input type="checkbox" checked={confirmed} onChange={e => setConfirmed(e.target.checked)} style={{ marginTop: 3 }} />
                <span>I confirm that the information provided is accurate and complete. I have read the terms & conditions
                  of contractual engagement as per AI-858/2026. I understand that my profile will be auto-screened against
                  the eligibility criteria of this advertisement.
                  {empanelOptIn && ' I also consent to empanelment with NPC using the same profile.'}</span>
              </label>
            </div>
          </>
        )}

        {/* Navigation */}
        <div style={S.navRow}>
          {step > 0 && <button type="button" onClick={goBack} style={S.backBtn}>Previous</button>}
          <div style={{ flex: 1 }} />
          {step < 4 ? (
            <button type="button" onClick={goNext} style={S.nextBtn}>
              {step === 0 ? 'Start Application' : 'Next'}
            </button>
          ) : (
            <button type="submit" disabled={loading || !confirmed} style={{ ...S.submitBtn, opacity: confirmed ? 1 : 0.5 }}>
              {loading ? 'Submitting...' : 'Submit Application'}
            </button>
          )}
        </div>
      </form>
    </div>
  );
}

const S: Record<string, React.CSSProperties> = {
  container: { maxWidth: 960, margin: '0 auto', padding: 24 },
  prefillBanner: { background: '#e8f5e9', border: '1px solid #a5d6a7', padding: '10px 14px', borderRadius: 4, marginBottom: 16, fontSize: '0.9rem', color: '#2e7d32' },
  stepBar: { display: 'flex', gap: 4, marginBottom: 20, flexWrap: 'wrap' as const },
  stepItem: { padding: '8px 14px', borderRadius: 20, fontSize: '0.8rem', whiteSpace: 'nowrap' as const },
  advertBox: { background: '#fff', border: '1px solid #ddd', borderRadius: 8, padding: 20, marginBottom: 16 },
  detailGrid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, fontSize: '0.9rem', lineHeight: '1.6' },
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
