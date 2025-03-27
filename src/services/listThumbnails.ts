import { s3Client, THUMBNAIL_BUCKET, ORIGINAL_BUCKET } from '../config/awsConfig';
import { ListObjectsV2Command } from '@aws-sdk/client-s3';

export const listThumbnails = async () => {
    try {
        const params = {
            Bucket: THUMBNAIL_BUCKET,
            Prefix: 'thumbnail-uploads/',
            MaxKeys: 50
        };

        const command = new ListObjectsV2Command(params);
        const data = await s3Client.send(command);

        return data.Contents?.map(item => {
            const originalKey = item.Key?.replace('thumbnail-uploads/', '');

            return {
                thumbnailUrl: `https://${THUMBNAIL_BUCKET}.s3.amazonaws.com/${item.Key}`,
                originalUrl: `https://${ORIGINAL_BUCKET}.s3.amazonaws.com/${originalKey}`
            };
        }) || [];
    } catch (error) {
        console.error('Failed to list thumbnails', error);
        return [];
    }
};