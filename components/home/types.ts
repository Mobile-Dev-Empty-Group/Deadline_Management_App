export type HomeTabId = 'inProgress' | 'weekly' | 'daily' | 'team';

export type HomeTab = {
  id: HomeTabId;
  label: string;
};

export type Task = {
  id: string;
  title: string;
  time: string;
  completed?: boolean;
  tag?: string;
  tagColor?: string;
};

export type FeaturedTask = {
  title: string;
  description: string;
  date: string;
  duration: string;
  breakTime: string;
  progress: number;
};

export type Challenge = {
  title: string;
  description: string;
  ctaLabel: string;
};

export type QuickAction = {
  id: string;
  label: string;
  icon: 'bookmark' | 'briefcase' | 'users' | 'star' | 'calendar' | 'plus';
  accent: string;
};

