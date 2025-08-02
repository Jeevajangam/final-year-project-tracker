
import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { LogOut, GraduationCap } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { ErrorHandler } from '@/utils/errorHandler';

const DashboardLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { userProfile } = useAuth();

  const handleSignOut = async () => {
    try {
      console.log('Starting sign out process...');
      
      // Clear local storage first
      localStorage.clear();
      sessionStorage.clear();
      
      // Sign out from Supabase
      const { error } = await supabase.auth.signOut();
      
      if (error) {
        console.error('Supabase signOut error:', error);
        // Even if there's an error, we should still redirect
        ErrorHandler.handleError(error, 'Sign out');
      } else {
        ErrorHandler.handleSuccess('Signed out successfully');
      }
      
      // Force redirect to auth page regardless of error
      setTimeout(() => {
        window.location.href = '/auth';
      }, 1000);
      
    } catch (error) {
      console.error('Error during sign out:', error);
      ErrorHandler.handleError(error, 'Sign out');
      
      // Force redirect even on error
      setTimeout(() => {
        window.location.href = '/auth';
      }, 2000);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200 px-6 py-4 shadow-sm">
        <div className="flex justify-between items-center">
          <div className="flex items-center space-x-3">
            <div className="flex items-center space-x-2">
              <GraduationCap className="h-8 w-8 text-blue-600" />
              <span className="text-2xl font-bold text-gray-900">FYP Tracker</span>
            </div>
            {userProfile?.role && (
              <span className="text-sm text-gray-500 capitalize bg-gray-100 px-2 py-1 rounded">
                {userProfile.role}
              </span>
            )}
          </div>
          <div className="flex items-center space-x-4">
            <div className="text-right">
              <p className="font-medium text-gray-900">{userProfile?.name}</p>
              <p className="text-sm text-gray-500">{userProfile?.email}</p>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={handleSignOut}
              className="flex items-center space-x-2"
            >
              <LogOut className="h-4 w-4" />
              <span>Logout</span>
            </Button>
          </div>
        </div>
      </header>
      <main className="p-6">
        {children}
      </main>
    </div>
  );
};

export default DashboardLayout;
