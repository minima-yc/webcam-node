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

const files = await readdir(downloadDir);
files.sort();

const title = process.env.TITLE;
const outFile = process.env.OUTFILE;

// Tell fluent-ffmpeg where it can find FFmpeg
if (process.env.FFMPEG_PATH) {
	ffmpeg.setFfmpegPath(`${process.env.FFMPEG_PATH}/ffmpeg`);
	ffmpeg.setFfprobePath(`${process.env.FFMPEG_PATH}/ffprobe`);
} else {
	ffmpeg.setFfmpegPath(ffmpegStatic);
	ffmpeg.setFfprobePath(ffprobeStatic.path);
}

const ff = ffmpeg();

ff.on('progress', (progress) => {
	console.log(
		progress.frames,
		((progress.frames / (86400 * fps * scale)) * 100).toFixed(1),
		'%',
	);
	// console.log(`Processing: ${(progress.timemark)} hh:mm:ss.ff`);
})

	// The callback that is run when FFmpeg is finished
	.on('end', () => {
		console.log('FFmpeg has finished.');
		console.log(((performance.now() - timer) / 1000).toFixed(0), 'seconds');
	})

	// The callback that is run when FFmpeg encountered an error
	.on('error', (error) => {
		console.log('An error occurred: ' + error.message);
	});

const scale = 1 / 360;
const fps = 60;

let n = 12;
process.stdout.write('Adding files ');
for (const file of files) {
	const filePath = path.join(downloadDir, file);
	ff.addInput(filePath);
	ff.addInputOptions([`-itsscale ${scale}`]);
	process.stdout.write('.');
	n--;
	if (n < 1) break;
}
/*
	.screenshots({
		timestamps: [0],
		filename: '%b.jpg',
		// folder: '/path/to/output',
		// size: '320x240'
	})
	*/
// Log the percentage of work completed

ff
	// ffmpeg -i input -c:v libx264 -preset slow -crf 22 -c:a copy output.mkv
	.outputOptions('-crf', 28)
	.outputOptions('-movflags', '+faststart')
	.outputOptions('-preset', 'slow')
	// .outputOptions('scale', '720:-1')
	// .size('720x?')

	.outputOptions('-metadata', 'title=')
	.outputOptions('-metadata', 'composer=')
	.withFPS(fps)
	.noAudio()
	.mergeToFile(outFile, '.');
// .saveToFile('output.mp4')

/*


minimayc_2024-12-31_19-44-38.mp4 metadata
{
  streams: [
    {
      index: 0,
      codec_name: 'h264',
      codec_long_name: 'H.264 / AVC / MPEG-4 AVC / MPEG-4 part 10',
      profile: 'Main',
      codec_type: 'video',
      codec_time_base: '30103/900000',
      codec_tag_string: 'avc1',
      codec_tag: '0x31637661',
      width: 1920,
      height: 1080,
      coded_width: 1920,
      coded_height: 1088,
      has_b_frames: 0,
      sample_aspect_ratio: 'N/A',
      display_aspect_ratio: 'N/A',
      pix_fmt: 'yuvj420p',
      level: 40,
      color_range: 'pc',
      color_space: 'bt709',
      color_transfer: 'bt709',
      color_primaries: 'bt709',
      chroma_location: 'left',
      field_order: 'unknown',
      timecode: 'N/A',
      refs: 1,
      is_avc: 'true',
      nal_length_size: 4,
      id: 'N/A',
      r_frame_rate: '100/1',
      avg_frame_rate: '450000/30103',
      time_base: '1/90000',
      start_pts: 0,
      start_time: 0,
      duration_ts: 27092700,
      duration: 301.03,
      bit_rate: 3135097,
      max_bit_rate: 'N/A',
      bits_per_raw_sample: 8,
      nb_frames: 4500,
      nb_read_frames: 'N/A',
      nb_read_packets: 'N/A',
      tags: [Object],
      disposition: [Object]
    }
  ],
  format: {
    filename: 'C:\\Projects\\Maintained\\Minima\\webcam-node\\files\\download\\minimayc_2024-12-31_19-44-38.mp4',
    nb_streams: 1,
    nb_programs: 0,
    format_name: 'mov,mp4,m4a,3gp,3g2,mj2',
    format_long_name: 'QuickTime / MOV',
    start_time: 0,
    duration: 301.03,
    size: 118015242,
    bit_rate: 3136305,
    probe_score: 100,
    tags: {
      major_brand: 'mp42',
      minor_version: '0',
      compatible_brands: 'mp42isom',
      creation_time: '2024-12-31T19:44:38.000000Z',
      title: 'Archived with Unreal Media',
      composer: 'Unreal Archival Server'
    }
  },
  chapters: []
}
*/
