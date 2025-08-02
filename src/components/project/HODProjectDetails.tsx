
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Users, FileText, Eye } from 'lucide-react';
import { formatDateForDisplay } from '@/utils/dateUtils';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';

interface HODProjectDetailsProps {
  project: any;
  projectSections: any[];
  onClose: () => void;
}

// File preview component for Final Report
const FinalReportPreview: React.FC<{ fileUrl: string, fileName?: string }> = ({ fileUrl, fileName = 'Final Report' }) => {
  const getFileExtension = (filename: string) => {
    return filename.split('.').pop()?.toLowerCase() || '';
  };

  const renderPreview = () => {
    const extension = getFileExtension(fileName);
    
    switch (extension) {
      case 'pdf':
        return (
          <div className="w-full h-[600px] border rounded">
            <iframe
              src={`${fileUrl}#toolbar=0`}
              width="100%"
              height="100%"
              title={fileName}
              className="rounded"
            />
          </div>
        );
      case 'jpg':
      case 'jpeg':
      case 'png':
      case 'gif':
        return (
          <img
            src={fileUrl}
            alt={fileName}
            className="max-w-full h-auto max-h-[600px] object-contain rounded mx-auto"
          />
        );
      case 'doc':
      case 'docx':
        return (
          <div className="w-full h-[600px] border rounded">
            <iframe
              src={`https://view.officeapps.live.com/op/embed.aspx?src=${encodeURIComponent(fileUrl)}`}
              width="100%"
              height="100%"
              title={fileName}
              className="rounded"
            />
          </div>
        );
      case 'ppt':
      case 'pptx':
        return (
          <div className="w-full h-[600px] border rounded">
            <iframe
              src={`https://view.officeapps.live.com/op/embed.aspx?src=${encodeURIComponent(fileUrl)}`}
              width="100%"
              height="100%"
              title={fileName}
              className="rounded"
            />
          </div>
        );
      default:
        return (
          <div className="flex items-center justify-center h-64 bg-gray-100 rounded">
            <p className="text-gray-600">Preview not available for this file type</p>
          </div>
        );
    }
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button 
          size="sm" 
          variant="outline" 
          className="flex items-center space-x-2"
        >
          <Eye className="h-4 w-4" />
          <span>Preview Report</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{fileName}</DialogTitle>
        </DialogHeader>
        <div className="mt-4">
          {renderPreview()}
        </div>
      </DialogContent>
    </Dialog>
  );
};

const HODProjectDetails: React.FC<HODProjectDetailsProps> = ({
  project,
  projectSections,
  onClose
}) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved': case 'completed': return 'bg-green-500';
      case 'rejected': return 'bg-red-500';
      case 'pending': case 'in_progress': case 'submitted': return 'bg-yellow-500';
      case 'active': return 'bg-blue-500';
      default: return 'bg-gray-500';
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex justify-between items-start">
            <div className="flex-1">
              <CardTitle className="text-xl">{project.title}</CardTitle>
              <CardDescription className="mt-1">{project.description}</CardDescription>
              <div className="flex items-center space-x-4 mt-2">
                <div className="flex items-center space-x-2">
                  <Users className="h-4 w-4" />
                  <span className="text-sm text-muted-foreground">
                    {project.student_ids?.length || 0} students
                  </span>
                </div>
                <Badge className={getStatusColor(project.status)}>
                  {project.status}
                </Badge>
              </div>
            </div>
            <Button variant="outline" onClick={onClose}>
              Close
            </Button>
          </div>
        </CardHeader>
      </Card>

      {/* Final Report Section Only */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <FileText className="h-5 w-5" />
            <span>Final Report</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {project.final_report_url ? (
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <p className="font-medium">Final Report Submitted</p>
                  <p className="text-sm text-gray-600">
                    Submitted: {formatDateForDisplay(project.final_report_submitted_at)}
                  </p>
                </div>
                <FinalReportPreview 
                  fileUrl={project.final_report_url} 
                  fileName={`final_report_${project.title}.pdf`}
                />
              </div>
              
              {/* Embedded preview for immediate viewing */}
              <div className="mt-4">
                <h4 className="font-medium mb-2">Report Preview:</h4>
                <div className="w-full h-96 border rounded">
                  <iframe
                    src={`${project.final_report_url}#toolbar=0`}
                    width="100%"
                    height="100%"
                    title="Final Report Preview"
                    className="rounded"
                  />
                </div>
              </div>
            </div>
          ) : (
            <p className="text-gray-600 text-center py-4">
              Final report not submitted
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default HODProjectDetails;
