/**
 * @author John Walley / http://www.walley.org.uk/
 */

function TangentVertex ( pos, uv, normal, tangent ) {

  this.pos = pos; 
  this.uv = uv;
  this.normal = normal;
  this.tangent = tangent;
  
}

function TrackVertex ( pos, right, up, dir, uv, riverWidth ) {

  this.pos = pos;
  this.right = right || THREE.Vector3(1,0,0);
  this.up = up || THREE.Vector3(0,1,0);
  this.dir = dir || THREE.Vector3(0,0,1);
  
  this.uv = uv || THREE.Vector2(0,0);
    
  this.riverWidth = 16.0;
  
}

TrackVertex.prototype = {
  get leftTangentVertex() {
    return new TangentVertex(new THREE.Vector3().sub(this.pos, new THREE.Vector3().copy(this.right).divideScalar(2/(this.riverWidth*this.roadWidthScale))),
    new THREE.Vector2(this.uv.x, 0), 
    this.up, this.right);
  },
  
  get rightTangentVertex() {
    return new TangentVertex(new THREE.Vector3().add(this.pos, new THREE.Vector3().copy(this.right).divideScalar(2/this.riverWidth)),
    new THREE.Vector2(this.uv.x, (this.riverWidth*this.roadWidthScale)), 
    this.up, this.right);
  },
  
  get middleTangentVertex() {
    return new TangentVertex(new THREE.Vector3().copy(this.pos),
    new THREE.Vector2(this.uv.x, this.riverWidth/2), 
    this.up, this.right);
  },
  
  get middleLeftTangentVertex() {
    return new TangentVertex(new THREE.Vector3().sub(this.pos, new THREE.Vector3().copy(this.right).divideScalar(4/(this.riverWidth*this.roadWidthScale))),
    new THREE.Vector2(this.uv.x, this.riverWidth/4), 
    this.up, this.right);
  },
  
  get middleRightTangentVertex() {
    return new TangentVertex(new THREE.Vector3().add(this.pos, new THREE.Vector3().copy(this.right).divideScalar(4/(this.riverWidth*this.roadWidthScale))),
    new THREE.Vector2(this.uv.x, this.riverWidth/4), 
    this.up, this.right);
  }
}

function TrackLine ( inputPoints ) {

  this.numberOfIterationsPer100Meters = 20;
  this.numberOfUpSmoothValues = 10;
  this.roadTextureStrechFactor = 0.125;
  this.roadWidthScale = 13.25;
  
  this.points = []; // Array of TrackVertex
  this.roadVertices = [];
  this.roadIndices = [];
  
  this.load( inputPoints );
  
  this.generateVerticesAndObjects();

}

TrackLine.prototype.generateUTextureCoordinates = function () {

  var currentRoadUTexValue = 0.0;
  for (var num = 0; num < this.points.length; num++)
  {
    // Assign u texture coordinate
    this.points[num].uv = new THREE.Vector2(currentRoadUTexValue, 0);

    // Uniform calculation of the texture coordinates for the roadway,
    // so it doesn't matter if there is a gap of 2 or 200 m
    currentRoadUTexValue += this.roadTextureStrechFactor *
      (new THREE.Vector3().sub(this.points[(num + 1) % this.points.length].pos,
      this.points[num % this.points.length].pos).length());
  }

}

/**
 * Generate vertices from spline control points
 */
TrackLine.prototype.load = function ( inputPoints ) {

  if ( inputPoints.length < 3) {
    throw "inputPoints is invalid, we need at least three valid input points to generate a TrackLine."
  }

  var num;
  var p1, p2, p3, p4;
  
  // Generate all points with help of catmull rom splines
  for (num = 1; num < inputPoints.length-2; num++ ) {

    // Get the 4 required points for the catmull rom spline
    p1 = inputPoints[num - 1];
    p2 = inputPoints[num];
    p3 = inputPoints[num + 1];
    p4 = inputPoints[num + 2];

    // Calculate number of iterations we use here based
    // on the distance of the 2 points we generate new points from.
    var distance = p2.distanceTo(p3);
    
    var numberOfIterations = Math.floor(this.numberOfIterationsPer100Meters * (distance / 100.0));
    if (numberOfIterations <= 0)
      numberOfIterations = 1;

    var spline, newVertex;  
      
    for (iter = 0; iter < numberOfIterations; iter++)
    {
      spline = new THREE.Spline( [p1, p2, p3, p4] );
      // Non-standard spline definition
      newVertex = new TrackVertex( new THREE.Vector3().copy(spline.getPoint( (1/3) + iter / (3*numberOfIterations)) ) );
      this.points.push(newVertex);
    }  
  }
  
  var defaultUpVec = new THREE.Vector3(0, -1, 0);
  var lastUpVec = defaultUpVec;
  
  var preUpVectors = [];
  
  for (num = 0; num < this.points.length; num++)
  {
    // Get direction we are driving in at this point,
    // interpolate with help of last and next points.
    var dir = new THREE.Vector3().sub(this.points[(num + 1) % this.points.length].pos, (this.points[num - 1 < 0 ? this.points.length - 1 : num - 1].pos));
        
    dir.normalize();
    
    this.points[num].dir = dir; 

    // Store the optimalUpVectors in the preUpVectors list
    preUpVectors.push(defaultUpVec);    
    
    // First of all interpolate the preUpVectors
    var upVec = preUpVectors[num % this.points.length];
    
    var rightVec = new THREE.Vector3().cross(dir, upVec);
    rightVec.normalize();
    
    this.points[num].right = rightVec;
    
    upVec = new THREE.Vector3().cross(rightVec, dir);
    
    this.points[num].up = upVec;  
  
  }
  
  this.generateUTextureCoordinates();
    
}

/**
 * Generate vertices from spline control points
 */
TrackLine.prototype.generateVerticesAndObjects = function () {

  // Current texture coordinate for the roadway (in direction of movement)
  for (var num = 0; num < this.points.length; num++)
  {
    // Get vertices with help of the properties in the TrackVertex class.
    // For the road itself we only need vertices for the left and right
    // side, which are vertex number 0 and 1.
    this.roadVertices[num * 5 + 0] = this.points[num].rightTangentVertex;
    this.roadVertices[num * 5 + 1] = this.points[num].middleRightTangentVertex;
    this.roadVertices[num * 5 + 2] = this.points[num].middleTangentVertex;
    this.roadVertices[num * 5 + 3] = this.points[num].middleLeftTangentVertex;
    this.roadVertices[num * 5 + 4] = this.points[num].leftTangentVertex;
  }
  
  var indices = [];
  var vertexIndex = 0;
  for (num = 0; num < this.points.length - 1; num++)
  {
      // We only use 3 vertices (and the next 3 vertices),
      // but we have to construct all 24 indices for our 4 polygons.
      for (var sideNum = 0; sideNum < 4; sideNum++)
      {
          // Each side needs 2 polygons.

          // 1. Polygon
          indices[num * 24 + 6 * sideNum + 0] =
              vertexIndex + sideNum;
          indices[num * 24 + 6 * sideNum + 1] =
              vertexIndex + 5 + 1 + sideNum;
          indices[num * 24 + 6 * sideNum + 2] =
              vertexIndex + 5 + sideNum;

          // 2. Polygon
          indices[num * 24 + 6 * sideNum + 3] =
              vertexIndex + 5 + 1 + sideNum;
          indices[num * 24 + 6 * sideNum + 4] =
              vertexIndex + sideNum;
          indices[num * 24 + 6 * sideNum + 5] =
              vertexIndex + 1 + sideNum;
      }

      // Go to the next 5 vertices
      vertexIndex += 5;
  }  
  
  this.roadIndices = indices;

}

function Landscape () {

  this.gridWidth = 256;
  this.gridHeight = 256;
  
  this.mapWidthFactor = 10;
  this.mapHeightFactor = 10;
  this.mapZScale = 10.0;
  
  this.vertices = [];
  this.indices = [];
  
  this.mapHeights = new Array();
  this.track = null;
  
  var heights = new Array();
  
  for (var x = 0; x < this.gridWidth; x++) {
    for (var y = 0; y < this.gridWidth; y++) {
      heights[x + y * this.gridWidth] = Math.floor(Math.random()*256);
    }
  }
    
  
  for (var x = 0; x < this.gridWidth; x++) {
    this.mapHeights[x] = new Array();
    for (var y = 0; y < this.gridWidth; y++) {
      var index = x + y * this.gridWidth;
      pos = this.calcLandscapePos(x, y, heights);
      
      this.mapHeights[x][y]  = pos.y;
      
      this.vertices[index] = {};
      this.vertices[index].pos = pos;
      
      edge1 = new THREE.Vector3().sub(pos, this.calcLandscapePos(x, y + 1, heights));
      edge2 = new THREE.Vector3().sub(pos, this.calcLandscapePos(x + 1, y, heights));
      edge3 = new THREE.Vector3().sub(pos, this.calcLandscapePos(x - 1, y + 1, heights));
      edge4 = new THREE.Vector3().sub(pos, this.calcLandscapePos(x + 1, y + 1, heights));
      edge5 = new THREE.Vector3().sub(pos, this.calcLandscapePos(x - 1, y - 1, heights));
      
      this.vertices[index].normal = new THREE.Vector3().add(new THREE.Vector3().add(
        new THREE.Vector3().cross(edge2, edge1), new THREE.Vector3().cross(edge4, edge3)),
        new THREE.Vector3().cross(edge3, edge5));
        
      this.vertices[index].normal.normalize().negate();  

      // Step 4: Set tangent data, just use edge1
      this.vertices[index].tangent = new THREE.Vector3().copy(edge1).normalize();

      // Step 5: Set texture coordinates, use full 0.0f to 1.0f range!
      this.vertices[index].uv = new THREE.Vector2(
        y / (this.gridHeight - 1),
        x / (this.gridWidth - 1));      
    
    }  
  }
  
  var indices = new Array((this.gridWidth - 1) * (this.gridHeight - 1) * 6);
  var currentIndex = 0;
  for (var x = 0; x < this.gridWidth - 1; x++) {
    for (var y = 0; y < this.gridWidth - 1; y++)
    {
      // Set landscape data (Note: Right handed)
      this.indices[currentIndex + 0] = x * this.gridHeight + y;
      this.indices[currentIndex + 2] = (x + 1) * this.gridHeight + (y + 1);
      this.indices[currentIndex + 1] = (x + 1) * this.gridHeight + y;
      this.indices[currentIndex + 3] = (x + 1) * this.gridHeight + (y + 1);
      this.indices[currentIndex + 5] = x * this.gridHeight + y;
      this.indices[currentIndex + 4] = x * this.gridHeight + (y + 1);

      // Add indices
      currentIndex += 6;
    } 
  }                

}

Landscape.prototype.calcLandscapePos = function (x, y, heights) {

  var mapX = x < 0 ? 0 : x >= this.gridWidth ? this.gridWidth - 1 : x;
  var mapY = y < 0 ? 0 : y >= this.gridWidth ? this.gridWidth - 1 : y;

  // Get height
  var heightPercent = heights[mapX + mapY * this.gridWidth] / 255.0;

  // Build landscape position vector
  return new THREE.Vector3(
    x * this.mapWidthFactor,
    heightPercent * this.mapZScale,
    y * this.mapWidthFactor);
      
}

var camera, scene, renderer,
geometry, material, mesh,
controls;

var cameraCube, sceneCube, cubeTarget;

var ambientLight, directionalLight;

var trackLine;

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
  trackLine = new TrackLine( [new THREE.Vector3(-50,0,-50), 
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
  
  for (var num = 0; num < trackLine.roadVertices.length; num++) {
    geometry0.vertices.push(new THREE.Vertex(trackLine.roadVertices[num].pos));
    if (!(num % 5)) {
      landscapeLeftPts.push( new THREE.Vector2( trackLine.roadVertices[num].pos.x, trackLine.roadVertices[num].pos.z ) );  
    }
    if (!((num+1) % 5)) {
      landscapeRightPts.push( new THREE.Vector2( trackLine.roadVertices[num].pos.x, trackLine.roadVertices[num].pos.z ) );        
    }      
  }  
  
  landscapeLeftPts.push( new THREE.Vector2(300, -100) );
  landscapeLeftPts.push( new THREE.Vector2(0, -100) );  
  landscapeLeftPts.push( new THREE.Vector2(trackLine.roadVertices[0].pos.x, trackLine.roadVertices[0].pos.z ) ); 
  
  landscapeRightPts.push( new THREE.Vector2(300, 200) );
  landscapeRightPts.push( new THREE.Vector2(0, 200) );  
  landscapeRightPts.push( new THREE.Vector2(trackLine.roadVertices[4].pos.x, trackLine.roadVertices[4].pos.z ) );   
  
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
  while ( offset < trackLine.roadIndices.length ) {

    face = new THREE.Face3();

    uvs = new Array(3);
    
    uvs[0] = new THREE.UV(trackLine.roadVertices[trackLine.roadIndices[offset]].uv.x, 
    trackLine.roadVertices[trackLine.roadIndices[offset]].uv.y);
    face.a = trackLine.roadIndices[ offset++ ];
    
    uvs[1] = new THREE.UV(trackLine.roadVertices[trackLine.roadIndices[offset]].uv.x, 
    trackLine.roadVertices[trackLine.roadIndices[offset]].uv.y);    
    face.b = trackLine.roadIndices[ offset++ ];
    
    uvs[2] = new THREE.UV(trackLine.roadVertices[trackLine.roadIndices[offset]].uv.x, 
    trackLine.roadVertices[trackLine.roadIndices[offset]].uv.y);    
    face.c = trackLine.roadIndices[ offset++ ];  
    
    geometry0.faces.push(face);
    geometry0.faceVertexUvs[0].push(uvs);    
  }
 
  texture = THREE.ImageUtils.loadTexture( "water.jpg" );
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

