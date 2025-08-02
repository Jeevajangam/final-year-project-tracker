
import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { BookOpen, Users, FileText, CheckCircle, AlertTriangle, MessageSquare, BarChart3 } from 'lucide-react';
import ProjectCard from '@/components/project/ProjectCard';
import ProjectRequestsList from '@/components/dashboard/ProjectRequestsList';
import DashboardStats from '@/components/dashboard/DashboardStats';
import { ErrorHandler } from '@/utils/errorHandler';

const GuideDashboard = () => {
  const { user, userProfile } = useAuth();
  const [projects, setProjects] = useState([]);
  const [projectRequests, setProjectRequests] = useState([]);
  const [projectSections, setProjectSections] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchGuideData();
    }
  }, [user]);

  const fetchGuideData = async () => {
    try {
      // Fetch projects assigned to this guide
      const { data: projectsData, error: projectsError } = await supabase
        .from('projects')
        .select('*')
        .eq('guide_id', user?.id);

      if (projectsError) {
        throw projectsError;
      }

      // Fetch project requests sent to this guide
      const { data: requestsData, error: requestsError } = await supabase
        .from('project_requests')
        .select('*')
        .eq('guide_id', user?.id);

      if (requestsError) {
        throw requestsError;
      }

      // Fetch project sections for all assigned projects
      if (projectsData && projectsData.length > 0) {
        const projectIds = projectsData.map(p => p.id);
        const { data: sectionsData, error: sectionsError } = await supabase
          .from('project_sections')
          .select('*')
          .in('project_id', projectIds);

        if (sectionsError) {
          throw sectionsError;
        }

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
      ErrorHandler.handleError(error, 'Fetching guide data');
    } finally {
      setLoading(false);
    }
  };

  const handleRequestAction = async (requestId: string, action: 'approve' | 'reject') => {
    try {
      if (action === 'approve') {
        // Get the request details
        const request = projectRequests.find(r => r.id === requestId);
        if (!request) return;

        // Create a new project
        const { data: projectData, error: projectError } = await supabase
          .from('projects')
          .insert({
            title: request.project_title,
            description: request.project_description,
            guide_id: user?.id,
            student_ids: [request.student_id],
            department: userProfile?.department || 'Computer Science',
            status: 'active'
          })
          .select()
          .single();

        if (projectError) {
          throw projectError;
        }

        // Update the request status
        const { error: updateError } = await supabase
          .from('project_requests')
          .update({ 
            status: 'approved',
            updated_at: new Date().toISOString()
          })
          .eq('id', requestId);

        if (updateError) {
          throw updateError;
        }

        ErrorHandler.handleSuccess('Project request approved and project created successfully');
      } else {
        // Just update the request status to rejected
        const { error } = await supabase
          .from('project_requests')
          .update({ 
            status: 'rejected',
            updated_at: new Date().toISOString()
          })
          .eq('id', requestId);

        if (error) {
          throw error;
        }

        ErrorHandler.handleSuccess('Project request rejected');
      }

      // Refresh data
      fetchGuideData();
    } catch (error) {
      ErrorHandler.handleError(error, `${action === 'approve' ? 'Approving' : 'Rejecting'} project request`);
    }
  };

  const handleSetDueDate = async (sectionIdentifier: string, dueDate: string) => {
    try {
      console.log('Setting due date with identifier:', { sectionIdentifier, dueDate });
      
      // Try to find section by ID first, then by section_type
      let section = projectSections.find(s => s.id === sectionIdentifier);
      
      if (!section) {
        // If not found by ID, try to find by section_type across all projects
        section = projectSections.find(s => s.section_type === sectionIdentifier);
      }
      
      if (!section) {
        // If still not found, we need to create a new section for each active project
        console.log('Section not found, creating new sections for all active projects');
        
        const activeProjects = projects.filter(p => p.status === 'active');
        
        for (const project of activeProjects) {
          const { data: newSection, error: insertError } = await supabase
            .from('project_sections')
            .insert({
              project_id: project.id,
              section_type: sectionIdentifier,
              due_date: dueDate,
              status: 'pending',
              content: {},
              files: []
            })
            .select()
            .single();

          if (insertError) {
            console.error('Error creating new section:', insertError);
            throw insertError;
          }

          console.log('New section created for project:', project.id, newSection);
        }
      } else {
        // Update existing section(s) with the same section_type across all projects
        const sectionsToUpdate = projectSections.filter(s => s.section_type === section.section_type);
        
        for (const sectionToUpdate of sectionsToUpdate) {
          const { error } = await supabase
            .from('project_sections')
            .update({
              due_date: dueDate,
              updated_at: new Date().toISOString()
            })
            .eq('id', sectionToUpdate.id);

          if (error) {
            console.error('Due date update error:', error);
            throw error;
          }
        }
        
        console.log('Due date updated for existing sections');
      }

      // Refresh the data to show updated due date
      await fetchGuideData();
    } catch (error) {
      console.error('Error setting due date:', error);
      throw error;
    }
  };

  const handleSetFeedback = async (sectionIdentifier: string, feedback: string) => {
    try {
      console.log('Setting feedback with identifier:', { sectionIdentifier, feedback });
      
      let section = projectSections.find(s => s.id === sectionIdentifier);
      
      if (!section) {
        section = projectSections.find(s => s.section_type === sectionIdentifier);
      }
      
      if (!section) {
        throw new Error('Section not found for feedback update');
      }

      const { error } = await supabase
        .from('project_sections')
        .update({
          feedback,
          updated_at: new Date().toISOString()
        })
        .eq('id', section.id);

      if (error) {
        throw error;
      }

      // Refresh the data
      fetchGuideData();
    } catch (error) {
      throw error;
    }
  };

  const handleSetScore = async (sectionIdentifier: string, score: number) => {
    try {
      console.log('Setting score with identifier:', { sectionIdentifier, score });
      
      let section = projectSections.find(s => s.id === sectionIdentifier);
      
      if (!section) {
        section = projectSections.find(s => s.section_type === sectionIdentifier);
      }
      
      if (!section) {
        throw new Error('Section not found for score update');
      }

      const { error } = await supabase
        .from('project_sections')
        .update({
          score,
          updated_at: new Date().toISOString()
        })
        .eq('id', section.id);

      if (error) {
        throw error;
      }

      // Refresh the data
      fetchGuideData();
    } catch (error) {
      throw error;
    }
  };

  const handleSectionComplete = async (projectId: string, sectionType: string) => {
    try {
      // Find the section
      const section = projectSections.find(
        s => s.project_id === projectId && s.section_type === sectionType
      );

      if (!section) {
        throw new Error('Section not found');
      }

      const { error } = await supabase
        .from('project_sections')
        .update({
          status: 'completed',
          updated_at: new Date().toISOString()
        })
        .eq('id', section.id);

      if (error) {
        throw error;
      }

      ErrorHandler.handleSuccess('Section marked as completed');
      
      // Refresh the data
      fetchGuideData();
    } catch (error) {
      ErrorHandler.handleError(error, 'Completing section');
    }
  };

  const handleCompleteProject = async (projectId: string) => {
    try {
      const { error } = await supabase
        .from('projects')
        .update({
          status: 'completed',
          completed_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .eq('id', projectId);

      if (error) {
        throw error;
      }

      ErrorHandler.handleSuccess('Project marked as completed');
      
      // Refresh the data
      fetchGuideData();
    } catch (error) {
      ErrorHandler.handleError(error, 'Completing project');
    }
  };

  if (loading) {
    return <div className="flex items-center justify-center h-screen">Loading...</div>;
  }

  const pendingRequests = projectRequests.filter(r => r.status === 'pending');
  const completedProjects = projects.filter(p => p.status === 'completed');
  const submittedSections = projectSections.filter(s => s.status === 'submitted');

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Guide Dashboard</h1>
          <p className="text-muted-foreground">Welcome back, {userProfile?.name}!</p>
        </div>
        <div className="flex items-center space-x-4">
          <Badge variant="secondary" className="text-sm">
            {userProfile?.department}
          </Badge>
        </div>
      </div>

      <DashboardStats 
        activeProjects={projects.filter(p => p.status === 'active').length}
        pendingRequests={pendingRequests.length}
        submittedSections={submittedSections.length}
        completedProjects={completedProjects.length}
      />

      {/* Main Content Tabs */}
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
                  <p className="text-muted-foreground">No projects assigned yet</p>
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
                    onSectionComplete={(sectionType) => handleSectionComplete(project.id, sectionType)}
                    onSetDueDate={handleSetDueDate}
                    onSetFeedback={handleSetFeedback}
                    onSetScore={handleSetScore}
                    onCompleteProject={handleCompleteProject}
                    canEdit={false}
                    isGuide={true}
                    onUpdate={fetchGuideData}
                  />
                );
              })
            )}
          </div>
        </TabsContent>

        <TabsContent value="requests" className="space-y-4">
          <ProjectRequestsList 
            projectRequests={projectRequests}
            onRequestAction={handleRequestAction}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default GuideDashboard;
