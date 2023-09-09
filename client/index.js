import http2 from "node:http2";
import fs from "node:fs";
import process from "node:process";

import "dotenv/config";

import { DEFAULT_RESPONSE_HEADERS } from "./constants.js";

import "./process-config.js";
import { 
    respondWithHTML,
    respondWithJS,
    respondWithCSS,
    respondWithPNG,
    respondWithSVG
} from "./handlers.js";

const server = http2.createSecureServer({
	key: fs.readFileSync(process.env.PRIVATE_KEY_FILE_PATH),
	cert: fs.readFileSync(process.env.CERT_FILE_PATH)
});

server.on("error", (err) => {
    console.log(err);
    fs.writeFile(process.env.SERVER_LOG_FILE_PATH, `${err}\n`, {flag: "a+"});
});

server.on("stream", (stream, headers) => {
	const pathname = headers[":path"];

	// assets
	if (/assets\/[a-zA-Z0-9_.-]*/.test(pathname)) {
		const sanitizedPathname = pathname[0] === "/" ? pathname.slice(1) : pathname;
		const slashPosition = sanitizedPathname.indexOf("/");
		const assetName = sanitizedPathname.slice(slashPosition + 1);
        const assetExtension = assetName.slice(assetName.indexOf("."));

        fs.readFile(`./frontend/assets/${assetName}`, (err, data) => {
            if (assetExtension === ".png") {
                return respondWithPNG(err, data, stream);
            } else if (assetExtension === ".svg") {
                return respondWithSVG(err, data, stream);
            } else {
                // TODO: check headers to be appropriate for this error
                stream.respond({
                    ...DEFAULT_RESPONSE_HEADERS,
                    ":status": 404
                });
                stream.write(data);
                stream.end();
            }
        });

        return;
	}

	// styles 
	if (/styles\/[a-zA-Z0-9_.-]*/.test(pathname)) {
		const sanitizedPathname = pathname[0] === "/" ? pathname.slice(1) : pathname;
		const slashPosition = sanitizedPathname.indexOf("/");
		const styleName = sanitizedPathname.slice(slashPosition + 1);
        const styleExtension = styleName.slice(styleName.indexOf("."));

        fs.readFile(`./frontend/styles/${styleName}`, (err, data) => {
            if (styleExtension === ".css") { 
                return respondWithCSS(err, data, stream);
            } else {
                // TODO: check headers to be appropriate for this error
                stream.respond({
                    ...DEFAULT_RESPONSE_HEADERS,
                    ":status": 404
                });
                stream.write(data);
                stream.end();
            }
        });

        return;
	}

    // scripts
    if (/scripts\/[a-zA-Z0-9_.-]*/.test(pathname)) {
		const sanitizedPathname = pathname[0] === "/" ? pathname.slice(1) : pathname;
		const slashPosition = sanitizedPathname.indexOf("/");
		const scriptName = sanitizedPathname.slice(slashPosition + 1);
        const scriptExtension = scriptName.slice(scriptName.lastIndexOf("."));

        fs.readFile(`./frontend/dist-scripts/${scriptName}`, (err, data) => {
            if (scriptExtension === ".js") { 
                return respondWithJS(err, data, stream);
            } else {
                // TODO: check headers to be appropriate for this error
                stream.respond({
                    ...DEFAULT_RESPONSE_HEADERS,
                    ":status": 404
                });
                stream.write(data);
                stream.end();
            }
        });

        return;
    }
        

	// pages
	switch(pathname) {
        case "/":
            fs.readFile("./frontend/index.html", (err, data) => respondWithHTML(err, data, stream));
            break;
        case "/rules":
            fs.readFile("./frontend/rules.html", (err, data) => respondWithHTML(err, data, stream));
            break;
        case "/game":
            fs.readFile("./frontend/game.html", (err, data) => respondWithHTML(err, data, stream));
            break;
        default:
            // TODO: for unknown paths, respond with a special 404 page
            // TODO: insert other HTTP codes depending on situation
            fs.readFile("./frontend/index.html", (err, data) => respondWithHTML(err, data, stream));
            break;
	}

});

server.listen(process.env.PORT);

console.log(`[INFO] Server listening on ${process.env.PORT}`);
