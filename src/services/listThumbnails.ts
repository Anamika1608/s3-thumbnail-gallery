import { s3, THUMBNAIL_BUCKET, ORIGINAL_BUCKET } from '../config/awsConfig';

export const listThumbnails = async () => {
    try {
        const params = {
            Bucket: THUMBNAIL_BUCKET,
            Prefix: 'thumbnail-uploads/',
            MaxKeys: 50
        };

        const data = await s3.listObjectsV2(params).promise();

        return data.Contents?.map(item => {
            const originalKey = item.Key?.replace('thumbnail-uploads/', '').replace('thumbnail-', '');

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