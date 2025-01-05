import { readdir } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'url';

import ffprobeStatic from 'ffprobe-static';
import ffmpegStatic from 'ffmpeg-static';
import ffmpeg from 'fluent-ffmpeg';

const timer = performance.now();

// const __dirname = path.dirname(fileURLToPath(import.meta.url));
// const downloadDir = path.join(__dirname, '..', 'files', 'download');

const downloadDir = 'E:/MYC Webcam/2024/12/08';

let files = await readdir(downloadDir);
files.sort();
// for (const file of files)
//  	console.log(file, path.join(downloadDir, file));


// Tell fluent-ffmpeg where it can find FFmpeg
ffmpeg.setFfmpegPath(ffmpegStatic);
ffmpeg.setFfprobePath(ffprobeStatic.path);

// ffmpeg.setFfmpegPath('/usr/bin/ffmpeg');
// ffmpeg.setFfprobePath('/usr/bin/ffprobe');

const scale = 1 / 360;
const fps = 60;

const ff = ffmpeg();

files = await readdir('files/output');
files.sort();
for (const file of files) {
	const filePath = path.join(downloadDir, file)
	ff.addInput(filePath);
}
ff
// ffmpeg -i input -c:v libx264 -preset slow -crf 22 -c:a copy output.mkv
.outputOptions('-movflags', '+faststart')
.outputOptions('-preset', 'slow')

.outputOptions('-metadata', 'title=Minima Yacht Club')
.outputOptions('-metadata', 'composer=')
.withFPS(fps)
.noAudio()
.mergeToFile('merged.mp4', './files')
// saveToFile(`files/output/${file}-720.mp4`)

// Log the percentage of work completed
.on("progress", (progress) => {
	console.log(progress.frames, (progress.frames / (86400 * fps * scale) * 100).toFixed(1), '%');
	// console.log(`Processing: ${(progress.timemark)} hh:mm:ss.ff`);
})

// The callback that is run when FFmpeg is finished
.on("end", () => {
	console.log("FFmpeg has finished.");
	console.log(performance.now() - timer);
})

// The callback that is run when FFmpeg encountered an error
.on("error", (error) => {
	console.log("An error occurred: " + error.message);
});
