import { FullBoardType } from "../common";

export const CAMERA_FOV = 50;
export const CAMERA_ASPECT = 2; 
export const CAMERA_NEAR = 1;
export const CAMERA_FAR = 10000;
export const CELL_WIDTH = 2;
export const CELL_DEPTH = CELL_WIDTH;
export const CELL_HEIGHT = 1;

/*
 * the distance between the full boards should accommodate two rows of pieces: 
 * one on the fullboard and one on the potential attack board
 */
export const FULL_BOARD_TYPE_Y_COORDINATE_MAP = {
    [FullBoardType.Top]: 8,
    [FullBoardType.Middle]: 4,
    [FullBoardType.Bottom]: 0
};

/*
 * fullboards always must align two rows at a time
 */
export const FULL_BOARD_TYPE_Z_COORDINATE_OFFSET_MAP = {
    [FullBoardType.Top]: 4 * CELL_WIDTH,
    [FullBoardType.Middle]: 2 * CELL_WIDTH,// TODO: should be calculated based on the cell dimensions
    [FullBoardType.Bottom]: 0
};
