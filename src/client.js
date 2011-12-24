/**
 * @author John Walley / http://www.walley.org.uk/
 */
 
/**
 * Main entry point for our game
 */

require(["client/Client"], function (Client) {
  var game = new Client();
  game.run();
});
