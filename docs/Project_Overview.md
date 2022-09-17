## Project Overview

### Sponsoring Organizations

This reference implementation server was sponsored by HL7 (Health Level Seven) as part of a grant from the ONC (US Office of the National Coordinator for Health IT). Its initial server code was created in August-September 2022 and dplyed initially utilized at the HL7 FHIR Connectathon (September 17-18, 2022).

All the code has been made publicly available under APACHE 2.0 license as an adaptation of the open-source HAPI server. The server code is delivered "as-is" with no warranty and expected for future development. 

### Project Goals

The initial server was designed with several goals in mind: 

1.	Support for FHIR R4 (version 4.0.1)
2.	Open development (e.g. open source code publicly hosted on Github)
3.	Support for FHIR resources profiled in the IPS FHIR Implementation Guide
4.	Support for the `$summary` operations that generate IPS documents
5. A set of 10+ well-populated synthetic patients and at least one example patient with no information
6. The ability to load new data into the server (e.g. POST operations) and generate new summaries
7. Valid IPS bundles for pre-loaded data
8. Demonstration filtering logic from all resources to relevant summary
9. Demonstration  narrative generations for `Composition.section.text`

## Project Documentation

- [Installing HAPI IPS Reference Implementation Server](https://github.com/jddamore/fhir-ips-server/blob/main/docs/Installing_HAPI_IPS_Server.md)
- [Examples Documentation](https://github.com/jddamore/fhir-ips-server/blob/main/docs/Examples_Documentation.md)
- [Summary Creation Logic](https://github.com/jddamore/fhir-ips-server/blob/main/docs/Summary_Creation_Steps.md)
- [Installing Development Environments](https://github.com/jddamore/fhir-ips-server/blob/main/docs/Installing_Dev_Environments.md)
- [Code Changes for HAPI IPS Server](https://github.com/jddamore/fhir-ips-server/blob/main/docs/Code_Changes_HAPI_IPS.md) 

## For More Information

- [FHIR IPS Implementation Guide (current build)](http://build.fhir.org/ig/HL7/fhir-ips)
- [General Introduction to IPS](https://international-patient-summary.net/)
- [HAPI Documentation](https://hapifhir.io/hapi-fhir/docs/) 