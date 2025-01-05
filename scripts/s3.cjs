const AWS = require('aws-sdk');
const PATH = require('path');
const FS = require('fs');
require('dotenv').config();

// Full path of object. For example '../files/local-object'
const file = 'scripts/s3.cjs';
const fileStream = new FS.createReadStream(file);

// Create an S3 client for IDrive e2
const s3 = new AWS.S3({
	endpoint: `https://${process.env.endpoint}`, //your storage-endpoint
	accessKeyId: process.env.access_key, //your access-key
	secretAccessKey: process.env.secret_key, //your secret-key
});

// upload object 'local-object' as 'my-object' in bucket 'my-bucket' params
var params = {
	Bucket: 'webcam-static',
	Key: 'my-object.js',
	// Body: fileStream,
};

/*
// put object call
s3.putObject(params, function (err, data) {
	if (err) {
		console.log('Error:', err);
	} else {
		console.log('Success:', data);
	}
});
*/


s3.getObject(params, function (err, data) {
	if (err) {
		console.log('Error:', err);
	} else {
		console.dir(data);
		console.log('Success:', data);
	}
});
