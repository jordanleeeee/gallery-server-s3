import type {NextApiRequest, NextApiResponse} from 'next'
import imagemin from 'imagemin'
import imageminMozjpeg from 'imagemin-mozjpeg'
import {getFile} from "@/util/fileUtil";
import {getContentType} from "@/util/fileUtil";
import {decode} from "@/util/urlUtil";
import {getLogger} from "@/util/logger";

const logger = getLogger()

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.url === undefined || req.method !== 'GET') {
        logger.info("on request", {method: req.method, path: undefined, ip: req.socket.remoteAddress})
        res.status(404);
        res.end(`path not found`);
        return
    }

    let decodedUrl = decode(req.url)
    logger.info("on request", {method: req.method, path: decodedUrl, ip: req.socket.remoteAddress})

    let path = decodedUrl.substring(5, decodedUrl.length);
    // const fromLocal = req.headers.host!.includes('localhost') || req.headers.host!.includes('127.0.0.1')

    try {
        let file = await getFile(path);
        res.writeHead(200, {'Content-Type': getContentType(path), 'Cache-Control': 'max-age=3600'});
        // if (!fromLocal && file.ContentLength! > 100_000) { // compress for non-local request and file > 1MB
        //     res.end(await imagemin.buffer(file.Body! as Buffer, {plugins: [imageminMozjpeg({quality: 80})]}));
        // }
        res.send(file.Body!)
        res.end()
    } catch (e) {
        logger.error(`file not found: ${decodedUrl}`)
        res.status(404);
        res.end();
    }
}

export const config = {
    api: {
        responseLimit: false,
    },
}
