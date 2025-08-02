
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { FileText, Upload, Download } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { formatDateForDisplay } from '@/utils/dateUtils';
import { downloadFile } from '@/utils/fileDownload';

interface FinalReportSectionProps {
  project: any;
  canEdit: boolean;
  onUpdate: () => void;
}

const FinalReportSection: React.FC<FinalReportSectionProps> = ({
  project,
  canEdit,
  onUpdate
}) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.type !== 'application/pdf') {
        toast({
          title: "Invalid File Type",
          description: "Please select a PDF file only.",
          variant: "destructive"
        });
        return;
      }
      setSelectedFile(file);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile || !project?.id) return;

    setUploading(true);
    try {
      const fileExt = 'pdf';
      const fileName = `final_report_${Date.now()}.${fileExt}`;
      const filePath = `${project.id}/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('final-reports')
        .upload(filePath, selectedFile);

      if (uploadError) throw uploadError;

      const { error: updateError } = await supabase
        .from('projects')
        .update({
          final_report_url: filePath,
          final_report_submitted_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .eq('id', project.id);

      if (updateError) throw updateError;

      // Create notification for HOD
      const { data: guideData } = await supabase
        .from('profiles')
        .select('department')
        .eq('id', project.guide_id)
        .single();

      if (guideData) {
        const { data: hodData } = await supabase
          .from('profiles')
          .select('id')
          .eq('role', 'hod')
          .eq('department', guideData.department);

        if (hodData && hodData.length > 0) {
          await supabase
            .from('notifications')
            .insert({
              user_id: hodData[0].id,
              project_id: project.id,
              type: 'final_report',
              title: 'New Final Report Submitted',
              message: `Final report for project "${project.title}" has been submitted.`
            });
        }
      }

      toast({
        title: "Success",
        description: "Final report uploaded successfully"
      });

      setSelectedFile(null);
      onUpdate();
    } catch (error) {
      console.error('Upload error:', error);
      toast({
        title: "Upload Failed",
        description: "Failed to upload final report. Please try again.",
        variant: "destructive"
      });
    } finally {
      setUploading(false);
    }
  };

  const handleDownload = () => {
    if (project?.final_report_url) {
      downloadFile(project.final_report_url, `final_report_${project.title}.pdf`, 'final-reports');
    }
  };

  const isProjectCompleted = project?.status === 'completed';

  return (
    <Card className="mt-4">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <FileText className="h-5 w-5" />
          <span>Final Report</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {project?.final_report_url ? (
          <div className="space-y-2">
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div>
                <p className="font-medium">Final Report Submitted</p>
                <p className="text-sm text-gray-600">
                  Submitted: {formatDateForDisplay(project.final_report_submitted_at)}
                </p>
              </div>
              <Button 
                size="sm" 
                variant="outline" 
                onClick={handleDownload}
                className="flex items-center space-x-2"
              >
                <Download className="h-4 w-4" />
                <span>Download</span>
              </Button>
            </div>
            
            {canEdit && !isProjectCompleted && (
              <div className="space-y-2">
                <Label htmlFor="final-report-update">Update Final Report (PDF only)</Label>
                <div className="flex items-center space-x-2">
                  <Input
                    id="final-report-update"
                    type="file"
                    accept=".pdf"
                    onChange={handleFileChange}
                    className="flex-1"
                  />
                  <Button 
                    onClick={handleUpload}
                    disabled={!selectedFile || uploading}
                    className="flex items-center space-x-2"
                  >
                    <Upload className="h-4 w-4" />
                    <span>{uploading ? 'Updating...' : 'Update'}</span>
                  </Button>
                </div>
              </div>
            )}
          </div>
        ) : (
          <>
            {canEdit && !isProjectCompleted ? (
              <div className="space-y-2">
                <Label htmlFor="final-report">Upload Final Report (PDF only)</Label>
                <div className="flex items-center space-x-2">
                  <Input
                    id="final-report"
                    type="file"
                    accept=".pdf"
                    onChange={handleFileChange}
                    className="flex-1"
                  />
                  <Button 
                    onClick={handleUpload}
                    disabled={!selectedFile || uploading}
                    className="flex items-center space-x-2"
                  >
                    <Upload className="h-4 w-4" />
                    <span>{uploading ? 'Uploading...' : 'Upload'}</span>
                  </Button>
                </div>
                {selectedFile && (
                  <p className="text-sm text-gray-600">
                    Selected: {selectedFile.name}
                  </p>
                )}
              </div>
            ) : (
              <p className="text-gray-600 text-center py-4">
                Final report not submitted
              </p>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
};

export default FinalReportSection;
