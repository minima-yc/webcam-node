import { readdir } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'url';

import ffprobeStatic from 'ffprobe-static';
import ffmpegStatic from 'ffmpeg-static';
import ffmpeg from 'fluent-ffmpeg';
import 'dotenv/config.js';

const timer = performance.now();

// const __dirname = path.dirname(fileURLToPath(import.meta.url));
// const downloadDir = path.join(__dirname, '..', 'files', 'download');

const downloadDir = process.env.DOWNLOAD_DIR;

let files = await readdir(downloadDir);
files.sort();
// for (const file of files)
//  	console.log(file, path.join(downloadDir, file));

// Tell fluent-ffmpeg where it can find FFmpeg
if (process.env.FFMPEG_PATH) {
	ffmpeg.setFfmpegPath(`${process.env.FFMPEG_PATH}/ffmpeg`);
	ffmpeg.setFfprobePath(`${process.env.FFMPEG_PATH}/ffprobe`);
} else {
	ffmpeg.setFfmpegPath(ffmpegStatic);
	ffmpeg.setFfprobePath(ffprobeStatic.path);
}

const scale = 1 / 360;
const fps = 60;

const doOne = async(file) => {
	const filePath = path.join(downloadDir, file)
	return new Promise((resolve, reject) => {
		const ff = ffmpeg();
		ff.addInput(filePath);
		ff.addInputOptions([`-itsscale ${scale}`]);
	
		ff
		// ffmpeg -i input -c:v libx264 -preset slow -crf 22 -c:a copy output.mkv
		.outputOptions('-crf', 28)
		.outputOptions('-movflags', '+faststart')
		.outputOptions('-preset', 'slow')
		// .outputOptions('scale', '720:-1')
		// .size('?x720')
	
		.outputOptions('-metadata', 'title=Minima Yacht Club')
		.outputOptions('-metadata', 'composer=')
		.withFPS(fps)
		.noAudio()
		// .mergeToFile('output8Dec360-60-25.mp4', './files')
		.saveToFile(`files/output/${file}-tl.mp4`)
	
		// Log the percentage of work completed
		.on("progress", (progress) => {
			console.log(progress.frames, (progress.frames / (86400 * fps * scale) * 100).toFixed(1), '%');
			// console.log(`Processing: ${(progress.timemark)} hh:mm:ss.ff`);
		})
	
		// The callback that is run when FFmpeg is finished
		.on("end", () => {
			resolve(true);
		})
	
		// The callback that is run when FFmpeg encountered an error
		.on("error", (error) => {
			console.log("An error occurred: " + error.message);
			reject(error);
		});
	});
}

for (const file of files) {
	await doOne(file);
}
