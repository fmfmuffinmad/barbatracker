const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const fs = require('fs');
const execSync = require('child_process').execSync;

const app = express();
const port = process.env.PORT || 5000;

// execSync(`sfdx force:auth:web:login --setalias default-dev --instanceurl https://test.salesforce.com --setdefaultusername`, { encoding: 'utf-8' });


if(!fs.existsSync(path.join(__dirname, 'force'))) {
  execSync(`sfdx force:project:create --projectname force -d ".\" -s force`, { encoding: 'utf-8' });
}

let output = execSync(`sfdx force:org:list --json`, { encoding: 'utf-8' })
              .replace(/[\u001b\u009b][[()#;?]*(?:[0-9]{1,4}(?:;[0-9]{0,4})*)?[0-9A-ORZcf-nqry=><]/g, '');

let SFDX_orgs = JSON.parse(output);
if (SFDX_orgs.status !== 0) {
  execSync(`sfdx force:auth:web:login --setalias default-dev --instanceurl https://test.salesforce.com --setdefaultusername`, { encoding: 'utf-8' });
} 

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// API calls
app.get('/api/hello', (req, res) => {
  res.send({ express: 'Hello From Express' });
});

app.post('/api/world', (req, res) => {
  console.log(req.body);
  res.send(
    `I received your POST request. This is what you sent me: ${req.body.post}`,
  );
});

// force calls
app.get('/force/orgs', (req, res) => {
  res.send({orgs: SFDX_orgs});
})

if (process.env.NODE_ENV === 'production') {
  // Serve any static files
  app.use(express.static(path.join(__dirname, 'client/build')));

  // Handle React routing, return all requests to React app
  app.get('*', function(req, res) {
    res.sendFile(path.join(__dirname, 'client/build', 'index.html'));
  });
}

app.listen(port, () => console.log(`Listening on port ${port}`));
