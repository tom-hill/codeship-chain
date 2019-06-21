'use strict';
const codeship = require('./config/codeship_secrets.json');
const fetch = require('node-fetch');
const util = require('util');

let accessToken, orgId;

function makeRequest(url, options) {
  return new Promise((resolve, reject) => {
    fetch(`http://api.codeship.com/v2${url}`, options)
      .then(res => {
        console.log(`REQUEST MADE TO: http://api.codeship.com/v2${url}`);
        console.log('REQUEST RESPONSE: ', util.inspect(res));
        if (res.ok) {
          if (res.status === 202) resolve(res.status);

          resolve(res.json());
        }

        reject(new Error('No Matching Fetch Status'));
      });
  });
}

function authCodeship() {
  return new Promise( async (resolve, reject) => {
    const options = {
      method: 'POST',
      headers: {
        Authorization: `Basic ${Buffer.from(`${codeship.user}:${codeship.password}`).toString('base64')}`,
      }
    };

    const auth = await makeRequest('/auth', options).catch(e => console.log(e));

    resolve(auth);
  });
}

function getProjectList() {
  return new Promise( async (resolve, reject) => {
    const options = {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-type': 'application/json',
      }
    };

    const projectList = await makeRequest(`/organizations/${orgId}/projects`, options).catch(e => console.log(e));

    resolve(projectList);
  });
}

function constructLookup() {
  return new Promise(async (resolve, reject) => {
    const projectList = await getProjectList().catch(e => console.log(e));

    const lookup = {};
    codeship.projects.forEach((chainProject) => {
      lookup[chainProject.trigger] = {};

      chainProject.branches.forEach((branch) => {
        const filteredProjects = projectList.projects.filter((project) => chainProject.chained.includes(project.name));
        lookup[chainProject.trigger][branch] = filteredProjects.map((project) => project.uuid);
      });
    });

    if (Object.keys(lookup).length > 0) {
      resolve(lookup);
    } else {
      reject(new Error("Lookup <object> could not be created"));
    }
  });
}

function startChainedProjects(branch, chainedProjects) {
  console.log("START CHAINED PROJECTS");
  return Promise.all(
    chainedProjects.map((project) => {
      console.log("MAPPING PROEJCT: ", project);
      const options = {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-type': 'application/json',
        },
        body: JSON.stringify({
          "ref": `heads/${branch}`
        }),
      };

      return makeRequest(`/organizations/${orgId}/projects/${project}/builds`, options);
    })
  )
}

module.exports.chain = async (event) => {
  const auth = await authCodeship().catch(e => console.log(e));
  accessToken = auth.access_token;
  orgId = auth.organizations.find(org => org.name === codeship.org).uuid;

  const lookup = await constructLookup().catch(e => console.log(e));
  console.log("LOOKUP: ", JSON.stringify(lookup));

  let chainedProjects = [];
  console.log("EVENT BODY: ", event.body);
  const { project_name, branch } = JSON.parse(event.body).build;
  if(project_name in lookup) {
    const project = lookup[project_name];
    if (branch in project) {
      chainedProjects = project[branch];
    }
  }

  let result;
  if (chainedProjects.length > 0) {
    result = await startChainedProjects(branch, chainedProjects).catch(e => console.log(e));
  }

  console.log("RESULT: ", JSON.stringify(result));

  return {
    statusCode: 200,
    body: JSON.stringify({
      message: 'Event triggered by Codeship-Chain',
      input: event,
    }, null, 2),
  };
};
