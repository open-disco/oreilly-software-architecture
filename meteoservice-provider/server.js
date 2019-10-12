const http = require('http');
const url = require('url');
const discovery = require('../lib/disco/discovery');

// This service's port
const PORT = 3301;

// Open DISCO Settings
// http://www.open-disco.org
const discoSettings = {

  // General settings
  verbose: true,
  registryID: null,
  renewTTL: 300000,
  contentType: 'application/json',
  acceptType: 'application/json',

  // Service identifiers
  serviceName: 'Méteo service',
  serviceURL: `http://localhost:${PORT}`,
  tags: 'weather-lookup',
  semanticProfile: 'http://alps.io/profiles/actual-weather',
  healthURL: `http://localhost:${PORT}`,
  healthTTL: '86400',

  // Registry service endpoints
  registerURL: 'http://localhost:8282/reg/',
  renewURL: 'http://localhost:8282/renew/',
  unregisterURL: 'http://localhost:8282/unreg/',
  findURL: 'http://localhost:8282/find/',
  bindURL: 'http://localhost:8282/bind/'
};

// API Specification
const yaml = require('../lib/readYaml');
const apiSpecification = yaml.readYAMLFile('./meteoservice-openapi3.yaml');

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

// Run the service
const server = http
  .createServer(acmeServerHandler)
  .listen(PORT, () => {
    console.log(`listening http://localhost:${PORT}/`);
    console.log(`to shutdown run: $ kill ${process.pid}`);
  });

// Register the service 
discovery.register(discoSettings, (data, response) => {
  console.log('service registered');
});

// Server handler
function acmeServerHandler(request, response) {
  const requestURL = url.parse(request.url);
  console.info(`<--- ${request.method} ${requestURL.pathname}${(requestURL.search) ? requestURL.search : ''}`);
  console.log('<--- headers:', JSON.stringify(request.headers, '', 2));

  let requestBody = [];
  request.on('data', (chunk) => {
    requestBody.push(chunk);
  }).on('end', () => {
    requestBody = Buffer.concat(requestBody).toString();
    if (requestBody) {
      console.log('<--- body:', requestBody);
    }
    console.log('\n');
  });

  if (requestURL.pathname === '/meteo/actuelle') {
    response.writeHead(201, responseHeaders);
    response.end(JSON.stringify(weatherResponseBody, '', 2));
  }
  else if (requestURL.pathname === '/oas') {
    response.writeHead(200, responseHeaders);
    response.end(JSON.stringify(apiSpecification, '', 2))
  }
  else {
    response.writeHead(404, responseHeaders);
    response.end(`{
  "title": "Resource ${requestURL.pathname} not found"
}`);
  }
}

// Shutdown routine
process.on('SIGTERM', () => {
  discovery.unregister(discoSettings, () => {
    console.log('service unregistered');

    server.close(() => {
      console.log('gracefully shutting down');
      process.exit(0);
    });
  });
});
