/**
 * @author John Walley / http://www.walley.org.uk/
 */

/**
 * Main entry class for our server
 * @constructor
 */
Server = function () {
  var io = require('../../utils/nodejs/node_modules/socket.io').listen(27960);

  io.sockets.on('connection', function (socket) {
    socket.emit('motd', { motd: 'Welcome!' });
    console.info('Connection');
  });
  
  io.sockets.on('disconnect', function () {
    console.info('Disconnect');
  });  
}

server = new Server();

