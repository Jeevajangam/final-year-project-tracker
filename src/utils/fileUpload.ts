
import { supabase } from '@/integrations/supabase/client';
import { ErrorHandler } from './errorHandler';

export interface UploadedFile {
  name: string;
  size: number;
  type: string;
  url: string;
  path: string;
}

export class FileUploadService {
  static async uploadFiles(
    files: File[],
    projectId: string,
    sectionType: string
  ): Promise<UploadedFile[]> {
    const uploadedFiles: UploadedFile[] = [];

    for (const file of files) {
      try {
        // Generate unique filename to prevent overwrites
        const fileExt = file.name.split('.').pop();
        const timestamp = Date.now();
        const randomId = Math.random().toString(36).substring(7);
        const fileName = `${sectionType}_${timestamp}_${randomId}.${fileExt}`;
        const filePath = `uploads/${projectId}/${sectionType}/${fileName}`;

        console.log('Uploading file:', { 
          originalName: file.name,
          fileName, 
          filePath, 
          size: file.size,
          type: file.type 
        });

        // Upload to Supabase Storage
        const { error: uploadError } = await supabase.storage
          .from('project_files')
          .upload(filePath, file, {
            cacheControl: '3600',
            upsert: false
          });

        if (uploadError) {
          console.error('Upload error:', uploadError);
          throw new Error(`Failed to upload ${file.name}: ${uploadError.message}`);
        }

        // Get public URL
        const { data: { publicUrl } } = supabase.storage
          .from('project_files')
          .getPublicUrl(filePath);

        if (!publicUrl) {
          throw new Error(`Failed to get URL for ${file.name}`);
        }

        const uploadedFile: UploadedFile = {
          name: file.name,
          size: file.size,
          type: file.type,
          url: publicUrl,
          path: filePath
        };

        uploadedFiles.push(uploadedFile);
        console.log('File uploaded successfully:', uploadedFile);

      } catch (error) {
        console.error(`Failed to upload ${file.name}:`, error);
        ErrorHandler.handleError(error, `File upload for ${file.name}`);
        throw error; // Re-throw to stop the upload process
      }
    }

    return uploadedFiles;
  }

  static getSignedUrl(filePath: string, expiresIn: number = 3600): Promise<string> {
    return supabase.storage
      .from('project_files')
      .createSignedUrl(filePath, expiresIn)
      .then(({ data, error }) => {
        if (error) throw error;
        return data?.signedUrl || '';
      });
  }
}
