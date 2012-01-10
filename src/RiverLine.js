/**
 * @author John Walley / http://www.walley.org.uk/
 */

define(['RiverVertex'], function (RiverVertex) {
  /** 
    A module representing enabling construction of a river
    @exports RiverLine
    @version 1.0
   */
     
  /**
   * River geometry and utility methods to build it
   * @constructor
   */
  function RiverLine(inputPoints, landscape) {
    this.numberOfIterationsPer100Meters = 20;
    this.numberOfUpSmoothValues = 10;
    this.riverTextureStretchFactor = 0.125;
    this.riverWidthScale = 13.25;

    this.points = []; // Array of RiverVertex

    if (inputPoints !== undefined) {
      this.load(inputPoints, landscape);
    }
  }

  /**
   * Generate U texture coordinates, i.e. along the direction of travel. V texture coordinates are generated elsewhere
   */
  RiverLine.prototype.generateUTextureCoordinates = function () {
    var currentRiverUTexValue = 0.0;
    for (var num = 0; num < this.points.length; num++)
    {
      // Assign u texture coordinate
      this.points[num].uv = new THREE.Vector2(currentRiverUTexValue, 0);

      // Uniform calculation of the texture coordinates for the riverway,
      // so it doesn't matter if there is a gap of 2 or 200 m
      currentRiverUTexValue += this.riverTextureStretchFactor *
        (new THREE.Vector3().sub(this.points[(num + 1) % this.points.length].pos,
        this.points[num % this.points.length].pos).length());
    }
  }

  /**
   * Generate vertices from spline control points
   * @param {Array.<THREE.Vector3>} inputPoints Array of spline control points
   */
  RiverLine.prototype.load = function (inputPoints, landscape) {
    if ( inputPoints.length < 3) {
      throw "inputPoints is invalid, we need at least three valid input points to generate a RiverLine."
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
        newVertex = new RiverVertex( new THREE.Vector3().copy(spline.getPoint( (1/3) + iter / (3*numberOfIterations)) ) );
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
  
  return RiverLine;
});