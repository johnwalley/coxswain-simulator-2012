/**
 * @author John Walley / http://www.walley.org.uk/
 */

define([
'common/Player', 
'client/Input',
'client/SoundManager',
'Landscape', 
'BaseGame', 
'client/SkyBox', 
'../../lib/dat.gui.js', 
'../../lib/Three.js', 
'../../lib/Stats.js',
'../../lib/RequestAnimationFrame.js',
'../../lib/socket.io.js'],
function (Player, Input, SoundManager, Landscape, BaseGame, SkyBox) {
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

    this.drawMesh = {
      landscape: true,
      river: true,
      boat: true
    };
  
    this.clock = new THREE.Clock();
    this.startTime = this.clock.elapsedTime;
    this.elapsedTime = 0;
    
    // Set up renderer
    this.renderer = new THREE.WebGLRenderer({ antialias: true });
    var container = document.getElementById("container");
    //this.renderer.setSize(container.clientWidth, 
    //                      container.clientHeight);
    this.renderer.setSize(window.innerWidth, window.innerHeight);         
                          
    this.mlib = {};
  
    // Client only properties, rendering, input, sound, etc.
    this.input = new Input(this.renderer.domElement);
    this.camera = new THREE.PerspectiveCamera( BaseGame.fieldOfView, container.clientWidth / container.clientHeight, BaseGame.nearPlane, BaseGame.farPlane );
    
    this.level = 'cam';

    // Common properties, i.e. physics engine
    this.landscape = new Landscape(this.level);
    
    this.sound = new SoundManager();

    // Game screens stack
    this.gameScreens = [];
    
    //this.gameScreens.push(new MainMenu());
    //this.gameScreens.push(new SplashScreen());
    
    this.player = new Player(this.input, this.landscape); // TODO: Decouple input from physics - make event driven?
    
    this.mode = Client.SINGLEPLAYER;
    this.opponent = new Player();
    this.opponent.boatPos = this.player.boatPos.clone();
    this.opponent.boatPos.x -= 4;
    
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
      
    // Chrome
    this.stats = new Stats();
    
    // Diagnostic GUI
    // http://workshop.chromeexperiments.com/examples/gui
    this.gui = new dat.GUI();
    
    this.gui.add(this, 'elapsedTime').name('Time').listen();
    
    var f1 = this.gui.addFolder('Boat');
    
    f1.add(this.player, 'speed').listen();
    f1.add(this.player.boatPos, 'x').listen();
    f1.add(this.player.boatPos, 'z').listen();
    f1.add(this.player, 'boatAngle').name('Boat Angle').listen();
    f1.open();
    
    var f2 = this.gui.addFolder('Camera');
    
    f2.add(this.player.cameraPos, 'x').listen();
    f2.add(this.player.cameraPos, 'z').listen();
    //f2.open();
    
    var f3 = this.gui.addFolder('River');
    
    f3.add(this.player, 'riverSegmentNumber').listen();
    f3.open();    
    
    this.stats.update();
  
  }
  
  Client.prototype = {
    SINGLEPLAYER: 1,
    MULTIPLAYER: 2,
    get inMenu () {
      return false;
    },
    get inGame () {
      return true;
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
  
    delta = this.clock.getDelta();
    // this.input.update();
    // this.sound.update();
    this.elapsedTime = this.clock.elapsedTime - this.startTime;
    this.player.update(delta);
    
    // Are we racing against someone?
    if (this.mode == Client.MULTIPLAYER) {
      // Send our position to the server
      this.socket.emit('state', {x:this.player.boatPos.x, y:this.player.boatPos.y, z:this.player.boatPos.z});      
    }
    
    this.camera.position = this.player.cameraPos.clone();
    // Lean camera when turning?
    this.camera.lookAt(this.player.lookAtPos);
    this.camera.position.addSelf(this.player.lastCameraWobble);
    
    this.lightMesh.rotation.y = -this.player.boatAngle;
    
    this.skyBox.target = this.player.boatDir;
    
    this.uniformsNoise.time.value += delta/20;
    this.uniformsNormalMap["uOffset"].value.y -= delta/10;
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
    // Handle current screen
    //if (this.gameScreens.peek().render()) {
    //  this.sound.play();
    //}
    this.skyBox.camera.lookAt(this.skyBox.target); 

    this.renderer.clear();
    this.quadTarget.materials = this.mlib["noise"];
    this.renderer.render( this.sceneRenderTarget, this.cameraOrtho, this.noiseMap, true );

    this.quadTarget.materials[0] = this.mlib["normal"];
    this.renderer.render( this.sceneRenderTarget, this.cameraOrtho, this.normalMap, true );

    this.quadTarget.materials[0] = this.mlib["color"];
    this.mlib["color"].uniforms.colorRamp.texture = this.specularRampTexture;
    //this.renderer.render( this.sceneRenderTarget, this.cameraOrtho, this.specularMap, true );
    
    this.camera.position.y = 5;;
    
    this.renderer.clear();
    this.renderer.render(this.skyBox.scene, this.skyBox.camera);  
    this.renderer.render(this.scene, this.camera);
  }

  /**
   * Initialisation function
   * Does a lot of heavy lifting currently
   */
  Client.prototype.init = function () {

    // Initialise renderer
    //this.renderer.setSize( window.innerWidth, window.innerHeight );
    this.renderer.autoClear = false;
    this.renderer.shadowMapEnabled = true;
    
    // Draw to specified dom element
    container = document.getElementById( 'container' );
    container.appendChild( this.renderer.domElement );

    // Main scene. Holds river, landscape and player model
    scene = new THREE.Scene();
    //scene.fog = new THREE.FogExp2(0x000033, 0.01);

    // TODO: Transition to z axis being up
    //camera.up = THREE.Vector3(0, 1, 0);
    //this.camera.position.set(72, 8, 105);
     
    scene.add(this.camera);
    
    // Add ambient light
    var ambientLight = new THREE.AmbientLight(0x554422);
    scene.add(ambientLight);

    var directionalLight = new THREE.DirectionalLight(0xaaddcc);
    directionalLight.position = BaseGame.lightDirection;
    directionalLight.castShadow = true;
    //scene.add(directionalLight);    

    var spotlight = new THREE.SpotLight( 0xd2cfb9, 2, 0 );
    spotlight.position.set( 200, 150, 200 );
    scene.add( spotlight );    
                          
    /* In general objects know how to construct their own meshes.
       However they do not have responsibility for rendering themselves. I wish
       to decouple the renderer as much as possible from the physics engine */
    
    if (this.drawMesh.landscape) {
      // Generate landscape and add to scene
      leftBankMesh = this.landscape.generateMesh()[0];
      //leftBankMesh.castShadow = true;
      rightBankMesh = this.landscape.generateMesh()[1];
      //rightBankMesh.castShadow = true;    
      //scene.add(leftBankMesh);
      //scene.add(rightBankMesh);
    }
    
    // Generate river and add to scene
    riverMesh = this.landscape.river.generateMesh();
    //riverMesh.receiveShadow = true;
    //scene.add(riverMesh);
    
    // Generate boat model and add to scene
    pointLight = new THREE.PointLight(0xff1111, 1, 100);
    pointLight.position = this.player.boatPos;
    scene.add(pointLight);
    
    sphere = new THREE.CubeGeometry(8, 1, 1.5, 4, 1, 2);
    lightMesh = new THREE.Mesh(sphere, new THREE.MeshPhongMaterial({color: 0xff0000}));
    lightMesh.scale.set(0.5, 0.5, 0.5);
    lightMesh.position = pointLight.position;
    scene.add(lightMesh);

    pointLight = new THREE.PointLight(0x0000aa, 1, 100);
    pointLight.position = this.opponent.boatPos;
    scene.add(pointLight);
    
    sphere = new THREE.CubeGeometry(8, 1, 1.5, 4, 1, 2);
    var lightMesh2 = new THREE.Mesh(sphere, new THREE.MeshPhongMaterial({color: 0x0000ff}));
    lightMesh2.scale.set(0.5, 0.5, 0.5);
    lightMesh2.position = pointLight.position;
    scene.add(lightMesh2);
    
    scene.add(this.camera);
    
    // SkyBox
    var skyBox = new SkyBox();
    
    skyBox.scene.add(skyBox.generateMesh('night/fade/'));
    
    skyBox.scene.add(skyBox.camera);
    
    // Water surface
    this.cameraOrtho = new THREE.Camera();
    this.cameraOrtho.projectionMatrix = THREE.Matrix4.makeOrtho( window.innerWidth / - 2, window.innerWidth / 2, window.innerHeight / 2, window.innerHeight / - 2, -10000, 10000 );
    this.cameraOrtho.position.z = 100;
    this.sceneRenderTarget = new THREE.Scene();

    // Noise
    var rx = 512, ry = 512;
    var pars = {minFilter: THREE.LinearMipmapLinearFilter, magFilter: THREE.LinearFilter, format: THREE.RGBFormat};

    this.noiseMap  = new THREE.WebGLRenderTarget( rx, ry, pars );
    this.normalMap = new THREE.WebGLRenderTarget( rx, ry, pars );
    this.colorMap  = new THREE.WebGLRenderTarget( rx, ry, pars );
    this.specularMap = new THREE.WebGLRenderTarget( rx, ry, pars );

    this.uniformsNoise = {
      time:  { type: "f", value: 1.0 },
      scale: { type: "v2", value: new THREE.Vector2( 2, 2 ) }
    };

    this.uniformsNormal = {
      height:  	{ type: "f",  value: 0.075 },
      resolution: { type: "v2", value: new THREE.Vector2( rx, ry ) },
      scale: 		{ type: "v2", value: new THREE.Vector2( 1, 1 ) },
      heightMap:  { type: "t",  value: 1, texture: this.noiseMap }
    };
    
    var rwidth = 256, rheight = 1, rsize = rwidth * rheight;

    var tcolor = new THREE.Color( 0xffffff );
        
    // Specular ramp data
    var dataSpecular = new Uint8Array( rsize * 3 );

    for ( var i = 0; i < rsize; i ++ ) {
      var h = i / 255;

      tcolor.setHSV( 0.0, 0.0, 1 - h );

      dataSpecular[i * 3] 	  = Math.floor( tcolor.r * 255 );
      dataSpecular[i * 3 + 1] = Math.floor( tcolor.g * 255 );
      dataSpecular[i * 3 + 2] = Math.floor( tcolor.b * 255 );
    }    
    
    // Ramp textures
    this.specularRampTexture = new THREE.DataTexture( dataSpecular, rwidth, rheight, THREE.RGBFormat );
    this.specularRampTexture.needsUpdate = true;

    var colorRampTexture;
    
    this.uniformsColor = {
      scale: 		{ type: "v2", value: new THREE.Vector2( 1, 1 ) },
      heightMap:  { type: "t",  value: 1, texture: this.noiseMap },
      colorRamp:  { type: "t",  value: 2, texture: colorRampTexture }
    };

    var vertexShader = document.getElementById('vertexShader').textContent;
    var vertexShaderFlip = document.getElementById('vertexShaderFlip').textContent;    
    
    // Normal

    var normalShader = THREE.ShaderUtils.lib["normal"];

    uniformsNormalMap = THREE.UniformsUtils.clone( normalShader.uniforms );

    uniformsNormalMap["tNormal"].texture = this.normalMap;
    //uniformsNormalMap["uNormalScale"].value = 100.25;

    uniformsNormalMap["tDiffuse"].texture = this.colorMap;
    uniformsNormalMap["tSpecular"].texture = this.specularMap;
    uniformsNormalMap["tAO"].texture = this.noiseMap;

    uniformsNormalMap["enableAO"].value = true;
    uniformsNormalMap["enableDiffuse"].value = false;
    uniformsNormalMap["enableSpecular"].value = true;

    uniformsNormalMap["uDiffuseColor"].value.setHex( 0x202336 );
    uniformsNormalMap["uSpecularColor"].value.setHex( 0xd2cfb9 );
    uniformsNormalMap["uAmbientColor"].value.setHex( 0x1a1d21 );

    uniformsNormalMap["uShininess"].value = 20;

    uniformsNormalMap["enableReflection"].value = true;
    //uniformsNormalMap["tCube"].texture = skyBox.texture;
    uniformsNormalMap["uReflectivity"].value = 0.40;

    uniformsNormalMap["tNormal"].texture.wrapS = uniformsNormalMap["tNormal"].texture.wrapT = THREE.MirroredRepeatWrapping;
    uniformsNormalMap["tSpecular"].texture.wrapS = uniformsNormalMap["tSpecular"].texture.wrapT = THREE.MirroredRepeatWrapping;
    uniformsNormalMap["tAO"].texture.wrapS = uniformsNormalMap["tAO"].texture.wrapT = THREE.MirroredRepeatWrapping;

    uniformsNormalMap["uRepeat"].value = new THREE.Vector2(20,80);
    
    this.uniformsNormalMap = uniformsNormalMap;

    var size = 1.25,
      params = [
            ['noise', 		document.getElementById( 'fragmentShaderNoise' ).textContent, 	vertexShader, this.uniformsNoise, false, false],
            ['normal', 	document.getElementById( 'fragmentShaderNormal' ).textContent,  vertexShaderFlip, this.uniformsNormal, false, false],
            ['color', 		document.getElementById( 'fragmentShaderColormap' ).textContent,  vertexShaderFlip, this.uniformsColor, false, false],
            ['normalmap', 	normalShader.fragmentShader, normalShader.vertexShader, uniformsNormalMap, true, true]
          ];

    for( var i = 0; i < params.length; i ++ ) {
      material = new THREE.ShaderMaterial( {

        uniforms: 		params[i][3],
        vertexShader: 	params[i][2],
        fragmentShader: params[i][1],
        lights: 		params[i][4],
        fog: 		params[i][5]
        } );

      this.mlib[params[i][0]] = material;
    }    
    
    var plane = new THREE.PlaneGeometry(window.innerWidth, window.innerHeight);

    this.quadTarget = new THREE.Mesh(plane, new THREE.MeshBasicMaterial({color: 0xff0000}));
    this.quadTarget.position.z = -500;
    this.sceneRenderTarget.add(this.quadTarget);    
    
    // Surface
    var plane = new THREE.PlaneGeometry( 5000, 5000, 1, 1 );
    
    plane.computeFaceNormals();
    plane.computeVertexNormals();
    plane.computeTangents();
    
    var meshPlane = new THREE.Mesh(plane, this.mlib["normalmap"]);
    meshPlane.rotation.x = -Math.PI / 2;
    scene.add( meshPlane );

    this.scene = scene;  
    this.skyBox = skyBox;
    
    this.pointLight = pointLight;
    this.lightMesh = lightMesh;
    
    this.stats.domElement.style.position = 'absolute';
    this.stats.domElement.style.top = '0px';
    //container.appendChild( this.stats.domElement );
  }
  
  return Client;
});