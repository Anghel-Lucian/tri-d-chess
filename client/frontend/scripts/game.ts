import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

import Game from './Game/Model/Game';

const game = Game.getInstance("Lucian", "1", "Alexandra", "2");

console.log(game);

function main() {

	const canvas = document.getElementById('game-container');
	const renderer = new THREE.WebGLRenderer( { antialias: true, canvas } );

	const fov = 75;
	const aspect = 2; // the canvas default
	const near = 1;
	const far = 25;
	const camera = new THREE.PerspectiveCamera( fov, aspect, near, far );
	camera.position.z = 10;

    const controls = new OrbitControls(camera, renderer.domElement);

	const scene = new THREE.Scene();

    const color = 0xFFFFFF;
    const intensity = 10;
    const light = new THREE.AmbientLight( 0xADD8E6, intensity );
    //const light2 = new THREE.DirectionalLight( color, intensity );
    //light.position.set( - 1, 2, -4 );
    scene.add( light );
    //scene.add( light2 );

	const boxWidth = 1;
	const boxHeight = 1;
	const boxDepth = 1;
	const geometry = new THREE.BoxGeometry( boxWidth, boxHeight, boxDepth );

	const material = new THREE.MeshPhongMaterial( { color: 0x44aa88 } ); // greenish blue

	const cube = new THREE.Mesh( geometry, material );
	scene.add( cube );

    function resizeRendererToDisplaySize(renderer: THREE.Renderer) {
        const canvas = renderer.domElement;
        const pixelRatio = window.devicePixelRatio;
        const width = canvas.clientWidth * pixelRatio | 0;
        const height = canvas.clientHeight * pixelRatio | 0;
        const needResize = canvas.width !== width || canvas.height !== height;

        if (needResize) {
            renderer.setSize(width, height, false);
        }

        return needResize;
    }

	function render(time: number) {

		time *= 0.001; // convert time to seconds

        if (resizeRendererToDisplaySize(renderer)) {
            const canvas = renderer.domElement;
            camera.aspect = canvas.clientWidth / canvas.clientHeight;
            camera.updateProjectionMatrix();
        }

		//cube.rotation.x = time;
		//cube.rotation.y = time;

		renderer.render( scene, camera );
        
        controls.update;

		requestAnimationFrame( render );

	}

	requestAnimationFrame( render );

}

main();

