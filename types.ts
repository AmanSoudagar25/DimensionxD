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

export interface RenderNode {
  id: string;
  imageUrl: string;
  position: { x: number; y: number };
  settings: { lighting: string; style: string }; // The prompt data
  isSaved: boolean;
  
  // UI specific fields
  title: string;
  timestamp: string;
}

export interface BOQItem {
  name: string;
  brand: string;
  price: string;
  commission: string;
  img: string;
  sponsored?: boolean;
}

export interface RoomSettings {
  viewpoint: string;
  lens: string;
  angle: string;
  lightingScenario: string;
  mood: string;
  style: string;
  creativity: number;
  excludePrompt: string;
}

export interface ProjectData {
  renders: RenderNode[];
  boq: BOQItem[];
  roomSettings: RoomSettings;
}