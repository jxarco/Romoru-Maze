/*var confeti_list = [];
var pop_list = [];
var audio = new Audio('assets/audio.mp3');*/

function coinFlip() {
    return (Math.floor(Math.random() * 2) == 0);
}

function isInt(n){
    return Number(n) === n && n % 1 === 0;
}

function isFloat(n){
    return Number(n) === n && n % 1 !== 0;
}

// tecla ENTER para enviar solucion
document.getElementById("solution").addEventListener("keyup", function(event){
  event.preventDefault();
  if(event.keyCode == 13)
  {
    isSolution();
  }
});

function generateTextHints(){
	list = [];
	list.push( {text: "1* <i>Maybe you have an ace in the sleeve...</i>", solution: "ace of diamonds" });
	list.push( {text: "2* <i>Disney cartoon...</i>", solution: "mickey mouse" });
	list.push( {text: "3* <i>In ancient times, he was not a king, not a god...</i>", solution: "tutankamon" });
	list.push( {text: "4* <i>You are too young if you have not played it...</i>", solution: "pacman" });
	list.push( {text: "5* <i>Maths would not be the same without this number...</i>", solution: "pi" });
	list.push( {text: "6* <i>Maybe people is kinda racist for small ones...</i>", solution: "pluto" });
	list.push( {text: "7* <i>It was terrorism, not an accident...</i>", solution: "11s" });
	list.push( {text: "8* <i>Some people call him <b>The Lord</b>...</i>", solution: "sauron" });

	return list;
}

function generateMeshHints(){

	var list = [];

	/***TWIN TOWERS***/
	var twinTowerGroup = new THREE.Group();
	var towerGeometry = new THREE.BoxGeometry( 0.5, 3, 0.5, 12, 32 );
	var towerMat = new THREE.MeshPhongMaterial( { color: "grey", shininess: 300 } );
	var towerMesh = new THREE.Mesh(towerGeometry, towerMat);


	var tower2Mesh = new THREE.Mesh(towerGeometry, towerMat);
	tower2Mesh.position.x = towerMesh.position.x + 0.85;
	
	twinTowerGroup.add(towerMesh);
	twinTowerGroup.add(tower2Mesh);
	twinTowerGroup.name = "hint";

	list.push( twinTowerGroup );

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

	list.push( piGroup );

	/***DIAMOND***/

	var diamondGeo = new THREE.OctahedronGeometry(1, 0)
	var diamondMat = new THREE.MeshPhongMaterial( { color: 0xff0000, shininess: 50 } );
	var diamondMesh = new THREE.Mesh(diamondGeo, diamondMat);

	diamondMesh.name = "hint";
	list.push( diamondMesh );

	/***PLANETA***/
	var planetGeometry = new THREE.SphereGeometry(0.5, 32, 32); 
	var planetMaterial = new THREE.MeshPhongMaterial({color: 0xFD772A, shininess: 50 }); 
	var planetMesh = new THREE.Mesh(planetGeometry, planetMaterial);
	planetMesh.name = "hint";

	list.push( planetMesh );

	/***PYRAMID HINT***/
	var pyramidGeometry = new THREE.CylinderGeometry(0, 1.5, 1.5, 4, false); 
	var pyramidMaterial = new THREE.MeshPhongMaterial({color: 0xF1D78B, shininess: 50 }); 
	var pyramidMesh = new THREE.Mesh(pyramidGeometry, pyramidMaterial);
	pyramidMesh.name = "hint";

	list.push( pyramidMesh );

	/***MIKEY MOUSE***/
	var mikeyGroup = new THREE.Group();
	var mikeyGeo1 = new THREE.SphereGeometry(0.5,32,32);
	mikeyGeo1.applyMatrix( new THREE.Matrix4().makeScale( 1.0, 1.0, 0.85 ) );
	var mikeyMat = new THREE.MeshPhongMaterial({color: "grey", shininess: 50});
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

	list.push( mikeyGroup );

	/***RING HINT***/
	var ringGeometry = new THREE.TorusGeometry( 0.5, 0.05, 12, 32 );
	ringGeometry.applyMatrix( new THREE.Matrix4().makeScale( 1.0, 1.0, 3 ) );
	var ringMat = new THREE.MeshPhongMaterial( { color: 0xddc604, shininess: 300 } );
	var ringMesh = new THREE.Mesh(ringGeometry, ringMat);
	ringMesh.name = "hint";

	list.push( ringMesh );

	/***PACMAN***/
	var pacmanGeo = new THREE.TorusGeometry(0.1, 0.5, 30, 20, 5.3);
	var pacmanMat = new THREE.MeshPhongMaterial( { color: 0xFDDE00, shininess: 50, side: THREE.DoubleSide} );
	var pacmanMesh = new THREE.Mesh(pacmanGeo,pacmanMat);
	pacmanMesh.rotation.z += Math.PI/6
	pacmanMesh.name = "hint";

	list.push( pacmanMesh );

	return list;
}

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

/*function confetiExplosion(){

	removeConfeti();

	audio.play();
	
	var confetiMat = new THREE.MeshPhongMaterial( {
			color: Math.random() * 0x808008 + 0x808080,
			shininess: 100,
			side: THREE.DoubleSide
		} );

	var confetiGeo = new THREE.BoxGeometry(0.12, 0.01, 0.07);

	for(var i = 0; i < 2000; i++){

		confetiMat = new THREE.MeshPhongMaterial( {
			color: Math.random() * 0x808008 + 0x808080,
			shininess: 100,
			side: THREE.DoubleSide
		} );

		var y = (Math.random() * 30) + 1;
		var x = (Math.random() * 30) + 1;
		var z = (Math.random() * 30) + 1;

		confetiMesh  = new THREE.Mesh( confetiGeo, confetiMat );
		confetiMesh.castShadow = true;
		confetiMesh.rotation.x = (Math.random() * 2 * Math.PI) + 1;
		confetiMesh.position.x = x - 15;
		confetiMesh.position.y = y + 7;
		confetiMesh.position.z = z - 15;
		confeti_list.push(confetiMesh);
		toScene( confetiMesh, 1 );
	}
}

function removeConfeti(){

	audio.pause();
	audio.currentTime = 0;

	// quitar el confeti anterior
	for( var i = confeti_list.length - 1; i >= 0; i--){
		toScene( confeti_list[i], 0 );
	}
}

function popCube(argumentx, argumentz){

	if(!argumentx){
		var px = scene.getObjectByName("player_body").position.x;
		var pz = scene.getObjectByName("player_body").position.z;
	}else{
		var px = argumentx;
		var pz = argumentz;
	}
	
	var poppedGeo = new THREE.BoxGeometry(0.25, 0.25, 0.25);
	var poppedMat = new THREE.MeshPhongMaterial( {
			color: Math.random() * 0x808008 + 0x808080,
			shininess: 100,
			side: THREE.DoubleSide
	});

	var popped = new THREE.Mesh(poppedGeo, poppedMat);
	popped.position.x = px;
	popped.position.y = 2;
	popped.position.z = pz;
	pop_list.push(popped);
	scene.add(popped);

	if(!argumentx){
		var poppedPosition = {
			x: px,
			z: pz,
			info: 12
		}

		if(window.server_on) server.sendMessage(poppedPosition);
	}
}

function removePopped(){
	for( var i = pop_list.length - 1; i >= 0; i--){
		scene.remove(pop_list[i]);
	}
}*/