/**
 * @author John Walley / http://www.walley.org.uk/
 */

/**
 * Main entry class for our game
 * @constructor
 */
function CoxSimManager() {
  input = new Input();
  camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 0.5, 8000 );
  this.player = new Player(input, camera);
  
  this.level = 'cam';
  
  
  this.landscape = null;
}


CoxSimManager.prototype.run = function () {
  this.init();
  // Game loop
  this.step();
}

CoxSimManager.prototype.step = function () {
  this.update();
  this.draw();
  requestAnimationFrame(this.step.bind(this));
}

CoxSimManager.prototype.update = function () {
  // this.input.update();
  // this.sound.update();
  this.player.update();
  
  //this.controls.update( this.clock.getDelta() );

  this.cubeTarget.x = -Math.cos(this.player.camera.rotation.y);
  this.cubeTarget.y = 0;
  this.cubeTarget.z = -Math.sin(this.player.camera.rotation.y);
  
  this.stats.update();
}

/**
 * Draw
 * @param gameTime Game time
 */
CoxSimManager.prototype.draw = function (gameTime) {
  this.render();
  // this.uiRenderer.render();
}

CoxSimManager.prototype.render = function () {
  this.cameraCube.lookAt(this.cubeTarget);  
  
	this.renderer.render(this.sceneCube, this.cameraCube);  
  this.renderer.render(this.scene, this.player.camera);
}

CoxSimManager.prototype.init = function () {

  scene = new THREE.Scene();
  //scene.fog = new THREE.Fog( 0x58c2c0, 1, 200 );

  // TODO: Transition to z axis being up
  //camera.up = THREE.Vector3(0, 1, 0);
  this.player.camera.position.x = 72;
  this.player.camera.position.y = 8;
  this.player.camera.position.z = 105;
  
  controls = new THREE.FirstPersonControls( this.player.camera );

  controls.movementSpeed = 100;
  controls.lookSpeed = 0.05;
  controls.lookVertical = false;
 
  scene.add(this.player.camera);
    
  ambientLight = new THREE.AmbientLight(0xffffff);
  scene.add(ambientLight);

  directionalLight = new THREE.DirectionalLight(0xffff44);
  directionalLight.position = BaseGame.lightDirection.normalize();
  scene.add(directionalLight);  
  
  // Landscape
  
  this.landscape = new Landscape(this.level);
  
  //landscape = new Landscape();
  //landscapeGeometry = new THREE.Geometry();
  //
  //for (var num = 0; num < landscape.vertices.length; num++) {
  //  landscapeGeometry.vertices.push(new THREE.Vertex(landscape.vertices[num].pos));
  //}    
  //  
  //landscapeGeometry.faceVertexUvs[0] = [];   
  //
  //var uvs;
  //var offset = 0;
  //while ( offset < landscape.indices.length ) {
  //
  //  face = new THREE.Face3();
  //
  //  uvs = new Array(3);
  //  
  //  uvs[0] = new THREE.UV(landscape.vertices[landscape.indices[offset]].uv.x, 
  //  landscape.vertices[landscape.indices[offset]].uv.y);
  //  //face.vertexNormals.push(new THREE.Vector3(1,1,0));
  //  //face.vertexNormals.push(new THREE.Vector3().copy(landscape.vertices[landscape.indices[offset]].normal));
  //  face.a = landscape.indices[ offset++ ];
  //  
  //  uvs[1] = new THREE.UV(landscape.vertices[landscape.indices[offset]].uv.x, 
  //  landscape.vertices[landscape.indices[offset]].uv.y);  
  //  //face.vertexNormals.push(new THREE.Vector3(1,1,0));
  //  //face.vertexNormals.push(new THREE.Vector3().copy(landscape.vertices[landscape.indices[offset]].normal));
  //  face.b = landscape.indices[ offset++ ];
  //  
  //  uvs[2] = new THREE.UV(landscape.vertices[landscape.indices[offset]].uv.x, 
  //  landscape.vertices[landscape.indices[offset]].uv.y);    
  //  //face.vertexNormals.push(new THREE.Vector3(1,1,0));
  //  //face.vertexNormals.push(new THREE.Vector3().copy(landscape.vertices[landscape.indices[offset]].normal));    
  //  face.c = landscape.indices[ offset++ ]; 
  //
  //  landscapeGeometry.faces.push(face);
  //  landscapeGeometry.faceVertexUvs[0].push(uvs);    
  //}
  //
  //landscapeGeometry.computeFaceNormals();
	//landscapeGeometry.computeVertexNormals();
  //  
  //landscapeMaterial = new THREE.MeshLambertMaterial( { color: 0x55ff33, ambient: 0x555533, shading: THREE.FlatShading, wireframe: false } );  
  //
  //var landscapeMesh = new THREE.Mesh( landscapeGeometry, landscapeMaterial );
  //
  //landscapeMesh.position.x = -500;
  //landscapeMesh.position.y = -10;
  //landscapeMesh.position.z = -500;
  //scene.add(landscapeMesh);    
                        
  geometry0 = new THREE.Geometry();
  
  var landscapeLeftPts = [];
  var landscapeRightPts = [];
  
  for (var num = 0; num < this.landscape.river.riverVertices.length; num++) {
    geometry0.vertices.push(new THREE.Vertex(this.landscape.river.riverVertices[num].pos));
    if (!(num % 5)) {
      landscapeLeftPts.push( new THREE.Vector2( this.landscape.river.riverVertices[num].pos.x, this.landscape.river.riverVertices[num].pos.z ) );  
    }
    if (!((num+1) % 5)) {
      landscapeRightPts.push( new THREE.Vector2( this.landscape.river.riverVertices[num].pos.x, this.landscape.river.riverVertices[num].pos.z ) );        
    }      
  }  
  
  landscapeLeftPts.push( new THREE.Vector2(3500, 4000) );
  landscapeLeftPts.push( new THREE.Vector2(3500, -100) );  
  landscapeLeftPts.push( new THREE.Vector2(this.landscape.river.riverVertices[5].pos.x, this.landscape.river.riverVertices[5].pos.z ) ); 
  
  landscapeRightPts.push( new THREE.Vector2(-100, 4000) ); 
  landscapeRightPts.push( new THREE.Vector2(-100, 0) ); 
  landscapeRightPts.push( new THREE.Vector2(this.landscape.river.riverVertices[5].pos.x, this.landscape.river.riverVertices[5].pos.z ) );   
  
  var landscapeLeftShape = new THREE.Shape( landscapeLeftPts );
  var landscapeRightShape = new THREE.Shape( landscapeRightPts );
  
  var landscapeLeft3d = new THREE.ExtrudeGeometry( landscapeLeftShape, { amount: 10	} );
  var landscapeRight3d = new THREE.ExtrudeGeometry( landscapeRightShape, { amount: 10	} );

  var meshLeft = THREE.SceneUtils.createMultiMaterialObject( landscapeLeft3d, [ new THREE.MeshLambertMaterial( { color: 0x22aa33 } )] );
  
  var meshRight = THREE.SceneUtils.createMultiMaterialObject( landscapeRight3d, [ new THREE.MeshLambertMaterial( { color: 0x22aa33 } )] );  
  
  meshLeft.rotation.set( Math.PI/2, 0, 0 );
  meshRight.rotation.set( Math.PI/2, 0, 0 );
  
  scene.add( meshLeft );    
  scene.add( meshRight )
   
  geometry0.faceVertexUvs[0] = [];   
  
  var uvs;
  var offset = 0;
  while ( offset < this.landscape.river.riverIndices.length ) {

    face = new THREE.Face3();

    uvs = new Array(3);
    
    uvs[0] = new THREE.UV(this.landscape.river.riverVertices[this.landscape.river.riverIndices[offset]].uv.x, 
    this.landscape.river.riverVertices[this.landscape.river.riverIndices[offset]].uv.y);
    face.a = this.landscape.river.riverIndices[ offset++ ];
    
    uvs[1] = new THREE.UV(this.landscape.river.riverVertices[this.landscape.river.riverIndices[offset]].uv.x, 
    this.landscape.river.riverVertices[this.landscape.river.riverIndices[offset]].uv.y);    
    face.b = this.landscape.river.riverIndices[ offset++ ];
    
    uvs[2] = new THREE.UV(this.landscape.river.riverVertices[this.landscape.river.riverIndices[offset]].uv.x, 
    this.landscape.river.riverVertices[this.landscape.river.riverIndices[offset]].uv.y);    
    face.c = this.landscape.river.riverIndices[ offset++ ];  
    
    geometry0.faces.push(face);
    geometry0.faceVertexUvs[0].push(uvs);    
  }
 
  texture = THREE.ImageUtils.loadTexture( "textures/water.jpg" );
  texture.wrapS = 0;
  texture.wrapT = 0;
  
  material0 = new THREE.MeshBasicMaterial( { map: texture, wireframe: false, transparent: true, opacity: 0.9 } );  
  
  var riverMesh = new THREE.Mesh( geometry0, material0 );
  riverMesh.position.set(0, 5, 0);
  scene.add(riverMesh);  
  
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

