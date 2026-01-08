export enum ProjectStatus {
  Active = 'Active',
  Archived = 'Archived',
  Pending = 'Pending',
  Draft = 'Draft'
}

export interface Project {
  id: string;
  name: string;
  roomType: string;
  lastEdited: string;
  status: ProjectStatus;
  thumbnailUrl?: string;
}

export interface User {
  name: string;
  avatarUrl: string;
}