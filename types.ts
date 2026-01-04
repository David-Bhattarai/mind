
export enum MoodType {
  HAPPY = 'Happy',
  CALM = 'Calm',
  SAD = 'Sad',
  ANXIOUS = 'Anxious',
  STRESSED = 'Stressed',
  ANGRY = 'Angry'
}

export interface Message {
  id: string;
  role: 'user' | 'model';
  content: string;
  timestamp: number;
}

export interface User {
  id: string;
  username: string;
  password?: string;
  role: 'user' | 'admin';
  joinedAt: number;
  lastActive: number;
  plan: 'FREE' | 'PRO';
  xp: number;
}

export interface Doctor {
  id: string;
  name: string;
  specialty: string;
  experience: string;
  status: 'Online' | 'Offline';
  image: string;
  rating: number;
}

export interface UserSession {
  id: string;
  moodHistory: { date: string; mood: MoodType; intensity: number }[];
  lastSessionDate: string;
  username: string;
}

export interface MindfulnessActivity {
  id: string;
  title: string;
  description: string;
  duration: string;
  icon: string;
  category: 'Breathing' | 'Focus' | 'Movement';
}
