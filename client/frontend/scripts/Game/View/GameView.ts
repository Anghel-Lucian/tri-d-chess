// TODO: I don't think we want to import model classes in here. I think that the constructor should
// receive a data object with a specific interface, and render it accordingly. The
// data object would contain the white/black pieces, the cells, the full boards and the
// attack boards as an initial state.
// Whenever that state updates, a render method will be called that will update the

import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { MTLLoader } from 'three/examples/jsm/loaders/MTLLoader';
import { OBJLoader } from 'three/examples/jsm/loaders/OBJLoader';

import { ThreeDCoordinates, ViewData, ViewFullBoard } from "./utils";
import { 
    CAMERA_ASPECT,
    CAMERA_FAR,
    CAMERA_FOV,
    CAMERA_NEAR,
    CELL_DEPTH,
    CELL_HEIGHT,
    CELL_WIDTH,
    FULL_BOARD_TYPE_Y_COORDINATE_MAP,
    FULL_BOARD_TYPE_Z_COORDINATE_OFFSET_MAP
} from './constants';
import { PlayerColor } from '../common';

const cellGeometry: THREE.BoxGeometry = new THREE.BoxGeometry(CELL_WIDTH, CELL_HEIGHT, CELL_DEPTH);
const cellMaterialWhite: THREE.MeshPhongMaterial = new THREE.MeshPhongMaterial({color: 0xfcfafa}); 
const cellMaterialBlack: THREE.MeshPhongMaterial = new THREE.MeshPhongMaterial({color: 0xe64578}); 

export default class GameView {
    private canvas: HTMLElement;
    private renderer: THREE.Renderer;
    private camera: THREE.PerspectiveCamera;
    private scene: THREE.Scene;
    private controls: OrbitControls;
    private mainLight: THREE.Light;
    private static instance: GameView;

    private constructor(canvas: HTMLElement) {
        this.canvas = canvas; 
        this.renderer = new THREE.WebGLRenderer({antialias: true, canvas: this.canvas});

        this.camera = new THREE.PerspectiveCamera(CAMERA_FOV, CAMERA_ASPECT, CAMERA_NEAR, CAMERA_FAR);
        this.camera.position.z = 25;
        this.camera.position.y = 15;
        this.camera.position.x = 10;

        this.controls = new OrbitControls(this.camera, this.renderer.domElement);
        this.controls.enableDamping = true;

        // TODO: replace with directional lights or other lights, this is just to see all clearly
        this.mainLight = new THREE.AmbientLight(0xffffff, 1);

        this.scene = new THREE.Scene();

        const mtlLoader = new MTLLoader();
        const objLoader = new OBJLoader();

        const scene = this.scene;

        mtlLoader.load("assets/chess-pieces/Bishop.mtl", (materials) => {
            materials.preload();
            
            objLoader.setMaterials(materials);
            objLoader.load("assets/chess-pieces/Bishop.obj", (object) => {
                scene.add(object);
            });
        });
        this.scene.add(this.mainLight);
    }

    public static getInstance(canvas: HTMLElement): GameView {
        if (!this.instance) {
            this.instance = new GameView(canvas);
        }

        return this.instance;
    }

    public startRendering(data: ViewData) {
        this.renderFullBoards(data);

        requestAnimationFrame(this.render.bind(this));
    }

    /**
      * Recursively called using requestAnimationFrame.
      * Renders the view continuously.
      *
      * @param {number} time Time in seconds
      */
    private render(time: number) {
		time *= 0.001; // convert time to seconds

        if (this.resizeRendererToDisplaySize(this.renderer)) {
            const canvas = this.renderer.domElement;
            this.camera.aspect = canvas.clientWidth / canvas.clientHeight;
            this.camera.updateProjectionMatrix();
        }

        this.controls.update();

		this.renderer.render(this.scene, this.camera);
        
		requestAnimationFrame(this.render.bind(this));
    }

    private renderFullBoards(data: ViewData) {
        this.renderFullBoard(data.fullBoardTop);
        // TODO: attack boards as well per full board
        this.renderFullBoard(data.fullBoardMiddle);
        // TODO: attack boards as well per full board
        this.renderFullBoard(data.fullBoardBottom);
        // TODO: attack boards as well per full board
    }

    /**
      * Render cells of a full board starting at the bottom-right cell
      * TODO: ensure that the cells are ordered first, in order of their coordinates (first 0,0; 0,1 ... 3,3)
      */
    private renderFullBoard(board: ViewFullBoard) {
        let cellColor: PlayerColor = PlayerColor.White;

        for (const cellData of board.cells) {
            if ((cellData.x + 1) % 2 === 0 && cellData.y === 0) {
                cellColor = PlayerColor.White;
            } else if ((cellData.x + 1) % 2 !== 0 && cellData.y === 0) {
                cellColor = PlayerColor.Black;
            } else {
                cellColor = cellColor === PlayerColor.White ? PlayerColor.Black : PlayerColor.White;
            }

            const material = cellColor === PlayerColor.White ? cellMaterialWhite : cellMaterialBlack;
            const cell = new THREE.Mesh(cellGeometry, material);

            cell.translateY(FULL_BOARD_TYPE_Y_COORDINATE_MAP[board.type]);
            cell.translateX((cellData.x + 1) * CELL_WIDTH);
            // Unfortunate naming I believe, because the Y on cellData refers to the board which is a 2D plane
            cell.translateZ((cellData.y + 1) * CELL_WIDTH + FULL_BOARD_TYPE_Z_COORDINATE_OFFSET_MAP[board.type]);

            console.log(cellData.piece);

            this.scene.add(cell);
        }
    }

    private resizeRendererToDisplaySize(renderer: THREE.Renderer) {
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

}
