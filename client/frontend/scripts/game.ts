import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

import GameController from './Game/Controller/GameController';

const gameController = new GameController("Alexandra", "1", "Lucian", "2");

console.log(gameController);

function main2() {

	const canvas = document.getElementById('game-container');
	const renderer = new THREE.WebGLRenderer( { antialias: true, canvas } );

	const fov = 75;
	const aspect = 2; // the canvas default
	const near = 1;
	const far = 10005;
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
    const cube2 = new THREE.Mesh(geometry, material);
	scene.add( cube );
    scene.add(cube2);

    cube.translateX(-5);
    cube2.translateX(5);

    const maxStars = 1000;
    /*
    const stars = new Array(0);
    for ( let i = 0; i < 10000; i ++ ) {
        let x = THREE.MathUtils.randFloatSpread( 2000 );
        let y = THREE.MathUtils.randFloatSpread( 2000 );
        let z = THREE.MathUtils.randFloatSpread( 2000 );
        stars.push(x, y, z);
    }*/
    const starsGeometry = new THREE.BufferGeometry();
    /*starsGeometry.setAttribute(
        "position", new THREE.Float32BufferAttribute(stars, 3)
    );*/
    const positions = new Float32Array(maxStars * 3);
    starsGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));

    const pointCloud =  new THREE.Points(starsGeometry, material);
    scene.add(pointCloud);
    /*
    const starsMaterial = new THREE.PointsMaterial( { color: 0x888888 } );
    const starField = new THREE.Points( starsGeometry, starsMaterial );
    scene.add( starField );
    */

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
       
        // rqeuired if controls.enableDamping or controls.autoRotate are true
        controls.update;

		requestAnimationFrame( render );

	}

	requestAnimationFrame( render );

}

//main2();

