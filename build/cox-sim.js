function TangentVertex(a,b,c,d){this.pos=a;this.uv=b;this.normal=c;this.tangent=d};function RiverVertex(a,b,c,d,e){this.pos=a;this.right=b||THREE.Vector3(1,0,0);this.up=c||THREE.Vector3(0,1,0);this.dir=d||THREE.Vector3(0,0,1);this.uv=e||THREE.Vector2(0,0);this.riverWidth=64}
RiverVertex.prototype={get leftTangentVertex(){return new TangentVertex((new THREE.Vector3).sub(this.pos,(new THREE.Vector3).copy(this.right).divideScalar(2/(this.riverWidth*this.roadWidthScale))),new THREE.Vector2(this.uv.x,0),this.up,this.right)},get rightTangentVertex(){return new TangentVertex((new THREE.Vector3).add(this.pos,(new THREE.Vector3).copy(this.right).divideScalar(2/this.riverWidth)),new THREE.Vector2(this.uv.x,this.riverWidth*this.roadWidthScale),this.up,this.right)},get middleTangentVertex(){return new TangentVertex((new THREE.Vector3).copy(this.pos),
new THREE.Vector2(this.uv.x,this.riverWidth/2),this.up,this.right)},get middleLeftTangentVertex(){return new TangentVertex((new THREE.Vector3).sub(this.pos,(new THREE.Vector3).copy(this.right).divideScalar(4/(this.riverWidth*this.roadWidthScale))),new THREE.Vector2(this.uv.x,this.riverWidth/4),this.up,this.right)},get middleRightTangentVertex(){return new TangentVertex((new THREE.Vector3).add(this.pos,(new THREE.Vector3).copy(this.right).divideScalar(4/(this.riverWidth*this.roadWidthScale))),new THREE.Vector2(this.uv.x,
this.riverWidth/4),this.up,this.right)}};function RiverLine(a){this.numberOfIterationsPer100Meters=20;this.numberOfUpSmoothValues=10;this.riverTextureStrechFactor=0.125;this.riverWidthScale=13.25;this.points=[];this.riverVertices=[];this.riverIndices=[];this.load(a);this.generateVerticesAndObjects()}
RiverLine.prototype.generateUTextureCoordinates=function(){for(var a=0,b=0;b<this.points.length;b++)this.points[b].uv=new THREE.Vector2(a,0),a+=this.riverTextureStrechFactor*(new THREE.Vector3).sub(this.points[(b+1)%this.points.length].pos,this.points[b%this.points.length].pos).length()};
RiverLine.prototype.load=function(a){if(3>a.length)throw"inputPoints is invalid, we need at least three valid input points to generate a RiverLine.";var b,c,d,e,h;for(b=1;b<a.length-2;b++){c=a[b-1];d=a[b];e=a[b+1];h=a[b+2];var f=d.distanceTo(e),f=Math.floor(this.numberOfIterationsPer100Meters*(f/100));0>=f&&(f=1);var g;for(iter=0;iter<f;iter++)g=new THREE.Spline([c,d,e,h]),g=new RiverVertex((new THREE.Vector3).copy(g.getPoint(1/3+iter/(3*f)))),this.points.push(g)}a=new THREE.Vector3(0,-1,0);c=[];
for(b=0;b<this.points.length;b++)d=(new THREE.Vector3).sub(this.points[(b+1)%this.points.length].pos,this.points[0>b-1?this.points.length-1:b-1].pos),d.normalize(),this.points[b].dir=d,c.push(a),e=c[b%this.points.length],e=(new THREE.Vector3).cross(d,e),e.normalize(),this.points[b].right=e,e=(new THREE.Vector3).cross(e,d),this.points[b].up=e;this.generateUTextureCoordinates()};
RiverLine.prototype.generateVerticesAndObjects=function(){for(var a=0;a<this.points.length;a++)this.riverVertices[5*a+0]=this.points[a].rightTangentVertex,this.riverVertices[5*a+1]=this.points[a].middleRightTangentVertex,this.riverVertices[5*a+2]=this.points[a].middleTangentVertex,this.riverVertices[5*a+3]=this.points[a].middleLeftTangentVertex,this.riverVertices[5*a+4]=this.points[a].leftTangentVertex;for(var b=[],c=0,a=0;a<this.points.length-1;a++){for(var d=0;4>d;d++)b[24*a+6*d+0]=c+d,b[24*a+6*
d+1]=c+5+1+d,b[24*a+6*d+2]=c+5+d,b[24*a+6*d+3]=c+5+1+d,b[24*a+6*d+4]=c+d,b[24*a+6*d+5]=c+1+d;c+=5}this.riverIndices=b};function Landscape(){this.gridHeight=this.gridWidth=256;this.mapZScale=this.mapHeightFactor=this.mapWidthFactor=10;this.vertices=[];this.indices=[];this.mapHeights=[];this.track=null;for(var a=[],b=0;b<this.gridWidth;b++)for(var c=0;c<this.gridWidth;c++)a[b+c*this.gridWidth]=Math.floor(256*Math.random());for(b=0;b<this.gridWidth;b++){this.mapHeights[b]=[];for(c=0;c<this.gridWidth;c++){var d=b+c*this.gridWidth;pos=this.calcLandscapePos(b,c,a);this.mapHeights[b][c]=pos.y;this.vertices[d]={};this.vertices[d].pos=
pos;edge1=(new THREE.Vector3).sub(pos,this.calcLandscapePos(b,c+1,a));edge2=(new THREE.Vector3).sub(pos,this.calcLandscapePos(b+1,c,a));edge3=(new THREE.Vector3).sub(pos,this.calcLandscapePos(b-1,c+1,a));edge4=(new THREE.Vector3).sub(pos,this.calcLandscapePos(b+1,c+1,a));edge5=(new THREE.Vector3).sub(pos,this.calcLandscapePos(b-1,c-1,a));this.vertices[d].normal=(new THREE.Vector3).add((new THREE.Vector3).add((new THREE.Vector3).cross(edge2,edge1),(new THREE.Vector3).cross(edge4,edge3)),(new THREE.Vector3).cross(edge3,
edge5));this.vertices[d].normal.normalize().negate();this.vertices[d].tangent=(new THREE.Vector3).copy(edge1).normalize();this.vertices[d].uv=new THREE.Vector2(c/(this.gridHeight-1),b/(this.gridWidth-1))}}for(b=a=0;b<this.gridWidth-1;b++)for(c=0;c<this.gridWidth-1;c++)this.indices[a+0]=b*this.gridHeight+c,this.indices[a+2]=(b+1)*this.gridHeight+(c+1),this.indices[a+1]=(b+1)*this.gridHeight+c,this.indices[a+3]=(b+1)*this.gridHeight+(c+1),this.indices[a+5]=b*this.gridHeight+c,this.indices[a+4]=b*this.gridHeight+
(c+1),a+=6}Landscape.prototype.calcLandscapePos=function(a,b,c){return new THREE.Vector3(a*this.mapWidthFactor,c[(0>a?0:a>=this.gridWidth?this.gridWidth-1:a)+(0>b?0:b>=this.gridWidth?this.gridWidth-1:b)*this.gridWidth]/255*this.mapZScale,b*this.mapWidthFactor)};var camera,scene,renderer,geometry,material,mesh,controls,cameraCube,sceneCube,cubeTarget,ambientLight,directionalLight,riverLine,clock=new THREE.Clock;init();animate();
function init(){scene=new THREE.Scene;camera=new THREE.PerspectiveCamera(75,window.innerWidth/window.innerHeight,0.5,8E3);camera.position.x=72;camera.position.y=8;camera.position.z=105;controls=new THREE.FirstPersonControls(camera);controls.movementSpeed=100;controls.lookSpeed=0.05;controls.lookVertical=!1;scene.add(camera);ambientLight=new THREE.AmbientLight(16777215);scene.add(ambientLight);directionalLight=new THREE.DirectionalLight(16777028,0.8);directionalLight.position.set(-1,1,-0.5).normalize();
scene.add(directionalLight);landscape=new Landscape;landscapeGeometry=new THREE.Geometry;for(var a=0;a<landscape.vertices.length;a++)landscapeGeometry.vertices.push(new THREE.Vertex(landscape.vertices[a].pos));landscapeGeometry.faceVertexUvs[0]=[];for(var b,a=0;a<landscape.indices.length;)face=new THREE.Face3,b=Array(3),b[0]=new THREE.UV(landscape.vertices[landscape.indices[a]].uv.x,landscape.vertices[landscape.indices[a]].uv.y),face.a=landscape.indices[a++],b[1]=new THREE.UV(landscape.vertices[landscape.indices[a]].uv.x,
landscape.vertices[landscape.indices[a]].uv.y),face.b=landscape.indices[a++],b[2]=new THREE.UV(landscape.vertices[landscape.indices[a]].uv.x,landscape.vertices[landscape.indices[a]].uv.y),face.c=landscape.indices[a++],landscapeGeometry.faces.push(face),landscapeGeometry.faceVertexUvs[0].push(b);landscapeGeometry.computeFaceNormals();landscapeGeometry.computeVertexNormals();landscapeMaterial=new THREE.MeshLambertMaterial({color:5635891,ambient:5592371,shading:THREE.FlatShading,wireframe:!1});b=new THREE.Mesh(landscapeGeometry,
landscapeMaterial);b.position.x=-500;b.position.y=-10;b.position.z=-500;b=[new THREE.Vector3(-141.18,0,-217.65),new THREE.Vector3(0,0,0),new THREE.Vector3(141.18,0,217.65),new THREE.Vector3(382.35,0,452.94),new THREE.Vector3(923.53,0,552.94),new THREE.Vector3(1135.3,0,588.24),new THREE.Vector3(1200,0,688.24),new THREE.Vector3(1300,0,811.76),new THREE.Vector3(1505.9,0,788.24),new THREE.Vector3(1705.9,0,758.82),new THREE.Vector3(1841.2,0,964.71),new THREE.Vector3(1976.5,0,1347.1),new THREE.Vector3(2017.6,
0,1588.2),new THREE.Vector3(2123.5,0,1741.2),new THREE.Vector3(2294.1,0,2229.4),new THREE.Vector3(2529.4,0,2288.2),new THREE.Vector3(2647.1,0,2394.1),new THREE.Vector3(2817.6,0,2458.8),new THREE.Vector3(2982.4,0,2623.5),new THREE.Vector3(2982.4,0,2794.1),new THREE.Vector3(3082.4,0,2970.6),new THREE.Vector3(3041.2,0,3241.2),new THREE.Vector3(2847.1,0,3452.9),new THREE.Vector3(2758.8,0,3594.1),new THREE.Vector3(2747.1,0,3747.1)];riverLine=new RiverLine(b);geometry0=new THREE.Geometry;var c=[];b=[];
for(a=0;a<riverLine.riverVertices.length;a++)geometry0.vertices.push(new THREE.Vertex(riverLine.riverVertices[a].pos)),a%5||c.push(new THREE.Vector2(riverLine.riverVertices[a].pos.x,riverLine.riverVertices[a].pos.z)),(a+1)%5||b.push(new THREE.Vector2(riverLine.riverVertices[a].pos.x,riverLine.riverVertices[a].pos.z));c.push(new THREE.Vector2(3500,4E3));c.push(new THREE.Vector2(3500,-100));c.push(new THREE.Vector2(riverLine.riverVertices[5].pos.x,riverLine.riverVertices[5].pos.z));b.push(new THREE.Vector2(-100,
4E3));b.push(new THREE.Vector2(-100,0));b.push(new THREE.Vector2(riverLine.riverVertices[5].pos.x,riverLine.riverVertices[5].pos.z));a=new THREE.Shape(c);b=new THREE.Shape(b);a=new THREE.ExtrudeGeometry(a,{amount:10});b=new THREE.ExtrudeGeometry(b,{amount:10});a=THREE.SceneUtils.createMultiMaterialObject(a,[new THREE.MeshLambertMaterial({color:2271795})]);b=THREE.SceneUtils.createMultiMaterialObject(b,[new THREE.MeshLambertMaterial({color:2271795})]);a.rotation.set(Math.PI/2,0,0);b.rotation.set(Math.PI/
2,0,0);scene.add(a);scene.add(b);geometry0.faceVertexUvs[0]=[];for(a=0;a<riverLine.riverIndices.length;)face=new THREE.Face3,b=Array(3),b[0]=new THREE.UV(riverLine.riverVertices[riverLine.riverIndices[a]].uv.x,riverLine.riverVertices[riverLine.riverIndices[a]].uv.y),face.a=riverLine.riverIndices[a++],b[1]=new THREE.UV(riverLine.riverVertices[riverLine.riverIndices[a]].uv.x,riverLine.riverVertices[riverLine.riverIndices[a]].uv.y),face.b=riverLine.riverIndices[a++],b[2]=new THREE.UV(riverLine.riverVertices[riverLine.riverIndices[a]].uv.x,
riverLine.riverVertices[riverLine.riverIndices[a]].uv.y),face.c=riverLine.riverIndices[a++],geometry0.faces.push(face),geometry0.faceVertexUvs[0].push(b);texture=THREE.ImageUtils.loadTexture("textures/water.jpg");texture.wrapS=0;texture.wrapT=0;material0=new THREE.MeshBasicMaterial({map:texture,wireframe:!1});b=new THREE.Mesh(geometry0,material0);b.position.set(0,5,0);scene.add(b);cameraCube=new THREE.PerspectiveCamera(60,window.innerWidth/window.innerHeight,1,1E5);cubeTarget=new THREE.Vector3(0,
0,0);sceneCube=new THREE.Scene;b=THREE.ImageUtils.loadTextureCube("skybox/px.jpg,skybox/nx.jpg,skybox/py.jpg,skybox/ny.jpg,skybox/pz.jpg,skybox/nz.jpg".split(","),new THREE.CubeRefractionMapping);a=THREE.ShaderUtils.lib.cube;a.uniforms.tCube.texture=b;b=new THREE.ShaderMaterial({fragmentShader:a.fragmentShader,vertexShader:a.vertexShader,uniforms:a.uniforms,depthWrite:!1});mesh=new THREE.Mesh(new THREE.CubeGeometry(1E3,1E3,1E3),b);mesh.flipSided=!0;sceneCube.add(mesh);sceneCube.add(cameraCube);geometry2=
new THREE.CubeGeometry(1E3,10,250);material=new THREE.MeshBasicMaterial({color:16777215,wireframe:!0});mesh=new THREE.Mesh(geometry2,material);mesh.position.x=500;mesh.position.y=5;mesh.position.z=125;scene.add(mesh);renderer=new THREE.WebGLRenderer({antialias:!0});renderer.setSize(window.innerWidth,window.innerHeight);renderer.autoClear=!1;container=document.getElementById("container");container.appendChild(renderer.domElement)}function animate(){webkitRequestAnimationFrame(animate);render()}
function render(){controls.update(clock.getDelta());cubeTarget.x=-Math.cos(camera.rotation.y);cubeTarget.y=0;cubeTarget.z=-Math.sin(camera.rotation.y);cameraCube.lookAt(cubeTarget);renderer.render(sceneCube,cameraCube);renderer.render(scene,camera)};
