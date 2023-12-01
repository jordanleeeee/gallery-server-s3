import * as path from 'path';
import {File} from "@/type/file";
import AWS from 'aws-sdk';
// import sharp from 'sharp';

AWS.config.update({
    credentials: {
        accessKeyId: process.env.accessKeyId!,
        secretAccessKey: process.env.secretAccessKey!,
    },
    region: process.env.region!
});
const s3 = new AWS.S3();
const bucketName = 'sweetimg';

export async function getFile(filePath: string) {
    return await s3.getObject({
        Bucket: bucketName,
        Key: filePath
    }).promise();
}

export function getFileStream(filePath: string) {
    return s3.getObject({
        Bucket: bucketName,
        Key: filePath
    }).createReadStream();
}

export function getContentType(filePath: string): string {
    const extension = path.extname(filePath);
    switch (extension) {
        case '.html':
            return 'text/html';
        case '.css':
            return 'text/css';
        case '.js':
            return 'text/javascript';
        case '.json':
            return 'application/json';
        case '.png':
            return 'image/png';
        case '.jpg':
        case '.jpeg':
            return 'image/jpeg';
        case '.gif':
            return 'image/gif';
        case '.svg':
            return 'image/svg+xml';
        case '.webp':
            return 'image/webp';
        case '.ico':
            return 'image/x-icon';
        case '.woff':
            return 'font/woff';
        case '.woff2':
            return 'font/woff2';
        case '.ttf':
            return 'font/ttf';
        case '.otf':
            return 'font/otf';
        case '.txt':
            return 'text/plain';
        case '.pdf':
            return 'application/pdf';
        case '.zip':
            return 'application/zip';
        case '.mp3':
            return 'audio/mpeg';
        case '.wav':
            return 'audio/wav';
        case '.mp4':
            return 'video/mp4';
        case '.webm':
            return 'video/webm';
        default:
            return 'text/plain';
    }
}

export function isImage(contentType: string): boolean {
    return contentType.includes("image")
}

export async function getContentInDirectory(path: string): Promise<File[]> {

    const files: File[] = [];

    const objects = await s3.listObjectsV2({
        Bucket: bucketName,
        Delimiter: "/",
        Prefix: path === "" ? "" : path.substring(1) + "/"
    }).promise();

    for (const object of objects.Contents!) {
        let fullPath = object.Key!;
        const parts = fullPath.split("/");
        path = parts[parts.length - 1];


        let file: File = {
            path: path,
            type: "file",
            lastModify: object.LastModified?.toISOString()!
        };


        file.contentType = getContentType(path)
        // if (isImage(file.contentType)) {
        //     const image = await getFile(fullPath);
        //
        //     const {width, height} = await sharp(image.Body!).metadata();
        //     file.imageWidth = width;
        //     file.imageHeight = height;
        // }
        files.push(file)
    }
    objects.CommonPrefixes!.forEach(object => {
        let fullPath = object.Prefix!.substring(0, object.Prefix!.length - 1);
        const parts = fullPath.split("/");
        let path = parts[parts.length - 1];

        let file: File = {
            path: path,
            type: "directory",
            lastModify: "-"
        };

        // s3.listObjects({
        //     Bucket: bucketName,
        //     Delimiter: path + item
        // }).promise().then()
        //
        // let innerContent = fs.readdirSync(path + "/" + item).filter(_ => !_.startsWith('.'));
        // if (innerContent.length !== 0 && !innerContent.some(_ => !isImage(getContentType(_)))) {
        //     file.type = "imageDirectory"
        //     file.icon = item + "/" + innerContent[0]
        //
        //     let imageSize = sizeOf(path + '/' + file.icon);
        //     file.imageWidth = imageSize.width
        //     file.imageHeight = imageSize.height
        // }

        files.push(file)
    })
    return files;
}


// for (const item of contents) {
//     if (item.startsWith(".")) continue
//
//     const itemPath = `${path}/${item}`;
//     const stats = fs.statSync(itemPath);
//
//     let file: File = {
//         path: item,
//         type: stats.isDirectory() ? "directory" : "file",
//         lastModify: stats.mtime.toISOString()
//     };
//
//     if (!stats.isDirectory()) {
//         file.contentType = getContentType(item)
//         if (isImage(file.contentType)) {
//             let imageSize = sizeOf(path + '/' + item);
//             file.imageWidth = imageSize.width
//             file.imageHeight = imageSize.height
//         }
//     } else {
//         let innerContent = fs.readdirSync(path + "/" + item).filter(_ => !_.startsWith('.'));
//         if (innerContent.length !== 0 && !innerContent.some(_ => !isImage(getContentType(_)))) {
//             file.type = "imageDirectory"
//             file.icon = item + "/" + innerContent[0]
//
//             let imageSize = sizeOf(path + '/' + file.icon);
//             file.imageWidth = imageSize.width
//             file.imageHeight = imageSize.height
//         }
//     }
//     files.push(file)
// }
// return files
// }
