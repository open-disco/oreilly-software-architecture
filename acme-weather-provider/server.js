const http = require('http');
const url = require("url");
const discovery = require('./disco/discovery');

const PORT = 3300;

// Default response headers
const responseHeaders = {
  'Content-Type': 'application/json',
  'Cache-Control': 'no-cache',
  'Expires': '0'
};

// Mock response body
const responseBody = {
  "airTemperature": 16,
  "windDirection": "ENE"
};

// Run the service
const server = http
  .createServer(acmeServerHandler)
  .listen(PORT, () => {
    console.log(`listening http://localhost:${PORT}/`);
    console.log(`to shutdown run: $ kill ${process.pid}`)
  });

// Register the service 
discovery.register(null, (data, response) => {
  console.log('service registered');
});

// Server handler
function acmeServerHandler(request, response) {
  const requestURL = url.parse(request.url);
  console.info(`request ${requestURL.pathname}`);
  
  if (requestURL.pathname === '/weather') {
    response.writeHead(200, responseHeaders);
    response.end(JSON.stringify(responseBody, '', 2));
  }
  else {
    response.writeHead(404, responseHeaders);
    response.end();
  }
}

// Shutdown routine
process.on('SIGTERM', () => {
  discovery.unregister(null, () => {
    console.log('service unregistered');

    server.close(() => {
      console.log('gracefully shutting down');
      process.exit(0);
    });
  });
});
