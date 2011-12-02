/**
 * Base game class for all the basic game support.
 * Connects all our helper classes together and makes our life easier!
 * @constructor
 */
function BaseGame() {
  this.fieldOfView = Math.PI/2;
  this.nearPlane = 0.5;
  this.farPlane = 2000;
  
  // These can change, e.g. the user could resize the window
  this.width = window.innerWidth;
  this.height = window.innerWidth;
  
  this.lightDirection = new THREE.Vector3(-1, 1, -0.5);
  
  this.elapsedTimeThisFrameInMs = 0.001;
  this.totalTimeMs = 0;
  this.lastFrameTotalTimeMs = 0;
  this.startTimeThisSecond = 0;
  
  this.applyResolutionChange();
  
}

/**
 * Handle anything that is affected by the canvas size changing
 */
BaseGame.prototype.applyResolutionChange = function () {

}