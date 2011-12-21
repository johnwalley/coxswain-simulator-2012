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