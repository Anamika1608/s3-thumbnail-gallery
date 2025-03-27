import AWS from 'aws-sdk';

AWS.config.update({
    accessKeyId: import.meta.env.VITE_AWS_ACCESS_KEY_ID,
    secretAccessKey: import.meta.env.VITE_AWS_SECRET_ACCESS_KEY,
    region: import.meta.env.VITE_AWS_REGION
});

export const THUMBNAIL_BUCKET = import.meta.env.VITE_THUMBNAIL_BUCKET;
export const ORIGINAL_BUCKET = import.meta.env.VITE_ORIGINAL_BUCKET;

export const s3 = new AWS.S3();
