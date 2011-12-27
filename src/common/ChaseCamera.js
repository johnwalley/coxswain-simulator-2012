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
    
    this.cameraDistance = 10;
    this.cameraLookVector;
    
    this.maxCameraWobbleTimeout = 0.7;
    this.cameraWobbleTimeout = 0;
    this.cameraWobbleFactor = 1;
    
    this.lastCameraWobble = new THREE.Vector3(0, 0, 0);
      
    this.setCameraPosition(new THREE.Vector3().add(new THREE.Vector3(0, 0, 0), new THREE.Vector3(0, 10, 10)));
  }

  // Inherit BoatPhysics
  ChaseCamera.prototype = new BoatPhysics();

  // Correct the constructor pointer because it points to ChaseCamera
  ChaseCamera.prototype.constructor = ChaseCamera;

  ChaseCamera.prototype.update = function (delta) {
    BoatPhysics.prototype.update.call(this, delta);

    this.updateView();
  }

  ChaseCamera.prototype.setCameraPosition = function (cameraPos) {
    this.cameraPos = cameraPos;
    this.cameraLookVector = new THREE.Vector3().sub(this.lookAtPos, this.cameraPos);
  }

  ChaseCamera.prototype.updateView = function () {
    // This function is an abomination of misunderstanding and hacks. Do better!

    this.cameraLookVector = this.boatDir.clone();
    
    this.cameraLookVector.multiplyScalar(-this.cameraDistance);

    this.cameraPos = new THREE.Vector3().add(this.lookAtPos, this.cameraLookVector).addSelf(this.boatUp).addSelf(this.boatUp).addSelf(this.boatUp);
  
    // Is the camera wobbling?
    if (this.cameraWobbleTimeout > 0) {
      // This should pick up on the frametime
      this.cameraWobbleTimeout -= 1/60;
      if (this.cameraWobbleTimeout < 0) {
        this.cameraWobbleTimeout = 0;
      }
    }
    
    // Add camera shake if camera wobble effect is on
    // and if in game (check if we're zooming in at start)
    if (this.cameraWobbleTimeout > 0) {
      var effectStrength = 0.1 * this.cameraWobbleFactor * (this.cameraWobbleTimeout / this.maxCameraWobbleTimeout);
      this.lastCameraWobble.multiplyScalar(0.8).addSelf(new THREE.Vector3(Math.random(), 0, Math.random()).normalize().multiplyScalar(effectStrength));
    }
    
    
  }
  
  ChaseCamera.prototype.wobbleCamera = function (wobbleFactor) {
    this.cameraWobbleTimeout = this.maxCameraWobbleTimeout;
    this.cameraWobbleFactor = wobbleFactor;
  }
  
  return ChaseCamera;
});