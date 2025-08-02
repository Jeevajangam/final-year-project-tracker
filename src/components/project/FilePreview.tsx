
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Eye, Download, AlertCircle } from 'lucide-react';

interface FilePreviewProps {
  file: {
    name: string;
    url: string;
    type?: string;
    size?: number;
  };
}

const FilePreview: React.FC<FilePreviewProps> = ({ file }) => {
  const [previewUrl, setPreviewUrl] = useState('');
  const [previewError, setPreviewError] = useState(false);

  useEffect(() => {
    if (file.url) {
      setPreviewUrl(file.url);
    }
  }, [file]);

  const getFileExtension = (filename: string) => {
    return filename.split('.').pop()?.toLowerCase() || '';
  };

  const handleDownload = () => {
    const link = document.createElement('a');
    link.href = previewUrl;
    link.download = file.name;
    link.target = '_blank';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const renderPreview = () => {
    const extension = getFileExtension(file.name);
    
    if (previewError) {
      return (
        <div className="flex flex-col items-center justify-center h-64 bg-gray-100 rounded">
          <AlertCircle className="h-12 w-12 text-gray-400 mb-4" />
          <p className="text-gray-600 mb-4">Unable to preview this file</p>
          <Button onClick={handleDownload} size="sm">
            <Download className="h-4 w-4 mr-2" />
            Download File
          </Button>
        </div>
      );
    }
    
    switch (extension) {
      case 'pdf':
        return (
          <div className="w-full h-96 border rounded">
            <iframe
              src={`${previewUrl}#toolbar=0`}
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
            src={previewUrl}
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
              src={`https://docs.google.com/gview?url=${encodeURIComponent(previewUrl)}&embedded=true`}
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
              src={previewUrl}
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
            <Button onClick={handleDownload} size="sm">
              <Download className="h-4 w-4 mr-2" />
              Download File
            </Button>
          </div>
        );
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
            <Button onClick={handleDownload} size="sm" variant="outline">
              <Download className="h-4 w-4 mr-2" />
              Download
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

export default FilePreview;
