# ENTORNOS DE COMUNICACIÓN VIRTUAL

Práctica final
- Sincronización de mundo 3D

Alejandro Rodríguez Corrales
174249
alejandro.rodriguez04@estudiant.upf.edu

David Moreno Esteban
174440
david.moreno04@estudiant.upf.edu

Alexis Ruiz Alcalá
174746
alexis.ruiz01@estudiant.upf.edu

##################################################################################

NOTA: El chat tiene disponibles notificaciones por cada mensaje. Habrá que
dar permisos al navegador para mostrarlas. 

!!!!!!!				!!!!!!!				 	    !!!!!!
UPDATE: Con XAMPP funcionan!!! No hace falta usar el servidor de GitHub
!!!!!!!				!!!!!!!				 	    !!!!!!

##################################################################################

Laberinto 3D:

	Juego colaborativo en el que el objetivo es común; llegar al centro. Se deberán resolver
	algunos acertijos, pero para ello se necesitará la ayuda de los otros usuarios de la sala. 
	Las pistas que un jugador se encuentre no le servirán a él, sinó a alguno de los otros 3
	jugadores. Cada uno de estos jugadores estará en un cuadrante distinto del laberinto, por
	lo que solo se podrán unir los 4 jugadores en el centro. 
	
	NOTA: Máximo 4 jugadores en una misma sala! Una vez dentro los 4, no hacer refresh! La cosa
	es que al hacer refresh será en 5o que entre. No funcionará! Si uno lo hace, reiniciar los 4.


	- Inicialmente: 
		- Pantalla de carga: Se podrá elegir sala cuando las texturas estén 100% cargadas.
		- 4 jugadores situados en las 4 diferentes esquinas del laberinto
		- Panel de información visible, esconder presionando ESC.
		- El muñeco que muestra nuestro personaje solo lo verán los otros jugadores.(Primera persona)

	- Jugabilidad

		- Para desplazarse utilizar WASD o el controlador situado inicialmente
		  en la parte inferior derecha. 

		- El controlador/cruceta se puede desplazar donde mejor le venga al usuario haciendo
		  click en las partes que no sean botones de controlador y arrastrando. 

		- Al encontrar una puerta 'siniestra', hacer click sobre ella para que aparezca
		  la pista en forma de texto, y el input donde poner la solución. Para esconder 
		  el panel, presionar ESC.

		- Si encontramos una pista en forma de Mesh 3D, memorizar, les será útil a los otros
		  3 jugadores. Así que, coméntalo por el chat!:)

		- Al llegar al centro del laberinto, resolver el PicPuzzle. Para ello, hacer click sobre 
		  cada uno de sus cuadrantes para rotar y formar la imagen final.


	- Funcionalidades

		- Parte inferior de la pantalla (Hover) abre menú: Información usuario, Ayuda, Chat, Delete Chat.

		- Abrir chat presionando 'c' o Menú -> Chats. 

			- Escribir en el input text y enviar pulsando Enter, o click en el avion de papel.

			- Switch que permite escribir automaticamente la primera en mayuscula, aun sin haber
			  escrito nosotros en mayúscula.

			- Siguen habiendo mensajes privados, de la misma manera que en la p1 (whispers). Es decir, 
			escribimos mensaje y clicamos al que queramos en 'People Connected'. 

		- Para ver la Información Personal, presionar 'p' o Menú ->  Click en Avatar

			- Cambiar nombre: Click sobre 'Name', escribir y hacer click en Aceptar o presionar Enter.
			Alerta si el nombre sobrepasa los 15 caracteres.

			- Cambiar Avatar: Click sobre 'Avatar' y click. 

		- Para borrar el chat, Menú -> Click sobre icono de la papelera.

		- Modo debug o admin: 
			1. Poner como nombre "admin.os"
			2. Pulsar 'x' en el teclado 

	- Sincronización de mundo 

		- Las puertas se abren para todos los jugadores con el mismo efecto. Si uno lo abre, se abrirá para todos los
		de la sala. Si un jugador las abre y después entra el resto, estarán abiertas.

		- El puzzle se queda tal cual lo ha dejado el último. Se reinicia cuando el último jugador de la sala se
		desconecta.
