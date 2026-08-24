import React, { useState, useCallback, FC } from 'react';
import { extractInfoFromDocument } from '../services/geminiService';
import { ExtractedDocumentInfo, Language } from '../types';
import { translations } from '../constants';
import { UploadIcon, CloseIcon, SparklesIcon, CheckCircleIcon, BotIcon } from './Icons';

interface DocumentUploadProps {
  onDocumentProcessed: (info: ExtractedDocumentInfo) => void;
  lang: Language;
  isOpen: boolean;
  onClose: () => void;
}

const Spinner: FC = () => (
  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
);

export const DocumentUpload: FC<DocumentUploadProps> = ({ onDocumentProcessed, lang, isOpen, onClose }) => {
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
    onClose();
    setFile(null);
    setPreview(null);
    setIsProcessing(false);
    setError(null);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-md flex items-center justify-center z-50 p-4 transition-all">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-indigo-500/30 rounded-3xl shadow-2xl max-w-lg w-full overflow-hidden transform transition-all scale-100">
        {/* Header */}
        <div className="p-6 border-b border-slate-100 dark:border-slate-800 bg-gradient-to-r from-indigo-900/40 via-purple-900/30 to-slate-900 flex items-center justify-between">
          <div className="flex items-center space-x-3 rtl:space-x-reverse">
            <div className="p-2.5 rounded-2xl bg-indigo-600/20 border border-indigo-500/30 text-indigo-400">
              <SparklesIcon className="h-6 w-6" />
            </div>
            <div>
              <h2 className="text-xl font-extrabold text-slate-900 dark:text-white">{t.uploadDocument}</h2>
              <p className="text-xs text-indigo-300 font-medium">Google Gemini AI OCR Processing</p>
            </div>
          </div>
          <button
            onClick={closeModal}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <CloseIcon className="h-5 w-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-4">
          <div
            className="relative border-2 border-dashed border-slate-300 dark:border-indigo-500/40 hover:border-indigo-500 rounded-2xl p-6 text-center cursor-pointer bg-slate-50 dark:bg-slate-800/40 transition-all overflow-hidden group"
            onDrop={onDrop}
            onDragOver={onDragOver}
            onClick={() => document.getElementById('fileInputModal')?.click()}
          >
            <input
              type="file"
              id="fileInputModal"
              className="hidden"
              onChange={(e) => handleFileChange(e.target.files ? e.target.files[0] : null)}
              accept="image/jpeg, image/png, image/webp"
            />

            {preview ? (
              <div className="relative inline-block">
                <img src={preview} alt="Document Preview" className="max-h-52 mx-auto rounded-xl shadow-md border border-slate-200 dark:border-slate-700" />
                {isProcessing && <div className="laser-line"></div>}
              </div>
            ) : (
              <div className="space-y-3 py-4">
                <div className="w-16 h-16 mx-auto rounded-2xl bg-indigo-500/10 flex items-center justify-center text-indigo-500 group-hover:scale-110 transition-transform">
                  <UploadIcon className="h-8 w-8" />
                </div>
                <div className="text-slate-600 dark:text-slate-300">
                  <p className="font-bold text-sm">{t.dropFileHere}</p>
                  <p className="text-xs text-slate-400 mt-1">Soporta Visa, Emirates ID, Permiso KHDA, Aptitud Médica (JPEG, PNG, WEBP)</p>
                </div>
              </div>
            )}
          </div>

          {error && (
            <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-500 text-xs font-semibold flex items-center gap-2">
              <BotIcon className="w-4 h-4 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Modal Actions */}
          <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex justify-end space-x-3 rtl:space-x-reverse">
            <button
              onClick={closeModal}
              className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-xl text-sm font-semibold transition-colors"
              disabled={isProcessing}
            >
              {t.cancel}
            </button>
            <button
              onClick={handleProcessDocument}
              className="px-5 py-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white rounded-xl text-sm font-bold shadow-lg shadow-indigo-500/25 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 min-w-[160px] transition-all"
              disabled={!file || isProcessing}
            >
              {isProcessing ? (
                <>
                  <Spinner />
                  <span>{t.processingDocument}</span>
                </>
              ) : (
                <>
                  <SparklesIcon className="w-4 h-4" />
                  <span>{t.uploadAndProcess}</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
