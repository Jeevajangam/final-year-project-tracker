
import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Users, BookOpen, Clock, Star, Search, Send, Calendar, CheckCircle, AlertCircle } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

const HODDashboard = () => {
  const { user, userProfile } = useAuth();
  const [projects, setProjects] = useState([]);
  const [guides, setGuides] = useState([]);
  const [students, setStudents] = useState([]);
  const [guideRequests, setGuideRequests] = useState([]);
  const [invitationRequests, setInvitationRequests] = useState([]);
  const [selectedGuide, setSelectedGuide] = useState('');
  const [invitationMessage, setInvitationMessage] = useState('');
  const [guideSearchQuery, setGuideSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchHODData();
      fetchGuides();
      fetchGuideRequests();
      fetchInvitationRequests();
    }
  }, [user]);

  const fetchHODData = async () => {
    try {
      // Fetch all projects in the same department
      const { data: projectsData } = await supabase
        .from('projects')
        .select('*, profiles!projects_guide_id_fkey(*)')
        .eq('department', userProfile?.department || 'Computer Science');

      // Fetch all students in the department
      const { data: studentsData } = await supabase
        .from('profiles')
        .select('*')
        .eq('role', 'student')
        .eq('department', userProfile?.department || 'Computer Science');

      setProjects(projectsData || []);
      setStudents(studentsData || []);
    } catch (error) {
      console.error('Error fetching HOD data:', error);
      toast({
        title: "Error",
        description: "Failed to load dashboard data",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchGuides = async () => {
    try {
      const { data } = await supabase
        .from('profiles')
        .select('*')
        .eq('role', 'guide')
        .eq('department', userProfile?.department || 'Computer Science');
      
      setGuides(data || []);
    } catch (error) {
      console.error('Error fetching guides:', error);
    }
  };

  const fetchGuideRequests = async () => {
    try {
      const { data } = await supabase
        .from('guide_requests')
        .select('*, profiles!guide_requests_guide_id_fkey(name, email)')
        .eq('hod_id', user?.id);
      
      setGuideRequests(data || []);
    } catch (error) {
      console.error('Error fetching guide requests:', error);
    }
  };

  const fetchInvitationRequests = async () => {
    try {
      const { data } = await supabase
        .from('hod_invitations')
        .select('*, profiles!hod_invitations_guide_id_fkey(name, email)')
        .eq('hod_id', user?.id);
      
      setInvitationRequests(data || []);
    } catch (error) {
      console.error('Error fetching invitation requests:', error);
    }
  };

  const handleSendInvitation = async () => {
    if (!selectedGuide || !invitationMessage.trim()) {
      toast({
        title: "Error",
        description: "Please select a guide and enter a message",
        variant: "destructive"
      });
      return;
    }

    try {
      const { error } = await supabase
        .from('hod_invitations')
        .insert({
          hod_id: user?.id,
          guide_id: selectedGuide,
          message: invitationMessage,
          status: 'pending'
        });

      if (error) throw error;

      toast({
        title: "Success",
        description: "Invitation sent successfully"
      });

      setSelectedGuide('');
      setInvitationMessage('');
      fetchInvitationRequests();
    } catch (error) {
      console.error('Error sending invitation:', error);
      toast({
        title: "Error",
        description: "Failed to send invitation",
        variant: "destructive"
      });
    }
  };

  const handleRequestAction = async (requestId: string, action: 'approved' | 'rejected') => {
    try {
      const { error } = await supabase
        .from('guide_requests')
        .update({ status: action })
        .eq('id', requestId);

      if (error) throw error;

      toast({
        title: "Success",
        description: `Request ${action} successfully`
      });

      fetchGuideRequests();
    } catch (error) {
      console.error('Error updating request:', error);
      toast({
        title: "Error",
        description: "Failed to update request",
        variant: "destructive"
      });
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved': case 'completed': return 'bg-green-500';
      case 'rejected': return 'bg-red-500';
      case 'pending': case 'active': return 'bg-blue-500';
      default: return 'bg-gray-500';
    }
  };

  const filteredGuides = guides.filter(guide => 
    guide.name.toLowerCase().includes(guideSearchQuery.toLowerCase()) ||
    guide.email.toLowerCase().includes(guideSearchQuery.toLowerCase())
  );

  if (loading) {
    return <div className="flex items-center justify-center h-screen">Loading...</div>;
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">HOD Dashboard</h1>
          <p className="text-muted-foreground">Welcome, {userProfile?.name}!</p>
        </div>
        <Badge variant="secondary" className="text-sm">
          {userProfile?.department}
        </Badge>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Projects</CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{projects.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Projects</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {projects.filter(p => p.status === 'active').length}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Students</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{students.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Requests</CardTitle>
            <Star className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {guideRequests.filter(r => r.status === 'pending').length}
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="projects" className="space-y-4">
        <TabsList>
          <TabsTrigger value="projects">Projects Overview</TabsTrigger>
          <TabsTrigger value="requests">Guide Requests</TabsTrigger>
          <TabsTrigger value="invitations">Guide Invitations</TabsTrigger>
        </TabsList>

        <TabsContent value="projects" className="space-y-4">
          <div className="grid gap-4">
            {projects.map((project: any) => (
              <Card key={project.id}>
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <CardTitle className="text-xl">{project.title}</CardTitle>
                      <CardDescription className="mt-1">{project.description}</CardDescription>
                      <div className="flex items-center space-x-4 mt-3">
                        <div className="flex items-center space-x-2">
                          <Users className="h-4 w-4" />
                          <span className="text-sm text-muted-foreground">
                            {project.student_ids?.length || 0} students
                          </span>
                        </div>
                        <Badge className={getStatusColor(project.status)}>
                          {project.status}
                        </Badge>
                        {project.deadline && (
                          <div className="flex items-center space-x-1 text-sm text-muted-foreground">
                            <Calendar className="h-4 w-4" />
                            <span>Due: {new Date(project.deadline).toLocaleDateString()}</span>
                          </div>
                        )}
                      </div>
                      {project.profiles && (
                        <p className="text-sm text-muted-foreground mt-2">
                          Guide: {project.profiles.name}
                        </p>
                      )}
                    </div>
                  </div>
                </CardHeader>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="requests" className="space-y-4">
          <div className="grid gap-4">
            {guideRequests.filter(r => r.status === 'pending').length === 0 ? (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-8">
                  <Clock className="h-12 w-12 text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">No pending requests</p>
                </CardContent>
              </Card>
            ) : (
              guideRequests
                .filter(r => r.status === 'pending')
                .map((request) => (
                  <Card key={request.id}>
                    <CardHeader>
                      <div className="flex justify-between items-start">
                        <div>
                          <CardTitle className="text-lg">
                            Request from {request.profiles?.name || 'Guide'}
                          </CardTitle>
                          <CardDescription>{request.profiles?.email}</CardDescription>
                          <p className="mt-2 text-sm">{request.message}</p>
                        </div>
                        <Badge className={getStatusColor(request.status)}>
                          {request.status}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-muted-foreground">
                          Submitted: {new Date(request.created_at).toLocaleDateString()}
                        </span>
                        <div className="space-x-2">
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => handleRequestAction(request.id, 'rejected')}
                          >
                            Reject
                          </Button>
                          <Button 
                            size="sm"
                            onClick={() => handleRequestAction(request.id, 'approved')}
                          >
                            Approve
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
            )}
          </div>
        </TabsContent>

        <TabsContent value="invitations" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Invite Guide to Collaborate</CardTitle>
              <CardDescription>Send an invitation to a guide to work under your guidance</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium">Select Guide</label>
                <div className="mt-1 space-y-2">
                  <div className="relative">
                    <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search guides by name or email..."
                      value={guideSearchQuery}
                      onChange={(e) => setGuideSearchQuery(e.target.value)}
                      className="pl-8"
                    />
                  </div>
                  <div className="max-h-40 overflow-y-auto border rounded-md">
                    {filteredGuides.map((guide) => (
                      <div
                        key={guide.id}
                        className={`p-2 cursor-pointer hover:bg-gray-50 ${
                          selectedGuide === guide.id ? 'bg-blue-50 border-blue-200' : ''
                        }`}
                        onClick={() => setSelectedGuide(guide.id)}
                      >
                        <div className="font-medium">{guide.name}</div>
                        <div className="text-sm text-gray-500">{guide.email}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              
              <div>
                <label className="text-sm font-medium">Invitation Message</label>
                <Textarea
                  placeholder="Explain the collaboration opportunity and expectations..."
                  value={invitationMessage}
                  onChange={(e) => setInvitationMessage(e.target.value)}
                  className="mt-1"
                  rows={4}
                />
              </div>
              
              <Button 
                onClick={handleSendInvitation}
                className="w-full bg-slate-800 hover:bg-slate-700"
                disabled={!selectedGuide || !invitationMessage.trim()}
              >
                <Send className="h-4 w-4 mr-2" />
                Send Invitation
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Your Invitations</CardTitle>
              <CardDescription>Track invitations sent to guides</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {invitationRequests.length === 0 ? (
                  <p className="text-muted-foreground text-center py-4">No invitations sent yet</p>
                ) : (
                  invitationRequests.map((invitation) => (
                    <Card key={invitation.id} className="border-l-4 border-l-blue-500">
                      <CardHeader className="pb-2">
                        <div className="flex justify-between items-start">
                          <div>
                            <CardTitle className="text-base">
                              Invitation to {invitation.profiles?.name || 'Guide'}
                            </CardTitle>
                            <CardDescription className="text-sm">
                              {invitation.profiles?.email}
                            </CardDescription>
                          </div>
                          <Badge 
                            className={
                              invitation.status === 'approved' ? 'bg-green-500' :
                              invitation.status === 'rejected' ? 'bg-red-500' : 'bg-yellow-500'
                            }
                          >
                            {invitation.status}
                          </Badge>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <p className="text-sm text-gray-600 mb-2">{invitation.message}</p>
                        <p className="text-xs text-muted-foreground">
                          Sent: {new Date(invitation.created_at).toLocaleDateString()}
                        </p>
                      </CardContent>
                    </Card>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default HODDashboard;
