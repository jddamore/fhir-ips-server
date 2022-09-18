## Summary of Code Changes

Three primary areas were changed in the HAPI server for the execution of the summary operation. All files were specific to a FHIR R4 implementation

1. edited file: https://github.com/CrossroadsLabs/hapi-fhir/blob/rb_jd_ips/hapi-fhir-jpaserver-base/src/main/java/ca/uhn/fhir/jpa/provider/r4/BaseJpaResourceProviderPatientR4.java
2. new file: https://github.com/CrossroadsLabs/hapi-fhir/blob/rb_jd_ips/hapi-fhir-jpaserver-base/src/main/java/ca/uhn/fhir/jpa/provider/r4/patient/PatientSummary.java
3. new file: https://github.com/CrossroadsLabs/hapi-fhir/blob/rb_jd_ips/hapi-fhir-base/src/main/resources/ca/uhn/fhir/narrative/ips/IPS.html

The second file above is the primary logic for the summary creation. Multiple classes were added for the following purposes: 

- Map.ofEntries: fixed information in Composition.section 
- PregnancyCodes: fixed list of pregnancy LOINC codes
- buildFromSearch / createIPSBundle / createResourceList : Assembles resource related to patient
- createIPSComposition / Composition.SectionComponent: Creates - - Composition resource and the related section components
- createIPSResourceHashMap: Assigns resources to section based on resource.resoureType or resource.category or resource.code
- isObservationinSection: Logic for breaking observations out into multiple domains based on category
- noInfoAllergies / noInfoMedications / noInfoProblems: Dealing with IPS conformance expectations on no information
- filterPrimaries / passesFilter: Use exclusion logic to identify resources not related to Patient Summary
- pruneResources: Remove resources from Bundle not related to $summary operation 
- createSectionNarrative: Create narrative using thyme leaf package already in HAPI server
