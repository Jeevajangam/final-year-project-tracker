
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Calendar } from 'lucide-react';
import { formatDateTimeForInput, convertInputToISO } from '@/utils/dateUtils';
import { ErrorHandler } from '@/utils/errorHandler';

interface DueDateDialogProps {
  dueDate?: string;
  onSetDueDate?: (sectionId: string, dueDate: string) => void;
  sectionId: string;
  updating: boolean;
  setUpdating: (updating: boolean) => void;
}

const DueDateDialog: React.FC<DueDateDialogProps> = ({
  dueDate,
  onSetDueDate,
  sectionId,
  updating,
  setUpdating
}) => {
  const [dueDateDialogOpen, setDueDateDialogOpen] = useState(false);
  const [tempDueDate, setTempDueDate] = useState('');

  useEffect(() => {
    if (dueDate) {
      setTempDueDate(formatDateTimeForInput(dueDate));
    }
  }, [dueDate]);

  const handleSetDueDate = async () => {
    if (!tempDueDate || !onSetDueDate) {
      ErrorHandler.handleError('Please select a due date', 'Due date update');
      return;
    }
    
    if (!sectionId) {
      ErrorHandler.handleError('Section ID not available', 'Due date update');
      return;
    }
    
    setUpdating(true);
    try {
      const isoDate = convertInputToISO(tempDueDate);
      console.log('Setting due date:', { sectionId, dueDate: isoDate });
      
      await onSetDueDate(sectionId, isoDate);
      setDueDateDialogOpen(false);
      ErrorHandler.handleSuccess('Due date updated successfully');
    } catch (error) {
      console.error('Error setting due date:', error);
      ErrorHandler.handleError(error, 'Due date update');
    } finally {
      setUpdating(false);
    }
  };

  return (
    <Dialog open={dueDateDialogOpen} onOpenChange={setDueDateDialogOpen}>
      <DialogTrigger asChild>
        <Button size="sm" variant="outline" className="flex items-center space-x-1">
          <Calendar className="h-4 w-4" />
          <span>{dueDate ? 'Update Due Date' : 'Set Due Date'}</span>
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{dueDate ? 'Update Due Date' : 'Set Due Date'}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <Label htmlFor="due-date">Due Date and Time</Label>
            <Input
              id="due-date"
              type="datetime-local"
              value={tempDueDate}
              onChange={(e) => setTempDueDate(e.target.value)}
              className="mt-1"
            />
          </div>
          <div className="flex justify-end space-x-2">
            <Button 
              variant="outline"
              onClick={() => setDueDateDialogOpen(false)}
              disabled={updating}
            >
              Cancel
            </Button>
            <Button 
              onClick={handleSetDueDate}
              disabled={!tempDueDate || updating}
            >
              {updating ? 'Updating...' : 'Update'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default DueDateDialog;
