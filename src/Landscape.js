/**
 * Landscape geometry and utility methods to build it
 * @constructor
 */
function Landscape(level) {
 
  this.river = null;
 
  this.reloadLevel(level);
 
}
 
Landscape.prototype.reloadLevel = function (level) {
  this.level = level;
  
  if (this.river == null) {
    this.river = new River("River" + this.level);
  } else {
    this.river.reload("River" + this.level);
  }
}
 
Landscape.prototype.updateBoatRiverPosition = function (boatPos, riverSegmentNumber, riverSegmentPercent) {
  return this.river.updateBoatRiverPosition(boatPos, riverSegmentNumber, riverSegmentPercent);
}

Landscape.prototype.getRiverPositionMatrix = function (riverSegmentNumber, riverSegmentPercent) {
  return this.river.getRiverPositionMatrix(riverSegmentNumber, riverSegmentPercent);
}

Landscape.prototype.generateMesh = function () {
  geometry = new THREE.Geometry();
  
  var landscapeLeftPts = [];
  var landscapeRightPts = [];
  
  for (var num = 0; num < this.river.riverVertices.length; num++) {
    geometry.vertices.push(new THREE.Vertex(this.river.riverVertices[num].pos));
    if (!(num % 5)) {
      landscapeLeftPts.push( new THREE.Vector2( this.river.riverVertices[num].pos.x, this.river.riverVertices[num].pos.z ) );  
    }
    if (!((num+1) % 5)) {
      landscapeRightPts.push( new THREE.Vector2( this.river.riverVertices[num].pos.x, this.river.riverVertices[num].pos.z ) );        
    }      
  }  
  
  landscapeLeftPts.push( new THREE.Vector2(3500, 4000) );
  landscapeLeftPts.push( new THREE.Vector2(3500, -100) );  
  landscapeLeftPts.push( new THREE.Vector2(this.river.riverVertices[5].pos.x, this.river.riverVertices[5].pos.z ) ); 
  
  landscapeRightPts.push( new THREE.Vector2(-100, 4000) ); 
  landscapeRightPts.push( new THREE.Vector2(-100, 0) ); 
  landscapeRightPts.push( new THREE.Vector2(this.river.riverVertices[5].pos.x, this.river.riverVertices[5].pos.z ) );   
  
  var landscapeLeftShape = new THREE.Shape( landscapeLeftPts );
  var landscapeRightShape = new THREE.Shape( landscapeRightPts );
  
  var landscapeLeft3d = new THREE.ExtrudeGeometry( landscapeLeftShape, { amount: 10	} );
  var landscapeRight3d = new THREE.ExtrudeGeometry( landscapeRightShape, { amount: 10	} );

  var meshLeft = THREE.SceneUtils.createMultiMaterialObject(landscapeLeft3d, [new THREE.MeshLambertMaterial( { color: 0x22aa33 } )]);
  
  var meshRight = THREE.SceneUtils.createMultiMaterialObject(landscapeRight3d, [new THREE.MeshLambertMaterial( { color: 0x22aa33 } )]);  
  
  meshLeft.rotation.set( Math.PI/2, 0, 0 );
  meshRight.rotation.set( Math.PI/2, 0, 0 );
  
  return [meshLeft, meshRight];    
}
 
function lala() {
 
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
    
    // Removed from CoxSimManager
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

/**
* Calculate height a given coordinate
*/
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