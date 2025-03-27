import { s3, ORIGINAL_BUCKET, THUMBNAIL_BUCKET } from '../config/awsConfig';

export const uploadImageToS3 = async (file: File) => {
    try {
        const originalKey = `uploads/${Date.now()}-${file.name}`;

        const originalUpload = await s3.upload({
            Bucket: ORIGINAL_BUCKET,
            Key: originalKey,
            Body: file,
            ContentType: file.type
        }).promise();

        const thumbnailKey = `thumbnail-${originalKey}`;
        const thumbnailUrl = `https://${THUMBNAIL_BUCKET}.s3.amazonaws.com/${thumbnailKey}`;

        return {
            originalUrl: originalUpload.Location,
            thumbnailUrl: thumbnailUrl
        };
    } catch (error) {
        console.error('Upload failed', error);
        throw error;
    }
};