
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Upload, Download, Clock, CheckCircle, AlertCircle } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { formatDateForDisplay } from '@/utils/dateUtils';
import { downloadFile } from '@/utils/fileDownload';

interface ProjectSectionProps {
  sectionType: string;
  title: string;
  description: string;
  dueDate?: string;
  content?: any;
  files?: any[];
  status?: string;
  score?: number;
  feedback?: string;
  onUpdate: (sectionType: string, content: any, files: File[]) => void;
  onComplete?: (sectionType: string) => void;
  canEdit: boolean;
  isGuide?: boolean;
}

const ProjectSection: React.FC<ProjectSectionProps> = ({
  sectionType,
  title,
  description,
  dueDate,
  content,
  files = [],
  status = 'pending',
  score,
  feedback,
  onUpdate,
  onComplete,
  canEdit,
  isGuide = false
}) => {
  const [localContent, setLocalContent] = useState(content || {});
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [textContent, setTextContent] = useState(content?.text || '');

  // Reset local state when content changes
  useEffect(() => {
    setLocalContent(content || {});
    setTextContent(content?.text || '');
  }, [content]);

  const isDueDatePassed = dueDate && new Date(dueDate) < new Date();
  const hasContent = textContent.trim() !== '' || files.length > 0 || selectedFiles.length > 0;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setSelectedFiles(Array.from(e.target.files));
    }
  };

  const handleUpdate = () => {
    if (!hasContent) {
      toast({
        title: "Error",
        description: "Please add some content or files before updating",
        variant: "destructive"
      });
      return;
    }

    const updatedContent = {
      ...localContent,
      text: textContent
    };

    onUpdate(sectionType, updatedContent, selectedFiles);
    setSelectedFiles([]);
  };

  const handleDiscard = () => {
    // Reset to original state
    setTextContent(content?.text || '');
    setSelectedFiles([]);
    setLocalContent(content || {});
    
    // Clear file input
    const fileInput = document.getElementById(`files-${sectionType}`) as HTMLInputElement;
    if (fileInput) {
      fileInput.value = '';
    }
    
    toast({
      title: "Changes Discarded",
      description: "All unsaved changes have been discarded"
    });
  };

  const handleComplete = () => {
    if (onComplete) {
      onComplete(sectionType);
    }
  };

  const handleFileDownload = (file: any, index: number) => {
    if (file.url) {
      const fileName = file.name || `file_${index + 1}`;
      downloadFile(file.url, fileName);
    }
  };

  const getStatusBadge = () => {
    switch (status) {
      case 'submitted':
        return <Badge className="bg-blue-500">Submitted</Badge>;
      case 'completed':
        return <Badge className="bg-green-500">Completed</Badge>;
      case 'overdue':
        return <Badge className="bg-red-500">Overdue</Badge>;
      default:
        return <Badge variant="outline">Pending</Badge>;
    }
  };

  const hasChanges = textContent !== (content?.text || '') || selectedFiles.length > 0;

  return (
    <Card className="mb-4">
      <CardHeader>
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-lg">{title}</CardTitle>
            <CardDescription>{description}</CardDescription>
          </div>
          <div className="flex items-center space-x-2">
            {getStatusBadge()}
            {score && (
              <Badge variant="secondary">Score: {score}/10</Badge>
            )}
          </div>
        </div>
        {dueDate && (
          <div className="flex items-center space-x-2 text-sm bg-gray-50 p-3 rounded-lg border">
            <Clock className="h-4 w-4" />
            <span className={isDueDatePassed ? "text-red-500 font-medium" : "text-gray-700"}>
              Due: {formatDateForDisplay(dueDate)}
            </span>
            {isDueDatePassed && <AlertCircle className="h-4 w-4 text-red-500" />}
          </div>
        )}
      </CardHeader>
      <CardContent className="space-y-4">
        {canEdit && !isDueDatePassed && !isGuide && (
          <>
            <div>
              <Label htmlFor={`content-${sectionType}`}>Content</Label>
              <Textarea
                id={`content-${sectionType}`}
                value={textContent}
                onChange={(e) => setTextContent(e.target.value)}
                placeholder={`Enter ${title.toLowerCase()} details...`}
                className="mt-1"
                rows={4}
              />
            </div>
            
            <div>
              <Label htmlFor={`files-${sectionType}`}>Files</Label>
              <Input
                id={`files-${sectionType}`}
                type="file"
                multiple
                onChange={handleFileChange}
                className="mt-1"
              />
              {selectedFiles.length > 0 && (
                <div className="mt-2">
                  <p className="text-sm text-gray-600">
                    Selected: {selectedFiles.map(f => f.name).join(', ')}
                  </p>
                </div>
              )}
            </div>

            <div className="flex space-x-2">
              <Button 
                onClick={handleUpdate}
                disabled={!hasContent}
                className="flex items-center space-x-2"
              >
                <Upload className="h-4 w-4" />
                <span>Update</span>
              </Button>
              <Button 
                variant="outline"
                onClick={handleDiscard}
                disabled={!hasChanges}
              >
                Discard
              </Button>
            </div>
          </>
        )}

        {(!canEdit || isDueDatePassed || isGuide) && (
          <div className="bg-gray-50 p-4 rounded-lg">
            <p className="text-sm text-gray-600">
              {isDueDatePassed ? "Due date has passed - no further edits allowed" : 
               isGuide ? "Guide view - read only" : "Read-only mode"}
            </p>
            {textContent && (
              <div className="mt-2">
                <strong>Content:</strong>
                <p className="mt-1 whitespace-pre-wrap">{textContent}</p>
              </div>
            )}
          </div>
        )}

        {files.length > 0 && (
          <div>
            <Label>Uploaded Files</Label>
            <div className="mt-2 space-y-2">
              {files.map((file: any, index: number) => (
                <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                  <span className="text-sm">{file.name}</span>
                  <Button 
                    size="sm" 
                    variant="outline"
                    onClick={() => handleFileDownload(file, index)}
                  >
                    <Download className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          </div>
        )}

        {feedback && (
          <div className="bg-blue-50 p-4 rounded-lg">
            <Label className="text-blue-800">Guide Feedback</Label>
            <p className="mt-1 text-blue-700">{feedback}</p>
          </div>
        )}

        {isGuide && status === 'submitted' && (
          <div className="flex justify-end">
            <Button 
              onClick={handleComplete}
              className="flex items-center space-x-2 bg-green-600 hover:bg-green-700"
            >
              <CheckCircle className="h-4 w-4" />
              <span>Mark as Completed</span>
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ProjectSection;
