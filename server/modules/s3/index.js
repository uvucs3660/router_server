const { s3Client } = require('../../config/aws');
const { PutObjectCommand } = require('@aws-sdk/client-s3');
const { readFile } = require('node:fs/promises');

async function uploadToS3(file) {
  const params = {
    Bucket: 'project3-team5',
    Key: `${file.originalFilename}`,
    Body: await readFile(file.filepath),
    ContentType: file.mimetype,
    ACL: 'public-read'
  };

  try {
    await s3Client.send(new PutObjectCommand(params));
    return `https://project3-team5.s3.us-east-1.amazonaws.com/${params.Key}`;
  } catch (error) {
    console.error('Error uploading to S3:', error);
    throw error;
  }
}

async function uploadToS3Parallel(file) {
  const params = {
    Bucket: 'project3-team5',
    Key: `${file.originalFilename}`,
    Body: file.buffer,
    ContentType: file.mimetype,
    ACL: 'public-read'
  };

  try {
    await s3Client.send(new PutObjectCommand(params));
    return `https://project3-team5.s3.amazonaws.com/${params.Key}`;
  } catch (error) {
    console.error('Error uploading to S3:', error);
    throw error;
  }
}

module.exports = {
  uploadToS3,
  uploadToS3Parallel
};