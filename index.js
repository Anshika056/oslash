#!/usr/bin/env node

/**
 * Module dependencies.
 */

 const app = require('./app');
 const debug = require('debug')('node-skeleton:server');
 const http = require('http');
 const { APP_PORT } = require('./config.json');
 
 /**
  * Get port from environment and store in Express.
  */
 
 const port = normalizePort(APP_PORT || '3000');
 app.set('port', port);
 
 /**
  * Create HTTP server.
  */
 
 const server = http.createServer(app);
 
 /**
  * Listen on provided port, on all network interfaces.
  */
 
 server.listen(port);
 server.on('error', onError);
 server.on('listening', onListening);
 
 /**
  * Normalize a port into a number, string, or false.
  */
 
 function normalizePort(val) {
   let appPort = parseInt(val, 10);
 
   if (isNaN(appPort)) {
     // named pipe
     return val;
   }
 
   if (appPort >= 0) {
     // port number
     return appPort;
   }
 
   return false;
 }
 
 /**
  * Event listener for HTTP server "error" event.
  */
 
 function onError(error) {
   if (error.syscall !== 'listen') {
     throw error;
   }
 
   const bind = typeof port === 'string'
     ? 'Pipe ' + port
     : 'Port ' + port;
 
   // handle specific listen errors with friendly messages
   switch (error.code) {
     case 'EACCES':
       console.error(bind + ' requires elevated privileges');
       process.exit(1);
       break;
     case 'EADDRINUSE':
       console.error(bind + ' is already in use');
       process.exit(1);
       break;
     default:
       throw error;
   }
 }
 
 /**
  * Event listener for HTTP server "listening" event.
  */
 
 function onListening() {
   const addr = server.address();
   const bind = typeof addr === 'string'
     ? 'pipe ' + addr
     : 'port ' + addr.port;
     console.log("Listening on" + bind)
   debug('Listening on ' + bind);
 }
 