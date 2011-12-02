/**
 * Player helper class, holds all the current game properties:
 * Fuel, Health, Speed, Lives and Score.
 * Note: This class is just used in Cox Simulator 2012 and we only have
 * 1 instance of it for the current player for the current game.
 * If we want to have more than 1 player (e.g. in multiplayer mode)
 * you should add a multiplayer class and have all player instances there.
 * @constructor
 */
function Player() {
  // Call the parent constructor
  ChaseCam.call(this);
}

// Inherit ChaseCam
Player.prototype = new ChaseCam();

// Correct the constructor pointer because it points to Player
Player.prototype.constructor = Player;
