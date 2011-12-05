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
function ChaseCamera() {
  // Call the parent constructor
  BoatPhysics.call(this);
  
  this.cameraPos = new THREE.Vector3().add(new THREE.Vector3(0, 0, 0), new THREE.Vector3(0, 10, 10));
}

// Inherit BoatPhysics
ChaseCamera.prototype = new BoatPhysics();

// Correct the constructor pointer because it points to ChaseCamera
ChaseCamera.prototype.constructor = ChaseCamera;

ChaseCamera.prototype.update = function () {
  BoatPhysics.prototype.update.call(this);  
}
