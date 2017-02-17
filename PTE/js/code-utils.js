/*var confeti_list = [];
var pop_list = [];
var audio = new Audio('assets/audio.mp3');*/

function coinFlip() {
    return (Math.floor(Math.random() * 2) == 0);
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

function deleteUser(user_id){
	for( var i = 0; i < scene.children.length; i++){
		// borrará la luz(grupo luz + esfera) y el jugador

		if(scene.children[i].name == user_id){
			toScene(scene.children[i], 0);
		}
	}
	for( var i = 0; i < scene.children.length; i++){
		if(scene.children[i].name == (user_id + "_body")){
			toScene(scene.children[i], 0);
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
}*/