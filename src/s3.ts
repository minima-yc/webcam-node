// Example: sending a command (tree-shaking compatible).
import { createWriteStream, createReadStream, type ReadStream } from 'node:fs';
import {
	S3Client,
	GetObjectCommand,
	PutObjectCommand,
	type PutObjectCommandInput,
} from '@aws-sdk/client-s3';
import 'dotenv/config.js';

export const putObject = async (
	s3Client: S3Client,
	bucket: string,
	key: string,
	options: {
		text?: string,
		file?: string,
	} = {},
) => {

	let Body: PutObjectCommandInput['Body'] = Buffer.from('');
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
		}),
	);
};

export const getObject = async (
	s3Client: S3Client,
	bucket: string,
	key: string,
	options: {
		text?: string,
		file?: string,
	} = {},
) => {
	const response = await s3Client.send(
		new GetObjectCommand({
			Bucket: bucket,
			Key: key,
		}),
	);

	return new Promise((resolve) => {
		if (options.file) {
			const output = createWriteStream(options.file);
			output.on('close', () => resolve(response));
			if (response.Body) {
				(response.Body as unknown as ReadStream).pipe(output);
				return;
			}
			output.close();
		} else if (options.text) {
			return response.Body?.transformToString() ?? '';
		}
	});

	// Default is to just return (a promise for) the response.
	return response;
};

export const createS3Client = (endpoint: string, accessKeyId: string,	secretAccessKey: string) => {
	return new S3Client({
		endpoint,
		region: 'NotRequired',
		credentials: {
			accessKeyId,
			secretAccessKey,
		},
	});
};
