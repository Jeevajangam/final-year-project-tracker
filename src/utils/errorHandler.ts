
import { toast } from '@/hooks/use-toast';

export interface ApiError {
  message: string;
  code?: string;
  details?: any;
}

export class ErrorHandler {
  static handleError(error: any, context?: string): void {
    console.error(`Error in ${context}:`, error);
    
    let message = 'An unexpected error occurred';
    
    if (error?.message) {
      message = error.message;
    } else if (typeof error === 'string') {
      message = error;
    } else if (error?.error?.message) {
      message = error.error.message;
    }

    // Handle specific error types
    if (error?.code === 'refresh_token_not_found' || error?.status === 401) {
      message = 'Your session has expired. Please log in again.';
      // Force redirect to login after a short delay
      setTimeout(() => {
        window.location.href = '/auth';
      }, 2000);
    } else if (error?.code === 'PGRST116') {
      message = 'No data found or access denied';
    } else if (error?.code?.includes('storage')) {
      message = 'File operation failed. Please try again.';
    }

    toast({
      title: "Error",
      description: message,
      variant: "destructive"
    });
  }

  static handleSuccess(message: string): void {
    toast({
      title: "Success",
      description: message
    });
  }

  static async withErrorHandling<T>(
    operation: () => Promise<T>,
    context: string,
    successMessage?: string
  ): Promise<T | null> {
    try {
      const result = await operation();
      if (successMessage) {
        this.handleSuccess(successMessage);
      }
      return result;
    } catch (error) {
      this.handleError(error, context);
      return null;
    }
  }
}
