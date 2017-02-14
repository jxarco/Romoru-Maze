var app = {

	start3D: function(){
		INTERACTION();
	}
}

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

var camera, scene, renderer;
var controls;
var mesh;

function setCamera(list){

	var x = list.posx;
	var z = list.posz;
	var rotation = list.rot;

	camera.position.x = x;
	camera.position.z = z;
	camera.rotation.y += rotation;
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
	var prevTime = performance.now();

	function init() {

		camera = new THREE.PerspectiveCamera( 50, tam.width / tam.height, 1, 1000 );
		scene = new THREE.Scene();
		scene.fog = new THREE.Fog( 0xffffff, 0, 1000 );
		var light = new THREE.HemisphereLight( 0xeeeeff, 0x777788, 0.75 );
		light.position.set( 0.5, 1, 0.75 );
		scene.add( light );

		var onKeyDown = function ( event ) {

			if(document.activeElement.localName == "textarea" || document.activeElement.localName == "input"){
				return;
			}

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
				case 80: // p
					privateInfo();
					break;
				case 67: // c
					openChat();
					break;
				case 32: // space
					console.log("GRID: x(" + (camera.position.x / 4) + "), z(" + (camera.position.z / 4) + ")");
					break;
			}
		};

		document.addEventListener( 'keydown', onKeyDown, false );
		document.addEventListener( 'keyup', onKeyUp, false );

		// objects *************************************************************************************************

		// floor
		var floorTexture =  new THREE.TextureLoader().load( 'assets/grass_texture.png' );
		
		// geometry
	    var geometry = new THREE.PlaneGeometry(140, 140, 100, 100);
	    geometry.rotateX( - Math.PI / 2 );

	    // materials
	    var materials = [];
	    materials.push(new THREE.MeshBasicMaterial({
	        map: floorTexture
	    }));

	    // Add materialIndex to face
	    var l = geometry.faces.length / 2;
	    for (var i = 0; i < l; i++) {
	        geometry.faces[i].materialIndex = 0;
	    }


	    // mesh
	    mesh = new THREE.Mesh(geometry, new THREE.MultiMaterial(materials));
	    mesh.position.x = 63;
		mesh.position.y = -1.5;
		mesh.position.z = 63;
		mesh.receiveShadow = true;
		scene.add( mesh );

		// WALLS
		var wallTexture =  new THREE.TextureLoader().load( 'assets/wall2.jpg' );
		for(var i = 0; i < data.height; i++){
			for(var j = 0; j < data.width; j++){
				if(data.data[(i*myImage.width + j)*4] == 0){
					var wallGeo = new THREE.BoxGeometry(4, 3, 4);
					var wallMat = new THREE.MeshPhongMaterial( {
							map: wallTexture,
							shininess: 100,
							side: THREE.DoubleSide
					});

					var wall = new THREE.Mesh(wallGeo, wallMat);
					wall.position.x = i * 4;
					wall.position.y = 0;
					wall.position.z = j * 4;
					wall.receiveShadow = true;
					scene.add(wall);
				} 
			}
		}

		// renderer ************************************************************************************************

		renderer = new THREE.WebGLRenderer();
		renderer.setPixelRatio( window.devicePixelRatio );
		renderer.setSize( tam.width, tam.height );
		renderer.domElement.id = "my_canvas";
		container.appendChild( renderer.domElement );

		// controls (mouse)
		// controls = new THREE.OrbitControls( camera, renderer.domElement );
		// controls.update();

		window.addEventListener( 'resize', onWindowResize, false );
	}
	function onWindowResize() {
		camera.aspect = tam.width / tam.height;
		camera.updateProjectionMatrix();
		renderer.setSize( tam.width, tam.height );
	}
	function animate() {
		requestAnimationFrame( animate );

		var direction = camera.getWorldDirection();

		if(moveForward){
			new TWEEN.Tween( camera.position ).to( {
						x: camera.position.x + direction.multiplyScalar(1).x,
						y: camera.position.y + direction.multiplyScalar(1).y,
						z: camera.position.z + direction.multiplyScalar(1).z,
			}, 100 ).easing( TWEEN.Easing.Linear.None).start();
		}
		if(moveBackward){
			new TWEEN.Tween( camera.position ).to( {
						x: camera.position.x - direction.multiplyScalar(1).x,
						y: camera.position.y - direction.multiplyScalar(1).y,
						z: camera.position.z - direction.multiplyScalar(1).z,
			}, 200 ).easing( TWEEN.Easing.Linear.None).start();
		}
		if(moveLeft){
			new TWEEN.Tween( camera.rotation ).to( {
						y: camera.rotation.y + Math.PI / 2
			}, 250 ).easing( TWEEN.Easing.Sinusoidal.In).start();
		}
		if(moveRight){
			new TWEEN.Tween( camera.rotation ).to( {
						y: camera.rotation.y - Math.PI / 2
			}, 250 ).easing( TWEEN.Easing.Sinusoidal.In).start();
		}

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

