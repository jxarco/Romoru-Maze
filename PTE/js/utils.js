

// ENTER para envia y comprueba solucion
document.getElementById("solution").addEventListener("keyup", function(event){
  event.preventDefault();
  if(event.keyCode == 13)
  {
    isSolution();
  }
});

 // DRAGGABLE INSTRUCTIONS DIV IN CANVAS
var mousePosition;
var offset = [0,0];
var isDown = false, isDown_m;
var div = document.getElementById("canvas_info");
var controller = document.getElementById("movement_buttons");
var canvas = document.querySelector(".canvas_container");

div.addEventListener('mousedown', function(e) {

	isDown = true;
	offset = [
    	div.offsetLeft - e.clientX,
    	div.offsetTop - e.clientY
	];

	e.stopPropagation();
	e.stopImmediatePropagation();

}, false);

div.addEventListener('mouseup', function() {
  isDown = false;
}, false);

controller.addEventListener('mousedown', function(e) {

	isDown_m = true;
	offset = [
    	controller.offsetLeft - e.clientX,
    	controller.offsetTop - e.clientY
	];

	e.stopPropagation();
	e.stopImmediatePropagation();

}, false);

controller.addEventListener('mouseup', function() {
  isDown_m = false;
}, false);

canvas.addEventListener('mousemove', function(event) {
  	event.preventDefault();
	if (isDown) {
		mousePosition = {

		  x : event.clientX,
		  y : event.clientY
		};

		div.style.left = (mousePosition.x + offset[0]) + 'px';
		div.style.top  = (mousePosition.y + offset[1]) + 'px';
  	}

  	if (isDown_m) {
		mousePosition = {

		  x : event.clientX,
		  y : event.clientY
		};

		controller.style.left = (mousePosition.x + offset[0]) + 'px';
		controller.style.top  = (mousePosition.y + offset[1]) + 'px';
  	}

}, false);

canvas.addEventListener('mousedown', function(e) {
  	window.mouse.x = ( e.clientX / window.innerWidth ) * 2 - 1;
	window.mouse.y = - ( e.clientY / window.innerHeight ) * 2 + 1;
  	intersect();
}, false);

function generateTextHints(){
	list = [];
	list.push( {text: "1* <i>Becoming invisible could be dangerous to him...</i>", solution: "frodo bolson" });
	list.push( {text: "2* <i>One of the greatest tragedies in history...</i>", solution: "11s" });
	list.push( {text: "3* <i>Maybe you have an ace in the sleeve...</i>", solution: "ace of diamonds" });
	list.push( {text: "4* <i>In ancient times, he was crowned with just 8 years old...</i>", solution: "tutankamon" });
	list.push( {text: "5* <i>Maybe second small step for man, and a second giant leap for mankind?</i>", solution: "mars" });
	list.push( {text: "6* <i>Maths would not be the same without this number...</i>", solution: "pi" });
	list.push( {text: "7* <i>Big ears, funny voice, and a wife with a tie in her head...</i>", solution: "mickey mouse" });
	list.push( {text: "8* <i>You are too young if you have not played it...</i>", solution: "pacman" });
	
	return list;
}

function generateMeshHints(){

	var list = [];

	var texture_loader = new THREE.TextureLoader( window.manager ); 

	/***TWIN TOWERS***/
	var twinTowerGroup = new THREE.Group();
	var towerGeometry = new THREE.BoxGeometry( 0.5, 4, 0.5, 12, 32 );
	var towerTexture =  texture_loader.load( "assets/towers.jpg" );
	var towerMat = new THREE.MeshPhongMaterial( { map: towerTexture, shininess: 300 } );
	
	var towerMesh = new THREE.Mesh(towerGeometry, towerMat);
	var tower2Mesh = new THREE.Mesh(towerGeometry, towerMat);
	tower2Mesh.position.x = towerMesh.position.x + 0.85;
	
	twinTowerGroup.add(towerMesh);
	twinTowerGroup.add(tower2Mesh);
	twinTowerGroup.name = "hint";

	/***Pi***/
	var piGroup = new THREE.Group();
	var circleGeometry = new THREE.TorusGeometry( 0.8, 0.05, 15, 32 );
	var circleMaterial = new THREE.MeshPhongMaterial({color: 0xFFFFFF, shininess: 50 }); 
	var circleMesh = new THREE.Mesh(circleGeometry, circleMaterial);

	var inf1Geometry = new THREE.TorusGeometry( 0.2, 0.02, 15, 32 ); 
	inf1Geometry.applyMatrix( new THREE.Matrix4().makeScale( 1.2, 1.0, 1.5 ) );
	var inf1Mesh = new THREE.Mesh(inf1Geometry, circleMaterial);
	inf1Mesh.position.z = circleMesh.position.x - 0.24;
	inf1Mesh.rotation.y += Math.PI / 2;

	var inf2Geometry = new THREE.TorusGeometry( 0.2, 0.02, 15, 32 );
	inf2Geometry.applyMatrix( new THREE.Matrix4().makeScale( 1.2, 1.0, 1.5 ) );
	var inf2Material = new THREE.MeshPhongMaterial({color: 0xFFFFFF, shininess: 50 }); 
	var inf2Mesh = new THREE.Mesh(inf2Geometry, circleMaterial);
	inf2Mesh.position.z = circleMesh.position.x + 0.24;
	inf2Mesh.rotation.y += Math.PI / 2;

	piGroup.add(circleMesh);
	piGroup.add(inf1Mesh);
	piGroup.add(inf2Mesh);
	piGroup.name = "hint";

	/***DIAMOND***/

	var diamondGeo = new THREE.OctahedronGeometry(1, 0)
	var diamondMat = new THREE.MeshPhongMaterial( { color: 0xff0000, shininess: 50 } );
	var diamondMesh = new THREE.Mesh(diamondGeo, diamondMat);

	diamondMesh.name = "hint";

	/***PLANETA***/
	var marsTexture = texture_loader.load( 'assets/mars.jpg' );
	var marsNormalTexture = texture_loader.load( 'assets/mars_normal.jpg' );
	var planetGeometry = new THREE.SphereGeometry(0.5, 32, 32); 
	var planetMaterial = new THREE.MeshPhongMaterial({map: marsTexture, normalMap: marsNormalTexture, normalScale: new THREE.Vector2( 3, 3 ), shininess: 50 }); 
	var planetMesh = new THREE.Mesh(planetGeometry, planetMaterial);
	planetMesh.name = "hint";


	/***PYRAMID HINT***/
	var pyramidGeometry = new THREE.CylinderGeometry(0, 1.5, 1.5, 4, false); 
	var pyramidMaterial = new THREE.MeshPhongMaterial({color: 0xF1D78B, shininess: 50 }); 
	var pyramidMesh = new THREE.Mesh(pyramidGeometry, pyramidMaterial);
	pyramidMesh.name = "hint";

	/***MIKEY MOUSE***/
	var mikeyGroup = new THREE.Group();
	var mikeyGeo1 = new THREE.SphereGeometry(0.5,32,32);
	mikeyGeo1.applyMatrix( new THREE.Matrix4().makeScale( 1.0, 1.0, 0.85 ) );
	var mikeyMat = new THREE.MeshPhongMaterial({color: 0xC0C0C0, shininess: 50});
	var mikeyGeo2 = new THREE.SphereGeometry(0.3,32,32);
	mikeyGeo2.applyMatrix( new THREE.Matrix4().makeScale( 1.0, 1.0, 0.25 ) );
	var mikeyGeo3 = new THREE.SphereGeometry(0.3,32,32);
	mikeyGeo3.applyMatrix( new THREE.Matrix4().makeScale( 1.0, 1.0, 0.25 ) );
	var mikeyGeo4 = new THREE.SphereGeometry(0.05,32,32);
	mikeyGeo4.applyMatrix( new THREE.Matrix4().makeScale( 1.5, 1.0, 0.8 ) );


	var mikeyMesh1 = new THREE.Mesh(mikeyGeo1, mikeyMat);
	var mikeyMesh2 = new THREE.Mesh(mikeyGeo2, mikeyMat);
	var mikeyMesh3 = new THREE.Mesh(mikeyGeo3, mikeyMat);
	var mikeyMesh4 = new THREE.Mesh(mikeyGeo4, mikeyMat);

	mikeyMesh2.position.x = mikeyMesh1.position.x + 0.4;
	mikeyMesh2.position.y = mikeyMesh1.position.y + 0.5;
	mikeyMesh3.position.x = mikeyMesh1.position.x - 0.4;
	mikeyMesh3.position.y = mikeyMesh1.position.x + 0.5;
	mikeyMesh4.position.z = mikeyMesh1.position.z + 0.45;

	mikeyGroup.add(mikeyMesh1);
	mikeyGroup.add(mikeyMesh2);
	mikeyGroup.add(mikeyMesh3);
	mikeyGroup.add(mikeyMesh4);

	mikeyGroup.name = "hint";

	/***RING HINT***/
	var ringGeometry = new THREE.TorusGeometry( 0.5, 0.05, 12, 32 );
	ringGeometry.applyMatrix( new THREE.Matrix4().makeScale( 1.0, 1.0, 3 ) );
	var ringMat = new THREE.MeshPhongMaterial( { color: 0xD4AF37, shininess: 300 } );
	var ringMesh = new THREE.Mesh(ringGeometry, ringMat);
	ringMesh.name = "hint";

	/***PACMAN***/
	var pacmanGeo = new THREE.TorusGeometry(0.1, 0.5, 30, 20, 5.3);
	var pacmanMat = new THREE.MeshPhongMaterial( { color: 0xFDDE00, shininess: 50, side: THREE.DoubleSide} );
	var pacmanMesh = new THREE.Mesh(pacmanGeo,pacmanMat);
	pacmanMesh.rotation.z += Math.PI/6
	pacmanMesh.name = "hint";

	// ORDER IS IMPORTANT!!!
	list.push( twinTowerGroup );
	list.push( diamondMesh );
	list.push( ringMesh );
	list.push( planetMesh );
	list.push( piGroup );
	list.push( pacmanMesh );
	list.push( mikeyGroup );
	list.push( pyramidMesh );
	
	return list;
}

// crear la matriz desde la imagen
function CREATE_MATRIX(data, myImage){
	var matrix = [];

	for(var i = 0; i < myImage.height; i++){

		var newRow = [];
		for(var j = 0; j < myImage.width; j++){

			newRow.push( data[(i*myImage.width + j)*4] );
		}

		matrix.push( newRow );
	}
	
	return matrix;	
}

// modificar ciertos puntos de la matriz antes de crear la grande
// agua, pistas, puertas
function MODIFY_MATRIX( m ){

	// GREEN DOTS

	m[22][2] = 2;
	m[8][2] = 2;
	m[19][3] = 2;
	m[13][9] = 2;
	m[2][24] = 2;
	m[5][19] = 2;
	m[31][21] = 2;
	m[28][22] = 2;

	// RED DOTS

	m[23][4] = 3;//
	m[10][1] = 3;//
	m[15][20] = 3;//
	m[14][15] = 3;//
	m[3][22] = 3;//
	m[19][14] = 3;//
	m[20][19] = 3;
	m[26][21] = 3;//

	// BLUE DOTS

	m[5][15] = 4;//
	m[5][16] = 4;//
	m[5][17] = 4;//

	return m;
}

// crear una matriz grande a partir de una pequeña
function TRANSFORM_MATRIX( m, space ){

	if(space%2 == 0){
	 	console.log( "Matrix has not been transformed" )
	 	return m; 	
	} 

	var matrix = [];
	var LEN = m.length;
	var fillIn = (space - 1) / 2;
	var fillOut = (space - 1);

	for(var i = 0; i < LEN; i++){
		
		var newRow = [];

		for(var j = 0; j < LEN; j++){
			
			if(j == 0 || j == LEN - 1){

				for(var z = 0; z < fillIn + 1; z++){
					newRow.push(m[i][j]);
				}
			}else{
				for(var z = 0; z < fillOut + 1; z++){
					newRow.push(m[i][j]);
				}
			}
		}

		if(i == 0 || i == LEN - 1){

			for(var z = 0; z < fillIn + 1; z++){
				matrix.push( newRow );
			}
		}else{
			for(var z = 0; z < fillOut + 1; z++){
				matrix.push( newRow );
			}
		}
	}

	return matrix;
}


function coinFlip() {
    return (Math.floor(Math.random() * 2) == 0);
}

function isInt(n){
    return Number(n) === n && n % 1 === 0;
}

function isFloat(n){
    return Number(n) === n && n % 1 !== 0;
}