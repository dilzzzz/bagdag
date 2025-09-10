export enum AppView {
  Coach = 'Coach',
  InstructionalContent = 'InstructionalContent',
  ShotTracker = 'ShotTracker',
  FindCourses = 'FindCourses',
  HoleDesigner = 'HoleDesigner',
  Community = 'Community',
}

export enum MessageAuthor {
  User = 'user',
  AI = 'ai',
}

export interface ChatMessage {
  author: MessageAuthor;
  text: string;
  image?: string; // for user uploaded image
}

export interface GolfCourse {
  name: string;
  description: string;
  features: string[];
}

export interface Shot {
  id: number;
  club: string;
  distance: number;
  result: string;
  date: Date;
}
