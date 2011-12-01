/**
 * @author John Walley / http://www.walley.org.uk/
 */

var camera, scene, renderer,
geometry, material, mesh,
controls;

var cameraCube, sceneCube, cubeTarget;

var ambientLight, directionalLight;

var riverLine;

var clock = new THREE.Clock();

init();
animate();

function init() {

  scene = new THREE.Scene();
  scene.fog = new THREE.Fog( 0x58c2c0, 1, 200 );

  camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 0.25, 1000 );
  // TODO: Transition to z axis being up
  //camera.up = THREE.Vector3(0, 1, 0);
  camera.position.x = 20;
  camera.position.y = 8;
  camera.position.z = 12;
  controls = new THREE.FirstPersonControls( camera );

  controls.movementSpeed = 10;
  controls.lookSpeed = 0.1;
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
  
  // Track  
  riverLine = new RiverLine( [new THREE.Vector3(-50,0,-50), 
                              new THREE.Vector3(0,0,0),
                              new THREE.Vector3(33,0,20),
                              new THREE.Vector3(66,0,20),                              
                              new THREE.Vector3(100,0,0),
                              new THREE.Vector3(150,0,-50),
                              new THREE.Vector3(200,0,20),                              
                              new THREE.Vector3(220,0,80),
                              new THREE.Vector3(240,0,140)] );
               
  geometry0 = new THREE.Geometry();
  
  var landscapeLeftPts = [];
  var landscapeRightPts = [];
  
  for (var num = 0; num < riverLine.roadVertices.length; num++) {
    geometry0.vertices.push(new THREE.Vertex(riverLine.roadVertices[num].pos));
    if (!(num % 5)) {
      landscapeLeftPts.push( new THREE.Vector2( riverLine.roadVertices[num].pos.x, riverLine.roadVertices[num].pos.z ) );  
    }
    if (!((num+1) % 5)) {
      landscapeRightPts.push( new THREE.Vector2( riverLine.roadVertices[num].pos.x, riverLine.roadVertices[num].pos.z ) );        
    }      
  }  
  
  landscapeLeftPts.push( new THREE.Vector2(300, -100) );
  landscapeLeftPts.push( new THREE.Vector2(0, -100) );  
  landscapeLeftPts.push( new THREE.Vector2(riverLine.roadVertices[0].pos.x, riverLine.roadVertices[0].pos.z ) ); 
  
  landscapeRightPts.push( new THREE.Vector2(300, 200) );
  landscapeRightPts.push( new THREE.Vector2(0, 200) );  
  landscapeRightPts.push( new THREE.Vector2(riverLine.roadVertices[4].pos.x, riverLine.roadVertices[4].pos.z ) );   
  
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
  while ( offset < riverLine.roadIndices.length ) {

    face = new THREE.Face3();

    uvs = new Array(3);
    
    uvs[0] = new THREE.UV(riverLine.roadVertices[riverLine.roadIndices[offset]].uv.x, 
    riverLine.roadVertices[riverLine.roadIndices[offset]].uv.y);
    face.a = riverLine.roadIndices[ offset++ ];
    
    uvs[1] = new THREE.UV(riverLine.roadVertices[riverLine.roadIndices[offset]].uv.x, 
    riverLine.roadVertices[riverLine.roadIndices[offset]].uv.y);    
    face.b = riverLine.roadIndices[ offset++ ];
    
    uvs[2] = new THREE.UV(riverLine.roadVertices[riverLine.roadIndices[offset]].uv.x, 
    riverLine.roadVertices[riverLine.roadIndices[offset]].uv.y);    
    face.c = riverLine.roadIndices[ offset++ ];  
    
    geometry0.faces.push(face);
    geometry0.faceVertexUvs[0].push(uvs);    
  }
 
  texture = THREE.ImageUtils.loadTexture( "textures/water.jpg" );
  texture.wrapS = 0;
  texture.wrapT = 0;
  
  material0 = new THREE.MeshBasicMaterial( { map: texture, wireframe: false } );  
  
  var trackMesh = new THREE.Mesh( geometry0, material0 );
  trackMesh.position.set(0, 5, 0);
  scene.add(trackMesh);  
  
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
  
  
  // Wireframe
  geometry2 = new THREE.CubeGeometry( 240, 10, 130 );  
  
  material = new THREE.MeshBasicMaterial( { color: 0xffffff, wireframe: true } );
  

  mesh = new THREE.Mesh( geometry2, material );
  mesh.position.x = 120;
  mesh.position.y = 5;
  mesh.position.z = 15;
  scene.add( mesh ); 

  renderer = new THREE.WebGLRenderer( { antialias: true } );
  renderer.setSize( window.innerWidth, window.innerHeight );
  renderer.autoClear = false;
  
  container = document.getElementById( 'container' );

  container.appendChild( renderer.domElement );

}

function animate() {

  webkitRequestAnimationFrame( animate );
  render();

}

function render() {

 
  controls.update( clock.getDelta() );

  cubeTarget.x = -Math.cos(camera.rotation.y);
  cubeTarget.y = 0;
  cubeTarget.z = -Math.sin(camera.rotation.y);

  cameraCube.lookAt( cubeTarget );  
  
	renderer.render( sceneCube, cameraCube );  
  renderer.render( scene, camera );

}

