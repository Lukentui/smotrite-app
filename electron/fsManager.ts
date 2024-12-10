import fs from 'fs'
const crypto = require('crypto');
import { app } from "electron";

const calculateSHA256ByPath = path => new Promise<string>((resolve, reject) => {
    if(!fs.existsSync(path)) {
        throw new Error(`File doesn't exists: ${path}`)
    }

    const hash = crypto.createHash('sha256');
    const rs = fs.createReadStream(path);
    rs.on('error', reject);
    rs.on('data', chunk => hash.update(chunk));
    rs.on('end', () => resolve(hash.digest('hex').trim()));
})

const getAppDir = () => {
    const appDir = app.getPath("appData") + "/pro.nikkitin.smotrite";
    fs.mkdirSync(appDir, { recursive: true });
    return appDir;
}

export {
    calculateSHA256ByPath,
    getAppDir,
}