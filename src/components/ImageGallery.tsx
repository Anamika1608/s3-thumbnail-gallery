import React, { useState, useEffect } from 'react';
import { uploadImageToS3 } from '../services/uploadImageToS3';
import { listThumbnails } from '../services/listThumbnails';
import { downloadImage } from '../services/downloadImage';

interface Thumbnail {
    thumbnailUrl: string;
    originalUrl?: string;
}

const ImageGallery: React.FC = () => {
    const [thumbnails, setThumbnails] = useState<Thumbnail[]>([]);
    const [isLoading, setIsLoading] = useState<boolean>(false);

    useEffect(() => {
        const fetchThumbnails = async () => {
            setIsLoading(true);
            try {
                const thumbnailList: Thumbnail[] = (await listThumbnails()) || [];
                setThumbnails(thumbnailList);
            } catch (error) {
                console.error('Failed to fetch thumbnails', error);
            }
            setIsLoading(false);
        };

        fetchThumbnails();
    }, []);

    const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        setIsLoading(true);
        try {
            const uploadResult: { thumbnailUrl: string; originalUrl: string } = await uploadImageToS3(file);

            setThumbnails(prev => [
                ...prev,
                { thumbnailUrl: uploadResult.thumbnailUrl, originalUrl: uploadResult.originalUrl }
            ]);
        } catch (error) {
            console.error('Upload failed', error);
        }
        setIsLoading(false);
    };

    return (
        <div className="container mx-auto p-4">
            {thumbnails.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-64 bg-gray-100 rounded-lg">
                    <p className="text-gray-500 mb-4">No images uploaded yet</p>
                    <input
                        type="file"
                        id="upload-input"
                        className="hidden"
                        onChange={handleFileUpload}
                        accept="image/*"
                    />
                    <label
                        htmlFor="upload-input"
                        className="bg-green-500 text-white px-6 py-3 rounded-lg shadow-md hover:bg-green-600 cursor-pointer"
                    >
                        Upload First Image
                    </label>
                </div>
            ) : (
                <>
                    <div className="grid grid-cols-3 gap-4 mb-6">
                        {thumbnails.map((thumb, index) => (
                            <div key={index} className="relative group">
                                <img
                                    src={thumb.thumbnailUrl}
                                    alt={`Thumbnail ${index}`}
                                    className="w-full h-48 object-cover rounded"
                                />
                                <button
                                    onClick={() => downloadImage(thumb.originalUrl as string)}
                                    className="absolute bottom-2 right-2 bg-blue-500 text-white p-2 rounded opacity-0 group-hover:opacity-100 transition-opacity"
                                >
                                    Download
                                </button>
                            </div>
                        ))}
                    </div>

                    <div className="flex justify-center">
                        <input
                            type="file"
                            id="upload-input"
                            className="hidden"
                            onChange={handleFileUpload}
                            accept="image/*"
                        />
                        <label
                            htmlFor="upload-input"
                            className="bg-green-500 text-white px-6 py-3 rounded-lg shadow-md hover:bg-green-600 cursor-pointer"
                        >
                            Upload More Images
                        </label>
                    </div>
                </>
            )}

            {isLoading && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                    <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-white"></div>
                </div>
            )}
        </div>
    );
};

export default ImageGallery;