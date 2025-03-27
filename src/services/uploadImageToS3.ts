import { s3Client, ORIGINAL_BUCKET, THUMBNAIL_BUCKET } from '../config/awsConfig';
import { PutObjectCommand } from '@aws-sdk/client-s3';

export const uploadImageToS3 = async (file: File) => {
    try {
        console.log('Uploading image to S3', file);
        const originalKey = `uploads/${Date.now()}-${file.name}`;

        console.log("Uploading original image", originalKey);

        const originalUpload = await s3Client.send(new PutObjectCommand({
            Bucket: ORIGINAL_BUCKET,
            Key: originalKey,
            Body: file,
            ContentType: file.type
        }));

        console.log('original Upload successful', originalUpload);

        const thumbnailKey = `thumbnail-${originalKey}`;
        const thumbnailUrl = `https://${THUMBNAIL_BUCKET}.s3.amazonaws.com/${thumbnailKey}`;

        console.log('Generating thumbnail', thumbnailKey);
        console.log('Generating thumbnail url', thumbnailUrl);

        return {
            originalUrl: `https://${ORIGINAL_BUCKET}.s3.amazonaws.com/${originalKey}`,
            thumbnailUrl: thumbnailUrl
        };
    } catch (error) {
        console.error('Upload failed', error);
        throw error;
    }
};