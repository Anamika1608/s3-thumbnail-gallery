import { S3Client, GetObjectCommand, PutObjectCommand } from '@aws-sdk/client-s3';
import { Readable } from 'stream';
import sharp from 'sharp';

const s3 = new S3Client({ region: process.env.AWS_REGION || 'us-east-1' });

export const handler = async (event, context) => {
    console.log("Event received:", JSON.stringify(event, null, 2));

    try {
        // Extract source bucket and key
        const srcBucket = event.Records[0].s3.bucket.name;
        const srcKey = decodeURIComponent(
            event.Records[0].s3.object.key.replace(/\+/g, " ")
        );

        // Define thumbnail bucket and key
        const dstBucket = `${srcBucket}-thumbnails`;
        const dstKey = `thumbnail-${srcKey}`;

        // Determine image type
        const typeMatch = srcKey.match(/\.([^.]*)$/);
        if (!typeMatch) {
            console.log("Could not determine the image type.");
            return;
        }

        // Validate image type
        const imageType = typeMatch[1].toLowerCase();
        const supportedTypes = ['jpg', 'jpeg', 'png', 'webp'];
        if (!supportedTypes.includes(imageType)) {
            console.log(`Unsupported image type: ${imageType}`);
            return;
        }

        // Fetch the original image from S3
        const getObjectParams = {
            Bucket: srcBucket,
            Key: srcKey
        };
        const { Body: imageStream } = await s3.send(new GetObjectCommand(getObjectParams));

        // Convert stream to buffer
        let imageBuffer;
        if (imageStream instanceof Readable) {
            imageBuffer = Buffer.concat(await imageStream.toArray());
        } else {
            throw new Error('Unknown object stream type');
        }

        // Resize image using Sharp
        const thumbnailBuffer = await sharp(imageBuffer)
            .resize({
                width: 250,
                height: 250,
                fit: 'cover'
            })
            .toBuffer();

        // Upload thumbnail to destination bucket
        const uploadParams = {
            Bucket: dstBucket,
            Key: dstKey,
            Body: thumbnailBuffer,
            ContentType: `image/${imageType}`,
            ACL: 'public-read'
        };

        await s3.send(new PutObjectCommand(uploadParams));

        console.log(`Successfully created thumbnail: ${dstBucket}/${dstKey}`);
        return {
            statusCode: 200,
            body: JSON.stringify({
                message: 'Thumbnail generated successfully',
                originalImage: `${srcBucket}/${srcKey}`,
                thumbnail: `${dstBucket}/${dstKey}`
            })
        };

    } catch (error) {
        console.error('Thumbnail generation error:', error);
        return {
            statusCode: 500,
            body: JSON.stringify({
                message: 'Failed to generate thumbnail',
                error: error.message
            })
        };
    }
};