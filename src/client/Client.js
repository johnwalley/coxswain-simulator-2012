/**
 * @author John Walley / http://www.walley.org.uk/
 */

/**
 * Main entry class for our game
 * @constructor
 */
function Client() {
  this.input = new Input();
  this.camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 0.5, 8000 );
  this.player = new Player(this.input);
  
  this.level = 'cam';
  this.landscape = null;
  
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
  this.player.update();
  
  this.camera.position = this.player.cameraPos;
  this.camera.lookAt(this.player.lookAtPos);
  
  //this.controls.update( this.clock.getDelta() );

  this.cubeTarget.x = -Math.cos(this.camera.rotation.y);
  this.cubeTarget.y = 0;
  this.cubeTarget.z = -Math.sin(this.camera.rotation.y);
  
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
  this.cameraCube.lookAt(this.cubeTarget);  
  
	this.renderer.render(this.sceneCube, this.cameraCube);  
  this.renderer.render(this.scene, this.camera);
}

/**
 * Initialisation function
 * Does a lot of heavy lifting currently
 */
Client.prototype.init = function () {

  scene = new THREE.Scene();
  //scene.fog = new THREE.Fog( 0x58c2c0, 1, 200 );

  // TODO: Transition to z axis being up
  //camera.up = THREE.Vector3(0, 1, 0);
  this.camera.position.set(72, 8, 105);
  
  controls = new THREE.FirstPersonControls( this.camera );

  controls.movementSpeed = 100;
  controls.lookSpeed = 0.05;
  controls.lookVertical = false;
 
  scene.add(this.camera);
    
  ambientLight = new THREE.AmbientLight(0xffffff);
  scene.add(ambientLight);

  directionalLight = new THREE.DirectionalLight(0xffff44);
  directionalLight.position = BaseGame.lightDirection.normalize();
  scene.add(directionalLight);  
  
  // Landscape
  
  this.landscape = new Landscape(this.level);
    
                        
  //Landscape
  scene.add(this.landscape.generateMesh()[0]);
  scene.add(this.landscape.generateMesh()[1]);
  
  // River
  scene.add(this.landscape.river.generateMesh());
  
  // Skybox
	cameraCube = new THREE.PerspectiveCamera( 60, window.innerWidth / window.innerHeight, 1, 100000 );
  cubeTarget = new THREE.Vector3( 0, 0, 0 );
  sceneCube = new THREE.Scene();
  
  var path = "skybox/";
  var format = '.jpg';
  var urls = [
    path + 'px' + format, path + 'nx' + format,
    path + 'py' + format, path + 'ny' + format,
    path + 'pz' + format, path + 'nz' + format
  ];  
  
  var textureCube = THREE.ImageUtils.loadTextureCube( urls, new THREE.CubeRefractionMapping() );
  

  var shader = THREE.ShaderUtils.lib[ "cube" ];
  shader.uniforms[ "tCube" ].texture = textureCube;

  var cubeMaterial = new THREE.ShaderMaterial( {

    fragmentShader: shader.fragmentShader,
    vertexShader: shader.vertexShader,
    uniforms: shader.uniforms,
    depthWrite: false

  } );

  mesh = new THREE.Mesh( new THREE.CubeGeometry( 1000, 1000, 1000 ), cubeMaterial );
  mesh.flipSided = true;
  sceneCube.add( mesh );
  sceneCube.add(cameraCube);

  renderer = new THREE.WebGLRenderer( { antialias: true } );
  renderer.setSize( window.innerWidth, window.innerHeight );
  renderer.autoClear = false;
  
  container = document.getElementById( 'container' );

  container.appendChild( renderer.domElement );
  
  this.scene = scene;
  this.renderer = renderer;
  this.controls = controls;
  
  this.cameraCube = cameraCube;
  this.sceneCube = sceneCube;
  this.cubeTarget = cubeTarget;
  
  this.stats = new Stats();
  this.stats.domElement.style.position = 'absolute';
  this.stats.domElement.style.top = '0px';
  container.appendChild( this.stats.domElement );
  
  this.clock = new THREE.Clock();
}