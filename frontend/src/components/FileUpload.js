import React, { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { motion, AnimatePresence } from 'framer-motion';
import { Upload, File, X, CheckCircle, AlertCircle } from 'lucide-react';
import { Card, CardContent } from './ui/card';
import { Button } from './ui/button';
import { cn } from '../lib/utils';

const FileUpload = ({ 
  files = [], 
  onFileChange, 
  onUpload, 
  loading = false, 
  disabled = false,
  maxFiles = 5,
  maxSize = 10 * 1024 * 1024, // 10MB
  accept = { 'application/pdf': ['.pdf'] }
}) => {
  const [dragActive, setDragActive] = useState(false);
  const [uploadProgress, setUploadProgress] = useState({});

  const onDrop = useCallback((acceptedFiles, rejectedFiles) => {
    if (rejectedFiles.length > 0) {
      // Handle rejected files
      console.log('Rejected files:', rejectedFiles);
    }
    
    if (acceptedFiles.length > 0) {
      onFileChange(acceptedFiles);
    }
  }, [onFileChange]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept,
    maxFiles,
    maxSize,
    disabled: disabled || loading,
    onDragEnter: () => setDragActive(true),
    onDragLeave: () => setDragActive(false),
  });

  const removeFile = (index) => {
    const newFiles = files.filter((_, i) => i !== index);
    onFileChange(newFiles);
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="w-full space-y-4">
      {/* Upload Zone */}
      <Card variant="glass" className="overflow-hidden">
        <CardContent className="p-0">
          <div
            {...getRootProps()}
            className={cn(
              "relative p-8 text-center cursor-pointer transition-all duration-300",
              "border-2 border-dashed border-gray-300 hover:border-purple-400",
              "bg-gradient-to-br from-gray-50 to-white",
              isDragActive && "border-purple-500 bg-purple-50 scale-105",
              disabled && "cursor-not-allowed opacity-60"
            )}
          >
            <input {...getInputProps()} />
            
            <motion.div
              initial={{ scale: 1 }}
              animate={{ scale: isDragActive ? 1.1 : 1 }}
              transition={{ duration: 0.2 }}
              className="flex flex-col items-center space-y-4"
            >
              <div className={cn(
                "p-4 rounded-full transition-colors duration-300",
                isDragActive ? "bg-purple-200" : "bg-gray-100"
              )}>
                <Upload className={cn(
                  "w-8 h-8 transition-colors duration-300",
                  isDragActive ? "text-purple-600" : "text-gray-500"
                )} />
              </div>
              
              <div className="space-y-2">
                <h3 className="text-lg font-semibold text-gray-900">
                  {isDragActive ? "Drop your files here" : "Upload your documents"}
                </h3>
                <p className="text-sm text-gray-600">
                  Drag & drop files or click to browse
                </p>
                <p className="text-xs text-gray-500">
                  PDF files up to {formatFileSize(maxSize)} • Max {maxFiles} files
                </p>
              </div>
            </motion.div>

            {/* Progress Overlay */}
            <AnimatePresence>
              {loading && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="absolute inset-0 bg-white/80 backdrop-blur-sm flex items-center justify-center"
                >
                  <div className="text-center space-y-2">
                    <div className="w-8 h-8 border-3 border-purple-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
                    <p className="text-sm font-medium text-purple-600">Processing files...</p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </CardContent>
      </Card>

      {/* File List */}
      <AnimatePresence>
        {files.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-2"
          >
            <h4 className="text-sm font-medium text-gray-700 mb-3">
              Selected Files ({files.length})
            </h4>
            
            {files.map((file, index) => (
              <motion.div
                key={`${file.name}-${index}`}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className="bg-white border border-gray-200">
                  <CardContent className="p-4">
                    <div className="flex items-center space-x-3">
                      <div className="flex-shrink-0">
                        <File className="w-5 h-5 text-red-500" />
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">
                          {file.name}
                        </p>
                        <p className="text-xs text-gray-500">
                          {formatFileSize(file.size)}
                        </p>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <CheckCircle className="w-4 h-4 text-green-500" />
                        
                        {!loading && (
                          <button
                            onClick={() => removeFile(index)}
                            className="p-1 hover:bg-gray-100 rounded-full transition-colors"
                          >
                            <X className="w-4 h-4 text-gray-400 hover:text-red-500" />
                          </button>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Upload Button */}
      {files.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex justify-center"
        >
          <Button
            onClick={onUpload}
            disabled={!files.length || loading}
            loading={loading}
            size="lg"
            className="px-8"
          >
            {loading ? 'Processing Documents...' : `Upload ${files.length} File${files.length > 1 ? 's' : ''}`}
          </Button>
        </motion.div>
      )}
    </div>
  );
};

export default FileUpload;