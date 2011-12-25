/**
 * @author John Walley / http://www.walley.org.uk/
 */

define(function () {
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
      fieldOfView: Math.PI/2,
      nearPlane: 0.5,
      farPlane: 2000,
      
      // These can change, e.g. the user could resize the window
      width: window.innerWidth,
      height: window.innerWidth,
      
      lightDirection: {x: 0.2, y: 1, z: 1},
      
      elapsedTimeThisFrameInMs: 10,
      totalTimeMs: 0,
      lastFrameTotalTimeMs: 0,
      startTimeThisSecond: 0,
    }
  }());
  
  return BaseGame;
});
