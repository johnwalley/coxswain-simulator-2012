/**
 * Chase camera for our boat. We are always close behind it.
 * The camera rotation is not the same as the current boat rotation,
 * we interpolate the values a bit, allowing the user to do small changes
 * without rotating the camera frantically. Also feels more realistic in
 * curves. Derived from the BasePlayer class, which controls the car
 * by the user input. This camera class is not controlled by the user,
 * its all automatic!
 * @constructor
 */
function ChaseCam() {
  // Call the parent constructor
  BasePlayer.call(this);
}

// Inherit BasePlayer
ChaseCam.prototype = new BasePlayer();

// Correct the constructor pointer because it points to ChaseCam
ChaseCam.prototype.constructor = BasePlayer;
