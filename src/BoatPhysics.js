/**
 * Boat controller class for controlling the boat we cox.
 * This class is derived from the BasePlayer class, which stores all
 * important game values for us (game time, game over, etc.).
 * The ChaseCamera is then derived from this class and finally we got the
 * Player class itself at the top, which is deriven from all these classes.
 * This way we can easily access everything from the Player class.
 * @constructor
 */
function BoatPhysics() {
  // Call the parent constructor
  BasePlayer.call(this);
}

// Inherit BasePlayer
BoatPhysics.prototype = new BasePlayer();

// Correct the constructor pointer because it points to BoatPhysics
BoatPhysics.prototype.constructor = BoatPhysics;
