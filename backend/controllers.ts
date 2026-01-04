
import { db } from './database';

export const AuthController = {
  login: (body: any) => {
    const user = db.findOne('users', { username: body.username, pin: body.pin });
    if (!user) return { status: 401, message: 'Invalid Credentials' };
    db.update('users', { _id: user._id }, { lastActive: Date.now() });
    return { status: 200, data: user };
  },
  register: (body: any) => {
    const exists = db.findOne('users', { username: body.username });
    if (exists) return { status: 400, message: 'User already exists' };
    const user = db.insert('users', { 
      ...body, 
      role: body.username === 'admin' ? 'admin' : 'user', 
      xp: 0, 
      plan: 'FREE',
      joinedAt: Date.now() 
    });
    return { status: 201, data: user };
  }
};

export const QuestController = {
  complete: (userId: string, questId: string, xp: number) => {
    const user = db.findOne('users', { _id: userId });
    if (!user) return { status: 404 };
    const newXP = (user.xp || 0) + xp;
    db.update('users', { _id: userId }, { xp: newXP });
    db.insert('activities', { userId, type: 'QUEST_COMPLETE', questId, xp });
    return { status: 200, data: { newXP } };
  }
};

export const PaymentController = {
  process: (userId: string, plan: string, amount: number) => {
    const tx = db.insert('transactions', { userId, plan, amount, status: 'SUCCESS' });
    db.update('users', { _id: userId }, { plan });
    return { status: 200, data: { tx, plan } };
  },
  // Added: init and verify methods for mock payment flow
  init: (userId: string, method: string, amount: number) => {
    const tx = db.insert('transactions', { userId, method, amount, status: 'PENDING' });
    return { status: 200, data: { tx_id: tx._id } };
  },
  verify: (userId: string, tx_id: string, method: string) => {
    db.update('transactions', { _id: tx_id }, { status: 'SUCCESS' });
    return { status: 200, data: { tx_id, status: 'SUCCESS' } };
  }
};

export const CrisisController = {
  triggerAlert: (userId: string, level: string) => {
    const alert = db.insert('alerts', { userId, level, timestamp: Date.now() });
    db.insert('activities', { userId, type: 'CRISIS_ALERT', level });
    return { status: 201, data: alert };
  }
};

export const AdminController = {
  getAllData: () => {
    const stats = db.getSystemWideStats();
    const users = db.find('users');
    const logs = db.find('activities').slice(-100);
    return { status: 200, data: { stats, users, logs } };
  },
  deleteUser: (userId: string) => {
    db.delete('users', { _id: userId });
    return { status: 200, message: 'User Terminated' };
  }
};

export const GameController = {
  saveChessSession: (userId: string, moves: number) => {
    db.insert('games', { userId, type: 'CHESS', moves });
    const user = db.findOne('users', { _id: userId });
    if (user) db.update('users', { _id: userId }, { xp: (user.xp || 0) + 10 });
    return { status: 201 };
  },
  // Added: startSession, logChessMove, and saveBubbleScore implementations
  startSession: (type: string) => {
    return { status: 200, data: { session_id: `GAME_${Date.now()}` } };
  },
  logChessMove: (userId: string, moveCount: number, board: any) => {
    db.insert('activities', { userId, type: 'CHESS_MOVE', moveCount });
    return { status: 201 };
  },
  saveBubbleScore: (userId: string, score: number) => {
    db.insert('games', { userId, type: 'BUBBLES', score });
    return { status: 201 };
  }
};

export const AnalyticsController = {
  getUserMetrics: (userId: string, days: number = 7) => {
    const activities = db.find('activities', { userId });
    const chats = db.find('chats', { userId });
    const user = db.findOne('users', { _id: userId });

    return {
      status: 200,
      data: {
        total_events: activities.length + chats.length,
        xp: user?.xp || 0,
        plan: user?.plan || 'FREE',
        curve: Array.from({ length: days }, (_, i) => ({
          time: `Day ${days - i}`,
          count: Math.floor(Math.random() * 20)
        })),
        distribution: [
          { name: 'CHAT', value: chats.length },
          { name: 'GAMES', value: db.find('games', { userId }).length },
          { name: 'BIOMETRIC', value: db.find('biometrics', { userId }).length }
        ]
      }
    };
  }
};

// Added: ChatController for chat persistence
export const ChatController = {
  saveMessage: (body: any) => {
    const chat = db.insert('chats', body);
    return { status: 201, data: chat };
  },
  getHistory: (userId: string) => {
    const history = db.find('chats', { userId });
    return { status: 200, data: history };
  }
};

// Added: NeuralController for training model mock
export const NeuralController = {
  trainModel: () => {
    return { status: 200, message: 'Neural Model Trained' };
  }
};

// Added: FrontierController for mental health modules
export const FrontierController = {
  logBiometrics: (body: any) => {
    const bio = db.insert('biometrics', body);
    return { status: 201, data: bio };
  },
  getCommunityPosts: () => {
    const posts = [
      { user: 'Suman', text: 'Refreshing feel vayo!', time: 'Now' },
      { user: 'Aisha', text: 'Neural OS v9 is fast.', time: '1m' }
    ];
    return { status: 200, data: posts };
  },
  logRoleplay: (userId: string, type: string, text: string) => {
    db.insert('activities', { userId, type: 'ROLEPLAY', subType: type, text });
    return { status: 201 };
  },
  saveJournal: (userId: string, text: string) => {
    db.insert('journals', { userId, text });
    return { status: 201 };
  },
  saveArt: (userId: string, mood: string, art: string) => {
    db.insert('biometrics', { userId, type: 'ART', mood, art });
    return { status: 201 };
  },
  generateRoadmap: (userId: string, goal: string) => {
    db.insert('activities', { userId, type: 'ROADMAP', goal });
    return { status: 201 };
  },
  syncHabits: (userId: string, habits: any) => {
    db.insert('activities', { userId, type: 'HABITS', habits });
    return { status: 201 };
  },
  getWisdom: () => {
    const wisdom = [
      { text: "Breathe in peace.", author: "Dr. Mindcore" },
      { text: "Progress is key.", author: "Clinical Agent" }
    ];
    return { status: 200, data: wisdom };
  }
};
