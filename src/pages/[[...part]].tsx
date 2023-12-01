import React from "react";
import {GetServerSideProps} from "next";
import {FileProps} from "@/type/file";
import {getContentInDirectory} from "@/util/fileUtil";
import Home from "@/components/Home";
import {getLogger} from "@/util/logger";

const DynamicPage = (fileProps: FileProps) => {
    return <Home rootPath={fileProps.rootPath} files={fileProps.files}/>;
};

const logger = getLogger()

export const getServerSideProps: GetServerSideProps<FileProps> = async ({params, req}) => {
    let rootPath = ""

    let subPath = "";
    if (params) {
        if (params.part) {
            subPath += "/";
            subPath += (params.part as string[]).join("/");
            logger.info("on request", {method: 'GET', path: subPath, ip: req.socket.remoteAddress})
        } else {
            logger.info("on request", {method: 'GET', path: "/", ip: req.socket.remoteAddress})
        }
    }

    try {
        let contentInDirectory = await getContentInDirectory(rootPath + subPath);
        return {
            props: {
                rootPath,
                files: contentInDirectory,
            },
        };
    } catch (e) {
        logger.error(e)
        return {
            notFound: true,
        };
    }
};

export default DynamicPage;
