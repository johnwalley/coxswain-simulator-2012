/**
 * @author John Walley / http://www.walley.org.uk/
 */

define([
'../../utils/nodejs/node_modules/socket.io',
'fs'], function ( io, fs) {
  /** 
    A module representing the server
    @exports Server
    @version 1.0
   */
 
  function Player(id, socket, pos, dir) {
    this.id = id;
    this.socket = socket;
    this.pos = pos;
    this.dir = dir;
  }
  
  function Game(p1, p2) {
    this.p1 = p1;
    this.p2 = p2;
  }
 
  /**
   * Main entry class for our server
   * @constructor
   */
  Server = function () {
    // Start server
    var server = io.listen(27960);
    
    var stream = fs.createWriteStream("log/my_file.txt");    
    
    var playerCount = 0;
    var playerQueue = [];
    var gameList = [];
    
    var motd = 'Welcome to Coxswain Simulator 2012!';
    
    server.sockets.on('connection', function (socket) {

      var playerId = null;

      socket.emit('motd', { motd: motd });
      playerCount++;
      playerId = playerCount-1;
      console.info(playerId + ' joined the game');      
      console.info(playerCount + ' players');
      
      pos = {x: 0, y: 0, z:0};
      dir = {x: 0, y: 0, z: 0};
      
      var player = new Player(playerId, socket, pos, dir);
      
      playerQueue.push(player);
      
      // Is there anybody to play with?
      if (playerQueue.length > 1) {
        var game = new Game(playerQueue.pop(), playerQueue.pop());
        gameList.push(game);
        // Let clients know the game has started
        game.p1.socket.emit('start');
        game.p2.socket.emit('start');
      }
      
      socket.on('state', function(data) {
        player.pos = data;
        socket.emit('state', player.pos);
        console.log(JSON.stringify(player.pos));
        fs.write(JSON.stringify(player.pos));
      });   
      
      socket.on('disconnect', function () {
        playerCount--;
        console.info(playerCount + ' players');
      });  
      
    });
  }

  return Server;
});

