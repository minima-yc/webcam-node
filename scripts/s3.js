// Example: sending a command (tree-shaking compatible).
import { createWriteStream, createReadStream } from 'node:fs';
import { S3Client, GetObjectCommand, PutObjectCommand } from '@aws-sdk/client-s3';
import 'dotenv/config.js';

const createObject = async (s3Client, bucket, key, options = {}) => {
	let Body = Buffer.from('');
	if (options.file) {
		Body = createReadStream(options.file);
	} else if (options.text) {
		Body = options.text;
	}

	return s3Client.send(
		new PutObjectCommand({
			Bucket: bucket,
			Key: key,
			Body,
			IfNoneMatch: '*',
		}),
	);
};

const putObject = async (s3Client, bucket, key, options = {}) => {
	let Body = Buffer.from('');
	if (options.file) {
		Body = createReadStream(file);
	} else if (options.text) {
		Body = options.text;
	}

	return s3Client.send(
		new PutObjectCommand({
			Bucket: bucket,
			Key: key,
			Body,
		}),
	);
};

const getObject = async (s3Client, bucket, key, options = {}) => {
	const response = await s3Client.send(
		new GetObjectCommand({
			Bucket: bucket,
			Key: key,
		}),
	);

	if (options.file) {
		return new Promise((resolve) => {
			const output = createWriteStream(options.file);
			output.on('close', () => resolve(response));
			response.Body.pipe(output);
		});
	} else if (options.text) {
		return response.Body.transformToString();
	} else if (options.buffer) {
	}

	// Default is to just return (a promise for) the response.
	return response;
};

const s3Client = new S3Client({
	endpoint: `https://${process.env.endpoint}`,
	region: 'NotRequired',
	credentials: {
		accessKeyId: process.env.access_key,
		secretAccessKey: process.env.secret_key,
	},
});

/*
const response = await getObject(s3Client, 'webcam-static', 'my-object.js', {
	file: 'my-object.js',
});
*/
const file = 'output8Dec180-60.mp4';
const response = await createObject(s3Client, 'webcam-static', `output/${file}`, {
	file,
});

console.log(response);
s3Client.destroy();
