import { fetchFile } from "@ffmpeg/util";
import { getFFmpeg } from "./ffmpeg-manager.js";

export async function extractMovThumbnail(file, logMessage, setProgress) {
    let instance;
    try {
        instance = await getFFmpeg(logMessage, setProgress);
        await instance.writeFile("thumb_input.mov", await fetchFile(file));
        await instance.exec(["-i", "thumb_input.mov", "-ss", "0.1", "-vframes", "1", "-f", "mjpeg", "thumb.jpg"]);
        const data = await instance.readFile("thumb.jpg");
        if (data && data.length > 100) return data.buffer;
    } catch (e) {
        if (logMessage) logMessage(`MOV thumbnail extraction failed: ${e.message}`, "warning");
    } finally {
        if (instance) {
            await instance.deleteFile("thumb_input.mov").catch(() => {});
            await instance.deleteFile("thumb.jpg").catch(() => {});
        }
    }
    return null;
}

export async function extractThumbnailFromInstance(instance, videoFilename, logMessage) {
    try {
        await instance.exec(["-ss", "0.1", "-i", videoFilename, "-vframes", "1", "-vf", "scale=320:-2", "-f", "mjpeg", "thumb.jpg"]);
        const data = await instance.readFile("thumb.jpg");
        await instance.deleteFile("thumb.jpg").catch(() => {});
        if (data && data.length > 100) return data.buffer;
    } catch (e) {
        logMessage(`Thumbnail capture failed: ${e.message}`, "warning");
    }
    return null;
}
