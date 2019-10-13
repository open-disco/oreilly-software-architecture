const url = require('url');
const discoServer = require('../lib/disco/disco-server');

// This service's port
const PORT = 3301;
const appURL = `http://localhost:${PORT}`; 
const registryURL = `https://disco-registry.herokuapp.com`;

// Open DISCO Settings
// http://www.open-disco.org
const discoSettings = {
  // General settings
  verbose: true,
  registryID: null,
  renewTTL: 300000,
  contentType: "application/json",
  acceptType: "application/json",

  // Service identifiers
  serviceName: "Méteo service",
  serviceURL: appURL,
  tags: "weather-lookup",
  semanticProfile: "http://alps.io/profiles/actual-weather",
  healthURL: appURL,
  healthTTL: "86400",

  // Registry service endpoints
  registerURL: `${registryURL}/reg/`,
  renewURL: `${registryURL}/renew/`,
  unregisterURL: `${registryURL}/unreg/`,
  findURL: `${registryURL}/find/`,
  bindURL: `${registryURL}/bind/`
};

// API Specification
const yaml = require('./../lib/readYaml');
const apiSpecification = yaml.readYAMLFile('./meteoservice-provider/meteoservice-openapi3.yaml');

// Default response headers
const responseHeaders = {
  'Content-Type': 'application/json',
  'Cache-Control': 'no-cache',
  'Expires': '0'
};

// Mock response body
const weatherResponseBody = {
  temperature: 15.3,
  roseePoint: 2.1,
  vent: "SWS"
};

// Server Handler
function handler(request, response) {
  const requestURL = url.parse(request.url);

  // Serve POST /meteo/actuelle
  if (requestURL.pathname === '/meteo/actuelle') {
    response.writeHead(201, responseHeaders);
    response.end(JSON.stringify(weatherResponseBody, '', 2));
  }

  return false;
} 

// Run the ACME service
discoServer(discoSettings, apiSpecification, handler, PORT);
