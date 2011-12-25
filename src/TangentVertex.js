/**
 * @author John Walley / http://www.walley.org.uk/
 */

define(function () {
  /** 
    A module representing a tangent vertex, i.e. position, UV, normal and tangent
    @exports Client
    @version 1.0
   */
   
  /**
   * Geometry primative
   * @constructor
   */
   function TangentVertex(pos, uv, normal, tangent) {
    this.pos = pos; 
    this.uv = uv;
    this.normal = normal;
    this.tangent = tangent;
  }
  
  return TangentVertex;
});