import { S3Client } from '@aws-sdk/client-s3';

const awsConfig = {
    region: import.meta.env.VITE_AWS_REGION || 'us-east-1',
    credentials: {
        accessKeyId: import.meta.env.VITE_AWS_ACCESS_KEY_ID,
        secretAccessKey: import.meta.env.VITE_AWS_SECRET_ACCESS_KEY
    }
};

export const s3Client = new S3Client(awsConfig);

export const THUMBNAIL_BUCKET = import.meta.env.VITE_THUMBNAIL_BUCKET;
export const ORIGINAL_BUCKET = import.meta.env.VITE_ORIGINAL_BUCKET;
