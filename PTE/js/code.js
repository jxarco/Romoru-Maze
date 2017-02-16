var app = {

	start3D: function(){
		INTERACTION();
	}
}

var confeti_list = [];
var pop_list = [];
var collidableMeshList = [];

var camera, scene, renderer, controls;
var MAT, MAT2, data;
var floorMESH, materials;
var container, tam, audio;
var light, light2;
var direction = new THREE.Vector3();
var initialRotation;
var co = 1;

window.walls_on = true;

funZero();

function funZero(){

	container = document.querySelector(".canvas_container");
	tam = container.getBoundingClientRect();
	audio = new Audio('assets/audio.mp3');

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
		light = new THREE.HemisphereLight( 0xeeeeff, 0x777788, 0.1 );
		light.position.set( 0.5, 1, 0.75 );
		scene.add( light );

		light2 = new THREE.PointLight( 0xffffff, 1, 15, 1 );
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
		scene.add( floorMESH );

		// // roof
		// var roofTexture =  new THREE.TextureLoader().load( 'assets/space.png' );
	 //    var geometry2 = new THREE.PlaneGeometry(165, 165, 2, 1, 1);
	 //    geometry2.rotateX( - Math.PI / 2 );
	 //    geometry2.rotateZ( - Math.PI );
	    
		// var material2 = new THREE.MeshPhongMaterial( { color: 0xffffff, map: roofTexture } );
		// roofTexture.wrapS = roofTexture.wrapT = THREE.RepeatWrapping;
		// roofTexture.repeat.set( 256, 256 );

	 //    roofMESH = new THREE.Mesh(geometry2, material2);
	 //    roofMESH.position.x = 80;
		// roofMESH.position.y = 2;
		// roofMESH.position.z = 80;
		// roofMESH.receiveShadow = true;
		// scene.add( roofMESH );

		//WALLS
		if(window.walls_on){
			var wallTexture =  new THREE.TextureLoader().load( 'assets/wall2.jpg' );
			for(var i = 0; i < MAT.length; i++){
				for(var j = 0; j < MAT.length; j++){
					if(MAT[i][j] == 0){ // 0 NEGRO
						var wallGeo = new THREE.BoxGeometry(5, 4, 5);
						var wallMat = new THREE.MeshPhongMaterial( {
								map: wallTexture,
								shininess: 100,
								side: THREE.DoubleSide
						});

						var wall = new THREE.Mesh(wallGeo, wallMat);
						wall.position.x = i * 5;
						wall.position.y = 0;
						wall.position.z = j * 5;
						wall.receiveShadow = true;
						scene.add(wall);
					} 
					else if(MAT[i][j] == 2){ // 2 VERDE MODIFICADO
						var wallGeo = new THREE.BoxGeometry(5, 4, 5);
						var AUX = new THREE.MeshPhongMaterial( {
					 			color: "green",
					 			shininess: 100,
					 			side: THREE.DoubleSide
					 	});

						var wall = new THREE.Mesh(wallGeo, AUX);
						wall.position.x = i * 5;
						wall.position.y = 0;
						wall.position.z = j * 5;
						wall.receiveShadow = true;
						scene.add(wall);
					} 
					else if(MAT[i][j] == 3){ // 3 ROJO MODIFICADO
						var wallGeo = new THREE.BoxGeometry(5, 4, 5);
						var AUX = new THREE.MeshPhongMaterial( {
					 			color: "red",
					 			shininess: 100,
					 			side: THREE.DoubleSide
					 	});

						var wall = new THREE.Mesh(wallGeo, AUX);
						wall.position.x = i * 5;
						wall.position.y = 0;
						wall.position.z = j * 5;
						wall.receiveShadow = true;
						scene.add(wall);
					}


					// HACKER MODE ***********************************************************************
					// else if(MAT[i][j] == 252){ // 252 AMARILLO 
					// 	wallGeo = new THREE.BoxGeometry(5, 1, 5);
					// 	var AUX = new THREE.MeshPhongMaterial( {
					// 			color: "yellow",
					// 			shininess: 100,
					// 			side: THREE.DoubleSide
					// 	});
					// 	wall = new THREE.Mesh(wallGeo, AUX);
					// 	wall.position.x = i * 5;
					// 	wall.position.y = -1.5;
					// 	wall.position.z = j * 5;
					// 	wall.receiveShadow = true;
					// 	scene.add(wall);
					// } 
					// ***********************************************************************************
				}
			}
		}
		
		// COMPROBAR BLOQUEOS DE COLISIONES

		// WALLS CON MUCHAS MESHS -> DESDE MAT2
		// for(var i = 0; i < MAT2.length; i++){
		// 	for(var j = 0; j < MAT2.length; j++){
		// 		if(MAT2[i][j] == 0){ // 0 NEGRO + AZUL + VERDE
		// 			var wallGeo = new THREE.BoxGeometry(1, 3.1, 1);

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

		// controls (mouse)
		controls = new THREE.OrbitControls( camera, renderer.domElement );
		controls.update();

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

			console.log(camera.rotation.y)

			moveLeft = false;
		}
		if(moveRight){
			new TWEEN.Tween( camera.rotation ).to( {
						y: camera.rotation.y - Math.PI / 2
			}, 300 ).easing( TWEEN.Easing.Sinusoidal.In).start();

			console.log(camera.rotation.y)

			moveRight = false;
		}

		light2.position.x = camera.position.x;
		light2.position.y = camera.position.y;
		light2.position.z = camera.position.z;

		TWEEN.update();
		renderer.render( scene, camera );
	}
}

function confetiExplosion(){

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
		scene.add( confetiMesh );
	}
}

function removeConfeti(){

	audio.pause();
	audio.currentTime = 0;

	// quitar el confeti anterior
	for( var i = confeti_list.length - 1; i >= 0; i--){
		scene.remove(confeti_list[i]);
	}
}

function deleteUser(user_id){
	for( var i = 0; i < scene.children.length; i++){
		// borrará la luz(grupo luz + esfera) y el jugador

		if(scene.children[i].name == user_id){
			scene.remove(scene.children[i]);
		}
	}
	for( var i = 0; i < scene.children.length; i++){
		if(scene.children[i].name == (user_id + "_body")){
			scene.remove(scene.children[i]);
		}
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
}

function setCamera(list){

	var x = list.posx;
	var z = list.posz;
	var rotation = list.rot;

	camera.position.x = x;
	camera.position.z = z;
	camera.rotation.y += rotation;

	initialRotation = camera.rotation.y;
}

function CREATE_MATRIX(data, myImage){
	var matrix = [];

	// for(var i = 0; i < data.length; i += 4){
	// 	// 	var newRow = [];
	// 	//for(var j = 0; j < myImage.height; j++){
	// 		var pixelr = data[i];
	// 		var pixelg = data[i+1];
	// 		var pixelb = data[i+2];
	// 		var pixela = data[i+3];

	// 		var s = "r: " + pixelr + ", g: " + pixelg + ", b: " + pixelb + ", a: " + pixela;
			
	// 		//newRow.push( s );
	// 	//}

	// 	matrix.push( s );
	// }



	for(var i = 0; i < myImage.height; i++){

		var newRow = [];
		for(var j = 0; j < myImage.width; j++){

			newRow.push( data[(i*myImage.width + j)*4] );
		}

		matrix.push( newRow );
	}

	// for(var i = 0; i < 3; i++){

	// 	var newRow = [];
	// 	for(var j = 0; j < 3; j++){

	// 		newRow.push( i+j );
	// 	}

	// 	matrix.push( newRow );
	// }
	
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

	// if(space%2 == 0){
	// 	console.log( "Matrix has not been transformed" )
	// 	return m; 	
	// } 

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

