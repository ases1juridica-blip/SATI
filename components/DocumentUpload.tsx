
import React, { useState, useCallback, FC } from 'react';
import { extractInfoFromDocument } from '../services/geminiService';
import { ExtractedDocumentInfo, Language } from '../types';
import { translations } from '../constants';
import { UploadIcon } from './Icons';

interface DocumentUploadProps {
  onDocumentProcessed: (info: ExtractedDocumentInfo) => void;
  lang: Language;
}

const Spinner: FC = () => (
  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
);

export const DocumentUpload: FC<DocumentUploadProps> = ({ onDocumentProcessed, lang }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const t = translations[lang];

  const handleFileChange = (selectedFile: File | null) => {
    if (selectedFile) {
      if (!['image/jpeg', 'image/png', 'image/webp'].includes(selectedFile.type)) {
          setError(t.errorUnsupportedFormat);
          return;
      }
      setFile(selectedFile);
      setError(null);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result as string);
      };
      reader.readAsDataURL(selectedFile);
    }
  };

  const onDrop = useCallback((event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.stopPropagation();
    if (event.dataTransfer.files && event.dataTransfer.files.length > 0) {
      handleFileChange(event.dataTransfer.files[0]);
      event.dataTransfer.clearData();
    }
  }, []);

  const onDragOver = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.stopPropagation();
  };

  const handleProcessDocument = async () => {
    if (!file) return;

    setIsProcessing(true);
    setError(null);
    try {
      const info = await extractInfoFromDocument(file);
      if (info) {
        onDocumentProcessed(info);
        closeModal();
      } else {
        setError(t.errorParsing);
      }
    } catch (err) {
      setError(t.errorProcessing);
    } finally {
      setIsProcessing(false);
    }
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setFile(null);
    setPreview(null);
    setIsProcessing(false);
    setError(null);
  };

  return (
    <div>
      <button
        onClick={() => setIsModalOpen(true)}
        className="fixed bottom-6 right-6 rtl:left-6 rtl:right-auto bg-blue-600 text-white rounded-full p-4 shadow-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 transition-transform transform hover:scale-105 z-40"
        aria-label={t.uploadDocument}
      >
        <UploadIcon className="h-8 w-8" />
      </button>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-2xl max-w-lg w-full transform transition-all duration-300 scale-100 opacity-100">
            <div className="p-6">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">{t.uploadDocument}</h2>
              
              <div 
                className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-6 text-center cursor-pointer hover:border-blue-500 dark:hover:border-blue-400 transition-colors"
                onDrop={onDrop}
                onDragOver={onDragOver}
                onClick={() => document.getElementById('fileInput')?.click()}
              >
                <input
                  type="file"
                  id="fileInput"
                  className="hidden"
                  onChange={(e) => handleFileChange(e.target.files ? e.target.files[0] : null)}
                  accept="image/jpeg, image/png, image/webp"
                />
                {preview ? (
                  <img src={preview} alt="Document Preview" className="max-h-48 mx-auto rounded-md" />
                ) : (
                  <div className="text-gray-500 dark:text-gray-400">
                    <UploadIcon className="h-12 w-12 mx-auto mb-2 text-gray-400 dark:text-gray-500"/>
                    <p>{t.dropFileHere}</p>
                  </div>
                )}
              </div>

              {error && <p className="text-red-500 mt-3 text-sm">{error}</p>}

              <div className="mt-6 flex justify-end space-x-3">
                <button
                  onClick={closeModal}
                  className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600"
                  disabled={isProcessing}
                >
                  Cancel
                </button>
                <button
                  onClick={handleProcessDocument}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-blue-400 disabled:cursor-not-allowed flex items-center justify-center min-w-[150px]"
                  disabled={!file || isProcessing}
                >
                  {isProcessing ? <Spinner /> : t.uploadAndProcess}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
