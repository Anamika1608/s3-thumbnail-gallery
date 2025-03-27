import React, { useState, useEffect } from 'react';
import uploadImageToS3 from '../services/uploadImageToS3';
import listThumbnails from '../services/listThumbnails';
import downloadImage from '../services/downloadImage';

const ImageGallery = () => {
    const [thumbnails, setThumbnails] = useState([]);
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        const fetchThumbnails = async () => {
            setIsLoading(true);
            try {
                const thumbnailList = await listThumbnails();
                setThumbnails(thumbnailList);
            } catch (error) {
                console.error('Failed to fetch thumbnails', error);
            }
            setIsLoading(false);
        };

        fetchThumbnails();
    }, []);

    const handleFileUpload = async (event) => {
        const file = event.target.files[0];
        if (!file) return;

        setIsLoading(true);
        try {
            const uploadResult = await uploadImageToS3(file);

            setThumbnails(prev => [
                ...prev,
                { url: uploadResult.thumbnailUrl, originalUrl: uploadResult.originalUrl }
            ]);
        } catch (error) {
            console.error('Upload failed', error);
        }
        setIsLoading(false);
    };

    return (
        <div className="container mx-auto p-4">
            <div className="grid grid-cols-3 gap-4">
                {thumbnails.map((thumb, index) => (
                    <div
                        key={index}
                        className="relative group"
                    >
                        <img
                            src={thumb.url}
                            alt={`Thumbnail ${index}`}
                            className="w-full h-48 object-cover rounded"
                        />
                        <button
                            onClick={() => downloadImage(thumb.originalUrl)}
                            className="absolute bottom-2 right-2 bg-blue-500 text-white p-2 rounded opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                            Download
                        </button>
                    </div>
                ))}
            </div>

            <div className="fixed bottom-4 right-4">
                <input
                    type="file"
                    id="upload-input"
                    className="hidden"
                    onChange={handleFileUpload}
                    accept="image/*"
                />
                <label
                    htmlFor="upload-input"
                    className="bg-green-500 text-white p-4 rounded-full shadow-lg cursor-pointer hover:bg-green-600"
                >
                    Upload Image
                </label>
            </div>

            {isLoading && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                    <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-white"></div>
                </div>
            )}
        </div>
    );
};

export default ImageGallery;