## Examples 

As part of the IPS Reference Server, we created a script (JavaScript) to load individual resources and/or Bundles. To maintain referential integrity, the script performs a bottom up load of resources and re-assigns new references based on API responses. 

### Patients Available

1. EU Connectathon Sample
2. IPS IG Full Example
3. IPS IG No Info Example
4. IPS IG (adapted) No Known Example
5. Netherland Connectathon Sample
6. New Zealand Connectathon Sample
7. Taiwan Connectathon Sample
8. United Kingdom Connectathon Sample
9. US Synthetic Sample (Synthea 1)
10. US Synthetic Sample (Synthea 2)
11. US Synthetic Sample (Synthea 3)
12. US Synthetic Sample (Synthea 4)

### Script Requirements

The script for patient loading requires NodeJS (v14 or higher) to be installed and for nested folders within the target directory. Each folder should only contain 1 patient, although it may include a single Bundle or multiple files with various resources. The data must be JSON. Data are loaded using API POST for the respective resources. 

To execute the script, navigate to local directory and run

`node loading_script.js` 

Source code available [here](https://github.com/jddamore/fhir-ips-server/blob/main/scripts/loading_script/loading_script.js)