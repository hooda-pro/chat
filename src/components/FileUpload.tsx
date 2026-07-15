"use client";

import { useState, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Upload,
  File,
  Image,
  X,
  AlertCircle,
  Check,
  FileText,
  FileSpreadsheet,
  FileCode,
  Archive,
} from "lucide-react";
import { cn, isAllowedFileType, isImageFile, formatFileSize, MAX_FILE_SIZE } from "@/lib/utils";

interface FileUploadProps {
  onFilesSelected: (files: File[]) => void;
  isOpen: boolean;
  onClose: () => void;
}

const ALLOWED_EXTENSIONS = [
  "PDF", "DOC", "DOCX", "TXT", "XLS", "XLSX",
  "CSV", "JSON", "ZIP", "PNG", "JPG", "JPEG", "WebP", "GIF",
];

export default function FileUpload({
  onFilesSelected,
  isOpen,
  onClose,
}: FileUploadProps) {
  const [dragOver, setDragOver] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);

  const validateFiles = useCallback((files: FileList | File[]): File[] => {
    const valid: File[] = [];
    const invalid: string[] = [];

    Array.from(files).forEach((file) => {
      if (!isAllowedFileType(file)) {
        invalid.push(`${file.name}: نوع الملف غير مدعوم`);
      } else if (file.size > MAX_FILE_SIZE) {
        invalid.push(`${file.name}: حجم الملف يتجاوز ${MAX_FILE_SIZE / 1024 / 1024}MB`);
      } else {
        valid.push(file);
      }
    });

    if (invalid.length > 0) {
      setError(invalid.join("\n"));
    } else {
      setError(null);
    }

    return valid;
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setDragOver(false);
      const valid = validateFiles(e.dataTransfer.files);
      setSelectedFiles((prev) => [...prev, ...valid]);
    },
    [validateFiles]
  );

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = () => setDragOver(false);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const valid = validateFiles(e.target.files);
      setSelectedFiles((prev) => [...prev, ...valid]);
    }
  };

  const removeFile = (index: number) => {
    setSelectedFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const handleUpload = () => {
    if (selectedFiles.length > 0) {
      onFilesSelected(selectedFiles);
      setSelectedFiles([]);
      setError(null);
      onClose();
    }
  };

  const getFileIcon = (file: File) => {
    if (isImageFile(file)) return Image;
    const type = file.type;
    if (type.includes("pdf") || type.includes("word") || type.includes("doc")) return FileText;
    if (type.includes("excel") || type.includes("sheet") || type.includes("xls") || type.includes("csv")) return FileSpreadsheet;
    if (type.includes("json")) return FileCode;
    if (type.includes("zip") || type.includes("rar")) return Archive;
    return File;
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
            onClick={onClose}
          />

          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-full max-w-lg mx-4"
            dir="rtl"
          >
            <div className="glass rounded-2xl p-6 border border-surface-700/30 shadow-2xl">
              {/* Header */}
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-semibold text-surface-100">
                  رفع الملفات
                </h2>
                <button
                  onClick={onClose}
                  className="p-1.5 rounded-lg hover:bg-surface-800 text-surface-400 hover:text-surface-200 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Drop zone */}
              <div
                onDrop={handleDrop}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                className={cn(
                  "border-2 border-dashed rounded-xl p-8 text-center transition-all duration-300",
                  dragOver
                    ? "border-primary-500 bg-primary-500/5"
                    : "border-surface-700/50 hover:border-surface-600"
                )}
              >
                <Upload className="w-10 h-10 mx-auto mb-3 text-surface-400" />
                <p className="text-surface-300 mb-1">
                  اسحب وأفلت الملفات هنا
                </p>
                <p className="text-surface-500 text-sm mb-4">أو</p>
                <div className="flex justify-center gap-3">
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="px-4 py-2 bg-surface-800 hover:bg-surface-700 text-surface-200 rounded-lg text-sm transition-colors flex items-center gap-2"
                  >
                    <File className="w-4 h-4" />
                    ملفات
                  </button>
                  <button
                    onClick={() => imageInputRef.current?.click()}
                    className="px-4 py-2 bg-surface-800 hover:bg-surface-700 text-surface-200 rounded-lg text-sm transition-colors flex items-center gap-2"
                  >
                    <Image className="w-4 h-4" />
                    صور
                  </button>
                </div>

                <input
                  ref={fileInputRef}
                  type="file"
                  multiple
                  onChange={handleFileSelect}
                  className="hidden"
                  accept=".pdf,.doc,.docx,.txt,.xls,.xlsx,.csv,.json,.zip"
                />
                <input
                  ref={imageInputRef}
                  type="file"
                  multiple
                  onChange={handleFileSelect}
                  className="hidden"
                  accept="image/png,image/jpeg,image/webp,image/gif"
                />
              </div>

              {/* Allowed types */}
              <div className="flex flex-wrap gap-1.5 mt-3">
                {ALLOWED_EXTENSIONS.map((ext) => (
                  <span
                    key={ext}
                    className="px-2 py-0.5 bg-surface-800/50 text-surface-400 text-xs rounded-md border border-surface-700/30"
                  >
                    {ext}
                  </span>
                ))}
              </div>

              {/* Error */}
              {error && (
                <div className="mt-3 p-3 bg-red-500/10 border border-red-500/20 rounded-xl flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                  <p className="text-red-400 text-sm whitespace-pre-line">{error}</p>
                </div>
              )}

              {/* Selected files */}
              {selectedFiles.length > 0 && (
                <div className="mt-4 space-y-2 max-h-[200px] overflow-y-auto">
                  {selectedFiles.map((file, i) => {
                    const Icon = getFileIcon(file);
                    return (
                      <div
                        key={i}
                        className="flex items-center gap-3 px-3 py-2 bg-surface-800/50 rounded-xl border border-surface-700/30"
                      >
                        <Icon className="w-4 h-4 text-surface-400 shrink-0" />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm text-surface-200 truncate">
                            {file.name}
                          </p>
                          <p className="text-xs text-surface-500">
                            {formatFileSize(file.size)}
                          </p>
                        </div>
                        <button
                          onClick={() => removeFile(i)}
                          className="p-1 hover:bg-surface-700 rounded-lg text-surface-500 hover:text-red-400 transition-colors"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Actions */}
              <div className="flex gap-3 mt-6">
                <button
                  onClick={onClose}
                  className="flex-1 px-4 py-2.5 bg-surface-800 hover:bg-surface-700 text-surface-300 rounded-xl transition-colors"
                >
                  إلغاء
                </button>
                <button
                  onClick={handleUpload}
                  disabled={selectedFiles.length === 0}
                  className="flex-1 px-4 py-2.5 bg-gradient-to-l from-primary-600 to-purple-600 hover:from-primary-500 hover:to-purple-500 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-xl font-medium transition-all duration-300 flex items-center justify-center gap-2"
                >
                  <Upload className="w-4 h-4" />
                  <span>رفع {selectedFiles.length > 0 ? `(${selectedFiles.length})` : ""}</span>
                </button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
