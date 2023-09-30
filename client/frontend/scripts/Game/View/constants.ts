import { FullBoardType } from "../common";

export const CAMERA_FOV = 75;
export const CAMERA_ASPECT = 2; 
export const CAMERA_NEAR = 1;
export const CAMERA_FAR = 5;
export const CELL_WIDTH = 1;
export const CELL_HEIGHT = 1;
export const CELL_DEPTH = 1;

// TODO: the distance between the full boards should accommodate two rows of pieces (one on the fullboard and on the 
// potential attack board);
export const FULL_BOARD_TYPE_Y_COORDINATE_MAP = {
    [FullBoardType.Top]: 12,
    [FullBoardType.Middle]: 6,
    [FullBoardType.Bottom]: 0
};

// TODO: fullboards always must align two rows at a time
export const FULL_BOARD_TYPE_Z_COORDINATE_OFFSET_MAP = {
    [FullBoardType.Top]: 4,
    [FullBoardType.Middle]: 2,
    [FullBoardType.Bottom]: 0
};
