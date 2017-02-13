var app = {

	start3D: function(){
		example();
	}
}

var camera, scene, controls, renderer, startTime;
var baseRing, ground;
var container = document.querySelector(".canvas_container");
var tam = container.getBoundingClientRect();

var confeti_list = [];
var pop_list = [];
var collidableMeshList = [];
var materials;

var audio = new Audio('assets/audio.mp3');;


// MAP

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


function example(){
	var camera, scene, renderer;
	var geometry, material, mesh;
	var controls;
	var objects = [];
	var raycaster;
	var blocker = document.getElementById( 'blocker' );
	var instructions = document.getElementById( 'instructions' );
	// http://www.html5rocks.com/en/tutorials/pointerlock/intro/
	var havePointerLock = 'pointerLockElement' in document || 'mozPointerLockElement' in document || 'webkitPointerLockElement' in document;
	if ( havePointerLock ) {
		var element = document.body;
		var pointerlockchange = function ( event ) {
			if ( document.pointerLockElement === element || document.mozPointerLockElement === element || document.webkitPointerLockElement === element ) {
				controlsEnabled = true;
				controls.enabled = true;
				blocker.style.display = 'none';
			} else {
				controls.enabled = false;
				blocker.style.display = '-webkit-box';
				blocker.style.display = '-moz-box';
				blocker.style.display = 'box';
				instructions.style.display = '';
			}
		};
		var pointerlockerror = function ( event ) {
			instructions.style.display = '';
		};
		// Hook pointer lock state change events
		document.addEventListener( 'pointerlockchange', pointerlockchange, false );
		document.addEventListener( 'mozpointerlockchange', pointerlockchange, false );
		document.addEventListener( 'webkitpointerlockchange', pointerlockchange, false );
		document.addEventListener( 'pointerlockerror', pointerlockerror, false );
		document.addEventListener( 'mozpointerlockerror', pointerlockerror, false );
		document.addEventListener( 'webkitpointerlockerror', pointerlockerror, false );
		instructions.addEventListener( 'click', function ( event ) {
			instructions.style.display = 'none';
			// Ask the browser to lock the pointer
			element.requestPointerLock = element.requestPointerLock || element.mozRequestPointerLock || element.webkitRequestPointerLock;
			element.requestPointerLock();
		}, false );
	} else {
		instructions.innerHTML = 'Your browser doesn\'t seem to support Pointer Lock API';
	}
	init();
	animate();
	var controlsEnabled = false;
	var moveForward = false;
	var moveBackward = false;
	var moveLeft = false;
	var moveRight = false;
	var canJump = false;
	var prevTime = performance.now();
	var velocity = new THREE.Vector3();
	function init() {
		camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 1, 1000 );
		scene = new THREE.Scene();
		scene.fog = new THREE.Fog( 0xffffff, 0, 750 );
		var light = new THREE.HemisphereLight( 0xeeeeff, 0x777788, 0.75 );
		light.position.set( 0.5, 1, 0.75 );
		scene.add( light );
		controls = new THREE.PointerLockControls( camera );
		scene.add( controls.getObject() );
		var onKeyDown = function ( event ) {
			switch ( event.keyCode ) {
				case 38: // up
				case 87: // w
					moveForward = true;
					break;
				case 37: // left
				case 65: // a
					moveLeft = true; break;
				case 40: // down
				case 83: // s
					moveBackward = true;
					break;
				case 39: // right
				case 68: // d
					moveRight = true;
					break;
				case 32: // space
					if ( canJump === true ) velocity.y += 350;
					canJump = false;
					break;
			}
		};
		var onKeyUp = function ( event ) {
			switch( event.keyCode ) {
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
			}
		};
		document.addEventListener( 'keydown', onKeyDown, false );
		document.addEventListener( 'keyup', onKeyUp, false );
		raycaster = new THREE.Raycaster( new THREE.Vector3(), new THREE.Vector3( 0, - 1, 0 ), 0, 10 );
		// floor
		geometry = new THREE.PlaneGeometry( 2000, 2000, 100, 100 );
		geometry.rotateX( - Math.PI / 2 );
		for ( var i = 0, l = geometry.vertices.length; i < l; i ++ ) {
			var vertex = geometry.vertices[ i ];
			vertex.x += Math.random() * 20 - 10;
			vertex.y += Math.random() * 2;
			vertex.z += Math.random() * 20 - 10;
		}
		for ( var i = 0, l = geometry.faces.length; i < l; i ++ ) {
			var face = geometry.faces[ i ];
			face.vertexColors[ 0 ] = new THREE.Color().setHSL( Math.random() * 0.3 + 0.5, 0.75, Math.random() * 0.25 + 0.75 );
			face.vertexColors[ 1 ] = new THREE.Color().setHSL( Math.random() * 0.3 + 0.5, 0.75, Math.random() * 0.25 + 0.75 );
			face.vertexColors[ 2 ] = new THREE.Color().setHSL( Math.random() * 0.3 + 0.5, 0.75, Math.random() * 0.25 + 0.75 );
		}
		material = new THREE.MeshBasicMaterial( { vertexColors: THREE.VertexColors } );
		mesh = new THREE.Mesh( geometry, material );
		scene.add( mesh );
		
		// objects

		// WALLS
		for(var i = 0; i < data.height; i++){
			for(var j = 0; j < data.width; j++){
				if(data.data[(i*myImage.width + j)*4] == 0){
					var wallGeo = new THREE.BoxGeometry(1, 5, 1);
					var wallMat = new THREE.MeshPhongMaterial( {
							color: 0xeee,
							shininess: 100,
							side: THREE.DoubleSide
					});

					var wall = new THREE.Mesh(wallGeo, wallMat);
					wall.position.x = i - 58.5;
					wall.position.y = 0.5;
					wall.position.z = j - 58.5;
					scene.add(wall);
				} 
			}
		}

		// renderer
		renderer = new THREE.WebGLRenderer();
		renderer.setClearColor( 0xffffff );
		renderer.setPixelRatio( window.devicePixelRatio );
		renderer.setSize( tam.width, tam.height );
		renderer.domElement.id = "my_canvas";
		container.appendChild( renderer.domElement );

		//
		window.addEventListener( 'resize', onWindowResize, false );
	}
	function onWindowResize() {
		camera.aspect = window.innerWidth / window.innerHeight;
		camera.updateProjectionMatrix();
		renderer.setSize( window.innerWidth, window.innerHeight );
	}
	function animate() {
		requestAnimationFrame( animate );
		if ( controlsEnabled ) {
			raycaster.ray.origin.copy( controls.getObject().position );
			raycaster.ray.origin.y -= 10;
			var intersections = raycaster.intersectObjects( objects );
			var isOnObject = intersections.length > 0;
			var time = performance.now();
			var delta = ( time - prevTime ) / 1000;
			velocity.x -= velocity.x * 10.0 * delta;
			velocity.z -= velocity.z * 10.0 * delta;
			velocity.y -= 9.8 * 100.0 * delta; // 100.0 = mass
			if ( moveForward ) velocity.z -= 400.0 * delta;
			if ( moveBackward ) velocity.z += 400.0 * delta;
			if ( moveLeft ) velocity.x -= 400.0 * delta;
			if ( moveRight ) velocity.x += 400.0 * delta;
			if ( isOnObject === true ) {
				velocity.y = Math.max( 0, velocity.y );
				canJump = true;
			}
			controls.getObject().translateX( velocity.x * delta );
			controls.getObject().translateY( velocity.y * delta );
			controls.getObject().translateZ( velocity.z * delta );
			if ( controls.getObject().position.y < 10 ) {
				velocity.y = 0;
				controls.getObject().position.y = 10;
				canJump = true;
			}
			prevTime = time;
		}
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

function createFigure(id, colorf, path){

	var group = new THREE.Group();
	group.name = id + "_body";

	var playerBodyMat = new THREE.MeshPhongMaterial( {
			color: colorf,
			shininess: 15,
			side: THREE.DoubleSide
		} ); // -> player

	materials = [

		new THREE.MeshPhongMaterial( {
			color: colorf,
			shininess: 15,
			side: THREE.DoubleSide
		} ),

		new THREE.MeshPhongMaterial( {
			color: colorf,
			shininess: 15,
			side: THREE.DoubleSide
		} ),

		new THREE.MeshPhongMaterial( {
			map: new THREE.TextureLoader().load(path),
			shininess: 15,
			side: THREE.DoubleSide
		} )// -> head
	]


	var playerHeadGeo = new THREE.CylinderGeometry(0.75, 0.75, 0.35, 32);
	var playerBodyGeo = new THREE.BoxGeometry(1, 1.5, 1);
	var playerArmGeo = new THREE.CylinderGeometry(0.18, 0.15, 1.5, 32);
		
	var playerHead = new THREE.Mesh(playerHeadGeo, new THREE.MultiMaterial(materials));
	playerHead.position.y = 2.25;
	playerHead.rotation.x = - Math.PI / 2;   
	playerHead.rotation.y = Math.PI / 2;
	playerHead.castShadow = true;
	group.add(playerHead);

	
	var playerBody = new THREE.Mesh(playerBodyGeo, playerBodyMat);
	playerBody.castShadow = true;
	playerBody.position.y = 0.75;
	group.add(playerBody);

	// posición inicial en el laberinto
	group.position.x = -32.5;
	group.position.z = -58;

	//scene.add(group);
}

function createNewLight(list, colorl, user_id, path){

	var group = new THREE.Group();
	group.name = user_id;

	var spotLight = new THREE.SpotLight( colorl, 0.75 );
	spotLight.angle = Math.PI / 5;
	spotLight.penumbra = 0.2;
	spotLight.castShadow = true;


	group.add( spotLight );

	var lightGeometry = new THREE.SphereGeometry( 0.8, 32, 32 );
	var lightMat = new THREE.MeshPhongMaterial( {
			map: new THREE.TextureLoader().load("assets/sphere.png"),
			shininess: 15,
			side: THREE.DoubleSide
		} );
	var light_sphere = new THREE.Mesh( lightGeometry, lightMat );

	if(user_id != "player") group.add( light_sphere );

	group.position.x = list[0];
	group.position.y = list[1];
	group.position.z = list[2];

	// cada uno guarda su propia luz
	window.player = group;

	//scene.add(group);

	createFigure(user_id, colorl, path);
}

function updateMeshPosition(user_id, ox, oy, oz){

	if(scene.getObjectByName(user_id)){
		scene.getObjectByName(user_id).position.x = ox;
		scene.getObjectByName(user_id).position.y = oy;
		scene.getObjectByName(user_id).position.z = oz;
	}
}

function updatePlayerPosition(user_id, ox, oy, oz, ry){

	if(scene.getObjectByName(user_id + "_body")){
		scene.getObjectByName(user_id + "_body").position.x = ox;
		scene.getObjectByName(user_id + "_body").position.y = oy;
		scene.getObjectByName(user_id + "_body").position.z = oz;
		scene.getObjectByName(user_id + "_body").rotation.y = ry;
	}
}

function updateTexture(id, path){
	var head = scene.getObjectByName(id).children[0];
	head.material.materials[2].map = new THREE.ImageUtils.loadTexture(path);
	head.material.needsUpdate = true;
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

function removeConfeti(){

	audio.pause();
	audio.currentTime = 0;

	// quitar el confeti anterior
	for( var i = confeti_list.length - 1; i >= 0; i--){
		scene.remove(confeti_list[i]);
	}
}

function removePopped(){
	for( var i = pop_list.length - 1; i >= 0; i--){
		scene.remove(pop_list[i]);
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

function movementLimits(x, z){
	if(x > 60 || x < -60) return false;
	if(z > 4.5 || z < -60) return false;
	return true;
}

