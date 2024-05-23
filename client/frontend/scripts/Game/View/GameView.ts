// TODO: I don't think we want to import model classes in here. I think that the constructor should
// receive a data object with a specific interface, and render it accordingly. The
// data object would contain the white/black pieces, the cells, the full boards and the
// attack boards as an initial state.
// Whenever that state updates, a render method will be called that will update the

import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { MTLLoader } from 'three/examples/jsm/loaders/MTLLoader';
import { OBJLoader } from 'three/examples/jsm/loaders/OBJLoader';

import { ThreeDCoordinates, ViewAttackBoard, ViewData, ViewFullBoard, ViewPiece } from "./utils";
import { 
    CAMERA_ASPECT,
    CAMERA_FAR,
    CAMERA_FOV,
    CAMERA_NEAR,
    CELL_DEPTH,
    CELL_HEIGHT,
    CELL_WIDTH,
    FULL_BOARD_TYPE_Y_COORDINATE_MAP,
    FULL_BOARD_TYPE_Z_COORDINATE_OFFSET_MAP,
    PIECE_RENDERED_MODEL
} from './constants';
import { PlayerColor, PieceName, FULL_BOARD_DIMENSION, AttackBoardType, FullBoardType } from '../common';

const cellGeometry: THREE.BoxGeometry = new THREE.BoxGeometry(CELL_WIDTH, CELL_HEIGHT, CELL_DEPTH);
const cellMaterialWhite: THREE.MeshPhongMaterial = new THREE.MeshPhongMaterial({color: 0xfcfafa}); 
const cellMaterialBlack: THREE.MeshPhongMaterial = new THREE.MeshPhongMaterial({color: 0xe64578}); 
const attackBoardsCoordinatesOffset = {
    bottomBottomRight: {
        x: 4,
        z: -2,
    },
    bottomBottomLeft: {
        x: 0,
        z: -4
    },
    bottomTopRight: {
        x: 4,
        z: 2,
    },
    bottomTopLeft: {
        x: 0,
        z: 0,
    },
    // TODO: replace the following 4 coordinate sets with correct values
    middleBottomRight: {
        x: 0,
        z: 2,
    },
    middleBottomLeft: {
        x: 4,
        z: 4,
    },
    middleTopRight: {
        x: 10,
        z: 10,
    },
    middleTopLeft: {
        x: 10,
        z: 10,
    },
    topBottomRight: {
        x: 4,
        z: 6,
    },
    topBottomLeft: {
        x: 0,
        z: 4,
    },
    topTopRight: {
        x: 4,
        z: 4,
    },
    topTopLeft: {
        x: 0,
        z: 8,
    }
};

export default class GameView {
    private canvas: HTMLElement;
    private renderer: THREE.Renderer;
    private camera: THREE.PerspectiveCamera;
    private scene: THREE.Scene;
    private controls: OrbitControls;
    private mainLight: THREE.Light;
    private mtlLoader: MTLLoader;
    private objLoader: OBJLoader;
    private raycaster: THREE.Raycaster;
    private pointer: THREE.Vector2;
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

        this.mtlLoader = new MTLLoader();
        this.objLoader = new OBJLoader();

        this.raycaster = new THREE.Raycaster();
        this.pointer = new THREE.Vector2();

        this.raycaster.setFromCamera(this.pointer, this.camera);

        this.scene.add(this.mainLight);

        // even listeners
        window.addEventListener('pointermove', (event) => {
            console.log("pointer moved");
            console.log({pointer: this.pointer});
            this.pointer.x = (event.clientX / window.innerWidth) * 2 - 1;
            this.pointer.y =- (event.clientY / window.innerHeight) * 2 + 1;
        });
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

        this.raycaster.setFromCamera(this.pointer, this.camera);

        const intersects = this.raycaster.intersectObjects(this.scene.children);

        for (let i = 0; i < intersects.length; i++) {
            console.log(intersects);
            intersects[i].object.rotateX(3.14 * 1.3);
        }

		this.renderer.render(this.scene, this.camera);
        
		requestAnimationFrame(this.render.bind(this));
    }

    private renderFullBoards(data: ViewData) {
        this.renderFullBoard(data.fullBoardTop);
        this.renderFullBoardAttackBoards(data.fullBoardTop);
        this.renderFullBoard(data.fullBoardMiddle);
        this.renderFullBoardAttackBoards(data.fullBoardMiddle);
        this.renderFullBoard(data.fullBoardBottom);
        this.renderFullBoardAttackBoards(data.fullBoardBottom);
    }

    /**
      * Render cells of a full board starting at the bottom-right cell
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

            const cellY = FULL_BOARD_TYPE_Y_COORDINATE_MAP[board.type];
            const cellX = (cellData.y + 1) * CELL_WIDTH;
            const cellZ = (cellData.x + 1) * CELL_WIDTH + FULL_BOARD_TYPE_Z_COORDINATE_OFFSET_MAP[board.type]

            cell.translateY(cellY);
            cell.translateX(cellX);
            cell.translateZ(cellZ);

            if (cellData.piece) {
                this.renderPiece(cellData.piece, cell);
            }

            this.scene.add(cell);
        }
    }

    private renderFullBoardAttackBoards(fullBoard: ViewFullBoard) {
        let cellColor: PlayerColor = PlayerColor.White;

        for (const board of fullBoard.attackBoards) {
            if (board.type === AttackBoardType.Left) {
                let coordinatesOffset;

                if (fullBoard.type === FullBoardType.Bottom) {
                    coordinatesOffset = attackBoardsCoordinatesOffset.bottomBottomLeft;
                } else if (fullBoard.type === FullBoardType.Middle) {
                    coordinatesOffset = attackBoardsCoordinatesOffset.middleBottomLeft;
                } else if (fullBoard.type === FullBoardType.Top) {
                    coordinatesOffset = attackBoardsCoordinatesOffset.topBottomLeft;
                }

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

                    const cellY = FULL_BOARD_TYPE_Y_COORDINATE_MAP[fullBoard.type] + 4;
                    const cellX = (cellData.y + coordinatesOffset.x) * CELL_WIDTH;
                    const cellZ = (cellData.x + coordinatesOffset.z) * CELL_WIDTH + FULL_BOARD_TYPE_Z_COORDINATE_OFFSET_MAP[board.type]

                    cell.translateY(cellY);
                    cell.translateX(cellX);
                    cell.translateZ(cellZ);

                    if (cellData.piece) {
                        this.renderPiece(cellData.piece, cell);
                    }

                    this.scene.add(cell);
                }
            } else {
                let coordinatesOffset;

                if (fullBoard.type === FullBoardType.Bottom) {
                    coordinatesOffset = attackBoardsCoordinatesOffset.bottomBottomRight;
                } else if (fullBoard.type === FullBoardType.Middle) {
                    coordinatesOffset = attackBoardsCoordinatesOffset.middleBottomRight;
                } else if (fullBoard.type === FullBoardType.Top) {
                    coordinatesOffset = attackBoardsCoordinatesOffset.topBottomRight;
                }

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

                    const cellY = FULL_BOARD_TYPE_Y_COORDINATE_MAP[fullBoard.type] + 4;
                    const cellX = (cellData.y + coordinatesOffset.x) * CELL_WIDTH;
                    const cellZ = (cellData.x + coordinatesOffset.z) * CELL_WIDTH + FULL_BOARD_TYPE_Z_COORDINATE_OFFSET_MAP[board.type]

                    cell.translateY(cellY);
                    cell.translateX(cellX);
                    cell.translateZ(cellZ);

                    if (cellData.piece) {
                        this.renderPiece(cellData.piece, cell);
                    }

                    this.scene.add(cell);
                }
            }
        }
    }


    private renderPiece(piece: ViewPiece, cellObject: THREE.Object3D) { 
        const {mtl, obj} = PIECE_RENDERED_MODEL[piece.name];
        const scene = this.scene;

        this.mtlLoader.load(`assets/chess-pieces/${mtl}.mtl`, (materials) => {
            materials.preload();
            
            this.objLoader.setMaterials(materials);
            this.objLoader.load(`assets/chess-pieces/${obj}.obj`, (object) => {
                object.scale.setScalar(0.03);
                object.rotateX(3.14 * 1.5);

                if (piece.color === PlayerColor.White) {
                    object.rotateZ(3.14 * 1);
                }

                object.position.setFromMatrixPosition(cellObject.matrixWorld);
                object.translateZ(0.5);
                scene.add(object);
            });
        });
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
