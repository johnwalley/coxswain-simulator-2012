/**
 * @author John Walley / http://www.walley.org.uk/
 */
 
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
  
  // Controls
  //this.input = input;
  
  this.defaultBoatMass = 1000;
  this.gravity = 9.81;
  
  this.defaultMaxSpeed = 20 * this.mphToMeterPerSec;
  this.maxPossibleSpeed = 25 * this.mphToMeterPerSec;
  
  this.defaultMaxAcceleration = 2.5;
  this.maxAcceleration = 5.75;
  this.minAcceleration = -3.25;
  
  this.boatFrictionInWater = 17;
  this.airFrictionPerSpeed = 0.66;
  
  this.maxAirFriction = this.airFrictionPerSpeed * 200;
  
  this.brakeSlowdown = 1;
  
  this.meterPerSecToMph = 1.609344 * ((60 * 60) / 1000);
  this.mphToMeterPerSec = 1 / this.meterPerSecToMph;
  
  this.maxRotationPerSec = 1.3;
  this.minSensitivity = 0.5;
  this.boatHeight = 2;
  
  this.minViewDistance = 0.4;
  this.maxViewDistance = 1.8;
  
  this.maxSpeed = this.defaultMaxSpeed * 1.05;
  this.carMass = this.defaultCarMass * 1.015;
  this.maxAcceleration = this.defaultMaxAcceleration * 0.85;
  
  this.boatPos = null;
  this.boatDir = null;
  // TODO: Replace with genuine 3D velocity
  this.speed = null;
  this.boatUp = null;
  this.carForce = null;
  this.viewDistance = null;
  
  this.rotateBoatAfterCollision = 0;
  this.isBoatOnWater = false;
  
  this.riverSegmentNumber = 0;
  this.riverSegmentPercent = 0;
  
  this.lastAccelerationResult = 0;
  
  //this.boatPos = boatPosition;
  this.boatPosition = new THREE.Vector3(0,0,1);
  this.boatDir = new THREE.Vector3(0,0,1);
  this.boatUp = new THREE.Vector3(0,1,0);
  
  this.virtualRotationAmount = 0.0;
  this.rotationChange = 0.0;  
  
}

// Inherit BasePlayer
BoatPhysics.prototype = new BasePlayer();

// Correct the constructor pointer because it points to BoatPhysics
BoatPhysics.prototype.constructor = BoatPhysics;

/*BoatPhysics.prototype = {
  get lookAtPos() {
    return new THREE.Vector3(new THREE.Vector3().add(this.boatPos, new THREE.Vector3().copy(this.boatUp).multiplyScalar(this.carHeight)));
  }
}*/

BoatPhysics.prototype.reset = function () {
  this.speed = 0;
  this.boatForce = new THREE.Vector3(0, 0, 0);
  this.riverSegmentNumber = 0;
  this.riverSegmentPercent = 0;
}

BoatPhysics.prototype.update = function () {
  BasePlayer.prototype.update.call(this);
  
  if (this.zoomInTime > 0) {
    this.boatOnWater = false;
  }
  
  var moveFactor = BaseGame.moveFactorSpeed;
  
  if (moveFactor < 0.001) {
    moveFactor = 0.001;
  }
  if (moveFactor > 0.5) {
    moveFactor = 0.5
  }
  
  var effectiveSenstivity = this.minSensitivity;
  
  // First handle rotations (reduce last value)
  this.rotationChange *= 0.95;
  
  if (this.input) {
  }
  
}


