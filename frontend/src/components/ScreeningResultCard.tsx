/**
 * Displays auto-screening results for empanelment or contractual applications.
 */

import React from 'react';
import type { ScreeningResult, ContractualScreeningResult } from '../types';

interface Props {
  type: 'empanelment' | 'contractual';
  empanelmentResult?: ScreeningResult;
  contractualResult?: ContractualScreeningResult;
}

const CATEGORY_LABELS: Record<string, string> = {
  ADVISOR: 'Advisor',
  SENIOR_CONSULTANT: 'Senior Consultant',
  CONSULTANT: 'Consultant',
  PROJECT_ASSOCIATE: 'Project Associate',
  YOUNG_PROFESSIONAL: 'Young Professional',
};

export default function ScreeningResultCard({ type, empanelmentResult, contractualResult }: Props) {
  const eligible = type === 'empanelment' ? empanelmentResult?.eligible : contractualResult?.eligible;
  const reasons = type === 'empanelment' ? empanelmentResult?.reasons : contractualResult?.reasons;

  return (
    <div style={{
      border: `2px solid ${eligible ? '#2e7d32' : '#c62828'}`,
      borderRadius: '8px',
      padding: '16px',
      margin: '16px 0',
      background: eligible ? '#e8f5e9' : '#ffebee',
    }}>
      <h3 style={{ margin: '0 0 8px', color: eligible ? '#2e7d32' : '#c62828' }}>
        Auto-Screening Result: {eligible ? 'ELIGIBLE' : 'NOT ELIGIBLE'}
      </h3>

      {type === 'empanelment' && empanelmentResult && (
        <>
          {empanelmentResult.provisionalCategory && (
            <p style={{ fontWeight: 'bold', fontSize: '1.1rem', margin: '4px 0' }}>
              Provisional Category: {CATEGORY_LABELS[empanelmentResult.provisionalCategory] || empanelmentResult.provisionalCategory}
            </p>
          )}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', margin: '12px 0' }}>
            <div>Total Experience: <strong>{empanelmentResult.computedValues.totalExperienceYears.toFixed(1)} years</strong></div>
            <div>Group-A Service: <strong>{empanelmentResult.computedValues.groupAServiceYears.toFixed(1)} years</strong></div>
            <div>Level-12+ Service: <strong>{empanelmentResult.computedValues.level12PlusYears.toFixed(1)} years</strong></div>
            <div>Age: <strong>{empanelmentResult.computedValues.age} years</strong></div>
            <div>Doctorate: <strong>{empanelmentResult.computedValues.hasDoctorate ? 'Yes' : 'No'}</strong></div>
            <div>Post-Graduation: <strong>{empanelmentResult.computedValues.hasPostGrad ? 'Yes' : 'No'}</strong></div>
          </div>
          {empanelmentResult.qualifiedCategories.length > 1 && (
            <p style={{ fontSize: '0.85rem', color: '#555' }}>
              Also qualifies for: {empanelmentResult.qualifiedCategories.slice(1).map(c => CATEGORY_LABELS[c]).join(', ')}
            </p>
          )}
        </>
      )}

      {type === 'contractual' && contractualResult && (
        <>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '8px', margin: '12px 0' }}>
            <div>Qualification: <strong style={{ color: contractualResult.meetsQualification ? '#2e7d32' : '#c62828' }}>
              {contractualResult.meetsQualification ? 'Met' : 'Not Met'}
            </strong></div>
            <div>Experience: <strong style={{ color: contractualResult.meetsExperience ? '#2e7d32' : '#c62828' }}>
              {contractualResult.meetsExperience ? 'Met' : 'Not Met'}
            </strong></div>
            <div>Age: <strong style={{ color: contractualResult.meetsAge ? '#2e7d32' : '#c62828' }}>
              {contractualResult.meetsAge ? 'Met' : 'Not Met'}
            </strong></div>
          </div>
          {contractualResult.suggestedRemunerationBand && (
            <p style={{ fontWeight: 'bold' }}>
              Suggested Remuneration: Rs {contractualResult.suggestedRemunerationBand.min.toLocaleString('en-IN')}
              {contractualResult.suggestedRemunerationBand.min !== contractualResult.suggestedRemunerationBand.max &&
                ` - Rs ${contractualResult.suggestedRemunerationBand.max.toLocaleString('en-IN')}`
              } / month
            </p>
          )}
        </>
      )}

      <details style={{ marginTop: '8px' }}>
        <summary style={{ cursor: 'pointer', fontSize: '0.9rem' }}>Detailed Reasons</summary>
        <ul style={{ margin: '8px 0', paddingLeft: '20px', fontSize: '0.85rem' }}>
          {reasons?.map((r, i) => <li key={i}>{r}</li>)}
        </ul>
      </details>
    </div>
  );
}
