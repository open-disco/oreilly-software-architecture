const http = require('http');
const url = require('url');
const discovery = require('../lib/disco/discovery');

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
  serviceName: "ACME Weather Service",
  serviceURL: "http://localhost:3300",
  tags: "weather-lookup",
  semanticProfile: "http://alps.io/profiles/actual-weather",
  healthURL: "http://localhost:3300",
  healthTTL: "86400",

  // Registry service endpoints
  registerURL: "http://localhost:8282/reg/",
  renewURL: "http://localhost:8282/renew/",
  unregisterURL: "http://localhost:8282/unreg/",
  findURL: "http://localhost:8282/find/",
  bindURL: "http://localhost:8282/bind/"
};

// API Specification
const yaml = require('../lib/readYaml');
const apiSpecification = yaml.readYAMLFile('./acme-weather-openapi3.yaml');

// Default response headers
const responseHeaders = {
  'Content-Type': 'application/json',
  'Cache-Control': 'no-cache',
  'Expires': '0'
};

// Mock response body
const weatherResponseBody = {
  "airTemperature": 16,
  "windDirection": "ENE"
};

// Run the service
const PORT = 3300;
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
  console.info(`request ${requestURL.pathname}${(requestURL.search)?requestURL.search:''}`);
  
  if (requestURL.pathname === '/weather') {
    response.writeHead(200, responseHeaders);
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
