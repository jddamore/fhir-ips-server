## Summary Creation Steps

### Summary Filtering

To create a summary, a set of rules are applied to filter all Patient data down to the relevant content by section for a summary. These rules should be considered preliminary and subject to future revision. 

**Filtering Logic (Preliminary)**
- Allergies (AllergyIntolerance)
  - Don’t want clinicalStatus inactive|resolved 
  - Don’t want verificationStatus entered-in-error
- Problems (Condition)
  - Don’t want clinicalStatus inactive|resolved 
  - Don’t want verificationStatus entered-in-error
- Medications (MedicationStatement and MedicationRequest)
  - MedicationStatement
    - Only status is active|intended|unknown|on-hold
    - For future consideration. Maybe some statuses are filtered out if the period.high is far enough in the past or if status isn’t active… 
  - MedicationRequest
    - Only status is active|unknown|on-hold
-	Results (DiagnosticReport and Observation where category='laboratory'
    - Observation 
      - Exclude all status is preliminary
      - Most recent of each observation.code 
    - DiagnosticReport 
      - No filtering applied
- Vital Signs (Observation where category='vital-signs') 
  - Most recent of each observation.code under category ‘vital-signs’
  - *For consideration, most recent of each* 
    - *Weight*
    - *Height*
    - *BMI*
    - *Head circumference if age <5*
- Social History (Observation where category='social-history')
  - Exclude all status is preliminary
- Pregnancy History (Observation where code is in IPS list)
  - Exclude all status is preliminary
- Immunizations (Immunization)
  - Exclude entered-in-error
- Advance Directive (Consent)
  - Only active|unknown status
- Functional Status (ClinicalImpression)
  - Status in-progress | completed
- Medical Devices (DeviceUseStatement)
  - Exclude entered-in-error
- Past History of Illness (Condition)
  - Use dates (Older than five years based on either dateTime or period.high) & clinicalStatus of inactive|remission|resolved 
  - Exclude entered-in-error
- Plan of Care 
  - Include status of active|on-hold|unknown 
- Procedures 
  - Exclude entered-in-error|not-done
  - *For consideration. Some procedures may merit filtering based on dates*
