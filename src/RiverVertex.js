/**
 * @author John Walley / http://www.walley.org.uk/
 */

define(['TangentVertex'], function (TangentVertex) {
  /** 
    A module representing a river vertex - basically a collection of helpers to get left and right positions
    @exports RiverVertex
    @version 1.0
   */
   
  /**
   * Used to build river geometry
   * @constructor
   */
   function RiverVertex(pos, right, up, dir, uv, riverWidth) {
    this.pos = pos;
    this.right = right || THREE.Vector3(1,0,0);
    this.up = up || THREE.Vector3(0,1,0);
    this.dir = dir || THREE.Vector3(0,0,1);
    this.uv = uv || THREE.Vector2(0,0); 
    this.riverWidth = 64.0;
  }

  RiverVertex.prototype = {
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
  
  return RiverVertex;
});