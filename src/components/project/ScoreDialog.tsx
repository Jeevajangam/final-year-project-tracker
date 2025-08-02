
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Star } from 'lucide-react';
import { ErrorHandler } from '@/utils/errorHandler';

interface ScoreDialogProps {
  score?: number;
  onSetScore?: (sectionId: string, score: number) => void;
  sectionId: string;
  updating: boolean;
  setUpdating: (updating: boolean) => void;
}

const ScoreDialog: React.FC<ScoreDialogProps> = ({
  score,
  onSetScore,
  sectionId,
  updating,
  setUpdating
}) => {
  const [scoreDialogOpen, setScoreDialogOpen] = useState(false);
  const [tempScore, setTempScore] = useState(score || 0);

  useEffect(() => {
    setTempScore(score || 0);
  }, [score]);

  const handleSetScore = async () => {
    if (!sectionId || !onSetScore) {
      ErrorHandler.handleError('Section ID not available', 'Score update');
      return;
    }
    
    setUpdating(true);
    try {
      await onSetScore(sectionId, tempScore);
      setScoreDialogOpen(false);
      ErrorHandler.handleSuccess('Score updated successfully');
    } catch (error) {
      ErrorHandler.handleError(error, 'Score update');
    } finally {
      setUpdating(false);
    }
  };

  return (
    <Dialog open={scoreDialogOpen} onOpenChange={setScoreDialogOpen}>
      <DialogTrigger asChild>
        <Button size="sm" variant="outline" className="flex items-center space-x-1">
          <Star className="h-4 w-4" />
          <span>{score ? 'Update Score' : 'Set Score'}</span>
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{score ? 'Update Score' : 'Set Score'}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <Label htmlFor="score">Score (0-10)</Label>
            <Input
              id="score"
              type="number"
              min="0"
              max="10"
              step="0.5"
              value={tempScore}
              onChange={(e) => setTempScore(parseFloat(e.target.value) || 0)}
              className="mt-1"
            />
          </div>
          <div className="flex justify-end space-x-2">
            <Button 
              variant="outline"
              onClick={() => setScoreDialogOpen(false)}
              disabled={updating}
            >
              Cancel
            </Button>
            <Button 
              onClick={handleSetScore}
              disabled={updating}
            >
              {updating ? 'Updating...' : 'Update'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ScoreDialog;
