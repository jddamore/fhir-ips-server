import fs from 'fs'
import pretty from 'pretty-data'
const pd = pretty.pd;
import chalk from 'chalk'
import request from 'request';

let target_url = 'https://ips.health/fhir';
let target_directory = './target';

let files = fs.readdirSync('./target');

let globalIndex = 0;

const loadNextDirectory = function () {
  if (files.length <= globalIndex) {
    console.log('done');
  } 
  else {
    fs.stat(`./target/${files[globalIndex]}`, (err, stats) => {
      if (err) throw err;
      else if (!stats.isDirectory()) {
        console.log(chalk.red(`skipping file ${files[globalIndex]} not nested in folder`));
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
  'DeviceUseStatement',
  'Media',
  'Specimen',
  'AllergyIntolerance',
  'CarePlan',
  'ClinicalImpression',
  'Consent',
  'Condition',
  'Immunization',
  'Procedure',
  'DiagnosticReport',
  'Observation',
  'MedicationStatement',
  'MedicationRequest',
  'Observation'
];

let resourcesToLoad = [];
let hashMap = {};
let Patient = '';

const load = function (data, cb) {
  let options = {
    url:`${target_url}/${data.resourceType}`, 
    headers: {'content-type' : 'application/json'},
    body: pd.json(data)
  }
  request.post(options, function(err, res) {
    if (!err && res.statusCode === 201) {
      //console.log(res.body);
      let body = JSON.parse(res.body);
      console.log(chalk.green(`${data.resourceType} loaded`))
      hashMap[`${data.resourceType}/${data.id}`] = `${data.resourceType}/${body.id}`;
      if (data.resourceType === 'Patient') Patient = `${data.resourceType}/${body.id}`;
      cb();
    }
    else {
      console.log(chalk.red(`Failed to load ${data.resourceType}/${data.id}`))
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
    for (let k1 in nextObject) {
      if(nextObject.hasOwnProperty(k1)) {
        if (Array.isArray(nextObject[k1])) {
          for (let i = 0; i < nextObject[k1].length; i++) {
            if (nextObject[k1][i].reference && hashMap[nextObject[k1][i].reference]) {
              nextObject[k1][i].reference = hashMap[nextObject[k1][i].reference];
            }    
          }
        }
        else {
          if (nextObject[k1].reference && hashMap[nextObject[k1].reference]) {
            nextObject[k1].reference = hashMap[nextObject[k1].reference];
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
    hashMap = {};
    globalIndex++;
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
      for (let i = 0; data.entry.length; i++) {
        if(data.entry[i].resourceType && allowableResourceTypes.includes(data.entry[i].resourceType)) {
          resourcesToLoad.push(data.entry[i]);
        }
        else {
          console.log(chalk.yellow(`skipping ${data.entry[i].resourceType}`));
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
      if (data) checkResource(data);
    }
  }
  loadResources();   
}

loadNextDirectory();