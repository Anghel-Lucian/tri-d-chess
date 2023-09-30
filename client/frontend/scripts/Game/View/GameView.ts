// TODO: I don't think we want to import model classes in here. I think that the constructor should
// receive a data object with a specific interface, and render it accordingly. The
// data object would contain the white/black pieces, the cells, the full boards and the
// attack boards as an initial state.
// Whenever that state updates, a render method will be called that will update the

import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

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
import { FullBoardType, PlayerColor } from '../common';

const cellGeometry: THREE.BoxGeometry = new THREE.BoxGeometry(CELL_WIDTH, CELL_HEIGHT, CELL_DEPTH);
const cellMaterialWhite: THREE.MeshPhongMaterial = new THREE.MeshPhongMaterial({ color: 0xfffff }); 
const cellMaterialBlack: THREE.MeshPhongMaterial = new THREE.MeshPhongMaterial({ color: 0x44aa88 }); // TODO: greenish blue, should be some other color

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
      * TODO: ensure that the cells are ordered first, in order of their coordinates (first 0,0; 0,1 ... 3,3)
      */
    private renderFullBoard(board: ViewFullBoard, startCoordinates: ThreeDCoordinates) {
        const currentCoordinates: ThreeDCoordinates = startCoordinates;
        let cellColor: PlayerColor = PlayerColor.White;
        let zCoordinate;

        for (let cellData of board.cells) {
            const material = cellColor === PlayerColor.White ? cellMaterialWhite : cellMaterialBlack;
            const cell = new THREE.Mesh(cellGeometry, material);

            if (cellColor === PlayerColor.White) {
                cellColor = PlayerColor.Black;
            } else {
                cellColor = PlayerColor.White;
            }

           cell.translateY(FULL_BOARD_TYPE_Y_COORDINATE_MAP[board.type]);
           cell.translateX(cellData.x);
           // TODO: unfortunate naming I believe, because the Y on cellData refers to the board
           // which is a two-d plane. 
           cell.translateZ(cellData.y + FULL_BOARD_TYPE_Z_COORDINATE_OFFSET_MAP[board.type]);

        }
    }


}