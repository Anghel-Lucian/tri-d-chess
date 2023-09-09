import process from "node:process";
import fs from "node:fs";

import "dotenv/config";

const invalidStreamErrorCode = "ERR_HTTP2_INVALID_STREAM";

process.on("uncaughtException", (err, origin) => {
    let content = `Caught exception: ${err}\nException origin: ${origin}\n`;

    if (err.code === invalidStreamErrorCode) {
        content += "Ignore. Bug in NodeJS core\n";
    }

    fs.writeFile(process.env.UNCAUGHT_EXCEPTIONS_FILE_PATH, content, {flag: "a+"}, errWriteFile => {
        if (errWriteFile) {
            console.log(errWriteFile);
        }
    });
});
