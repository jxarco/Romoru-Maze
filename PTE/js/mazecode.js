var app = {

	start3D: function(){
		INTERACTION();
	}
}

var HINTS = generateMeshHints();
var TEXT_HINTS = generateTextHints();
var hintIterator = 0;
var textHintIterator = 0;
var wallIterator = 0;

var activeObject;

var camera, renderer, controls, startTime;
var MAT, MAT2, data;
var floorMESH, sphere, materials;
var container, tam;
var light, light2, light3;
var direction = new THREE.Vector3();
var raycaster = new THREE.Raycaster();
var initialRotation;
var co = 1;

window.walls_on = true;
window.controls = true;
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
		scene.add(light2);

		var sphereGeo = new THREE.SphereGeometry(0.1, 32, 32);
		var sphereMat = new THREE.MeshPhongMaterial( {
								color: 0xffffff,
								side: THREE.DoubleSide
						});
		sphere = new THREE.Mesh(sphereGeo, sphereMat);
		sphere.position.x = 77.5;
		sphere.position.z = 77.5;
		scene.add(sphere);

		light3 = new THREE.PointLight( 0xffffff, 2, 50, 1.5 );
		light3.position.set( 77.5, 1, 77.5 );
		scene.add( light3 );

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
						var wallMat1 = new THREE.MeshBasicMaterial( {
								map: wallTexture1,
								side: THREE.DoubleSide
						});
						var wallMat2 = new THREE.MeshBasicMaterial( {
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
						wall.castShadow = true;
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
					else if(MAT[i][j] == 3){ // 3 ROJO MODIFICADO -> PUERTAS
						var wallGeo = new THREE.BoxGeometry(5, 4, 5);
						var wallMat = new THREE.MeshPhongMaterial( {
								map: wallDoorTexture,
								side: THREE.DoubleSide
						});
						var wallMat1 = new THREE.MeshPhongMaterial( {
								map: wallTexture1,
								side: THREE.DoubleSide
						});

						materials = [

						    new THREE.MeshBasicMaterial( { map: wallDoorTexture } ), // right
						    new THREE.MeshBasicMaterial( { map: wallDoorTexture } ), // left
						    new THREE.MeshBasicMaterial( { map: wallTexture1 } ), // top
						    new THREE.MeshBasicMaterial( { map: wallTexture1 } ), // bottom
						    new THREE.MeshBasicMaterial( { map: wallDoorTexture } ), // back
						    new THREE.MeshBasicMaterial( { map: wallDoorTexture } )  // front

						];

						var wall = new THREE.Mesh(wallGeo, new THREE.MultiMaterial( materials ));
						var textHint = TEXT_HINTS[textHintIterator];
						wall.name = "red";
						wall.message = textHint.text;
						wall.position.x = i * 5;
						wall.position.y = 0;
						wall.position.z = j * 5;
						wall.receiveShadow = true;
						wall.castShadow = true;
						scene.add(wall);
						textHintIterator++;
					}


					// HACKER MODE ***********************************************************************
					// else if(MAT[i][j] == 252){ // 252 AMARILLO 
					// 	wallGeo = new THREE.BoxGeometry(5, 1, 5);
					// 	var AUX = new THREE.MeshBasicMaterial( {
					// 			color: "yellow",
					// 	});
					// 	wall = new THREE.Mesh(wallGeo, AUX);
					// 	wall.position.x = i * 5;
					// 	wall.position.y = -1.5;
					// 	wall.position.z = j * 5;
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

		console.log(MAT2[x][z])

		if (MAT2[x][z] == 0 || MAT2[x][z] == 3){
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

		// hints rotation
		for(var i = 0; i < scene.children.length; i++){
			if(scene.children[i].name == "hint"){
				scene.children[i].rotation.y += 0.01;
				scene.children[i].position.y = Math.sin( time * 0.75 ) * 0.5;
			}
		}

		sphere.position.x = Math.cos( time ) * 2 + 85;
		sphere.position.z = Math.sin ( time ) * 2 + 85;
  		light3.position.x = Math.cos( time ) * 2 + 85;
 		light3.position.z = Math.sin( time ) * 2 + 85;

		TWEEN.update();
		renderer.render( scene, camera );
	}
}

function isSolution(){
	var text = document.getElementById("instructions");
	var input = document.getElementById("solution");
	var posibleSolution = document.getElementById("solution").value.toLowerCase();
	posibleSolution = posibleSolution.substring(0, posibleSolution.length - 1);
	input.value = "";

	var index = parseInt(text.innerHTML[191]) - 1;

	var solution = TEXT_HINTS[index].solution;

	if(posibleSolution === solution){
		text.innerHTML = "<b><p align='center'><font size='10'>WELL DONE!</font></p></b>";
		input.style.display = "none";
		MAT2[activeObject.position.x][activeObject.position.z] = -1; // para poder pasar
		new TWEEN.Tween( activeObject.position ).to( {
						y: -3.45
			}, 6000 ).easing( TWEEN.Easing.Linear.None).start();
		
		// setTimeout(function(){
		// 	scene.remove( activeObject );
		// }, 6000);
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
			" Hint: " +
			intersect.object.message +
			"<br/><br/>"  + 
			"<i>Close me with X or pressing ESC</i>";

			activeObject = intersect.object;
		}
	}
}

function setCamera(list){

	var x = list.posx;
	var z = list.posz;
	var rotation = list.rot;

	camera.position.x = 75;//x;
	camera.position.z = 75;//z;
	camera.rotation.y += rotation;

	initialRotation = camera.rotation.y;
}