
import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { BookOpen, Users, Target, Calendar, Plus } from 'lucide-react';
import ProjectCard from '@/components/project/ProjectCard';
import ProjectRequestModal from '@/components/project/ProjectRequestModal';
import { FileUploadService } from '@/utils/fileUpload';
import { ErrorHandler } from '@/utils/errorHandler';

const StudentDashboard = () => {
  const { user, userProfile } = useAuth();
  const [projects, setProjects] = useState([]);
  const [projectRequests, setProjectRequests] = useState([]);
  const [projectSections, setProjectSections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showRequestModal, setShowRequestModal] = useState(false);

  useEffect(() => {
    if (user) {
      fetchStudentData();
    }
  }, [user]);

  const fetchStudentData = async () => {
    try {
      const { data: projectsData } = await supabase
        .from('projects')
        .select('*')
        .contains('student_ids', [user?.id]);

      const { data: requestsData } = await supabase
        .from('project_requests')
        .select('*')
        .eq('student_id', user?.id);

      if (projectsData && projectsData.length > 0) {
        const projectIds = projectsData.map(p => p.id);
        const { data: sectionsData } = await supabase
          .from('project_sections')
          .select('*')
          .in('project_id', projectIds);
        
        const parsedSections = (sectionsData || []).map(section => ({
          ...section,
          files: Array.isArray(section.files) ? section.files : 
                 (section.files ? (typeof section.files === 'string' ? JSON.parse(section.files) : section.files) : []),
          content: section.content || {}
        }));
        
        setProjectSections(parsedSections);
      }

      setProjects(projectsData || []);
      setProjectRequests(requestsData || []);
    } catch (error) {
      ErrorHandler.handleError(error, 'Fetching student data');
    } finally {
      setLoading(false);
    }
  };

  const handleSectionUpdate = async (projectId: string, sectionType: string, content: any, files: File[]) => {
    try {
      console.log('Updating section:', { projectId, sectionType, content, files });
      
      let uploadedFiles = [];
      
      // Upload files if any
      if (files.length > 0) {
        uploadedFiles = await FileUploadService.uploadFiles(files, projectId, sectionType);
      }

      // Find or create the project section
      let existingSection = projectSections.find(
        s => s.project_id === projectId && s.section_type === sectionType
      );

      if (existingSection) {
        // Merge new files with existing files
        const existingFiles = Array.isArray(existingSection.files) ? existingSection.files : [];
        const updatedFiles = [...existingFiles, ...uploadedFiles];
        
        const { error } = await supabase
          .from('project_sections')
          .update({
            content,
            files: updatedFiles,
            status: 'submitted',
            submitted_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          })
          .eq('id', existingSection.id);

        if (error) {
          console.error('Section update error:', error);
          throw error;
        }
      } else {
        // Create new section if it doesn't exist
        const { error } = await supabase
          .from('project_sections')
          .insert({
            project_id: projectId,
            section_type: sectionType,
            content,
            files: uploadedFiles,
            status: 'submitted',
            submitted_at: new Date().toISOString()
          });

        if (error) {
          console.error('Section insert error:', error);
          throw error;
        }
      }

      // Log the submission
      await supabase
        .from('submissions_log')
        .insert({
          project_id: projectId,
          student_id: user?.id,
          section_type: sectionType,
          action: existingSection ? 'update' : 'submit',
          files: uploadedFiles,
          content
        });

      ErrorHandler.handleSuccess('Section updated successfully and shared with guide');

      // Refresh the data
      fetchStudentData();
    } catch (error) {
      ErrorHandler.handleError(error, 'Section update');
      throw error; // Re-throw to handle in component
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved': return 'bg-green-500';
      case 'rejected': return 'bg-red-500';
      case 'pending': return 'bg-yellow-500';
      default: return 'bg-gray-500';
    }
  };

  if (loading) {
    return <div className="flex items-center justify-center h-screen">Loading...</div>;
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Student Dashboard</h1>
          <p className="text-muted-foreground">Welcome back, {userProfile?.name}!</p>
        </div>
        <div className="flex items-center space-x-4">
          <Badge variant="secondary" className="text-sm">
            {userProfile?.department}
          </Badge>
          <Button onClick={() => setShowRequestModal(true)} className="flex items-center space-x-2">
            <Plus className="h-4 w-4" />
            <span>Send Project Request</span>
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Projects</CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{projects.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Requests</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {projectRequests.filter(r => r.status === 'pending').length}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Submissions</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{projectSections.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completed Sections</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {projectSections.filter(s => s.status === 'completed').length}
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="projects" className="space-y-4">
        <TabsList>
          <TabsTrigger value="projects">My Projects</TabsTrigger>
          <TabsTrigger value="requests">Project Requests</TabsTrigger>
        </TabsList>

        <TabsContent value="projects" className="space-y-4">
          <div className="grid gap-4">
            {projects.length === 0 ? (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-8">
                  <BookOpen className="h-12 w-12 text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">No active projects yet</p>
                  <Button className="mt-4" onClick={() => setShowRequestModal(true)}>
                    Send Project Request
                  </Button>
                </CardContent>
              </Card>
            ) : (
              projects.map((project: any) => {
                const projectSectionsData = projectSections.filter(s => s.project_id === project.id);
                
                return (
                  <ProjectCard
                    key={project.id}
                    project={project}
                    projectSections={projectSectionsData}
                    onSectionUpdate={(sectionType, content, files) => 
                      handleSectionUpdate(project.id, sectionType, content, files)
                    }
                    canEdit={true}
                    isGuide={false}
                    onUpdate={fetchStudentData}
                  />
                );
              })
            )}
          </div>
        </TabsContent>

        <TabsContent value="requests" className="space-y-4">
          <div className="grid gap-4">
            {projectRequests.map((request: any) => (
              <Card key={request.id}>
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-lg">{request.project_title}</CardTitle>
                      <CardDescription>{request.project_description}</CardDescription>
                    </div>
                    <Badge className={getStatusColor(request.status)}>
                      {request.status}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    Submitted: {new Date(request.created_at).toLocaleDateString()}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>

      <ProjectRequestModal
        isOpen={showRequestModal}
        onClose={() => setShowRequestModal(false)}
        onSuccess={fetchStudentData}
      />
    </div>
  );
};

export default StudentDashboard;
