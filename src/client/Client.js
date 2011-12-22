/**
 * @author John Walley / http://www.walley.org.uk/
 */

/**
 * Main entry class for our game
 * @constructor
 */
function Client() {

  // Client only properties, rendering, input, sound, etc.
  this.input = new Input();
  this.camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 0.5, 8000 );
  this.stats = new Stats();
  
  // Set up renderer
  this.renderer = new THREE.WebGLRenderer( { antialias: true } );
  
  this.level = 'cam';

  // Common properties, i.e. physics engine
  this.player = new Player(this.input); // TODO: Decouple input from physics - make event driven?
  this.landscape = new Landscape(this.level);

  // Test connection to server
  try {
    this.socket = io.connect('http://localhost:27960');
    
    this.socket.on('motd', function (data) {
    console.log(data.motd);
    });    
  } catch (e){
    console.log('Unable to connect to server');
  }
  

}


Client.prototype.run = function () {
  this.init();
  // Game loop
  this.step();
}

Client.prototype.step = function () {
  this.update();
  this.draw();
  requestAnimationFrame(this.step.bind(this));
}

Client.prototype.update = function () {
  // this.input.update();
  // this.sound.update();
  this.player.update(this.clock.getDelta());
  
  this.camera.position = this.player.cameraPos;
  this.camera.lookAt(this.player.lookAtPos);
  
  this.skyBox.target.x = -Math.cos(this.camera.rotation.y);
  this.skyBox.target.y = 0;
  this.skyBox.target.z = -Math.sin(this.camera.rotation.y);
  
  this.stats.update();
}

/**
 * Draw
 * @param gameTime Game time
 */
Client.prototype.draw = function (gameTime) {
  this.render();
  // this.uiRenderer.render();
}

Client.prototype.render = function () {
  this.skyBox.camera.lookAt(this.skyBox.target);  
	this.renderer.render(this.skyBox.scene, this.skyBox.camera);  
  this.renderer.render(this.scene, this.camera);
}

/**
 * Initialisation function
 * Does a lot of heavy lifting currently
 */
Client.prototype.init = function () {

  // Initialise renderer
  this.renderer.setSize( window.innerWidth, window.innerHeight );
  this.renderer.autoClear = false;
  
  // Draw to specified dom element
  container = document.getElementById( 'container' );
  container.appendChild( this.renderer.domElement );

  // Main scene. Holds river, landscape and player model
  scene = new THREE.Scene();
  scene.fog = new THREE.Fog( 0x58c2c0, 1, 800 );

  // TODO: Transition to z axis being up
  //camera.up = THREE.Vector3(0, 1, 0);
  this.camera.position.set(72, 8, 105);
   
  scene.add(this.camera);
  
  // Add ambient light
  var ambientLight = new THREE.AmbientLight(0xffffff);
  scene.add(ambientLight);

  var directionalLight = new THREE.DirectionalLight(0xffff44);
  directionalLight.position = BaseGame.lightDirection.normalize();
  scene.add(directionalLight);     
                        
  /* In general objects know how to construct their own meshes.
     However they do not have responsibility for rendering themselves. I wish
     to decouple the renderer as much as possible from the physics engine */
                        
  // Generate landscape and add to scene
  scene.add(this.landscape.generateMesh()[0]);
  scene.add(this.landscape.generateMesh()[1]);
  
  // Generate river and add to scene
  scene.add(this.landscape.river.generateMesh());
  
  scene.add(this.camera);
  
  var skyBox = new SkyBox();
  
  skyBox.scene.add(skyBox.generateMesh());
  
  this.scene = scene;  
  this.skyBox = skyBox;
  
  this.stats.domElement.style.position = 'absolute';
  this.stats.domElement.style.top = '0px';
  container.appendChild( this.stats.domElement );
  
  this.clock = new THREE.Clock();
}