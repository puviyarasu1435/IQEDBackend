const { S3Client } = require("@aws-sdk/client-s3");

const S3 = new S3Client({
  credentials: {
    accessKeyId: process.env.S3_ACCESS_KEY,
    secretAccessKey: process.env.S3_SECRET_ACCESS_KEY,
  },
  region: process.env.S3_BUCKET_REGION,
});



module.exports = S3;
