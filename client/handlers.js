import fs from "node:fs";
import process from "node:process";

import "dotenv/config";

import { DEFAULT_RESPONSE_HEADERS } from "./constants.js";

const ASSET_EXTENSION_MIME_TYPE_MAP = {
    ".html": "text/html; charset=utf-8",
    ".js": "text/javascript",
    ".css": "text/css; charset=utf-8",
    ".png": "image/png",
    ".svg": "image/svg+xml",
    ".mtl": "text/plain",
    ".obj": "text/plain" 
};

function respondWithContentType(err, data, stream, mimeType = "") {
    const headers = {
        ...DEFAULT_RESPONSE_HEADERS,
		...mimeType ? {"Content-Type": mimeType} : {} 
    };

    if (err) {
        console.log(err);
        fs.writeFile(process.env.SERVER_LOG_FILE_PATH, `${err}\n`, {flag: "a+"});
        stream.respond({
            ...headers,
            ":status": 400
        });
        stream.end();
        return;
    }

	stream.respond({
        ...headers,
		":status": 200
	});
	stream.write(data);
	stream.end();
}

function respondWithHTML(err, data, stream) {
    return respondWithContentType(err, data, stream, ASSET_EXTENSION_MIME_TYPE_MAP[".html"]); 
}

function respondWithJS(err, data, stream) {
    return respondWithContentType(err, data, stream, ASSET_EXTENSION_MIME_TYPE_MAP[".js"]);
}

function respondWithCSS(err, data, stream) {
    return respondWithContentType(err, data, stream, ASSET_EXTENSION_MIME_TYPE_MAP[".css"]);
}

function respondWithPNG(err, data, stream) {
    return respondWithContentType(err, data, stream, ASSET_EXTENSION_MIME_TYPE_MAP[".png"]);
}

function respondWithSVG(err, data, stream) {
    return respondWithContentType(err, data, stream, ASSET_EXTENSION_MIME_TYPE_MAP[".svg"]);
}

function respondWithMTL(err, data, stream) {
    return respondWithContentType(err, data, stream, ASSET_EXTENSION_MIME_TYPE_MAP[".mtl"]);
}

function respondWithOBJ(err, data, stream) {
    return respondWithContentType(err, data, stream, ASSET_EXTENSION_MIME_TYPE_MAP[".obj"]);
}

export {
	respondWithHTML,
    respondWithJS,
    respondWithCSS,
    respondWithPNG,
    respondWithSVG,
    respondWithMTL,
    respondWithOBJ
};
