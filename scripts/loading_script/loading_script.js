import fs from 'fs'
import pretty from 'pretty-data'
const pd = pretty.pd;
import chalk from 'chalk'
import request from 'request';

let target_url = 'https://ips.health/fhir';
let target_directory = './target';

let files = fs.readdirSync('./target');
console.log('directories found to load');
console.log(pd.json(files));

let globalIndex = 0;

const loadNextDirectory = function () {
  if (files.length <= globalIndex) {
    console.log(pd.json(Patients));
    console.log('done');
  } 
  else {
    fs.stat(`./target/${files[globalIndex]}`, (err, stats) => {
      if (err) throw err;
      else if (!stats.isDirectory()) {
        console.log(chalk.red(`skipping file ${files[globalIndex]} not nested in folder`));
        // console.log(globalIndex);
        globalIndex++;
        loadNextDirectory();
      }
      else {
        recursiveLoad(`./target/${files[globalIndex]}`);
      }; 
    })   
  }
}


// This is both allowable and reverse order of loading
let allowableResourceTypes = [
//'Patient', this is loaded separately
  'Organization',
  'Practitioner',
  'Device',
  'Medication',
  'PractitionerRole',
  'Encounter',
  'DeviceUseStatement',
  'Media',
  'Specimen',
  'AllergyIntolerance',
 // 'CarePlan', Still needs some work for referential itnegrity
  'ClinicalImpression',
  'Consent',
  'Condition',
  'Immunization',
  'Procedure',
  'Observation',
  'DiagnosticReport',
  'MedicationRequest',
  'MedicationStatement'
];

let resourcesToLoad = [];
let hashMap = {};
let Patient = '';
let Patients = [];
let currentPath = '';

const load = function (data, cb) {
  let fullUrl = data.fullUrl;
  delete data.fullUrl;
  let options = {
    url:`${target_url}/${data.resourceType}`, 
    headers: {'content-type' : 'application/json'},
    body: pd.json(data)
  }
  request.post(options, function(err, res) {
    if (!err && res.statusCode === 201) {
      //console.log(res.body);
      let body = JSON.parse(res.body);
      console.log(chalk.green(`${data.resourceType} ${body.id} loaded`))
      hashMap[`${data.resourceType}/${data.id}`] = `${data.resourceType}/${body.id}`;
      hashMap[`${fullUrl}`] = `${data.resourceType}/${body.id}`;
      if (data.resourceType === 'Patient') Patient = `${data.resourceType}/${body.id}`;
      cb();
    }
    else {
      console.log(chalk.red(`Failed to load ${data.resourceType}/${data.id} body below`))
      console.log(chalk.yellow(pd.json(data)))
      cb();
    }
  }) 
}

const arrayLoad = function () {
  if (resourcesToLoad.length) {
    resourcesToLoad.sort(function (a, b) {return b.loadingOrder - a.loadingOrder});
    // console.log(pd.json(resourcesToLoad));
    let nextObject = resourcesToLoad.pop();
    delete nextObject.loadingOrder;
    if (nextObject.subject) {
      nextObject.subject.reference = Patient;
    }
    else if (nextObject.patient) {
      nextObject.patient.reference = Patient;
    }
    for (let k1 in nextObject) {
      if(nextObject.hasOwnProperty(k1)) {
        if (Array.isArray(nextObject[k1])) {
          // console.log(`${k1} I am an array`)
          for (let i = 0; i < nextObject[k1].length; i++) {
            if (nextObject[k1][i].reference && hashMap[nextObject[k1][i].reference]) {
              nextObject[k1][i].reference = hashMap[nextObject[k1][i].reference];
            }
            else if (nextObject[k1][i].individual && nextObject[k1][i].individual.reference) {
              nextObject[k1][i].individual.reference = hashMap[nextObject[k1][i].individual.reference];
            }     
            else if (nextObject[k1][i].actor && nextObject[k1][i].actor.reference) {
              nextObject[k1][i].actor.reference = hashMap[nextObject[k1][i].actor.reference];
            }     
          }
        }
        else {
          let reference = nextObject[k1].reference;
          if (reference && hashMap[reference]) {
            nextObject[k1].reference = hashMap[reference];
          }  
        }
      }
    }
    load(nextObject, arrayLoad);
  }
  else {
    console.log('loading done');
    console.log(Patient);
    console.log(pd.json(hashMap));
    Patients.push(`${currentPath} ---- ${Patient}`);
    Patient = null;
    hashMap = {};
    globalIndex++;
    // console.log(globalIndex);
    loadNextDirectory();
  }
} 

const loadResources = function () {
  if(!Patient) {
    for (let i = 0; i < resourcesToLoad.length; i++) {
      if (resourcesToLoad[i].resourceType === 'Patient') {
        let data = resourcesToLoad[i];
        resourcesToLoad.splice(i, 1);
        load(data, function () {
          loadResources();
        });
        break;
      }
    }    
  }
  else {
    for (let i = 0; i < allowableResourceTypes.length; i++) {
      for (let j = 0; j < resourcesToLoad.length; j++) {
        if (allowableResourceTypes[i] === resourcesToLoad[j].resourceType) {
          resourcesToLoad[j].loadingOrder = i;
        }
      }
    }
    arrayLoad();    
  }
}

const checkResource = function (data) {
  if (data.resourceType && allowableResourceTypes.includes(data.resourceType)) {
    resourcesToLoad.push(data);
  }
  else if (data.resourceType === 'Patient') {
    resourcesToLoad.push(data);
  }
  else if (data.resourceType && data.resourceType === 'Bundle') {
    if (data.entry) {
      for (let i = 0; i < data.entry.length; i++) {
        if(data.entry[i].resource && data.entry[i].resource.resourceType && allowableResourceTypes.includes(data.entry[i].resource.resourceType)) {
          if (data.entry[i].fullUrl) data.entry[i].resource.fullUrl = data.entry[i].fullUrl; 
          resourcesToLoad.push(data.entry[i].resource);
        }
        else if(data.entry[i].resource && data.entry[i].resource.resourceType && data.entry[i].resource.resourceType === 'Patient') {
          resourcesToLoad.push(data.entry[i].resource);
        }
        else {
          console.log(chalk.yellow(`skipping ${data.entry[i].resource.resourceType}`));
        }
      } 
    }
  }
  else {
    console.log(chalk.yellow(`skipping ${data.resourceType}`));
  } 
} 

const recursiveLoad = function (filepath) {
  let files = fs.readdirSync(`./${filepath}`);
  if (!files.length) console.log(chalk.red(`Empty directory ${filepath}`))
  for (let i = 0; i < files.length; i++) {
    if (files[i].slice(-4).toLowerCase() !== 'json' ) {
      console.log(chalk.yellow(`skipping file which is not JSON ${filepath}`));
    }
    else {
      let file = fs.readFileSync(`./${filepath}/${files[i]}`,'utf-8');
      let data = null;
      let resourceType = null;
      try {
        data = JSON.parse(file);
      }
      catch (e) {
        console.log(chalk.red(`${files[i]} is not JSON`));
      }
      if (data) {
        console.log(`attempting to load ./${filepath}/${files[i]}`);
        currentPath = `${filepath}`;
        checkResource(data)
      };
    }
  }
  loadResources();   
}

loadNextDirectory();