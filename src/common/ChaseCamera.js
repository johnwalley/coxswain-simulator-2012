/**
 * @author John Walley / http://www.walley.org.uk/
 */

define(["common/BoatPhysics"], function (BoatPhysics) { 
  /**
   * Chase camera for our boat. We are always close behind it.
   * The camera rotation is not the same as the current boat rotation,
   * we interpolate the values a bit, allowing the user to do small changes
   * without rotating the camera frantically. Also feels more realistic in
   * curves. Derived from the BasePlayer class, which controls the car
   * by the user input. This camera class is not controlled by the user,
   * it's all automatic!
   * @constructor
   */
  function ChaseCamera(input, landscape) {
    // Call the parent constructor
    BoatPhysics.call(this, input, landscape);
    
    this.cameraPos;
    
    this.cameraDistance = 5;
    this.wannaCameraDistance = 5;
    
    this.cameraLookVector = new THREE.Vector3(1, 0, 0);
    this.wannaCameraLookVector;
    
    this.maxCameraWobbleTimeout = 0.7;
    this.cameraWobbleTimeout = 0;
    this.cameraWobbleFactor = 1;
    
    this.lastCameraWobble = new THREE.Vector3(0, 0, 0);
      
    this.setCameraPosition(new THREE.Vector3().add(this.boatPos, new THREE.Vector3(0, -100, 10)));
  }

  // Inherit BoatPhysics
  ChaseCamera.prototype = new BoatPhysics();

  // Correct the constructor pointer because it points to ChaseCamera
  ChaseCamera.prototype.constructor = ChaseCamera;

  ChaseCamera.prototype.update = function (delta) {
    BoatPhysics.prototype.update.call(this, delta);

    this.updateView(delta);
  }

  ChaseCamera.prototype.setCameraPosition = function (cameraPos) {
    this.cameraPos = cameraPos;
    this.cameraLookVector = new THREE.Vector3().sub(this.lookAtPos, this.cameraPos);
  }

  ChaseCamera.prototype.updateView = function (delta) {
    // This function is an abomination of misunderstanding and hacks. Do better!

    this.cameraDistance = (0.9 * this.cameraDistance) +
                          (0.1 * this.wannaCameraDistance);
    
    //this.cameraLookVector = this.boatDir.clone();    
    this.wannaCameraLookVector = this.boatDir.clone().multiplyScalar(-this.cameraDistance);;
                     
    this.cameraLookVector = new THREE.Vector3().add(
                              this.cameraLookVector.clone().multiplyScalar(0.9),
                              this.wannaCameraLookVector.clone().multiplyScalar(0.1));
    
    this.cameraPos = new THREE.Vector3().add(this.lookAtPos, this.cameraLookVector).addSelf(this.boatUp).addSelf(this.boatUp);
  
    // Is the camera wobbling?
    if (this.cameraWobbleTimeout > 0) {
      // This should pick up on the frametime
      this.cameraWobbleTimeout -= delta;
      if (this.cameraWobbleTimeout < 0) {
        this.cameraWobbleTimeout = 0;
      }
    }
    
    // Add camera shake if camera wobble effect is on
    // and if in game (check if we're zooming in at start)
    if (this.cameraWobbleTimeout > 0) {
      var effectStrength = 0.1 * this.cameraWobbleFactor * (this.cameraWobbleTimeout / this.maxCameraWobbleTimeout);
      this.lastCameraWobble = (new THREE.Vector3(Math.random()-0.5, 0, Math.random()-0.5).normalize().multiplyScalar(effectStrength));
    }
    else {
      this.lastCameraWobble.set(0, 0, 0);
    }    
    
  }
  
  ChaseCamera.prototype.wobbleCamera = function (wobbleFactor) {
    this.cameraWobbleTimeout = this.maxCameraWobbleTimeout;
    this.cameraWobbleFactor = wobbleFactor;
  }
  
  return ChaseCamera;
});