const fs = require('fs');
const pd = require('pretty-data').pd;

let filename = 'IPS-bundle-01.json';
let file = fs.readFileSync(`./example_bundle/${filename}`, 'utf-8');
let thing = JSON.parse(file);

if (!fs.existsSync(`./example_individual_resources/${filename}`)) {
  fs.mkdirSync(`./example_individual_resources/${filename.replace('.json', '')}`);
}

for (let i = 0; i < thing.entry.length; i++) {
  if (thing.entry[i].resource.resourceType !== 'Composition') {
    let name = `${thing.entry[i].resource.resourceType}_${thing.entry[i].resource.id}.json`;
    fs.writeFileSync(`./example_individual_resources/${filename.replace('.json', '')}/${name}`, pd.json(thing.entry[i].resource));
    console.log(`${name} file written`);  
  }
}
