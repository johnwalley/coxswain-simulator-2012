/**
 * @author John Walley / http://www.walley.org.uk/
 */

/**
 * Main entry class for our game
 * @constructor
 */
function CoxSimManager() {
  //this.player = new Player();
  //this.landscape = null;
}

CoxSimManager.prototype.run = function () {
  this.init();
  this.animate();
}

CoxSimManager.prototype.animate = function () {
  webkitRequestAnimationFrame(this.animate.bind(this));
  this.render();
}  

CoxSimManager.prototype.render = function () {
  this.controls.update( this.clock.getDelta() );

  this.cubeTarget.x = -Math.cos(this.camera.rotation.y);
  this.cubeTarget.y = 0;
  this.cubeTarget.z = -Math.sin(this.camera.rotation.y);

  this.cameraCube.lookAt(this.cubeTarget);  
  
	this.renderer.render(this.sceneCube, this.cameraCube);  
  this.renderer.render(this.scene, this.camera);
}

CoxSimManager.prototype.init = function () {
  scene = new THREE.Scene();
  //scene.fog = new THREE.Fog( 0x58c2c0, 1, 200 );

  camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 0.5, 8000 );
  // TODO: Transition to z axis being up
  //camera.up = THREE.Vector3(0, 1, 0);
  camera.position.x = 72;
  camera.position.y = 8;
  camera.position.z = 105;
  
  controls = new THREE.FirstPersonControls( camera );

  controls.movementSpeed = 100;
  controls.lookSpeed = 0.05;
  controls.lookVertical = false;
 
  scene.add( camera );
    
  ambientLight = new THREE.AmbientLight( 0xffffff );
  scene.add( ambientLight );

  directionalLight = new THREE.DirectionalLight( 0xffff44, 0.8 );
  directionalLight.position.set( -1, 1, -0.5 ).normalize();
  scene.add( directionalLight );  
  
  // Landscape
  landscape = new Landscape();
  landscapeGeometry = new THREE.Geometry();

  for (var num = 0; num < landscape.vertices.length; num++) {
    landscapeGeometry.vertices.push(new THREE.Vertex(landscape.vertices[num].pos));
  }    
    
  landscapeGeometry.faceVertexUvs[0] = [];   
  
  var uvs;
  var offset = 0;
  while ( offset < landscape.indices.length ) {

    face = new THREE.Face3();

    uvs = new Array(3);
    
    uvs[0] = new THREE.UV(landscape.vertices[landscape.indices[offset]].uv.x, 
    landscape.vertices[landscape.indices[offset]].uv.y);
    //face.vertexNormals.push(new THREE.Vector3(1,1,0));
    //face.vertexNormals.push(new THREE.Vector3().copy(landscape.vertices[landscape.indices[offset]].normal));
    face.a = landscape.indices[ offset++ ];
    
    uvs[1] = new THREE.UV(landscape.vertices[landscape.indices[offset]].uv.x, 
    landscape.vertices[landscape.indices[offset]].uv.y);  
    //face.vertexNormals.push(new THREE.Vector3(1,1,0));
    //face.vertexNormals.push(new THREE.Vector3().copy(landscape.vertices[landscape.indices[offset]].normal));
    face.b = landscape.indices[ offset++ ];
    
    uvs[2] = new THREE.UV(landscape.vertices[landscape.indices[offset]].uv.x, 
    landscape.vertices[landscape.indices[offset]].uv.y);    
    //face.vertexNormals.push(new THREE.Vector3(1,1,0));
    //face.vertexNormals.push(new THREE.Vector3().copy(landscape.vertices[landscape.indices[offset]].normal));    
    face.c = landscape.indices[ offset++ ]; 

    landscapeGeometry.faces.push(face);
    landscapeGeometry.faceVertexUvs[0].push(uvs);    
  }
  
  landscapeGeometry.computeFaceNormals();
	landscapeGeometry.computeVertexNormals();
    
  landscapeMaterial = new THREE.MeshLambertMaterial( { color: 0x55ff33, ambient: 0x555533, shading: THREE.FlatShading, wireframe: false } );  
  
  var landscapeMesh = new THREE.Mesh( landscapeGeometry, landscapeMaterial );
  
  landscapeMesh.position.x = -500;
  landscapeMesh.position.y = -10;
  landscapeMesh.position.z = -500;
  //scene.add(landscapeMesh);    

  // River Cam!  
  var splinePts = [new THREE.Vector3(-141.18,0,-217.65),
    new THREE.Vector3(0,0,0),
    new THREE.Vector3(141.18,0,217.65),
    new THREE.Vector3(382.35,0,452.94),
    new THREE.Vector3(923.53,0,552.94),
    new THREE.Vector3(1135.3,0,588.24),
    new THREE.Vector3(1200,0,688.24),
    new THREE.Vector3(1300,0,811.76),
    new THREE.Vector3(1505.9,0,788.24),
    new THREE.Vector3(1705.9,0,758.82),
    new THREE.Vector3(1841.2,0,964.71),
    new THREE.Vector3(1976.5,0,1347.1),
    new THREE.Vector3(2017.6,0,1588.2),
    new THREE.Vector3(2123.5,0,1741.2),
    new THREE.Vector3(2294.1,0,2229.4),
    new THREE.Vector3(2529.4,0,2288.2),
    new THREE.Vector3(2647.1,0,2394.1),
    new THREE.Vector3(2817.6,0,2458.8),
    new THREE.Vector3(2982.4,0,2623.5),
    new THREE.Vector3(2982.4,0,2794.1),
    new THREE.Vector3(3082.4,0,2970.6),
    new THREE.Vector3(3041.2,0,3241.2),
    new THREE.Vector3(2847.1,0,3452.9),
    new THREE.Vector3(2758.8,0,3594.1),
    new THREE.Vector3(2747.1,0,3747.1)];
              
  riverLine = new RiverLine(splinePts); 
                        
  geometry0 = new THREE.Geometry();
  
  var landscapeLeftPts = [];
  var landscapeRightPts = [];
  
  for (var num = 0; num < riverLine.riverVertices.length; num++) {
    geometry0.vertices.push(new THREE.Vertex(riverLine.riverVertices[num].pos));
    if (!(num % 5)) {
      landscapeLeftPts.push( new THREE.Vector2( riverLine.riverVertices[num].pos.x, riverLine.riverVertices[num].pos.z ) );  
    }
    if (!((num+1) % 5)) {
      landscapeRightPts.push( new THREE.Vector2( riverLine.riverVertices[num].pos.x, riverLine.riverVertices[num].pos.z ) );        
    }      
  }  
  
  landscapeLeftPts.push( new THREE.Vector2(3500, 4000) );
  landscapeLeftPts.push( new THREE.Vector2(3500, -100) );  
  landscapeLeftPts.push( new THREE.Vector2(riverLine.riverVertices[5].pos.x, riverLine.riverVertices[5].pos.z ) ); 
  
  landscapeRightPts.push( new THREE.Vector2(-100, 4000) ); 
  landscapeRightPts.push( new THREE.Vector2(-100, 0) ); 
  landscapeRightPts.push( new THREE.Vector2(riverLine.riverVertices[5].pos.x, riverLine.riverVertices[5].pos.z ) );   
  
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
  while ( offset < riverLine.riverIndices.length ) {

    face = new THREE.Face3();

    uvs = new Array(3);
    
    uvs[0] = new THREE.UV(riverLine.riverVertices[riverLine.riverIndices[offset]].uv.x, 
    riverLine.riverVertices[riverLine.riverIndices[offset]].uv.y);
    face.a = riverLine.riverIndices[ offset++ ];
    
    uvs[1] = new THREE.UV(riverLine.riverVertices[riverLine.riverIndices[offset]].uv.x, 
    riverLine.riverVertices[riverLine.riverIndices[offset]].uv.y);    
    face.b = riverLine.riverIndices[ offset++ ];
    
    uvs[2] = new THREE.UV(riverLine.riverVertices[riverLine.riverIndices[offset]].uv.x, 
    riverLine.riverVertices[riverLine.riverIndices[offset]].uv.y);    
    face.c = riverLine.riverIndices[ offset++ ];  
    
    geometry0.faces.push(face);
    geometry0.faceVertexUvs[0].push(uvs);    
  }
 
  texture = THREE.ImageUtils.loadTexture( "textures/water.jpg" );
  texture.wrapS = 0;
  texture.wrapT = 0;
  
  material0 = new THREE.MeshBasicMaterial( { map: texture, wireframe: false } );  
  
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
  this.camera = camera;
  this.renderer = renderer;
  this.controls = controls;
  
  this.cameraCube = cameraCube;
  this.sceneCube = sceneCube;
  this.cubeTarget = cubeTarget;
  
  this.clock = new THREE.Clock();
}
