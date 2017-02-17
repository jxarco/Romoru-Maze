var app = {

	start3D: function(){
		INTERACTION();
	}
}

var HINTS = generateHintList();
var hintIterator = 0;
var wallIterator = 0;

var camera, renderer, controls, startTime;
var MAT, MAT2, data;
var floorMESH, materials;
var container, tam;
var light, light2;
var direction = new THREE.Vector3();
var raycaster = new THREE.Raycaster();
var initialRotation;
var co = 1;

window.walls_on = true;
window.controls = false;
window.scene;
window.mouse = new THREE.Vector2();

funZero();

function funZero(){

	container = document.querySelector(".canvas_container");
	tam = container.getBoundingClientRect();

	// MAZE INFO

	// Get a reference to the image you want the pixels of and its dimensions
	var myImage = document.getElementById('maze_img');
	var w = myImage.width, h = myImage.height;
	// Create a Canvas element
	var canvas = document.createElement('canvas');
	// Size the canvas to the element
	canvas.width = w;
	canvas.height = h;

	// Draw image onto the canvas
	var ctx = canvas.getContext('2d');
	ctx.drawImage(myImage, 0, 0);

	// Finally, get the image data
	// ('data' is an array of RGBA pixel values for each pixel)
	var data = ctx.getImageData(0, 0, w, h);
	var pixelsData = data.data;

	MAT = CREATE_MATRIX(pixelsData, myImage);
	MAT = MODIFY_MATRIX(MAT);
	MAT2 = TRANSFORM_MATRIX(MAT, 5);
}

function INTERACTION(){
	
	var geometry, material;
	var objects = [];
	startTime = Date.now();

	init();
	animate();
	var moveForward = false;
	var moveBackward = false;
	var moveLeft = false;
	var moveRight = false;
	var q = false, e = false;
	var prevTime = performance.now();

	function init() {

		camera = new THREE.PerspectiveCamera( 50, tam.width / tam.height, 0.1, 1000 );
		scene = new THREE.Scene();
		scene.fog = new THREE.Fog( 0xffffff, 0, 1000 );

		// LIGHTS
		light = new THREE.DirectionalLight( 0xffffff, 0.15 );
		light.position.set( 0.5, 1, 0.75 );
		scene.add( light );

		light2 = new THREE.PointLight( 0xffffff, 1, 20, 1.5 );
		light2.penumbra = 0.1;

		scene.add(light2)

		var onKeyDown = function ( event ) {

			if(document.activeElement.localName == "textarea" || document.activeElement.localName == "input"){
				return;
			}

			switch ( event.keyCode ) {
				case 38: // up
				case 87: // w
					moveForward = false;
					break;
				case 37: // left
				case 65: // a
					moveLeft = false;
					break;
				case 40: // down
				case 83: // s
					moveBackward = false;
					break;
				case 39: // right
				case 68: // d
					moveRight = false;
					break;
				case 69: // e
					e = true;
					break;
			}
		};
		var onKeyUp = function ( event ) {

			if(document.activeElement.localName == "textarea" || document.activeElement.localName == "input"){
				return;
			}

			switch( event.keyCode ) {
				case 38: // up
				case 87: // w
					moveForward = true;
					break;
				case 37: // left
				case 65: // a
					moveLeft = true;
					break;
				case 40: // down
				case 83: // s
					moveBackward = true;
					break;
				case 39: // right
				case 68: // d
					moveRight = true;
					break;
				case 80: // p
					privateInfo();
					break;
				case 67: // c
					openChat();
					break;
				case 73: // i
					document.getElementById("canvas_info").style.display = "block";
					break;
				case 81: // q = realign
					camera.rotation.y = initialRotation;
					break;
				case 69: // e
					e = false;
					break;
			}
		};

		document.addEventListener( 'keydown', onKeyDown, false );
		document.addEventListener( 'keyup', onKeyUp, false );

		// objects *************************************************************************************************

		// floor
		var floorTexture =  new THREE.TextureLoader().load( 'assets/grass_texture.png' );
	    var geometry = new THREE.PlaneGeometry(165, 165, 1, 1);
	    geometry.rotateX( - Math.PI / 2 );
	    
		var material1 = new THREE.MeshPhongMaterial( { color: 0xffffff, map: floorTexture } );
		floorTexture.wrapS = floorTexture.wrapT = THREE.RepeatWrapping;
		floorTexture.repeat.set( 16, 16 );

	    floorMESH = new THREE.Mesh(geometry, material1);
	    floorMESH.position.x = 80;
		floorMESH.position.y = -1.5;
		floorMESH.position.z = 80;
		floorMESH.receiveShadow = true;
		floorMESH.name = "floor";
		scene.add( floorMESH );

		//WALLS
		if(window.walls_on){
			var wallTexture1 =  new THREE.TextureLoader().load( 'assets/wall2.jpg' );
			var wallTexture2 =  new THREE.TextureLoader().load( 'assets/wall4.png' );
			var wallDoorTexture =  new THREE.TextureLoader().load( 'assets/wall3.jpg' );
			for(var i = 0; i < MAT.length; i++){
				for(var j = 0; j < MAT.length; j++){
					if(MAT[i][j] == 0){ // 0 NEGRO

						wallIterator++;

						var wallGeo = new THREE.BoxGeometry(5, 4, 5);
						var wallMat1 = new THREE.MeshPhongMaterial( {
								map: wallTexture1,
								side: THREE.DoubleSide
						});
						var wallMat2 = new THREE.MeshPhongMaterial( {
								map: wallTexture2,
								side: THREE.DoubleSide
						});

						if(wallIterator % 2 == 0){
							var wall = new THREE.Mesh(wallGeo, wallMat1);
						}else{
							var wall = new THREE.Mesh(wallGeo, wallMat2);
						}

						wall.position.x = i * 5;
						wall.position.y = 0;
						wall.position.z = j * 5;
						wall.receiveShadow = true;
						hint.castShadow = true;
						scene.add(wall);
					} 
					else if(MAT[i][j] == 2){ // 2 VERDE MODIFICADO

						var hint = HINTS[hintIterator];
						hint.position.x = i * 5;
						hint.position.y = 0;
						hint.position.z = j * 5;
						hint.receiveShadow = true;
						hint.castShadow = true;
						scene.add(hint);
						hintIterator++;
					} 
					else if(MAT[i][j] == 3){ // 3 ROJO MODIFICADO
						var wallGeo = new THREE.BoxGeometry(5, 4, 5);
						var wallMat = new THREE.MeshPhongMaterial( {
								map: wallDoorTexture,
								side: THREE.DoubleSide
						});

						var wall = new THREE.Mesh(wallGeo, wallMat);
						wall.name = "red";
						wall.position.x = i * 5;
						wall.position.y = 0;
						wall.position.z = j * 5;
						wall.receiveShadow = true;
						hint.castShadow = true;
						scene.add(wall);
					}


					// HACKER MODE ***********************************************************************
					else if(MAT[i][j] == 252){ // 252 AMARILLO 
						wallGeo = new THREE.BoxGeometry(5, 1, 5);
						var AUX = new THREE.MeshPhongMaterial( {
								color: "yellow",
								shininess: 100,
								side: THREE.DoubleSide
						});
						wall = new THREE.Mesh(wallGeo, AUX);
						wall.position.x = i * 5;
						wall.position.y = -1.5;
						wall.position.z = j * 5;
						scene.add(wall);
					} 
					// ***********************************************************************************
				}
			}
		}
		
		// COMPROBAR BLOQUEOS DE COLISIONES

		// WALLS CON MUCHAS MESHS -> DESDE MAT2
		// for(var i = 0; i < MAT2.length; i++){
		// 	for(var j = 0; j < MAT2.length; j++){
		// 		if(MAT2[i][j] == 0){ // 0 NEGRO + AZUL + VERDE
		// 			var wallGeo = new THREE.BoxGeometry(1, 4, 1);

		// 			var wall = new THREE.Mesh(wallGeo, AUX);
		// 			wall.position.x = i;
		// 			wall.position.y = 0;
		// 			wall.position.z = j;
		// 			scene.add(wall);
		// 		} 
		// 	}
		// }

		// renderer ************************************************************************************************

		renderer = new THREE.WebGLRenderer();
		renderer.setPixelRatio( window.devicePixelRatio );
		renderer.setSize( tam.width, tam.height );
		renderer.domElement.id = "my_canvas";
		container.appendChild( renderer.domElement );

		//controls (mouse)
		if(window.controls){
			controls = new THREE.OrbitControls( camera, renderer.domElement );
			controls.update();	
		}
		
		window.addEventListener( 'resize', onWindowResize, false );
	}
	function onWindowResize() {
		camera.aspect = tam.width / tam.height;
		camera.updateProjectionMatrix();
		renderer.setSize( tam.width, tam.height );
	}

	function limits(dir){

		// Si va para atrás, tenemos que restar la dirección!!!
		if(dir) co = 1;
		else co = -1;

		var x = Math.floor(camera.position.x + (co * direction.x));
		var z = Math.floor(camera.position.z + (co * direction.z));

		if (MAT2[x][z] == 0){
		 	return false;
		}
		return true;
	}

	function animate() {
		requestAnimationFrame( animate );
		var currentTime = performance.now();
		var time = ( currentTime - startTime ) / 1000;

		camera.getWorldDirection( direction );

		if(moveForward && limits(1)){
			new TWEEN.Tween( camera.position ).to( {
						x: Math.floor(camera.position.x + direction.x),
						z: Math.floor(camera.position.z + direction.z),
			}, 200 ).easing( TWEEN.Easing.Linear.None).start();

			moveForward = false;
			
		}
		if(moveBackward && limits(0)){
			new TWEEN.Tween( camera.position ).to( {
						x: camera.position.x - direction.x,
						z: camera.position.z - direction.z,
			}, 200 ).easing( TWEEN.Easing.Linear.None).start();

			moveBackward = false;
		}
		if(moveLeft){
			new TWEEN.Tween( camera.rotation ).to( {
						y: camera.rotation.y + Math.PI / 2
			}, 300 ).easing( TWEEN.Easing.Sinusoidal.In).start();

			moveLeft = false;
		}
		if(moveRight){
			new TWEEN.Tween( camera.rotation ).to( {
						y: camera.rotation.y - Math.PI / 2
			}, 300 ).easing( TWEEN.Easing.Sinusoidal.In).start();

			moveRight = false;
		}

		light2.position.x = camera.position.x;
		light2.position.y = camera.position.y;
		light2.position.z = camera.position.z;

		if(window.controls) controls.target.set(75, 0, 75);

		// hints rotation
		for(var i = 0; i < scene.children.length; i++){
			if(scene.children[i].name == "hint"){
				scene.children[i].rotation.y += 0.01;
				scene.children[i].position.y = Math.sin( time * 0.75 ) * 0.5;
			}
		}

		TWEEN.update();
		renderer.render( scene, camera );
	}
}

function intersect(){
	// update the picking ray with the camera and mouse position
	raycaster.setFromCamera( window.mouse, camera );

	// calculate objects intersecting the picking ray
	var intersects = raycaster.intersectObjects( scene.children, true );

	if ( intersects.length > 0 ) {
		var intersect = intersects[ 0 ];
		if(intersect.object.name == "red"){
			document.getElementById("canvas_info").style.display = "block";
			document.getElementById("solution").style.display = "block";
			var text = document.getElementById("instructions");
			text.innerHTML = "<b>GOOD! DOOR TO NEXT LEVEL HAD BEEN REACHED!</b><br/>" + 
			"<br/>" +
			"You are not done yet! Try do solve this enigma to pass the door. Maybe other players "+
			"could have useful hints for you...<br/><br/>" + 
			" Hint: HINT1" +
			"<br/><br/>"  + 
			"<i>Close me with X or pressing ESC</i>"; 
		}
	}
}

function setCamera(list){

	var x = list.posx;
	var z = list.posz;
	var rotation = list.rot;

	camera.position.x = 22 * 5;//x;
	camera.position.z = 2 * 5;//z;
	camera.rotation.y += rotation;

	initialRotation = camera.rotation.y;
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

function isInt(n){
    return Number(n) === n && n % 1 === 0;
}

function isFloat(n){
    return Number(n) === n && n % 1 !== 0;
}

function generateHintList(){

	var list = [];

	/***RING HINT***/
	var ringGeometry = new THREE.TorusGeometry( 0.5, 0.05, 12, 32 );
	ringGeometry.applyMatrix( new THREE.Matrix4().makeScale( 1.0, 1.0, 3 ) );
	var ringMat = new THREE.MeshPhongMaterial( { color: 0xddc604, shininess: 300 } );
	var ringMesh = new THREE.Mesh(ringGeometry, ringMat);
	ringMesh.name = "hint";

	list.push( ringMesh );

	/***PYRAMID HINT***/
	var pyramidGeometry = new THREE.CylinderGeometry(0, 1.5, 1.5, 4, false); 
	var pyramidMaterial = new THREE.MeshPhongMaterial({color: 0xF1D78B, shininess: 50 }); 
	var pyramidMesh = new THREE.Mesh(pyramidGeometry, pyramidMaterial);
	pyramidMesh.name = "hint";

	list.push( pyramidMesh );


	/***PLANETA***/
	var planetGeometry = new THREE.SphereGeometry(0.5, 32, 32); 
	var planetMaterial = new THREE.MeshPhongMaterial({color: 0xFD772A, shininess: 50 }); 
	var planetMesh = new THREE.Mesh(planetGeometry, planetMaterial);
	planetMesh.name = "hint";

	list.push( planetMesh );


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

	/***DIAMOND***/

	var diamondGeo = new THREE.OctahedronGeometry(1, 0)
	var diamondMat = new THREE.MeshPhongMaterial( { color: 0xff0000, shininess: 50 } );
	var diamondMesh = new THREE.Mesh(diamondGeo, diamondMat);

	diamondMesh.name = "hint";
	list.push( diamondMesh );

	/***PACMAN***/
	var pacmanGeo = new THREE.TorusGeometry(0.1, 0.5, 30, 20, 5.3);
	var pacmanMat = new THREE.MeshPhongMaterial( { color: 0xFDDE00, shininess: 50, side: THREE.DoubleSide} );
	var pacmanMesh = new THREE.Mesh(pacmanGeo,pacmanMat);
	pacmanMesh.rotation.z += Math.PI/6
	pacmanMesh.name = "hint";

	list.push( pacmanMesh );

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

	return list;
}
