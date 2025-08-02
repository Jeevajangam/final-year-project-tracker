
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

export const downloadFile = async (filePath: string, fileName: string, bucketName: string = 'project_files') => {
  try {
    console.log('Downloading file:', { filePath, fileName, bucketName });
    
    const { data, error } = await supabase.storage
      .from(bucketName)
      .download(filePath);

    if (error) {
      console.error('Download error:', error);
      toast({
        title: "Download Failed",
        description: "Could not download the file. Please try again.",
        variant: "destructive"
      });
      return;
    }

    if (data) {
      const url = window.URL.createObjectURL(data);
      const a = document.createElement('a');
      a.href = url;
      a.download = fileName;
      a.style.display = 'none';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
      
      toast({
        title: "Download Started",
        description: `Downloading ${fileName}`,
      });
    }
  } catch (error) {
    console.error('Download failed:', error);
    toast({
      title: "Download Failed",
      description: "An error occurred while downloading the file.",
      variant: "destructive"
    });
  }
};
