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
function BoatPhysics(input) {
  // Call the parent constructor
  BasePlayer.call(this);
  
  // Controls
  this.input = input;
  
  this.boatMass = 1000;
  this.gravity = 9.81;
  
  this.defaultMaxSpeed = 50 * this.mphToMeterPerSec;
  this.maxPossibleSpeed = 50 * this.mphToMeterPerSec;
  
  this.defaultMaxAccelerationPerSec = 0.5;
  this.maxAcceleration = 5.75;
  this.minAcceleration = -3.25;
  
  this.boatFrictionInWater = 17;
  this.airFrictionPerSpeed = 0.66;
  
  this.maxAirFriction = this.airFrictionPerSpeed * 200;
  
  this.brakeSlowdown = 1;
  
  this.meterPerSecToMph = 1.609344 * ((60 * 60) / 1000);
  this.mphToMeterPerSec = 1 / this.meterPerSecToMph;
  
  this.maxRotationPerSec = 1.3;
  this.minSensitivity = 0.1;
  this.boatHeight = 2;
  
  this.minViewDistance = 0.4;
  this.maxViewDistance = 1.8;
  
  this.maxSpeed = this.defaultMaxSpeed * 1.05;
  this.carMass = this.defaultCarMass * 1.015;
  this.maxAccelerationPerSec = this.defaultMaxAccelerationPerSec * 0.85;
  
  // TODO: Replace with genuine 3D velocity
  this.speed = 0;
  this.boatUp = null;
  this.boatForce = new THREE.Vector3(0, 0, 0);
  this.viewDistance = null;
  
  this.rotateBoatAfterCollision = false;
  this.isBoatOnWater = true;
  
  this.riverSegmentNumber = 0;
  this.riverSegmentPercent = 0;
  
  this.lastAccelerationResult = 0;
  
  //this.boatPos = boatPosition;
  this.boatPos = new THREE.Vector3(72, 8, 125);
  this.boatDir = 0.0;
  this.boatUp = new THREE.Vector3(0, 1, 0);
  
  this.virtualRotationAmount = 0.0;
  this.rotationChange = 0.0;  
  
}

// Inherit BasePlayer
BoatPhysics.prototype = new BasePlayer();

// Correct the constructor pointer because it points to BoatPhysics
BoatPhysics.prototype.constructor = BoatPhysics;

BoatPhysics.prototype = {
  get lookAtPos() {
    return new THREE.Vector3().add(this.boatPos, new THREE.Vector3().copy(this.boatUp).multiplyScalar(this.boatHeight));
  }
}

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
  
  var moveFactor = BaseGame.elapsedTimeThisFrameInMs / 1000.0;
  
  if (moveFactor < 0.001) {
    moveFactor = 0.001;
  }
  if (moveFactor > 0.5) {
    moveFactor = 0.5
  }
  
  var effectiveSensitivity = this.minSensitivity ;
  
  // First handle rotations (reduce last value)
  this.rotationChange *= 0.95;
  
  if (this.input.moveLeft) {
    this.rotationChange += effectiveSensitivity * this.maxRotationPerSec * moveFactor / 2.5;
  } else if (this.input.moveRight){
    this.rotationChange -= effectiveSensitivity * this.maxRotationPerSec * moveFactor / 2.5;    
  } else {
    this.rotationChange = 0;
  }
  
  var maxRot = this.maxRotationPerSec * moveFactor * 1.25;
  
  // Handle car rotation after collision
  if (this.rotateBoatAfterCollision != 0)
  {
    if (this.rotateBoatAfterCollision > maxRot)
    {
      this.rotationChange += maxRot;
      this.rotateBoatAfterCollision -= maxRot;
    }
    else if (this.rotateBoatAfterCollision < -maxRot)
    {
      this.rotationChange -= maxRot;
      this.rotateBoatAfterCollision += maxRot;
    }
    else
    {
      this.rotationChange += this.rotateBoatAfterCollision;
      this.rotateBoatAfterCollision = 0;
    }
  }
  else
  {
    // If we are staying or moving very slowly, limit rotation!
    if (this.speed < 10.0) {
      this.rotationChange *= 0.67 + 0.33 * this.speed / 10.0;
    } else {
      this.rotationChange *= 1.0 + (this.speed - 10) / 100.0;
    }
  }    
  
  // Limit rotation change to MaxRotationPerSec * 1.5 (usually for mouse)
  if (this.rotationChange > maxRot) {
    this.rotationChange = maxRot;
  }
  if (this.rotationChange < -maxRot) {
    this.rotationChange = -maxRot;  
  }
  
  this.boatDir -= this.rotationChange;
  
  // Handle speed
  var newAccelerationForce = 0.0;
  
  if (this.input.moveForward) {
    newAccelerationForce += this.maxAccelerationPerSec * moveFactor;
  } else if (this.input.moveBackward) {
    newAccelerationForce -=  this.maxAccelerationPerSec * moveFactor;  
  }
   
  // Limit acceleration (but drive as fast forwards as possible if we
  // are moving backwards)
  if (this.speed > 0 && newAccelerationForce > this.maxAcceleration) {
    newAccelerationForce = this.maxAcceleration;
  }
  if (newAccelerationForce < this.minAcceleration) {
    newAccelerationForce = this.minAcceleration;  
  }
    
  this.boatForce.set(0, 0, 0);  
    
  // Add acceleration force to total boat force, but use the current boatDir!
  if (this.isBoatOnWater) {
    this.boatForce.addSelf(new THREE.Vector3(Math.cos(this.boatDir), 0, Math.sin(this.boatDir)).multiplyScalar(newAccelerationForce * moveFactor));
  }
  
  var oldSpeed = this.speed;
  
  var speedChangeVector = new THREE.Vector3().copy(this.boatForce).divideScalar(this.boatMass);
  
  if (this.isBoatOnWater && speedChangeVector.length() > 0) {
    var speedApplyFactor = speedChangeVector.normalize().dot(new THREE.Vector3(Math.cos(this.boatDir), 0, Math.sin(this.boatDir)));
    if (speedApplyFactor > 1) {
      speedApplyFactor = 1;
    }
    this.speed += speedChangeVector.length() * speedApplyFactor;
  }
  
  // Limit speed
  if (this.speed > this.maxSpeed) {
    this.speed = this.maxSpeed;
  }
  if (this.speed < -this.maxSpeed) {
    this.speed = -this.maxSpeed;  
  }
  
  
  // Apply speed and calculate new boat position.
  this.boatPos.addSelf(new THREE.Vector3(Math.cos(this.boatDir), 0, Math.sin(this.boatDir)).multiplyScalar(this.speed * moveFactor * 1.75));  
    
}


