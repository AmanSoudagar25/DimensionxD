import React, { useState } from 'react';
import { Navbar } from './components/Navbar';
import { NewProjectCard } from './components/NewProjectCard';
import { ProjectCard } from './components/ProjectCard';
import { CreateProjectModal } from './components/CreateProjectModal';
import { Workspace } from './components/Workspace';
import { Project, ProjectStatus, User } from './types';
import { Filter } from 'lucide-react';

// Mock Data
const CURRENT_USER: User = {
  name: "Alex Morgan",
  avatarUrl: "https://picsum.photos/200"
};

const INITIAL_PROJECTS: Project[] = [
  {
    id: '1',
    name: 'Modern Loft Renovation',
    roomType: 'Living Room',
    lastEdited: '2 hours ago',
    status: ProjectStatus.Active,
  },
  {
    id: '2',
    name: 'Seaside Villa',
    roomType: 'Master Bedroom',
    lastEdited: '1 day ago',
    status: ProjectStatus.Pending,
  },
  {
    id: '3',
    name: 'Corporate Office HQ',
    roomType: 'Open Plan Office',
    lastEdited: '3 days ago',
    status: ProjectStatus.Active,
  },
  {
    id: '4',
    name: 'Mountain Cabin',
    roomType: 'Kitchen & Dining',
    lastEdited: '1 week ago',
    status: ProjectStatus.Draft,
  },
  {
    id: '5',
    name: 'Urban Coffee Shop',
    roomType: 'Commercial',
    lastEdited: '2 weeks ago',
    status: ProjectStatus.Archived,
  },
  {
    id: '6',
    name: 'Minimalist Studio',
    roomType: 'Apartment',
    lastEdited: '1 month ago',
    status: ProjectStatus.Draft,
  }
];

type ViewState = 'dashboard' | 'workspace';

const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<ViewState>('dashboard');
  const [activeProject, setActiveProject] = useState<Project | null>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [projects, setProjects] = useState<Project[]>(INITIAL_PROJECTS);
  const [isNewProject, setIsNewProject] = useState(false);

  const handleProjectCreate = (projectData: any) => {
    const newProject: Project = {
      id: Date.now().toString(),
      name: projectData.name,
      roomType: projectData.roomType,
      lastEdited: 'Just now',
      status: ProjectStatus.Active,
    };
    
    setProjects([newProject, ...projects]);
    setIsCreateModalOpen(false);
    
    // Automatically open the workspace for the new project
    // and flag it as new to trigger analysis
    setIsNewProject(true);
    setActiveProject(newProject);
    setCurrentView('workspace');
  };

  const handleOpenProject = (project: Project) => {
    setIsNewProject(false);
    setActiveProject(project);
    setCurrentView('workspace');
  };

  const handleBackToDashboard = () => {
    setCurrentView('dashboard');
    setActiveProject(null);
    setIsNewProject(false);
  };

  if (currentView === 'workspace' && activeProject) {
    return (
      <Workspace 
        project={activeProject} 
        onBack={handleBackToDashboard} 
        isNewProject={isNewProject}
      />
    );
  }

  return (
    <div className="min-h-screen bg-background text-textMain pb-20">
      <Navbar user={CURRENT_USER} />
      
      <main className="max-w-7xl mx-auto px-6 py-10">
        <NewProjectCard onCreateClick={() => setIsCreateModalOpen(true)} />

        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-medium text-white">Recent Projects</h3>
          <button className="flex items-center gap-2 text-sm text-textMuted hover:text-white transition-colors">
            <Filter size={16} />
            <span>Filter</span>
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {projects.map((project) => (
            <ProjectCard 
              key={project.id} 
              project={project} 
              onClick={handleOpenProject}
            />
          ))}
        </div>
      </main>

      <CreateProjectModal 
        isOpen={isCreateModalOpen} 
        onClose={() => setIsCreateModalOpen(false)}
        onProjectCreated={handleProjectCreate}
      />
    </div>
  );
};

export default App;