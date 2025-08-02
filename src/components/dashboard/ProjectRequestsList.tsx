
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { MessageSquare } from 'lucide-react';

interface ProjectRequest {
  id: string;
  project_title: string;
  project_description: string;
  status: string;
  created_at: string;
}

interface ProjectRequestsListProps {
  projectRequests: ProjectRequest[];
  onRequestAction: (requestId: string, action: 'approve' | 'reject') => void;
}

const ProjectRequestsList: React.FC<ProjectRequestsListProps> = ({
  projectRequests,
  onRequestAction
}) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved': return 'bg-green-500';
      case 'rejected': return 'bg-red-500';
      case 'pending': return 'bg-yellow-500';
      default: return 'bg-gray-500';
    }
  };

  return (
    <div className="grid gap-4">
      {projectRequests.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-8">
            <MessageSquare className="h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-muted-foreground">No project requests</p>
          </CardContent>
        </Card>
      ) : (
        projectRequests.map((request: ProjectRequest) => (
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
              <div className="flex justify-between items-center">
                <p className="text-sm text-muted-foreground">
                  Submitted: {new Date(request.created_at).toLocaleDateString()}
                </p>
                {request.status === 'pending' && (
                  <div className="flex space-x-2">
                    <Button 
                      size="sm" 
                      onClick={() => onRequestAction(request.id, 'approve')}
                      className="bg-green-600 hover:bg-green-700"
                    >
                      Approve
                    </Button>
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => onRequestAction(request.id, 'reject')}
                    >
                      Reject
                    </Button>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        ))
      )}
    </div>
  );
};

export default ProjectRequestsList;
