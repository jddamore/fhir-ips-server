## Summary Creation Steps

### Data Pipeline

The steps for creating an IPS follow a set of data staging pipeline steps. These are summarized below from code available in the PatientSummary.java class: 

1.	Get all resources related to the patient specified
2.  Initialize `Bundle` and `Composition` 
3.	Assign resources by `ResourceType`, `category` or `code` to 14 IPS sections (see Filtering Logic for more information) 
3.	Evaluate if required resources are missing for required sections. If no resources found, create pseudo resource. 
  a. Allergies List
  b. Problem List
  c. Medication List 
4.	Filter out resources (see Filtering Logic for more information)
5.	Bundle pruning: removal of resources which have been filtered out in pipeline (See Narrative Generation) 
6.	Generate narrative for Composition.section

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

### Narrative Generation

Narrative is required at the `Composition.section.text` within the IPS (see http://build.fhir.org/ig/HL7/fhir-ips/design.html#narrative-and-language-translation). Since individual resources may be loaded into this server with or without `Resource.text`, the server recreates narrative using machine-readable content. 

This narrative creation should be considered preliminary and **DRAFT** and not suitable for production implementation. To edit this formatting, you should edit the following template: hapi-fhir-base/src/main/resources/ca/uhn/fhir/narrative/ips/IPS.html. Each section of the IPS has one or more tables with the following data elements:   

Advance Directive: 
- Scope: Consent.scope.text || Consent.scope.coding[x].display
- Status: Consent.status.code
- Action Controlled: Consent.provision.action[x].coding[x].display (concatenate items separated by comma, e.g. x, y, z) 
- Date: Consent.dateTime
 
Allergies: 
- Allergen: AllergyIntolerance.code.text || AllergyIntolerance.code.coding[x].display 
- Status: AllergyIntolerance.clinicalStatus.coding[x].display
- Category: AllergyIntolerance.code[x]
- Reaction: AllergyIntolerance.reaction.manifestation.text || AllergyIntolerance.reaction.manifestation.coding[x].display
- Severity: AllergyIntolerance.reaction.severity.code
- Comments: AllergyIntolerance.note[x].text (display all notes separated by \<br /> )
- Onset: AllergyIntolerance.onsetDateTime
 
Functional Status: 
- Assessment: ClinicalImpression.code.text ||  ClinicalImpression.code[x].display
- Status: ClinicalImpression.status.code
- Finding:  ClinicalImpression.summary
- Comments: ClinicalImpression.note[x].text (display all notes separated by \<br /> )
- Date: ClinicalImpression.effectiveDateTime
 
Immunizations: 
- Immunization: Immunization.vaccineCode.text || Immunization.vaccineCode.coding[x].display
- Status: Immunization.status.code
- Dose Number: Immunization.doseNumberPositiveInt || Immunization.doseNumberString              
- Manufacturer: Organization.name
- Lot Number: Immunization.lotNumber
- Comments: Immunization.note[x].text (display all notes separated by \<br /> )
- Date: Immunization.occurrenceDateTime
 
Medical Devices: 
- Device: Device.type.coding.text || Device.type.coding[x].display
- Status: DeviceUseStatement.status.code 
- Comments: DeviceUseStatement.note[x].text (display all notes separated by \<br /> )
- Date Recorded: DeviceUseStatement.recordedOn
 
Medications: 

Table 1 MedicationRequest
- Medication: MedicationRequest.medicationCodeableConcept.coding[x].display || Medication.code.coding.text || Medication.code.coding.code[x].display
- Status: MedicationRequest.status.display
- Route: MedicationRequest.dosageInstruction[x].route.coding[x].display
- Sig: MedicationRequest.dosageInstruction[x].text (display all sigs separated by \<br /> )
- Comments: MedicationRequest.note[x].text (display all notes separated by \<br /> )
- Authored Date: MedicationRequest.DateTime
 
Table 2 MedicationStatement
- Medication: MedicationStatement.medicationCodeableConcept.coding[x].display || Medication.code.coding.text || Medication.code.coding.code[x].display 
- Status: MedicationStatement.status.display
- Route: MedicationStatement.dosage[x].route.coding[x].display
- Sig: MedicationStatement.dosage [x].text (display all sigs separated by \<br /> )
- Date:  MedicationStatement.effectiveDateTime
 
Plan of Care
- Activity: CarePlan.description
- Intent: CarePlan.intent.code
- Comments CarePlan.dosage [x].text
- Planned Start: CarePlan.period.start 
- Planned End: CarePlan.period.end
 
Pregnancy: 
- Code: Observation.code.text || Observation.code.coding[x].display
- Result: Observation.valueQuantity.value || Observation.valueDateTime || Observation.valueCodeableConcept.coding[x].display || Observation.valueString
- Comments: Observation.note[x].text (display all notes separated by \<br /> )
- Date: Observation.effectiveDateTime
 
Past History of Past Illness & Problem List: 
- Medical Problem: Condition.code.text || Condition.code.coding[x].display
- Status: Condition.clinicalStatus.coding[x].display
- Comments: Condition.note[x].text (display all notes separated by \<br /> )
- Onset Date: Condition.onsetDateTime
 
Procedures: 
- Procedure: Procedure.code.text || Procedure.code.coding[x].display
- Comments: Procedure.note[x].text(display all notes separated by \<br /> )
- Date: Procedure.performedDateTime
 
Results: 
TABLE 1: Observation 
- Code: Observation.code.text || Observation.code.coding[x].display
- Result: Observation.valueQuantity.value || Observation.valueCodeableConcept.coding[x].display || Observation.valueString
- Unit: Observation.valueQuantity.unit
- Interpretation: Observation.interpretation.text || Observation. interpretation.coding[x].display
- Reference Range: Observation.referenceRange.low.value && “-“ && Observation.referenceRange.high.value
- Comments: Observation.note[x].text (display all notes separated by \<br /> )
- Date: Observation.effectiveDateTime
 
TABLE 2: DiagnosticReport
- Code: DiagnosticReport.code.text || DiagnosticReport.code.coding[x].display
- Date: DiagnosticReport.effectiveDateTime
 
Social History:
- Code: Observation.code.text || Observation.code.coding[x].display
- Result: Observation.valueQuantity.value || Observation.valueCodeableConcept.coding[x].display || Observation.valueString
- Unit: Observation.valueQuantity.unit
- Comments: Observation.note[x].text (display all notes separated by \<br /> )
- Date: Observation.effectiveDateTime
 
Vital Signs:  
- Code: Observation.code.text || Observation.code.coding[x].display
- Result: Observation.valueQuantity.value || Observation.valueCodeableConcept.coding[x].display || Observation.valueString
- Unit: Observation.valueQuantity.unit
- Interpretation: Observation.interpretation.text || Observation. interpretation.coding[x].display
- Comments: Observation.note[x].text (display all notes separated by \<br /> ) 
- Date: Observation.effectiveDateTime
 

