
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Upload, Clock, CheckCircle, AlertCircle } from 'lucide-react';
import { formatDateForDisplay } from '@/utils/dateUtils';
import EnhancedFilePreview from '@/components/ui/enhanced-file-preview';
import { FileUploadService } from '@/utils/fileUpload';
import { ErrorHandler } from '@/utils/errorHandler';
import DueDateDialog from '@/components/project/DueDateDialog';
import FeedbackDialog from '@/components/project/FeedbackDialog';
import ScoreDialog from '@/components/project/ScoreDialog';

interface SectionCardProps {
  sectionType: string;
  title: string;
  description: string;
  dueDate?: string;
  content?: any;
  files?: any[];
  status?: string;
  score?: number;
  feedback?: string;
  onUpdate?: (sectionType: string, content: any, files: File[]) => void;
  onComplete?: (sectionType: string) => void;
  onSetDueDate?: (sectionId: string, dueDate: string) => void;
  onSetFeedback?: (sectionId: string, feedback: string) => void;
  onSetScore?: (sectionId: string, score: number) => void;
  canEdit: boolean;
  isGuide?: boolean;
  scorable?: boolean;
  sectionId?: string;
  projectId?: string;
}

const SectionCard: React.FC<SectionCardProps> = ({
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
  onSetDueDate,
  onSetFeedback,
  onSetScore,
  canEdit,
  isGuide = false,
  scorable = false,
  sectionId,
  projectId
}) => {
  const [textContent, setTextContent] = useState(content?.text || '');
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    setTextContent(content?.text || '');
  }, [content]);

  const isDueDatePassed = dueDate && new Date(dueDate) < new Date();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setSelectedFiles(Array.from(e.target.files));
    }
  };

  const handleUpdate = async () => {
    if (!textContent.trim() && selectedFiles.length === 0) {
      ErrorHandler.handleError('Please add some content or files before updating', 'Section update');
      return;
    }

    if (!onUpdate || !projectId) {
      ErrorHandler.handleError('Update function not available', 'Section update');
      return;
    }

    setUpdating(true);
    try {
      const updatedContent = {
        text: textContent
      };

      await onUpdate(sectionType, updatedContent, selectedFiles);
      setSelectedFiles([]);
      
      // Clear file input
      const fileInput = document.getElementById(`files-${sectionType}`) as HTMLInputElement;
      if (fileInput) {
        fileInput.value = '';
      }
      
      ErrorHandler.handleSuccess('Section updated successfully');
    } catch (error) {
      ErrorHandler.handleError(error, 'Section update');
    } finally {
      setUpdating(false);
    }
  };

  const handleDiscard = () => {
    setTextContent(content?.text || '');
    setSelectedFiles([]);
    
    const fileInput = document.getElementById(`files-${sectionType}`) as HTMLInputElement;
    if (fileInput) {
      fileInput.value = '';
    }
    
    ErrorHandler.handleSuccess('Changes discarded');
  };

  const handleComplete = () => {
    if (onComplete) {
      onComplete(sectionType);
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
          <div className="flex-1">
            <CardTitle className="text-lg">{title}</CardTitle>
            <CardDescription>{description}</CardDescription>
          </div>
          <div className="flex items-start space-x-4">
            <div className="flex items-center space-x-2">
              {getStatusBadge()}
              {score && (
                <Badge variant="secondary">Score: {score}/10</Badge>
              )}
            </div>
          </div>
        </div>
        
        {/* Always show due date if it exists */}
        {dueDate && (
          <div className="flex items-center space-x-2 text-sm bg-gray-50 p-3 rounded-lg border">
            <Clock className="h-4 w-4" />
            <span className={isDueDatePassed ? "text-red-500 font-medium" : "text-gray-700"}>
              Due: {formatDateForDisplay(dueDate)}
            </span>
            {isDueDatePassed && <AlertCircle className="h-4 w-4 text-red-500" />}
          </div>
        )}

        {/* For guides, show due date below title if no due date set */}
        {isGuide && !dueDate && (
          <div className="text-sm text-gray-500 italic">
            No due date set
          </div>
        )}
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Guide Controls - Always available for guides */}
        {isGuide && (
          <div className="flex flex-wrap gap-2 mb-4">
            <DueDateDialog
              dueDate={dueDate}
              onSetDueDate={onSetDueDate}
              sectionId={sectionId || sectionType}
              updating={updating}
              setUpdating={setUpdating}
            />

            <FeedbackDialog
              feedback={feedback}
              onSetFeedback={onSetFeedback}
              sectionId={sectionId || sectionType}
              updating={updating}
              setUpdating={setUpdating}
            />

            {scorable && (
              <ScoreDialog
                score={score}
                onSetScore={onSetScore}
                sectionId={sectionId || sectionType}
                updating={updating}
                setUpdating={setUpdating}
              />
            )}

            {status === 'submitted' && (
              <Button 
                size="sm"
                onClick={handleComplete}
                className="flex items-center space-x-1 bg-green-600 hover:bg-green-700"
              >
                <CheckCircle className="h-4 w-4" />
                <span>Mark Complete</span>
              </Button>
            )}
          </div>
        )}

        {/* Student Content Editor */}
        {canEdit && !isGuide && (
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
                disabled={updating || (!textContent.trim() && selectedFiles.length === 0)}
                className="flex items-center space-x-2"
              >
                <Upload className="h-4 w-4" />
                <span>{updating ? 'Updating...' : 'Update'}</span>
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

        {/* Read-only Content Display */}
        {(!canEdit || isGuide) && (
          <div className="bg-gray-50 p-4 rounded-lg">
            {textContent && (
              <div className="mt-2">
                <strong>Content:</strong>
                <p className="mt-1 whitespace-pre-wrap">{textContent}</p>
              </div>
            )}
          </div>
        )}

        {/* Files Display with Enhanced Preview */}
        {files.length > 0 && (
          <div>
            <Label>Files</Label>
            <div className="mt-2 space-y-2">
              {files.map((file: any, index: number) => (
                <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                  <div>
                    <span className="text-sm font-medium">{file.name}</span>
                    {file.size && (
                      <p className="text-xs text-gray-500">
                        {(file.size / 1024 / 1024).toFixed(2)} MB
                      </p>
                    )}
                  </div>
                  <div className="flex space-x-2">
                    <EnhancedFilePreview file={file} />
                  </div>
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
      </CardContent>
    </Card>
  );
};

export default SectionCard;
