// TODO: I don't think we want to import model classes in here. I think that the constructor should
// receive a data object with a specific interface, and render it accordingly. The
// data object would contain the white/black pieces, the cells, the full boards and the
// attack boards as an initial state.
// Whenever that state updates, a render method will be called that will update the

import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

import { ThreeDCoordinates, ViewData, ViewFullBoard } from "./utils";
import { CAMERA_ASPECT, CAMERA_FAR, CAMERA_FOV, CAMERA_NEAR } from './constants';
import { FullBoardType } from '../common';

export default class GameView {
    private canvas: HTMLElement;
    private renderer: THREE.Renderer;
    private camera: THREE.PerspectiveCamera;
    private scene: THREE.Scene;
    private controls: OrbitControls;
    private mainLight: THREE.Light;

    constructor(canvas: HTMLElement) {
        this.canvas = canvas; 
        this.renderer = new THREE.WebGLRenderer({antialias: true, canvas: this.canvas});

        // TODO: maybe use another class for the camera since it will have to move and zoom and such
        this.camera = new THREE.PerspectiveCamera(CAMERA_FOV, CAMERA_ASPECT, CAMERA_NEAR, CAMERA_FAR);

        this.scene = new THREE.Scene();
        this.controls = new OrbitControls(this.camera, this.renderer.domElement);
        
        // TODO: replace with directional lights or other lights, this is just to see all clearly
        this.mainLight = new THREE.AmbientLight(0xffffff, 1);

        this.scene.add(this.mainLight);
    }

    public render(data: ViewData) {
         
    }

    public renderFullBoards(data: ViewData) {
        

    }

    /**
      * Render cells of a full board starting at the bottom-right cell
      */
    private renderFullBoard(board: ViewFullBoard, startCoordinates: ThreeDCoordinates) {
        const currentCoordinates: ThreeDCoordinates = startCoordinates;

        for (let cell of board.cells) {
       // TODO:      
        }
    }


}
