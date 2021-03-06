/**
 * @author John Walley / http://www.walley.org.uk/
 */
 
define(function () { 
  /**
   * Input
   * @constructor
   */
  function Input(domElement) {

    this.domElement = ( domElement !== undefined ) ? domElement : document;

    this.mouseX = 0;
    this.mouseY = 0;  
    
    this.moveForward = false;
    this.moveBackward = false;
    this.moveLeft = false;
    this.moveRight = false;  
    
    if (this.domElement === document) {
      this.viewHalfX = window.innerWidth / 2;
      this.viewHalfY = window.innerHeight / 2;
    } else {
      this.viewHalfX = this.domElement.width / 2;
      this.viewHalfY = this.domElement.height / 2;
      this.domElement.setAttribute( 'tabindex', -1 );
    }  

    this.onMouseMove = function ( event ) {

      if ( this.domElement === document ) {

        this.mouseX = (event.pageX - this.viewHalfX)/this.viewHalfX;
        this.mouseY = event.pageY - this.viewHalfY;

      } else {

        this.mouseX = event.pageX - this.domElement.offsetLeft - this.viewHalfX;
        this.mouseY = event.pageY - this.domElement.offsetTop - this.viewHalfY;

      }

    };
    
    this.onMouseDown = function ( event ) {
      if ( this.domElement !== document ) {

        this.domElement.focus();

      }

      event.preventDefault();
      event.stopPropagation();

      switch ( event.button ) {

        case 0: this.moveForward = true; break;
        case 2: this.moveBackward = true; break;

      }
      this.mouseDragOn = true;
    };

    this.onMouseUp = function ( event ) {

      event.preventDefault();
      event.stopPropagation();

      switch ( event.button ) {

        case 0: this.moveForward = false; break;
        case 2: this.moveBackward = false; break;

      }

      this.mouseDragOn = false;

    };
    
    this.onKeyDown = function (event) {
      switch(event.keyCode) {   
        case 38: /*up*/
        case 87: /*W*/ this.moveForward = true; break;

        case 37: /*left*/
        case 65: /*A*/ this.moveLeft = true; break;

        case 40: /*down*/
        case 83: /*S*/ this.moveBackward = true; break;

        case 39: /*right*/
        case 68: /*D*/ this.moveRight = true; break;
      }
    };
    
    this.onKeyUp = function (event) {
      switch(event.keyCode) {
        case 38: /*up*/
        case 87: /*W*/ this.moveForward = false; break;

        case 37: /*left*/
        case 65: /*A*/ this.moveLeft = false; break;

        case 40: /*down*/
        case 83: /*S*/ this.moveBackward = false; break;

        case 39: /*right*/
        case 68: /*D*/ this.moveRight = false; break;
      }
    };  
    
    // Wire up listeners
    this.domElement.addEventListener('mousemove', this.onMouseMove.bind(this), false );
    this.domElement.addEventListener('mousedown', this.onMouseDown.bind(this), false );    
    this.domElement.addEventListener('mouseup', this.onMouseUp.bind(this), false );        
    this.domElement.addEventListener('keydown', this.onKeyDown.bind(this), false);
    this.domElement.addEventListener('keyup', this.onKeyUp.bind(this), false);
  }

  return Input;
});