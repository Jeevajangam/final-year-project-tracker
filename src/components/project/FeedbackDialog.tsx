
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { MessageSquare } from 'lucide-react';
import { ErrorHandler } from '@/utils/errorHandler';

interface FeedbackDialogProps {
  feedback?: string;
  onSetFeedback?: (sectionId: string, feedback: string) => void;
  sectionId: string;
  updating: boolean;
  setUpdating: (updating: boolean) => void;
}

const FeedbackDialog: React.FC<FeedbackDialogProps> = ({
  feedback,
  onSetFeedback,
  sectionId,
  updating,
  setUpdating
}) => {
  const [feedbackDialogOpen, setFeedbackDialogOpen] = useState(false);
  const [tempFeedback, setTempFeedback] = useState(feedback || '');

  useEffect(() => {
    setTempFeedback(feedback || '');
  }, [feedback]);

  const handleSetFeedback = async () => {
    if (!tempFeedback.trim()) {
      ErrorHandler.handleError('Please enter feedback', 'Feedback update');
      return;
    }
    
    if (!sectionId || !onSetFeedback) {
      ErrorHandler.handleError('Section ID not available', 'Feedback update');
      return;
    }
    
    setUpdating(true);
    try {
      await onSetFeedback(sectionId, tempFeedback);
      setFeedbackDialogOpen(false);
      ErrorHandler.handleSuccess('Feedback updated successfully');
    } catch (error) {
      ErrorHandler.handleError(error, 'Feedback update');
    } finally {
      setUpdating(false);
    }
  };

  return (
    <Dialog open={feedbackDialogOpen} onOpenChange={setFeedbackDialogOpen}>
      <DialogTrigger asChild>
        <Button size="sm" variant="outline" className="flex items-center space-x-1">
          <MessageSquare className="h-4 w-4" />
          <span>{feedback ? 'Update Feedback' : 'Add Feedback'}</span>
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{feedback ? 'Update Feedback' : 'Add Feedback'}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <Label htmlFor="feedback">Feedback</Label>
            <Textarea
              id="feedback"
              value={tempFeedback}
              onChange={(e) => setTempFeedback(e.target.value)}
              placeholder="Enter your feedback..."
              className="mt-1"
              rows={4}
            />
          </div>
          <div className="flex justify-end space-x-2">
            <Button 
              variant="outline"
              onClick={() => setFeedbackDialogOpen(false)}
              disabled={updating}
            >
              Cancel
            </Button>
            <Button 
              onClick={handleSetFeedback}
              disabled={!tempFeedback.trim() || updating}
            >
              {updating ? 'Updating...' : 'Update'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default FeedbackDialog;
