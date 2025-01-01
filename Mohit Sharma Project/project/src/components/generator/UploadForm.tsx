import React, { useState } from 'react';
import { processVideo } from '../../utils/videoProcessor';
import type { MovieData } from '../../types';

interface UploadFormProps {
  onProcessed: (data: MovieData) => void;
}

export default function UploadForm({ onProcessed }: UploadFormProps) {
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const videoFile = formData.get('video') as File;
    const metadata = {
      title: formData.get('title') as string,
      genre: formData.get('genre') as string,
      targetDuration: Number(formData.get('duration'))
    };

    setUploading(true);
    try {
      const processedData = await processVideo(videoFile, metadata, setProgress);
      onProcessed(processedData);
    } catch (error) {
      console.error('Processing failed:', error);
    } finally {
      setUploading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <label className="block text-sm font-medium text-gray-700">Movie Title</label>
        <input
          type="text"
          name="title"
          required
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">Genre</label>
        <select
          name="genre"
          required
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
        >
          <option value="action">Action</option>
          <option value="drama">Drama</option>
          <option value="comedy">Comedy</option>
          <option value="horror">Horror</option>
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">Target Duration (seconds)</label>
        <input
          type="number"
          name="duration"
          min="30"
          max="180"
          defaultValue="120"
          required
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">Movie File</label>
        <input
          type="file"
          name="video"
          accept="video/*"
          required
          className="mt-1 block w-full"
        />
      </div>

      {uploading ? (
        <div>
          <div className="h-2 bg-gray-200 rounded">
            <div
              className="h-full bg-blue-600 rounded transition-all duration-300"
              style={{ width: `${progress}%` }}
            ></div>
          </div>
          <p className="text-sm text-gray-600 mt-2">Processing: {progress}%</p>
        </div>
      ) : (
        <button
          type="submit"
          className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors"
        >
          Generate Trailer
        </button>
      )}
    </form>
  );
}