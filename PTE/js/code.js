var app = {

	start3D: function(){
		loadCube();
	}
}

// player move controls
var w = false, a = false, s = false, d = false, k = false, l = false;
var velocity = new THREE.Vector3();

var camera, scene, controls, renderer, startTime;
var baseRing, ground;
var container = document.querySelector(".canvas_container");

var tam = container.getBoundingClientRect();

var confeti_list = [];
var pop_list = [];
var collidableMeshList = [];
var materials;

var audio = new Audio('assets/audio.mp3');;

function loadCube(){
	
	function init() {

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
//		window.mazeImage = data;


		camera = new THREE.PerspectiveCamera(10, tam.width / tam.height, 1, 1000 );
		camera.position.set( -24, 9, -93 );
		scene = new THREE.Scene();
		scene.background = new THREE.Color( 0x00032 );
		
		// Fog

		scene.fog = new THREE.Fog(0xffffff, 750);

		// Lights
		scene.add( new THREE.AmbientLight( 0x505050, 0.5 ) );

		var directionalLight = new THREE.DirectionalLight( 0xffffff, 0.25 );
		directionalLight.position.set( 0, 3, 0 );
		directionalLight.castShadow = true;
		directionalLight.shadow.camera.near = 1;
		directionalLight.shadow.camera.far = 10;
		scene.add( directionalLight );

		// Objects

		var floorGeo = new THREE.PlaneGeometry( 120, 120, 1, 1 )
		var flootMat = new THREE.MeshPhongMaterial( { color: 0xf1f4f1, shininess: 5 } );

		// Ground
		ground = new THREE.Mesh(floorGeo, flootMat );
		ground.rotation.x = - Math.PI / 2;
		ground.receiveShadow = true;
		collidableMeshList.push(ground);
		scene.add( ground );

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

		// Renderer
		renderer = new THREE.WebGLRenderer();
		renderer.domElement.id = "my_canvas";
		renderer.shadowMap.enabled = true;
		renderer.setPixelRatio( window.devicePixelRatio );
		renderer.setSize( tam.width, tam.height );
		window.addEventListener( 'resize', onWindowResize, false );
		container.appendChild( renderer.domElement );		

		// Controls
		controls = new THREE.OrbitControls( camera, renderer.domElement );

		// GUI

		var gui = new dat.GUI();
		container.appendChild(gui.domElement);
		gui.domElement.id = "gui_id";
	
		var parameters = 
		{
			a: function(){ confetiExplosion(); send("confeti") },
			b: function(){ removeConfeti(); send("rem_confeti") },
			d: function(){
				camera.position.x = 5;
				camera.position.y = 10;
				camera.position.z = 18;
			},
			h: function(){ removePopped(); send("rem_popped"); }
		};
		
		gui.add( parameters, 'a' ).name('Confeti explosion');
		gui.add( parameters, 'b' ).name('Remove confeti');		

		gui.add( parameters, 'h' ).name('Clean');

		// manera de hacer un grupo de parametros
		var folder = gui.addFolder('Camera position');
		folder.add(parameters, 'd').name('Default camera');
		folder.add( camera.position , 'x', -10, 50 ).step(1);
		folder.add( camera.position , 'y', -10, 50 ).step(1);
		folder.add( camera.position , 'z', -10, 50 ).step(1);
		folder.close();

		// inicialmente los controles cerrados
		gui.close();

		// Start
		startTime = performance.now();
	}

	function collides(mesh){

		var originPoint = mesh.position.clone();
		var localVertex = mesh.geometry.vertices[0].clone(); // solo utilizamos el primer vertex para la colision
		var globalVertex = localVertex.applyMatrix4( mesh.matrix );
		var directionVector = globalVertex.sub( mesh.position );
		
		var ray = new THREE.Raycaster( originPoint, directionVector.clone().normalize() );
		var collisionResults = ray.intersectObjects( collidableMeshList );
		if ( collisionResults.length > 0 && collisionResults[0].distance < directionVector.length() ){
			return true;
		}
	}

	function onWindowResize() {
		camera.aspect = tam.width / tam.height;
		camera.updateProjectionMatrix();
		renderer.setSize( tam.width, tam.height );
	}

	function animate() {
		var currentTime = performance.now();
		var time = ( currentTime - startTime ) / 1000;
		requestAnimationFrame( animate );

    	for(var i = 0; i < confeti_list.length; i++)
    	{
			if(confeti_list[i].position.y < 1.5){
    			if(!collides(confeti_list[i])){
    				confeti_list[i].position.y -= 0.03;
					confeti_list[i].rotation.x = Math.random() * time;
					confeti_list[i].rotation.y = Math.random() * time;
					confeti_list[i].scale.setScalar( Math.cos( time ) * 0.125 + 0.875 );
    			}
			}else{
				confeti_list[i].position.y -= 0.03;
				confeti_list[i].rotation.x = Math.random()  * time;
				confeti_list[i].rotation.y = Math.random()  * time;
				confeti_list[i].scale.setScalar( Math.cos( time ) * 0.125 + 0.875 );
			}

			if(confeti_list[i].position.y < 0){
				scene.remove(confeti_list[i])
			}
    	}

		renderer.render( scene, camera );

		var groupPosition = {
			px: camera.position.x,
			py: camera.position.y,
			pz: camera.position.z,
			info: 10
		}

		// LIGHT AND SPHERE MOVEMENTS

		// a veces carga antes --> evitamos fallos	
		if(scene.getObjectByName("player")){
			scene.getObjectByName("player").position.x = camera.position.x;
			scene.getObjectByName("player").position.y = camera.position.y;
			scene.getObjectByName("player").position.z = camera.position.z;
		}

		// PASSING POSITION TO OTHERS TO PRINT IT
		if(window.server_on) server.sendMessage(groupPosition);

		// PLAYER IN RING MOVEMENTS

		if(scene.getObjectByName("player_body")){

			var px = scene.getObjectByName("player_body").position.x;
			var pz = scene.getObjectByName("player_body").position.z;

			//velocity.x -= velocity.x * 10.0 * time;
			//velocity.z -= velocity.z * 10.0 * time;

			// if ( w ) velocity.z -= 0.1 * time;
			// if ( s ) velocity.z += 0.1 * time;

			// if ( a ) velocity.x -= 0.1 * time;
			// if ( d ) velocity.x += 0.1 * time;

			// scene.getObjectByName("player_body").position.x = velocity.x * time;
			// scene.getObjectByName("player_body").position.z = velocity.z * time;

			if(w && movementLimits(px, pz - 0.1)) scene.getObjectByName("player_body").position.z += 0.1;
			if(a && movementLimits(px - 0.1, pz)) scene.getObjectByName("player_body").position.x += 0.1;
			if(s && movementLimits(px, pz + 0.1)) scene.getObjectByName("player_body").position.z -= 0.1;
			if(d && movementLimits(px + 0.1, pz)) scene.getObjectByName("player_body").position.x -= 0.1;

			//controls.target.set( 0, 10, 0 );
			controls.target.set( scene.getObjectByName("player_body").position.x, 2.5, scene.getObjectByName("player_body").position.z );
			controls.update();

			if(k) scene.getObjectByName("player_body").rotation.y += 0.05;
			if(l) scene.getObjectByName("player_body").rotation.y -= 0.05;

			var playerPosition = {
				px : scene.getObjectByName("player_body").position.x,
				py : scene.getObjectByName("player_body").position.y,
				pz : scene.getObjectByName("player_body").position.z,
				ry : scene.getObjectByName("player_body").rotation.y,
				info: 11
			}
		}

		// PASSING POSITION TO OTHERS TO PRINT IT
		if(window.server_on) server.sendMessage(playerPosition);

		console.log(camera)

	}

	init();
	animate();
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

	scene.add(group);
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

	scene.add(group);

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

function changeRingColor(color) {
  //the return value by the chooser is like as: #ffff so
  //remove the # and replace by 0x
  color = color.replace( '#','0x' );
  //set the color in the object
  baseRing.material.color.setHex(color);
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

var onKeyDown = function (event){

	if(document.activeElement.localName == "textarea" || document.activeElement.localName == "input"){
		return;
	}

	switch(event.keyCode){
		case 87:
			w = true;
			break;
		case 65:
			a = true;
			break;
		case 83:
			s = true;
			break;
		case 68:
			d = true;
			break;
		case 75:
			k = true;
			break;
		case 76:
			l = true;
			break;
	}
}

var onKeyUp = function (event){

	if(document.activeElement.localName == "textarea" || document.activeElement.localName == "input"){
		return;
	}

	switch(event.keyCode){
		case 87:
			w = false;
			break;
		case 65:
			a = false;
			break;
		case 83:
			s = false;
			break;
		case 68:
			d = false;
			break;
		case 75:
			k = false;
			break;
		case 76:
			l = false;
			break;
		case 32:
			popCube();
			break;
		case 67:
			openChat();
			break;
		case 80:
			privateInfo();
			break;
	}
}

function movementLimits(x, z){
	if(x > 60 || x < -60) return false;
	if(z > 4.5 || z < -60) return false;
	return true;
}


document.addEventListener('keydown', onKeyDown, false);
document.addEventListener('keyup', onKeyUp, false);	


