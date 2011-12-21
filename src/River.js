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