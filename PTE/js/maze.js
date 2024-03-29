
var maze = {

	start3D: function(){
		INTERACTION();
	}
}

// defines
var W = 87, A = 65, S = 83, D = 68;
var FORWARD = 1, BACKWARD = 0;
// *************************+

var HINTS = generateMeshHints(); // LISTA CON OBJETOS
var TEXT_HINTS = generateTextHints(); // LISTA CON LOS TEXTOS DE CADA PUERTA
var hintIterator = 0;
var textHintIterator = 0;
var wallIterator = 0;

var activeObject; // Este sirve para guardar el ultimo objeto al que hemos clicado
var PNJ;
var animations = [];

// DOORS
var PIECES = [];
var howAreDoors = [];

var scene, camera, renderer, controls, startTime;
var MAT, MAT2, data;
var floorMESH, sphere, materials;
var container, tam;
var light, light2, light3;
var direction = new THREE.Vector3();
var auxiliar = new THREE.Vector3();
var raycaster = new THREE.Raycaster();
var initialRotation;

var is_moving = false;
window.walls_on = true;
window.controls = false;
window.admin = true;
window.mouse = new THREE.Vector2();
window.manager = new THREE.LoadingManager();

window.keys = [];

function loadData_fromImg(){

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

	loadData_fromImg();
	init();
	animate();

	function init() {

		camera = new THREE.PerspectiveCamera( 50, tam.width / tam.height, 0.1, 10000 );
		scene = new THREE.Scene();

		window.manager.onLoad = function(){
			document.getElementById("pixel-loader").style.display = "none";
		    document.querySelector("#contact_name").innerHTML = "Create or join a room to begin:";
		    document.getElementById("roominput").style.display = "block";
		    document.getElementById("roominput").focus();
		}

		texture_loader = new THREE.TextureLoader( window.manager );

		// LIGHTS
		light = new THREE.DirectionalLight( 0xffffff, 0.2 );
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

		light3 = new THREE.PointLight( 0xffffff, 0.75, 50, 1.5 );
		light3.position.set( 77.5, 1, 77.5 );
		scene.add( light3 );

		// SKY *********************************

		var imagePrefix = "assets/dawnmountain-";
		var directions  = ["xpos", "xneg", "ypos", "yneg", "zpos", "zneg"];
		var imageSuffix = ".png";
		var skyGeometry = new THREE.CubeGeometry( 256, 256, 256 );	
		
		var materialArray = [];
		for (var i = 0; i < 6; i++)
			materialArray.push( new THREE.MeshBasicMaterial({
				map: texture_loader.load( imagePrefix + directions[i] + imageSuffix ),
				side: THREE.BackSide
			}));
		var skyMaterial = new THREE.MultiMaterial( materialArray );
		var skyBox = new THREE.Mesh( skyGeometry, skyMaterial );
		skyBox.position.x = 75;
		skyBox.position.z = 75;
		skyBox.position.y = 10;
		scene.add( skyBox );

		// GAME ***********************

	    var gameGeoScreen = new THREE.PlaneGeometry(8, 4, 1, 1);
	    var gameGeoCube = new THREE.BoxGeometry(0.95, 0.95, 0.05);

		var gameMat = new THREE.MeshPhongMaterial( { color: 0xffffff, side: THREE.DoubleSide } );

	    var game = new THREE.Mesh(gameGeoScreen, gameMat);
	    game.position.x = 84.5;
	    game.position.y = 0.5;
		game.position.z = 95;
		game.receiveShadow = true;
		scene.add( game );

		var m = 4, n = 8;
		for(var i = -1; i < 3; i++){
			n = 8;
			for(var j = 81; j < 89; j++){
				var textcube =  texture_loader.load( "puzzle/caretos_part" + m + "x" + n + ".jpg" );
				var cubeMat = new THREE.MeshPhongMaterial( { map: textcube, side: THREE.DoubleSide } );
				var box = new THREE.Mesh(gameGeoCube, cubeMat);
				box.position.x = j;
				box.position.z = 95;
				box.position.y = i;
				box.rotation.z += (Math.PI / 2) * ((j % 3) + 1); // aplicamos una rotacion a cada cubo para desordenarlos
				box.name = "caretos_"+m+"_"+n;
				scene.add( box );
				PIECES.push( box );
				n--;
			}m--;
		}

		// Controls by MOUSE

		var arrows = document.querySelectorAll(".arrow");

		// por cada botón del controller, añadirle una función al clicar
		for(var i = 0; i < arrows.length; i++){
			var button = arrows[i];
			button.addEventListener( 'mousedown', function(e){
				keys[ this.dataset['key'] ] = true;
				var func = window[ this.dataset['func'] ];
				if(func != null) func();
				e.stopPropagation();
				e.stopImmediatePropagation();

			} , false);			
		}

		document.getElementById("canv_cont").addEventListener( 'mouseup', function(){
			keys[W] = false;
			keys[A] = false;
			keys[S] = false;
			keys[D] = false;
		} , false);

		// KEYBOARD

		document.addEventListener( 'keydown', function(event){

			if(document.activeElement.localName == "textarea" || document.activeElement.localName == "input") return;

			keys[event.keyCode] = true;

			switch( event.keyCode ) {

				case W: // w
					mForward();
					break;
				case A: // a
					mLeft();
					break;
				case S: // s
					mBackward();
					break;
				case D: // d
					mRight();
					break;
				case 80: // p
					privateInfo();
					break;
				case 73: // i
					document.getElementById("canvas_info").style.display = "block";
					break;
			}
		}, false );

		document.addEventListener( 'keyup', function(event){
			keys[event.keyCode] = false;
			if(document.activeElement.localName == "textarea" || document.activeElement.localName == "input") return;
			else if(event.keyCode == 67) openChat();
			else if(event.keyCode == 88 && window.admin){
				camera.position.x = 85;
				camera.position.z = 85;
			}
		}, false );

		// objects *************************************************************************************************

		// floor
		var floorTexture = texture_loader.load( 'assets/grass_text.jpg' );
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
			var wallTexture1 =  texture_loader.load( 'assets/wall2.jpg' );
			var wallTexture2 =  texture_loader.load( 'assets/wall4.png' );
			var waterTexture =  texture_loader.load( 'assets/water.jpg' );
			var wallDoorTexture =  texture_loader.load( 'assets/wall3.jpg' );
			for(var i = 0; i < MAT.length; i++){
				for(var j = 0; j < MAT.length; j++){
					
					var value = MAT[i][j];

					switch(value){

						case 0: // 0 NEGRO

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

							// intercalar muros con y sin hiedra

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
						
							break;

						case 2: // 2 VERDE MODIFICADO

							// vamos sacando el siguiente hint de la lista
							var hint = HINTS[hintIterator];
							hint.position.x = i * 5;
							hint.position.y = 0;
							hint.position.z = j * 5;
							hint.receiveShadow = true;
							hint.castShadow = true;
							scene.add(hint);
							hintIterator++;

							break;
						
						case 3: // 3 ROJO MODIFICADO -> PUERTAS

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

							    new THREE.MeshPhongMaterial( { map: wallDoorTexture } ), // right
							    new THREE.MeshPhongMaterial( { map: wallDoorTexture } ), // left
							    new THREE.MeshPhongMaterial( { map: wallTexture1 } ), // top
							    new THREE.MeshPhongMaterial( { map: wallTexture1 } ), // bottom
							    new THREE.MeshPhongMaterial( { map: wallDoorTexture } ), // back
							    new THREE.MeshPhongMaterial( { map: wallDoorTexture } )  // front

							];

							var wall = new THREE.Mesh(wallGeo, new THREE.MultiMaterial( materials ));
							var textHint = TEXT_HINTS[textHintIterator];
							wall.message = textHint.text;
							wall.position.x = i * 5;
							wall.position.z = j * 5;
							wall.name = "red_" + wall.position.x + "_" + wall.position.z;
							wall.receiveShadow = true;
							wall.castShadow = true;
							scene.add(wall);
							textHintIterator++;
							
							break;

						case 4: // 4 AGUA MODIFICADO

							var waterGeo = new THREE.BoxGeometry(5, 0.15, 5);
							var waterMat = new THREE.MeshPhongMaterial( {
									map: waterTexture,
									side: THREE.DoubleSide
							});

							var water = new THREE.Mesh(waterGeo, waterMat);
							var textHint = TEXT_HINTS[textHintIterator];
							water.position.x = i * 5;
							water.position.y = -1.57;
							water.position.z = j * 5;
							water.receiveShadow = true;
							water.castShadow = true;
							scene.add(water);

							break;

						// HACKER MODE ***********************************************************************
						// case 252: // 252 AMARILLO 
						// 	wallGeo = new THREE.BoxGeometry(5, 0.5, 5);
						// 	var AUX = new THREE.MeshBasicMaterial( {
						// 			color: "yellow",
						// 	});
						// 	wall = new THREE.Mesh(wallGeo, AUX);
						// 	wall.position.x = i * 5;
						// 	wall.position.y = -1.7;
						// 	wall.position.z = j * 5;
						// 	scene.add(wall);

						// 	break;
						// ***********************************************************************************
					}
				}
			}
		}

		// renderer ************************************************************************************************

		renderer = new THREE.WebGLRenderer();
		renderer.setPixelRatio( window.devicePixelRatio );
		renderer.setSize( tam.width, tam.height );
		renderer.domElement.id = "my_canvas";
		container.appendChild( renderer.domElement );

		window.addEventListener( 'resize', onWindowResize, false );

		//controls (mouse)
		if(!window.controls)
			return;

		controls = new THREE.OrbitControls( camera, renderer.domElement );
		controls.update();
	}

	function onWindowResize() {
		camera.aspect = tam.width / tam.height;
		camera.updateProjectionMatrix();
		renderer.setSize( tam.width, tam.height );
	}

	function animate() {
		requestAnimationFrame( animate );
		var currentTime = performance.now();
		var time = ( currentTime - startTime ) / 1000;

		camera.getWorldDirection( direction );

		// linterna
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

		// luz central
		sphere.position.x = Math.cos( time ) * 2 + 85;
		sphere.position.z = Math.sin ( time ) * 2 + 85;
  		light3.position.x = Math.cos( time ) * 2 + 85;
 		light3.position.z = Math.sin( time ) * 2 + 85;

 		// ANIMACIÓN DE LOS PNJ
 		for(i in animations){
 			var animation = animations[i];
 			animation.setTime( performance.now() / 1000 );	
 		}
 		
		TWEEN.update();
		renderer.render( scene, camera );

		// solo enviamos si esta el server ON y si nos hemos movido o rotado
		if(!window.server_on || ((auxiliar.x == camera.position.x) && (auxiliar.z == camera.position.z) && (auxiliar.y == camera.rotation.y)))
			return;

		// PASSING POSITION TO OTHERS TO PRINT IT
		// console.log("sending");
		var POSITION = {
			px : camera.position.x,
			pz : camera.position.z,
			ry : camera.rotation.y,
			info: 3
		}

		server.sendMessage(POSITION);
	}
}

function colliding_with(front){

	// Si va para atrás, tenemos que restar la dirección!!!
	var sentit = 1;
	if(!front) sentit = -1;

	var x = Math.floor(camera.position.x + (2 * sentit * direction.x));
	var z = Math.floor(camera.position.z + (2 * sentit * direction.z));

	if (MAT2[x][z] == 0 || MAT2[x][z] == 3 || MAT2[x][z] == 4){
	 	return false;
	}
	return true;
}

function mForward(){
	if(!colliding_with(FORWARD) || is_moving )
		return;

	is_moving = true;
	var tween = new TWEEN.Tween( camera.position ).to( {
				x: Math.floor(camera.position.x + direction.x),
				z: Math.floor(camera.position.z + direction.z)
	}, 100 ).easing( TWEEN.Easing.Linear.None);

	tween.onComplete(function(){
		is_moving = false;
		auxiliar.x = camera.position.x;
		auxiliar.z = camera.position.z;
		if(keys[W]) mForward();
	});

	tween.start();
}

function mBackward(){
	if(!colliding_with(BACKWARD) || is_moving )
		return;

	is_moving = true;
	var tween = new TWEEN.Tween( camera.position ).to( {
				x: Math.floor(camera.position.x - direction.x),
				z: Math.floor(camera.position.z - direction.z)
	}, 100 ).easing( TWEEN.Easing.Linear.None);

	tween.onComplete(function(){
		is_moving = false;
		auxiliar.x = camera.position.x;
		auxiliar.z = camera.position.z;
		if(keys[S]) mBackward();
	});

	tween.start();
}

function mRight(){

	if( is_moving )
		return;

	is_moving = true;
	var tween = new TWEEN.Tween( camera.rotation ).to( {
				y: camera.rotation.y - Math.PI / 2
	}, 600 ).easing( TWEEN.Easing.Sinusoidal.Out);

	tween.onComplete(function(){
		is_moving = false;
		auxiliar.y = camera.rotation.y;
		if(keys[D]) mRight();
	});

	tween.start();		
}

function mLeft(){
	if( is_moving )
		return;

	is_moving = true;
	var tween = new TWEEN.Tween( camera.rotation ).to( {
				y: camera.rotation.y + Math.PI / 2
	}, 600 ).easing( TWEEN.Easing.Sinusoidal.Out);

	tween.onComplete(function(){
		is_moving = false;
		auxiliar.y = camera.rotation.y;
		if(keys[A]) mLeft();
	});

	tween.start();	
}

function updatePlayerPosition(user_id, ox, oz, ry){

	if(!scene.getObjectByName(user_id))
		return;

	scene.getObjectByName(user_id).position.x = ox;
	scene.getObjectByName(user_id).position.z = oz;
	scene.getObjectByName(user_id).rotation.y = ry;
}

function updateDoorsInMatrix(i, j){

	MAT2[i][j] = -1;
}

function appendStringDoor(){

	var door_name = "red_" + activeObject.position.x + "_" + activeObject.position.z;
	howAreDoors.push( door_name );
}

function getNameFromOpenedDoors(){
	return howAreDoors;
}

function setDoorsFromList(list){

	for (i in list){
		scene.getObjectByName(list[i]).position.y = -3.45;
	}
}

function getPuzzleInfo(){
	var INFO = [];
	
	for (i in PIECES){
		INFO.push( PIECES[i].rotation.z );
	}

	return INFO;
}

function setPuzzleRotation(LIST){

	for (i in PIECES){
		PIECES[i].rotation.z = LIST[i];
	}
}

function createPNJ(user_id){
	var loader = new THREE.AssimpLoader( window.manager );
	loader.load( "models/Octaminator.assimp", function ( err, result ) {
		var object = result.object;
		object.name = user_id;
		scene.add( object );
		animation = result.animation;
		animations.push( animation );

		object.scale.set(0.005, 0.005, 0.005);
	} );
}

function deletePNJ(user_id){

	if(!scene.getObjectByName(user_id))
		return;

	scene.remove(scene.getObjectByName(user_id));
}

function isSolution(){
	var text = document.getElementById("instructions");
	var input = document.getElementById("solution");
	var posibleSolution = document.getElementById("solution").value.toLowerCase(); // cualquier valor con o sin mayus
	posibleSolution = posibleSolution.substring(0, posibleSolution.length - 1); // quitamos el salto de linea
	input.value = "";

	var index = parseInt(text.innerHTML[187]) - 1; 

	// cogemos la solucion de ese hint
	var solution = TEXT_HINTS[index].solution;

	if(posibleSolution !== solution)
		return;

	text.innerHTML = "<b><p align='center'>WELL DONE!</p></b>";
	input.style.display = "none";
	new TWEEN.Tween( activeObject.position ).to( {
					y: -3.45
		}, 6000 ).easing( TWEEN.Easing.Linear.None).start(); // efecto para bajar

	// añadir a la lista de puertas abiertas
	var aux = appendStringDoor();

	// update doors in game
	var doorDown = {
		x: activeObject.position.x,
		z: activeObject.position.z,
		info: 6,
		in_game: true
	}

	if(window.server_on) server.sendMessage(doorDown);

	setTimeout(function(){
		
		var x = activeObject.position.x;
		var z = activeObject.position.z;

		for(var i = (x - 2); i < (x + 3); i++){ // puerta y alrededores que tengan 3 ponemos -1 para quitar bloqueo
			for(var j = (z - 2); j < (z + 3); j++){
				if(MAT2[i][j] == 3){
					MAT2[i][j] = -1;

					// update doors in matrix
					var toChange = {
						i: i,
						j: j,
						info: 5
					}

					if(window.server_on) server.sendMessage(toChange);
				}
			}
		}

	}, 6050);
}

function openSelectedDoor(x, z, in_game){

	var door = scene.getObjectByName("red_" + x + "_" + z);
	door.how = "opened";

	if(!door) return;

	if(in_game){

		new TWEEN.Tween( door.position ).to( {
					y: -3.45
		}, 6000 ).easing( TWEEN.Easing.Linear.None).start(); // efecto para bajar
	}else{
		door.position.y = -3.45;
	}
}

function intersect(){
	// update the picking ray with the camera and mouse position
	raycaster.setFromCamera( window.mouse, camera );

	// calculate objects intersecting the picking ray
	var intersects = raycaster.intersectObjects( scene.children, true );

	if ( intersects.length <= 0 )
		return;

	var intersect = intersects[ 0 ];
	if(intersect.object.name.includes("red")){
		document.getElementById("canvas_info").style.display = "block";
		document.getElementById("solution").style.display = "block";
		var text = document.getElementById("instructions");
		text.innerHTML = "<b>GOOD! DOOR TO NEXT LEVEL HAD BEEN REACHED!</b><br/>" + 
		"<br/>" +
		"You are not done yet! Try to solve this enigma to pass the door. Maybe other players "+
		"could have useful hints for you...<br/>" + 
		" Hint: " +
		intersect.object.message;

		activeObject = intersect.object;
	}else if(intersect.object.name.includes("caretos")){

		applyRotation(intersect.object.name);

		var OBJECT = {
			object: intersect.object.name,
			info: 4
		}

		if(window.server_on) server.sendMessage(OBJECT);
	}
}

function applyRotation(name){
	var object = scene.getObjectByName(name);
	object.rotation.z += Math.PI / 2;
}

function setCamera(list){

	var x = list.posx;
	var z = list.posz;
	var rotation = list.rot;

	camera.position.x = x;
	camera.position.z = z;
	camera.rotation.y += rotation;

	auxiliar.x = camera.position.x;
	auxiliar.z = camera.position.z;
	auxiliar.y = camera.rotation.y;	

	initialRotation = camera.rotation.y;
}
