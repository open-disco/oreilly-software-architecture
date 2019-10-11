const http = require('http');
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

// Server handler
function acmeServerHandler(request, response) {
  console.info('request received');
  response.writeHead(200, responseHeaders);
  response.end(JSON.stringify(responseBody, '', 2));
}

// Shutdown routine
process.on('SIGTERM', () => {
  server.close(() => {
    console.log('gracefully shutting down');
    process.exit(0);
  });
});
