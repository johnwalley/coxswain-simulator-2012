/**
 * River for our game. Generated with the help of RiverLine
 * @constructor
 * @param {String} riverName River name to load 
 */
function River(riverName) {

  RiverLine.call(this, new RiverData().load(riverName));

  this.riverVertices = [];
  this.riverIndices = [];

  this.generateVerticesAndObjects();
}

// Inherit RiverLine
River.prototype = new RiverLine(new RiverData().load("Rivercam"));

// Correct the constructor pointer because it points to RiverLine
River.prototype.constructor = River;

/**
 * Reload
 * @param {Array.<THREE.Vector3>} inputPoints Array of spline control points
 */
River.prototype.reload = function (riverName) {
  // TODO: Implement me
}

/**
 * Update boat river position
 * @param {THREE.Vector3 }boatPos Boat position
 * @param {Number} riverSegmentNumber River segment number
 */
River.prototype.updateBoatRiverPosition = function (boatPos, riverSegmentNumber, riverSegmentPercent) {
  var num = riverSegmentNumber;
  
  gotBoatInThisSegment = false;
  thisPointDist = 0;
  nextPointDist = 1;
  maxNumberOfIterations = 100;
  
  do {
    thisPoint = this.points[num];
    nextPoint = this.points[num+1];
    
    thisPointDist = new THREE.Vector3().sub(boatPos, thisPoint.pos).dot(thisPoint.dir);
    nextPointDist = new THREE.Vector3().sub(nextPoint.pos, boatPos).dot(nextPoint.dir);
    
    if (thisPointDist < 0) {
      num--;
    } else if (nextPointDist < 0) {
      num++;
    } else {
      gotBoatInThisSegment = true;
    }
    
    if (maxNumberOfIterations-- < 0) {
      return;
    }
  } while (gotBoatInThisSegment == false);
  
  riverSegmentNumber = num;
  
  segmentLength = thisPointDist + nextPointDist;
  if (segmentLength == 0) {
    riverSegmentPercent = 0;
  } else {
    riverSegmentPercent = thisPointDist/nextPointDist;
  }
  
  return {
    riverSegmentNumber: riverSegmentNumber,
    riverSegmentPercent: riverSegmentPercent
  }
}

/**
 * Get river position matrix
 */
River.prototype.getRiverPositionMatrix = function (riverSegmentNumber, riverSegmentPercent) {
  // Make sure we are between 0 and 1
  if (riverSegmentPercent < 0) {
    riverSegmentPercent = 0;
  }
  if (riverSegmentPercent > 1) {
    riverSegmentPercent = 1;
  }
  
  var pointPercent = riverSegmentPercent;
  var num = riverSegmentNumber;
  
  return {
    right: new THREE.Vector3(0, 0, 0),
    forward: new THREE.Vector3(0, 0, 0),
    translation: new THREE.Vector3(0,0,0)
  }
}

/**
 * Generate vertices from spline control points
 */
River.prototype.generateVerticesAndObjects = function () {
  // Current texture coordinate for the riverway (in direction of movement)
  for (var num = 0; num < this.points.length; num++)
  {
    // Get vertices with help of the properties in the RiverVertex class.
    // For the river itself we only need vertices for the left and right
    // side, which are vertex number 0 and 1.
    this.riverVertices[num * 5 + 0] = this.points[num].rightTangentVertex;
    this.riverVertices[num * 5 + 1] = this.points[num].middleRightTangentVertex;
    this.riverVertices[num * 5 + 2] = this.points[num].middleTangentVertex;
    this.riverVertices[num * 5 + 3] = this.points[num].middleLeftTangentVertex;
    this.riverVertices[num * 5 + 4] = this.points[num].leftTangentVertex;
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
  
  this.riverIndices = indices;
}

/**
 * Generate mesh from vertices
 */
River.prototype.generateMesh = function () {

  geometry = new THREE.Geometry();

  for (var num = 0; num < this.riverVertices.length; num++) {
    geometry.vertices.push(new THREE.Vertex(this.riverVertices[num].pos));
    
  }
  
  geometry.faceVertexUvs[0] = [];   
  
  var uvs;
  var offset = 0;
  while ( offset < this.riverIndices.length ) {

    face = new THREE.Face3();

    uvs = new Array(3);
    
    uvs[0] = new THREE.UV(this.riverVertices[this.riverIndices[offset]].uv.x, 
    this.riverVertices[this.riverIndices[offset]].uv.y);
    face.a = this.riverIndices[ offset++ ];
    
    uvs[1] = new THREE.UV(this.riverVertices[this.riverIndices[offset]].uv.x, 
    this.riverVertices[this.riverIndices[offset]].uv.y);    
    face.b = this.riverIndices[ offset++ ];
    
    uvs[2] = new THREE.UV(this.riverVertices[this.riverIndices[offset]].uv.x, 
    this.riverVertices[this.riverIndices[offset]].uv.y);    
    face.c = this.riverIndices[ offset++ ];  
    
    geometry.faces.push(face);
    geometry.faceVertexUvs[0].push(uvs);    
  }
  
  geometry.mergeVertices();
  
  geometry.computeFaceNormals();
	geometry.computeVertexNormals();
 
  texture = THREE.ImageUtils.loadTexture( "textures/water.jpg" );
  texture.wrapS = 0;
  texture.wrapT = 0;
  
  material = new THREE.MeshPhongMaterial( { color: 0x2244bb } );  
  //material = new THREE.MeshBasicMaterial( { map: texture, transparent: true, opacity: 0.7 } );  
  
  mesh = new THREE.Mesh(geometry, material);
  mesh.position.set(0, 0, 0);
  
  return mesh;
}