'use client';

import { FC, useRef } from 'react';

interface FileUploadZoneProps {
  onFilesSelected: (files: File[]) => void;
}

const FileUploadZone: FC<FileUploadZoneProps> = ({ onFilesSelected }) => {
  const inputRef = useRef<HTMLInputElement>(null);

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const files = Array.from(e.dataTransfer.files).filter((f) => f.type === 'application/pdf');
    if (files.length > 0) onFilesSelected(files as File[]);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length > 0) onFilesSelected(files as File[]);
  };

  return (
    <div
      onDrop={handleDrop}
      onDragOver={(e) => e.preventDefault()}
      className="border-2 border-dashed border-indigo-300 rounded-lg p-8 text-center cursor-pointer hover:bg-indigo-50 transition"
      onClick={() => inputRef.current?.click()}
    >
      <input
        ref={inputRef}
        type="file"
        accept=".pdf"
        multiple
        onChange={handleFileChange}
        className="hidden"
      />
      <div className="text-4xl mb-2">📁</div>
      <p className="font-semibold text-gray-700">Drag & drop PDF files here</p>
      <p className="text-sm text-gray-500">or click to browse</p>
    </div>
  );
};

export default FileUploadZone;
