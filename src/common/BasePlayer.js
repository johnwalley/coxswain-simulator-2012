/**
 * @author John Walley / http://www.walley.org.uk/
 */

define(function () { 
  /**
   * Base player helper class, holds all the current game values:
   * Game time, game over, level number, victory.
   * More stuff that has impact to the CarController or ChaseCamera classes
   * should be included here, else add them directly to the Player class,
   * which handles all the game logic.
   * For example adding items or powerups should be done in this class
   * if they affect the speed or physics of our car.
   * For multiplayer purposes this class should be extended to assign
   * a player id to each player and link the network stuff up here.
   * @constructor
   */
   function BasePlayer() {
    this.currentGameTimeInMilliseconds = 0;
    this.startGameZoomTimeMilliseconds = 5000;
    this.zoomInTime = this.startGameZoomTimeMilliseconds;
    this.startGameZoomedInTime = 3000;
    this.firstFrame = true;
   }
   
   BasePlayer.prototype = {
    get gameTimeMilliseconds() {
      return this.currentGameTimeMilliseconds - this.zoomInTime;
    },
    get canControlCar() {
      return this.zoomInTime <= 0;
    }
  }

  BasePlayer.prototype.update = function (delta) {
    if (this.firstFrame) {
      this.firstFrame = false;
      return
    }

    if (this.zoomInTime > 0) {
      var lastZoomInTime = this.zoomInTime;
      this.zoomInTime -= delta;
      if (this.zoomInTime < 2000 && ((lastZoomInTime + 1000) / 1000) != ((this.zoomInTime + 1000) / 1000))
      {
        // Handle start
      }    
    }
    
    if (!this.canControlBoat) {
      return
    }
    
    this.currentGameTimeMilliseconds += delta;  
  }

  return BasePlayer;
});