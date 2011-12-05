/**
 * Base game class for all the basic game support.
 * Connects all our helper classes together and makes our life easier!
 */
var BaseGame = (function () {
  return {
    fieldOfView: Math.PI/2,
    nearPlane: 0.5,
    farPlane: 2000,
    
    // These can change, e.g. the user could resize the window
    width: window.innerWidth,
    height: window.innerWidth,
    
    lightDirection: new THREE.Vector3(0, 1, 1),
    
    elapsedTimeThisFrameInMs: 0.001,
    totalTimeMs: 0,
    lastFrameTotalTimeMs: 0,
    startTimeThisSecond: 0,
  }
}());
