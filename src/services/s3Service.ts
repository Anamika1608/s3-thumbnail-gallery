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

export const listThumbnails = async () => {
    try {
        const params = {
            Bucket: THUMBNAIL_BUCKET,
            Prefix: 'thumbnail-uploads/',
            MaxKeys: 50
        };

        const data = await s3.listObjectsV2(params).promise();

        return data.Contents?.map(item => ({
            key: item.Key,
            url: `https://${THUMBNAIL_BUCKET}.s3.amazonaws.com/${item.Key}`
        }));
    } catch (error) {
        console.error('Failed to list thumbnails', error);
        return [];
    }
};

export const downloadImage = async (imageUrl: string) => {
    try {
        const response = await fetch(imageUrl);
        const blob = await response.blob();
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = 'downloaded-image.jpg';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    } catch (error) {
        console.error('Download failed', error);
    }
};