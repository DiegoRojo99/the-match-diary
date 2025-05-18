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
      const reponse = await fetch('/api/photo/upload', {
        method: 'POST',
        body: formData,
      });
      if(!reponse.ok) {
        const error = await reponse.json();
        throw new Error(error.message);
      }
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
    <div className="m-4 flex flex-col items-center">
      <h2 className="text-lg font-semibold mb-2">Add a Photo</h2>
      <input
        type='file'
        accept='image/*'
        onChange={(e) => setFile(e.target.files?.[0] || null)}
        className="m-2 border border-gray-300 rounded p-2 flex flex-col items-center w-full"
        disabled={loading}
      />
      <button
        onClick={handleUpload}
        disabled={loading || !file}
        className="px-3 py-2 rounded bg-emerald-600 text-white hover:bg-emerald-700 
          disabled:opacity-50 cursor-pointer transition duration-200 ease-in-out w-full"
      >
        {loading ? 'Uploading...' : 'Upload Photo'}
      </button>
    </div>
  );
}
