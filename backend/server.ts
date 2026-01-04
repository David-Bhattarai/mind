
import * as Controllers from './controllers';

export const Server = {
  async handleRequest(method: string, url: string, body?: any) {
    const startTime = performance.now();
    let response: any = { status: 404, message: 'Resource Not Found' };

    try {
      const urlParts = url.split('?');
      const path = urlParts[0];
      const searchParams = new URLSearchParams(urlParts[1] || '');

      // Auth
      if (path === '/api/auth/login') response = Controllers.AuthController.login(body);
      else if (path === '/api/auth/register') response = Controllers.AuthController.register(body);
      
      // Quests & XP
      else if (path === '/api/v1/quests/complete') response = Controllers.QuestController.complete(body.userId, body.questId, body.xp);
      
      // Payments
      else if (path === '/api/v1/payments/upgrade') response = Controllers.PaymentController.process(body.userId, body.plan, body.amount);
      else if (path === '/api/v1/payments/init') response = Controllers.PaymentController.init(body.userId, body.method, body.amount);
      else if (path === '/api/v1/payments/verify') response = Controllers.PaymentController.verify(body.userId, body.tx_id, body.method);
      
      // Crisis
      else if (path === '/api/v1/crisis/alert') response = Controllers.CrisisController.triggerAlert(body.userId, body.level);
      
      // Games
      else if (path === '/api/v1/games/chess') response = Controllers.GameController.saveChessSession(body.userId, body.moves);
      else if (path === '/api/v1/games/session/start') response = Controllers.GameController.startSession(body.type);
      else if (path === '/api/v1/games/chess/move') response = Controllers.GameController.logChessMove(body.userId, body.moveCount, body.board);
      else if (path === '/api/v1/games/bubbles/score') response = Controllers.GameController.saveBubbleScore(body.userId, body.score);
      
      // Analytics
      else if (path.startsWith('/api/v1/analytics/usage')) {
        const userId = searchParams.get('userId');
        const days = searchParams.get('days');
        response = Controllers.AnalyticsController.getUserMetrics(userId || 'anon', days ? parseInt(days) : 14);
      }

      // Admin
      else if (path === '/api/admin/data') response = Controllers.AdminController.getAllData();
      else if (path.startsWith('/api/admin/users') && method === 'DELETE') {
        const userId = searchParams.get('id');
        response = Controllers.AdminController.deleteUser(userId || '');
      }

      // Chats
      else if (path === '/api/v1/chats' && method === 'POST') response = Controllers.ChatController.saveMessage(body);
      else if (path.startsWith('/api/v1/chats/history')) {
        const userId = searchParams.get('userId');
        response = Controllers.ChatController.getHistory(userId || 'anon');
      }

      // Frontier & Biometrics
      else if (path === '/api/v1/biometrics/process') response = Controllers.FrontierController.logBiometrics(body);
      else if (path === '/api/v1/frontier/community') response = Controllers.FrontierController.getCommunityPosts();
      else if (path === '/api/v1/frontier/roleplay') response = Controllers.FrontierController.logRoleplay(body.userId, body.type, body.text);
      else if (path === '/api/v1/frontier/journal') response = Controllers.FrontierController.saveJournal(body.userId, body.text);
      else if (path === '/api/v1/frontier/art') response = Controllers.FrontierController.saveArt(body.userId, body.mood, body.art);
      else if (path === '/api/v1/frontier/roadmap') response = Controllers.FrontierController.generateRoadmap(body.userId, body.goal);
      else if (path === '/api/v1/frontier/habits') response = Controllers.FrontierController.syncHabits(body.userId, body.habits);
      else if (path === '/api/v1/frontier/wisdom') response = Controllers.FrontierController.getWisdom();

      // Neural
      else if (path === '/api/v1/neural/train') response = Controllers.NeuralController.trainModel();

    } catch (err) {
      response = { status: 500, message: 'Internal Server Error' };
    }

    const latency = Math.round(performance.now() - startTime);
    return { ...response, latency };
  }
};
