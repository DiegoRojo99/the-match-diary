'use client';

import { useState } from 'react';

export default function AddPhotoForm({ visitId }: { visitId: string }) {
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);

  const handleUpload = async () => {
    if (!file) return;
    setLoading(true);
    const formData = new FormData();
    formData.append('photo', file);
    formData.append('visitId', visitId);

    try {
      await fetch('/api/photo/upload', {
        method: 'POST',
        body: formData,
      });
      window.location.reload();
    } 
    catch (err) {
      console.error('Upload error:', err);
    } 
    finally {
      setLoading(false);
    }
  };

  return (
    <div className="mt-4 flex flex-col items-center">
      <h2 className="text-lg font-semibold mb-2">Add a Photo</h2>
      <div className="flex items-center justify-center w-[400px] mb-4">
          <label className="flex flex-col items-center justify-center w-full h-64 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 dark:hover:bg-gray-800 dark:bg-gray-700 hover:bg-gray-100 dark:border-gray-600 dark:hover:border-gray-500 dark:hover:bg-gray-600">
              <div className="flex flex-col items-center justify-center pt-5 pb-6">
                  <svg className="w-8 h-8 mb-4 text-gray-500 dark:text-gray-400" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 20 16">
                      <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 13h3a3 3 0 0 0 0-6h-.025A5.56 5.56 0 0 0 16 6.5 5.5 5.5 0 0 0 5.207 5.021C5.137 5.017 5.071 5 5 5a4 4 0 0 0 0 8h2.167M10 15V6m0 0L8 8m2-2 2 2"/>
                  </svg>
                  <p className="mb-2 text-sm text-gray-500 dark:text-gray-400"><span className="font-semibold">Click to upload</span> or drag and drop</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">SVG, PNG, JPG or GIF (MAX. 800x400px)</p>
              </div>
              <input 
                id="dropzone-file" 
                type="file" 
                className="hidden"
                onChange={(e) => setFile(e.target.files?.[0] || null)}
                accept="image/*"
                disabled={loading}
              />
          </label>
      </div> 
      <button
        onClick={handleUpload}
        disabled={loading || !file}
        className="ml-2 px-3 py-1 rounded bg-emerald-600 text-white hover:bg-emerald-700 disabled:opacity-50"
      >
        {loading ? 'Uploading...' : 'Upload Photo'}
      </button>
    </div>
  );
}
