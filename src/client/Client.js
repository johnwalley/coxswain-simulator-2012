/**
 * @author John Walley / http://www.walley.org.uk/
 */

 define(['common/Player', 'client/Input'], function (Player, Input) {
  /** 
    A module representing the client
    @exports Client
    @version 1.0
   */
 
  /**
   * Main entry class for our game
   * @constructor
   */
  function Client() {

    // Client only properties, rendering, input, sound, etc.
    this.input = new Input();
    this.camera = new THREE.PerspectiveCamera( 90, window.innerWidth / window.innerHeight, 0.5, 8000 );
    this.stats = new Stats();
    
    // Set up renderer
    this.renderer = new THREE.WebGLRenderer({ antialias: true });
    
    this.level = 'cam';

    // Common properties, i.e. physics engine
    this.landscape = new Landscape(this.level);
    
    
    this.player = new Player(this.input, this.landscape); // TODO: Decouple input from physics - make event driven?
    
    this.mode = Client.MULTIPLAYER;
    this.opponent = new Player();
    this.opponent.boatPos = this.player.boatPos.clone();
    
    // Test connection to server
    this.socket = io.connect('http://localhost:27960');
    
    this.socket.on('motd', function (data) {
      console.log(data.motd);
    });

    // Experimental multiplayer support (client acts as spectator)
    this.socket.on('state', (function(data) {
      this.opponent.boatPos.set(data.x, data.y, data.z);
    }).bind(this));  
    
    this.socket.emit('join', { name: 'marv' });
  }
  
  Client.prototype = {
    SINGLEPLAYER: 1,
    MULTIPLAYER: 2
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
    
    // Are we racing against someone?
    if (this.mode == Client.MULTIPLAYER) {
      // Send our position to the server
      this.socket.emit('state', {x:this.player.boatPos.x, y:this.player.boatPos.y, z:this.player.boatPos.z});      
    }
    
    this.camera.position = this.player.cameraPos;
    this.camera.lookAt(this.player.boatPos);
    
    //this.pointLight.position = this.player.boatPos;
    //this.lightMesh.position = this.player.boatPos;
    
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
    this.renderer.shadowMapEnabled = true;
    
    // Draw to specified dom element
    container = document.getElementById( 'container' );
    container.appendChild( this.renderer.domElement );

    // Main scene. Holds river, landscape and player model
    scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x000000, 0.01);

    // TODO: Transition to z axis being up
    //camera.up = THREE.Vector3(0, 1, 0);
    //this.camera.position.set(72, 8, 105);
     
    scene.add(this.camera);
    
    // Add ambient light
    var ambientLight = new THREE.AmbientLight(0xaabbcc);
    scene.add(ambientLight);

    var directionalLight = new THREE.DirectionalLight(0x666666);
    directionalLight.position = BaseGame.lightDirection.normalize();
    directionalLight.castShadow = true;
    //scene.add(directionalLight);     
                          
    /* In general objects know how to construct their own meshes.
       However they do not have responsibility for rendering themselves. I wish
       to decouple the renderer as much as possible from the physics engine */
                          
    // Generate landscape and add to scene
    leftBankMesh = this.landscape.generateMesh()[0];
    //leftBankMesh.castShadow = true;
    rightBankMesh = this.landscape.generateMesh()[1];
    //rightBankMesh.castShadow = true;    
    scene.add(leftBankMesh);
    scene.add(rightBankMesh);
    
    // Generate river and add to scene
    riverMesh = this.landscape.river.generateMesh();
    //riverMesh.receiveShadow = true;
    scene.add(riverMesh);
    
    // Generate boat model and add to scene
    pointLight = new THREE.PointLight(0xaaffaa, 1, 100);
    pointLight.position = this.player.boatPos;
    scene.add(pointLight);
    
    sphere = new THREE.SphereGeometry(8, 16, 8, 1);
    lightMesh = new THREE.Mesh(sphere, new THREE.MeshBasicMaterial({color: 0x00ff00}));
    lightMesh.scale.set(0.05, 0.05, 0.05);
    lightMesh.position = pointLight.position;
    scene.add(lightMesh);

    pointLight = new THREE.PointLight(0xaaaaff, 1, 100);
    pointLight.position = this.opponent.boatPos;
    scene.add(pointLight);
    
    sphere = new THREE.SphereGeometry(8, 16, 8, 1);
    lightMesh = new THREE.Mesh(sphere, new THREE.MeshBasicMaterial({color: 0x0000ff}));
    lightMesh.scale.set(0.05, 0.05, 0.05);
    lightMesh.position = pointLight.position;
    scene.add(lightMesh);
    
    scene.add(this.camera);
    
    var skyBox = new SkyBox();
    
    skyBox.scene.add(skyBox.generateMesh('night/fade/'));
    
    this.scene = scene;  
    this.skyBox = skyBox;
    
    this.pointLight = pointLight;
    this.lightMesh = lightMesh;
    
    this.stats.domElement.style.position = 'absolute';
    this.stats.domElement.style.top = '0px';
    container.appendChild( this.stats.domElement );
    
    this.clock = new THREE.Clock();
  }
  
  return Client;
});