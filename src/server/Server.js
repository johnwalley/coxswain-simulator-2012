/**
 * @author John Walley / http://www.walley.org.uk/
 */

define(['../../utils/nodejs/node_modules/socket.io'], function (io) {
  /** 
    A module representing the server
    @exports Server
    @version 1.0
   */
 
  /**
   * Main entry class for our server
   * @constructor
   */
  Server = function () {
    var server = io.listen(27960);
    
    var playerCount = 0;
    var motd = 'Welcome to Coxswain Simulator 2012!';

    var position = null;

    server.sockets.on('connection', function (socket) {

      var playerId = null;

      socket.emit('motd', { motd: motd });
      playerCount++;
      console.info(playerCount + ' players');
      
      // Client joins the game
      socket.on('join', function(data) {
        playerId = playerCount;
        console.info(playerId + ' joined the game');
      });
      
      socket.on('state', function(data) {
        if (playerId == 1) {
          position = data;
        } else {
          socket.emit('state', position);
        }
      });   
      
      socket.on('disconnect', function () {
        playerCount--;
        console.info(playerCount + ' players');
      });  
      
    });
  }

  return Server;
});

