import React, { useCallback, useRef } from 'react';
import { motion } from 'framer-motion';
import { Upload, FileText, X } from 'lucide-react';
import Button from './Button';
import Card from './Card';

const FileUpload = ({ files, onFileChange, onUpload, loading }) => {
  const fileInputRef = useRef(null);

  const handleDragOver = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleDragEnter = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleDragLeave = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    const droppedFiles = Array.from(e.dataTransfer.files);
    const pdfFiles = droppedFiles.filter(file => file.type === 'application/pdf');
    
    if (pdfFiles.length > 0) {
      onFileChange({ target: { files: pdfFiles } });
    }
  }, [onFileChange]);

  const handleFileSelect = (e) => {
    onFileChange(e);
  };

  const handleContainerClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const removeFile = (index) => {
    const newFiles = Array.from(files);
    newFiles.splice(index, 1);
    onFileChange({ target: { files: newFiles } });
  };

  return (
    <Card className="w-full max-w-2xl">
      <div className="text-center space-y-6">
        <div className="flex items-center justify-center space-x-2">
          <Upload className="w-6 h-6 text-purple-500" />
          <h3 className="text-xl font-bold text-gray-900 dark:text-white">
            Upload Documents
          </h3>
        </div>

        <motion.div
          onDragOver={handleDragOver}
          onDragEnter={handleDragEnter}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={handleContainerClick}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="file-upload-zone relative border-2 border-dashed border-purple-300 dark:border-purple-600 rounded-xl p-8 bg-purple-50/50 dark:bg-purple-900/20 transition-all duration-200 cursor-pointer hover:border-purple-500 hover:bg-purple-100/50 dark:hover:bg-purple-800/30 select-none"
        >
          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept=".pdf"
            onChange={handleFileSelect}
            className="hidden"
          />
          
          <div className="space-y-4">
            <motion.div
              animate={{ y: [0, -10, 0] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="flex justify-center"
            >
              <div className="p-4 bg-purple-500 rounded-full">
                <Upload className="w-8 h-8 text-white" />
              </div>
            </motion.div>
            
            <div className="pointer-events-none">
              <p className="text-lg font-bold text-gray-900 dark:text-white">
                Drop PDF files here or click to browse
              </p>
              <p className="text-sm text-gray-700 dark:text-gray-400 mt-1 font-medium">
                Supports multiple PDF documents
              </p>
            </div>
          </div>
        </motion.div>

        {files.length > 0 && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            className="space-y-3"
          >
            <h4 className="text-sm font-bold text-gray-800 dark:text-gray-300 text-left">
              Selected Files ({files.length})
            </h4>
            <div className="space-y-2 max-h-32 overflow-y-auto custom-scrollbar">
              {Array.from(files).map((file, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="flex items-center justify-between p-3 bg-white/20 dark:bg-gray-800/50 rounded-lg"
                >
                  <div className="flex items-center space-x-3">
                    <FileText className="w-4 h-4 text-purple-500" />
                    <span className="text-sm text-gray-800 dark:text-gray-300 truncate font-medium">
                      {file.name}
                    </span>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      removeFile(index);
                    }}
                    className="p-1 text-gray-400 hover:text-red-500 transition-colors focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-opacity-50 rounded"
                    aria-label="Remove file"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}

        <Button
          onClick={onUpload}
          disabled={!files.length || loading}
          loading={loading}
          size="lg"
          className="w-full"
        >
          {loading ? 'Processing Documents...' : `Upload ${files.length} Document${files.length !== 1 ? 's' : ''}`}
        </Button>
      </div>
    </Card>
  );
};

export default FileUpload;