/**
 * @author John Walley / http://www.walley.org.uk/
 */
 
/**
 * Creates a huge cube which acts as our skybox
 * @constructor
 */
function SkyBox() {
	this.camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 1, 100000);
  this.target = new THREE.Vector3(0, 0, 0);
  this.scene = new THREE.Scene();
}

SkyBox.prototype.generateMesh = function () {
  var path = "skybox/";
  var format = '.jpg';
  var urls = [
    path + 'px' + format, path + 'nx' + format,
    path + 'py' + format, path + 'ny' + format,
    path + 'pz' + format, path + 'nz' + format
  ];  
  
  var texture = THREE.ImageUtils.loadTextureCube(urls, new THREE.CubeRefractionMapping());

  var shader = THREE.ShaderUtils.lib["cube"];
  shader.uniforms["tCube"].texture = texture;

  var material = new THREE.ShaderMaterial( {
    fragmentShader: shader.fragmentShader,
    vertexShader: shader.vertexShader,
    uniforms: shader.uniforms,
    depthWrite: false
  } );

  mesh = new THREE.Mesh(new THREE.CubeGeometry(1000, 1000, 1000), material);
  mesh.flipSided = true;  

  return mesh;
}