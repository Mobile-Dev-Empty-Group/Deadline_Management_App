import type { Challenge, FeaturedTask, HomeTab, HomeTabId, QuickAction, Task } from './types';

export const homeTabs: HomeTab[] = [
  { id: 'inProgress', label: 'In Progress' },
  { id: 'weekly', label: 'Weekly Task' },
  { id: 'daily', label: 'Daily Task' },
  { id: 'team', label: 'Team Task' },
];

export const featuredTask: FeaturedTask = {
  title: 'Design for dashboard project management',
  description: 'Morning Task',
  date: 'Oct 10, 2025',
  duration: '4 Hours',
  breakTime: '20 min break',
  progress: 80,
};

export const challenge: Challenge = {
  title: 'Daily Challenge',
  description: "Today’s challenge: Complete your top 3 tasks to start the day strong!",
  ctaLabel: 'Done',
};

export const quickActions: QuickAction[] = [
  { id: 'schedule', label: 'Schedule', icon: 'calendar', accent: '#FFE1E0' },
  { id: 'bookmark', label: 'Bookmark', icon: 'bookmark', accent: '#E1F0FF' },
  { id: 'team', label: 'Team Sync', icon: 'users', accent: '#E8E1FF' },
];

const createTask = (partial: Task): Task => partial;

export const tasksByTab: Record<HomeTabId, Task[]> = {
  inProgress: [
    createTask({
      id: 'ip-1',
      title: 'Wireframe for E commerce',
      time: '10:00AM – 12:00AM',
      completed: false,
      tag: 'UI',
      tagColor: '#FECACA',
    }),
    createTask({
      id: 'ip-2',
      title: 'High Fidelity for onboarding feature',
      time: '01:00PM – 03:30PM',
      completed: false,
      tag: 'UX',
      tagColor: '#C7D2FE',
    }),
  ],
  weekly: [
    createTask({
      id: 'wk-1',
      title: 'Sprint planning deck',
      time: 'Tuesday · 02:00PM',
      tag: 'Planning',
      tagColor: '#D1FAE5',
    }),
    createTask({
      id: 'wk-2',
      title: 'Partner review sync',
      time: 'Thursday · 09:30AM',
      tag: 'Meeting',
      tagColor: '#FCD34D',
    }),
  ],
  daily: [
    createTask({
      id: 'dy-1',
      title: 'Customer feedback digest',
      time: '08:30AM – 09:00AM',
      completed: true,
      tag: 'Research',
      tagColor: '#FBCFE8',
    }),
    createTask({
      id: 'dy-2',
      title: 'Team standup',
      time: '09:15AM – 09:30AM',
      completed: true,
      tag: 'Team',
      tagColor: '#BBF7D0',
    }),
    createTask({
      id: 'dy-3',
      title: 'Design QA with engineers',
      time: '04:00PM – 05:00PM',
      completed: false,
      tag: 'QA',
      tagColor: '#FEEBC8',
    }),
  ],
  team: [
    createTask({
      id: 'tm-1',
      title: 'Retro board prep',
      time: 'Tomorrow · 11:00AM',
      tag: 'Team',
      tagColor: '#E0F2FE',
    }),
    createTask({
      id: 'tm-2',
      title: 'Hiring sync',
      time: 'Friday · 04:00PM',
      tag: 'Ops',
      tagColor: '#FDE68A',
    }),
  ],
};

