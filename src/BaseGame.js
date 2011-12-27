/**
 * @author John Walley / http://www.walley.org.uk/
 */

define(['../lib/Three.js'], function () {
  /** 
    A module representing common properties of the game
    @exports BaseGame
    @version 1.0
   */
   
   /**
   * Base game class for all the basic game support.
   * Connects all our helper classes together and makes our life easier!
   */
  var BaseGame = (function () {
    return {
      fieldOfView: 90,
      nearPlane: 0.5,
      farPlane: 2000,
      
      // These can change, e.g. the user could resize the window
      width: window.innerWidth,
      height: window.innerHeight,
      
      lightDirection: new THREE.Vector3(0.2, 1, 0.5).normalize(),
      
      elapsedTimeThisFrameInMs: 10,
      totalTimeMs: 0,
      lastFrameTotalTimeMs: 0,
      startTimeThisSecond: 0,
    }
  }());
  
  return BaseGame;
});
