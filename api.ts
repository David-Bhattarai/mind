
import { db } from './NeuralDB';

const getSession = () => {
  const data = localStorage.getItem('mindcore_session');
  return data ? JSON.parse(data) : null;
};

const updateLocalSession = (updates: any) => {
  const current = getSession();
  if (current) {
    const updated = { ...current, ...updates };
    localStorage.setItem('mindcore_session', JSON.stringify(updated));
    window.dispatchEvent(new Event('storage'));
  }
};

export const API = {
  auth: {
    login: async (username: string, pin: string) => {
      const user = db.findOne('users', { username, pin });
      if (user) {
        db.update('users', { _id: user._id }, { lastActive: Date.now() });
        return user;
      }
      return null;
    },
    register: async (username: string, pin: string) => {
      const exists = db.findOne('users', { username });
      if (exists) return null;
      return db.insert('users', { username, pin, role: 'user', xp: 0, plan: 'FREE', joinedAt: Date.now() });
    },
    getCurrentUser: () => getSession(),
    logout: () => {
      localStorage.removeItem('mindcore_session');
      window.location.reload();
    }
  },

  diagnostics: {
    checkBackend: async () => {
      // In this Next.js-style app, the "Backend" is the local NeuralDB service
      return { online: true, mode: 'VIRTUAL_NODE', cluster: 'Local' };
    }
  },

  doctors: {
    getAll: async () => {
      return [
        { 
          id: 'dr1', 
          name: 'Dr. Aarav Sharma', 
          specialty: 'Clinical Psychology & CBT', 
          experience: '12 Years', 
          status: 'Online', 
          image: 'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?auto=format&fit=crop&q=80&w=200&h=200',
          rating: 4.9
        },
        { 
          id: 'dr2', 
          name: 'Dr. Ishani Koirala', 
          specialty: 'Anxiety & Stress Management', 
          experience: '8 Years', 
          status: 'Online', 
          image: 'https://images.unsplash.com/photo-1594824476967-48c8b964273f?auto=format&fit=crop&q=80&w=200&h=200',
          rating: 4.8
        }
      ];
    }
  },

  chat: {
    saveMessage: async (message: any) => {
      const user = getSession();
      return db.insert('chats', { ...message, userId: user?._id });
    },
    getHistory: async () => {
      const user = getSession();
      return db.find('chats', { userId: user?._id });
    }
  },

  frontier: {
    logBiometrics: async (data: any) => {
      return db.insert('biometrics', data);
    },
    getCommunityPosts: async () => {
      return [
        { user: 'Suman', text: 'Just finished my meditation. Feeling calm!', time: 'Now' },
        { user: 'Aisha', text: 'Mindcore AI is really helpful for late-night anxiety.', time: '12m ago' },
        { user: 'Bibek', text: 'The Chess game is actually quite hard!', time: '1h ago' }
      ];
    },
    saveJournal: async (text: string) => {
      const user = getSession();
      return db.insert('journals', { userId: user?._id, text });
    },
    getWisdom: async () => {
      return [
        { text: "Peace begins with a smile.", author: "Mother Teresa" },
        { text: "Our life is what our thoughts make it.", author: "Marcus Aurelius" },
        { text: "Breathe in peace, breathe out stress.", author: "Mindcore Guide" }
      ];
    },
    logRoleplay: async (type: string, text: string) => {
      const user = getSession();
      return db.insert('activities', { userId: user?._id, type: 'ROLEPLAY', subType: type, text });
    },
    saveArt: async (mood: string, art: string) => {
      const user = getSession();
      return db.insert('activities', { userId: user?._id, type: 'ART_GEN', mood, art });
    },
    generateRoadmap: async (goal: string) => {
      const user = getSession();
      return db.insert('activities', { userId: user?._id, type: 'ROADMAP', goal });
    },
    syncHabits: async (habits: any) => {
      const user = getSession();
      return db.insert('activities', { userId: user?._id, type: 'HABIT_SYNC', habits });
    }
  },

  games: {
    startSession: async (type: string) => {
      return { data: { session_id: `GAME_${Date.now()}` } };
    },
    logChessMove: async (moveCount: number, board: any) => {
      const user = getSession();
      return db.insert('games', { userId: user?._id, type: 'CHESS', moveCount });
    },
    saveBubbleScore: async (score: number) => {
      const user = getSession();
      return db.insert('games', { userId: user?._id, type: 'BUBBLES', score });
    }
  },

  admin: {
    getSystemData: async () => {
      return {
        stats: db.getStats(),
        users: db.find('users')
      };
    },
    terminateUser: async (userId: string) => {
      db.delete('users', { _id: userId });
      return { success: true };
    }
  },

  analytics: {
    getHealthScore: async () => {
      const user = getSession();
      const activities = db.find('activities', { userId: user?._id });
      return Math.min(100, activities.length * 5 + 65);
    },
    getUsageStats: async (days: number) => {
      const user = getSession();
      const cutoff = Date.now() - (days * 24 * 60 * 60 * 1000);
      const acts = db.find('activities', { userId: user?._id }).filter((a:any) => a.createdAt > cutoff);
      
      return {
        total_events: acts.length,
        curve: Array.from({ length: days }, (_, i) => ({
          time: `Day ${days - i}`,
          count: Math.floor(Math.random() * 10) + 1
        })),
        distribution: [
          { name: 'CHAT', value: db.find('chats', { userId: user?._id }).length },
          { name: 'GAMES', value: db.find('games', { userId: user?._id }).length },
          { name: 'BIOMETRIC', value: db.find('biometrics', { userId: user?._id }).length }
        ]
      };
    }
  },

  modules: {
    quests: {
      getDaily: () => [
        { id: 'q1', task: 'Complete 1 Deep Breathing Session', xp: 20 },
        { id: 'q2', task: 'Log your morning mood', xp: 15 },
        { id: 'q3', task: 'Win a game of Mindful Chess', xp: 50 }
      ],
      complete: async (questId: string, xp: number) => {
        const user = getSession();
        const newXP = (user.xp || 0) + xp;
        db.update('users', { _id: user._id }, { xp: newXP });
        db.insert('activities', { userId: user._id, type: 'QUEST', questId, xp });
        updateLocalSession({ xp: newXP });
        return { status: 200, data: { newXP } };
      }
    }
  },

  payments: {
    init: async (method: string, amount: number) => {
      const user = getSession();
      const tx = db.insert('transactions', { userId: user?._id, method, amount, status: 'PENDING' });
      return { data: { tx_id: tx._id } };
    },
    verify: async (tx_id: string, method: string) => {
      const user = getSession();
      db.update('transactions', { _id: tx_id }, { status: 'SUCCESS' });
      db.update('users', { _id: user._id }, { plan: 'PRO' });
      updateLocalSession({ plan: 'PRO' });
      return { status: 200, data: { status: 'SUCCESS' } };
    }
  },

  neural: {
    trainModel: async () => {
      return { status: 200, message: 'Neural Model Trained locally.' };
    }
  }
};
