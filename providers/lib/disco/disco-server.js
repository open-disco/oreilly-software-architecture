const http = require('http');
const url = require('url');
const discovery = require('./discovery');

// Default headers
const defaultResponseHeaders = {
  'Content-Type': 'application/json',
  'Cache-Control': 'no-cache',
  'Expires': '0'
};

let pathHandler = null;
let discoSettings = {};
let apiSpecification = {};
let server = null;

//
//  Create & run the service
//
function runService(settings, specification, handler, PORT) {
  pathHandler = handler;
  discoSettings = settings;
  apiSpecification = specification;

  server = http
    .createServer(serverHandler)
      .listen(PORT, () => {
        console.log(`listening on http://localhost:${PORT}/`);
        console.log(`to shutdown run: $ kill ${process.pid}`);
      });

  // Register with DISCO registry
  discovery.register(discoSettings, () => {
    console.log('service registered');
  });
}

//
// Main server handler
//
function serverHandler(request, response) {
  // Incoming request logging
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

  // Serve the API specification
  if (requestURL.pathname === '/oas') {
    response.writeHead(200, defaultResponseHeaders);
    response.end(JSON.stringify(apiSpecification, '', 2))    
  }
  
  // Delegate to supplied path handler, 404 if not handled
  if (!pathHandler(request, response)) {
    response.writeHead(404, defaultResponseHeaders);
    response.end(`{
  "title": "Resource ${requestURL.pathname} not found"
}`);
  }
}

// Shutdown routines
process.on('SIGTERM', () => {
  discovery.unregister(discoSettings, () => {
    console.log('service unregistered');

    server.close(() => {
      console.log('gracefully shutting down');
      process.exit(0);
    });
  });
});

module.exports = runService
