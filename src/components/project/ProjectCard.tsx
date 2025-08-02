
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ChevronDown, ChevronUp, Users, Calendar } from 'lucide-react';
import SectionCard from './SectionCard';

interface ProjectCardProps {
  project: any;
  projectSections: any[];
  onSectionUpdate?: (sectionType: string, content: any, files: File[]) => void;
  onSectionComplete?: (sectionType: string) => void;
  onSetDueDate?: (sectionId: string, dueDate: string) => void;
  onSetFeedback?: (sectionId: string, feedback: string) => void;
  onSetScore?: (sectionId: string, score: number) => void;
  onCompleteProject?: (projectId: string) => void;
  canEdit: boolean;
  isGuide?: boolean;
  onUpdate?: () => void;
}

const ProjectCard: React.FC<ProjectCardProps> = ({
  project,
  projectSections,
  onSectionUpdate,
  onSectionComplete,
  onSetDueDate,
  onSetFeedback,
  onSetScore,
  onCompleteProject,
  canEdit,
  isGuide = false,
  onUpdate
}) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const sectionTypes = [
    {
      type: 'team_information',
      title: 'Team Information',
      description: 'Details about your team members and roles',
      scorable: true
    },
    {
      type: 'project_objectives',
      title: 'Project Objectives',
      description: 'Define your project goals and objectives',
      scorable: true
    },
    {
      type: 'technologies_used',
      title: 'Technologies and Tools Used',
      description: 'List of technologies and tools for your project',
      scorable: true
    },
    {
      type: 'literature_review',
      title: 'Literature Review',
      description: 'Research and references related to your project',
      scorable: true
    },
    {
      type: 'system_design',
      title: 'System Design',
      description: 'System architecture and design documentation',
      scorable: true
    },
    {
      type: 'implementation',
      title: 'Implementation',
      description: 'Implementation details and code documentation',
      scorable: true
    },
    {
      type: 'final_presentation',
      title: 'Final Presentation',
      description: 'Your final project presentation',
      scorable: true
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-500';
      case 'submitted': return 'bg-blue-500';
      case 'overdue': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const handleCompleteProject = () => {
    if (onCompleteProject) {
      onCompleteProject(project.id);
    }
  };

  const getOrCreateSection = (sectionType: string) => {
    return projectSections.find(s => s.section_type === sectionType) || {
      section_type: sectionType,
      content: {},
      files: [],
      status: 'pending'
    };
  };

  return (
    <Card className="mb-6">
      <CardHeader>
        <div className="flex justify-between items-start">
          <div className="flex-1">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-xl">{project.title}</CardTitle>
                <CardDescription className="mt-1">{project.description}</CardDescription>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsExpanded(!isExpanded)}
                className="flex items-center space-x-1"
              >
                {isExpanded ? (
                  <ChevronUp className="h-4 w-4" />
                ) : (
                  <ChevronDown className="h-4 w-4" />
                )}
              </Button>
            </div>
            
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
          </div>
        </div>
      </CardHeader>

      {isExpanded && (
        <CardContent className="space-y-4">
          {/* Guide Actions */}
          {isGuide && (
            <div className="flex justify-end space-x-2 mb-4">
              {project.status === 'active' && (
                <Button onClick={handleCompleteProject} size="sm" className="bg-green-600 hover:bg-green-700">
                  Complete Project
                </Button>
              )}
            </div>
          )}

          {/* Project Sections */}
          <div className="space-y-4">
            {sectionTypes.map((sectionConfig) => {
              const section = getOrCreateSection(sectionConfig.type);
              
              return (
                <SectionCard
                  key={sectionConfig.type}
                  sectionType={sectionConfig.type}
                  title={sectionConfig.title}
                  description={sectionConfig.description}
                  dueDate={section.due_date}
                  content={section.content}
                  files={section.files || []}
                  status={section.status}
                  score={section.score}
                  feedback={section.feedback}
                  onUpdate={onSectionUpdate}
                  onComplete={onSectionComplete}
                  onSetDueDate={onSetDueDate}
                  onSetFeedback={onSetFeedback}
                  onSetScore={onSetScore}
                  canEdit={canEdit}
                  isGuide={isGuide}
                  scorable={sectionConfig.scorable}
                  sectionId={section.id}
                  projectId={project.id}
                />
              );
            })}
          </div>
        </CardContent>
      )}
    </Card>
  );
};

export default ProjectCard;
