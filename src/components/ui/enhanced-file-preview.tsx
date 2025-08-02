
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Eye, Download, AlertCircle, RefreshCw } from 'lucide-react';
import { ErrorHandler } from '@/utils/errorHandler';

interface EnhancedFilePreviewProps {
  file: {
    name: string;
    url: string;
    type?: string;
    size?: number;
    path?: string;
  };
}

const EnhancedFilePreview: React.FC<EnhancedFilePreviewProps> = ({ file }) => {
  const [previewError, setPreviewError] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const getFileExtension = (filename: string) => {
    return filename.split('.').pop()?.toLowerCase() || '';
  };

  const handleDownload = async () => {
    try {
      setIsLoading(true);
      
      const response = await fetch(file.url);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = file.name;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      
      ErrorHandler.handleSuccess(`Downloaded ${file.name} successfully`);
    } catch (error) {
      ErrorHandler.handleError(error, 'File download');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRetryPreview = () => {
    setPreviewError(false);
  };

  const renderPreview = () => {
    const extension = getFileExtension(file.name);
    
    if (previewError) {
      return (
        <div className="flex flex-col items-center justify-center h-64 bg-gray-100 rounded">
          <AlertCircle className="h-12 w-12 text-gray-400 mb-4" />
          <p className="text-gray-600 mb-4">Unable to preview this file</p>
          <div className="flex space-x-2">
            <Button onClick={handleRetryPreview} size="sm" variant="outline">
              <RefreshCw className="h-4 w-4 mr-2" />
              Retry Preview
            </Button>
            <Button onClick={handleDownload} size="sm" disabled={isLoading}>
              <Download className="h-4 w-4 mr-2" />
              {isLoading ? 'Downloading...' : 'Download File'}
            </Button>
          </div>
        </div>
      );
    }
    
    try {
      switch (extension) {
        case 'pdf':
          return (
            <div className="w-full h-96 border rounded">
              <iframe
                src={`${file.url}#toolbar=0`}
                width="100%"
                height="100%"
                title={file.name}
                className="rounded"
                onError={() => setPreviewError(true)}
              />
            </div>
          );
        
        case 'jpg':
        case 'jpeg':
        case 'png':
        case 'gif':
          return (
            <img
              src={file.url}
              alt={file.name}
              className="max-w-full h-auto max-h-96 object-contain rounded"
              onError={() => setPreviewError(true)}
            />
          );
        
        case 'doc':
        case 'docx':
        case 'ppt':
        case 'pptx':
        case 'xls':
        case 'xlsx':
          return (
            <div className="w-full h-96 border rounded">
              <iframe
                src={`https://docs.google.com/gview?url=${encodeURIComponent(file.url)}&embedded=true`}
                width="100%"
                height="100%"
                title={file.name}
                className="rounded"
                onError={() => setPreviewError(true)}
              />
            </div>
          );
        
        case 'txt':
          return (
            <div className="w-full h-96 border rounded p-4 bg-white overflow-auto">
              <iframe
                src={file.url}
                width="100%"
                height="100%"
                title={file.name}
                className="border-0"
                onError={() => setPreviewError(true)}
              />
            </div>
          );
        
        default:
          return (
            <div className="flex flex-col items-center justify-center h-64 bg-gray-100 rounded">
              <p className="text-gray-600 mb-4">Preview not available for this file type</p>
              <Button onClick={handleDownload} size="sm" disabled={isLoading}>
                <Download className="h-4 w-4 mr-2" />
                {isLoading ? 'Downloading...' : 'Download File'}
              </Button>
            </div>
          );
      }
    } catch (error) {
      console.error('Preview render error:', error);
      setPreviewError(true);
      return null;
    }
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button size="sm" variant="outline" className="flex items-center space-x-1">
          <Eye className="h-4 w-4" />
          <span>Preview</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <span>{file.name}</span>
            <Button onClick={handleDownload} size="sm" variant="outline" disabled={isLoading}>
              <Download className="h-4 w-4 mr-2" />
              {isLoading ? 'Downloading...' : 'Download'}
            </Button>
          </DialogTitle>
        </DialogHeader>
        <div className="mt-4">
          {renderPreview()}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default EnhancedFilePreview;
