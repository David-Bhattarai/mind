
/**
 * MINDCORE NEURAL BRIDGE v10.3 (ANALYTICS_CORE)
 * Telemetry and activity tracking integrated into the virtual Python node.
 */
import { db } from './NeuralDB';

type Request = { 
  method: 'GET' | 'POST' | 'PUT' | 'DELETE'; 
  url: string; 
  body?: any; 
  headers?: any 
};

type Response = { 
  status: number; 
  data: any; 
  message: string;
  latency: number;
  source: 'REMOTE_API' | 'LOCAL_SIMULATED' | 'OFFLINE_CACHE' | 'ERROR';
  node_info: string;
};

class NeuralBridge {
  private remoteUrl: string | null = localStorage.getItem('mindcore_remote_url');
  private isRemoteEnabled: boolean = localStorage.getItem('mindcore_remote_enabled') === 'true';

  private log(message: string, type: 'info' | 'error' | 'success' = 'info') {
    const time = new Date().toLocaleTimeString();
    const entry = `[${time}] ${type.toUpperCase()}: ${message}`;
    window.dispatchEvent(new CustomEvent('backend_log', { detail: entry }));
  }

  public setRemoteConfig(url: string, enabled: boolean) {
    this.remoteUrl = url.replace(/\/$/, "");
    this.isRemoteEnabled = enabled;
    localStorage.setItem('mindcore_remote_url', this.remoteUrl);
    localStorage.setItem('mindcore_remote_enabled', String(enabled));
    this.log(`Node config updated: ${this.remoteUrl}`, 'info');
  }

  public getRemoteConfig() {
    return { url: this.remoteUrl, enabled: this.isRemoteEnabled };
  }

  public async request(req: Request): Promise<Response> {
    const start = performance.now();
    
    if (this.isRemoteEnabled && this.remoteUrl) {
      try {
        const fullUrl = `${this.remoteUrl}${req.url}`;
        const response = await fetch(fullUrl, {
          method: req.method,
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('mindcore_v7_token') || ''}`,
            ...req.headers
          },
          body: req.method !== 'GET' ? JSON.stringify(req.body) : undefined
        });

        const data = await response.json();
        const latency = Math.round(performance.now() - start);
        this.log(`REMOTE: ${req.url} [${response.status}]`, 'success');
        
        return { 
          status: response.status, 
          data, 
          message: 'SUCCESS', 
          latency,
          source: 'REMOTE_API',
          node_info: this.remoteUrl.includes('8000') ? 'Django_Engine' : 'Flask_Engine'
        };
      } catch (err: any) {
        this.log(`REMOTE_FAIL: ${err.message}. Falling back...`, 'error');
      }
    }

    try {
      let data: any = null;
      let status = 200;

      // --- ANALYTICS ROUTES ---
      if (req.url === '/api/v1/analytics/log') {
        data = db.insert('ACTIVITY', req.body);
        this.log(`TELEMETRY: Logged ${req.body.category} action`, 'info');
      }
      else if (req.url.startsWith('/api/v1/analytics/usage')) {
        const urlObj = new URL(req.url, 'http://dummy.com');
        const days = parseInt(urlObj.searchParams.get('days') || '14');
        data = db.get_usage_stats(days);
        this.log(`ANALYTICS: Computing matrix for last ${days} days`, 'success');
      }

      // --- GAME MODULE ROUTING ---
      else if (req.url === '/api/v1/games/chess/move') {
        const { moveCount } = req.body;
        const stability = Math.max(0, 100 - (moveCount * 0.5));
        data = db.insert('QUEST', { sub_type: 'CHESS_STRATEGY', ...req.body, calculated_stability: stability });
        this.log(`CHESS_NODE: Move ${moveCount} validated. Stability: ${stability}%`, 'success');
      }
      else if (req.url === '/api/v1/games/bubbles/score') {
        const { score } = req.body;
        const stressReduction = Math.min(100, score * 1.5);
        data = db.insert('BIOMETRIC', { sub_type: 'STRESS_REDUCTION_GAME', ...req.body, stress_reduction: stressReduction });
        this.log(`SENSORY_NODE: Score ${score} saved. Stress reduced by ${stressReduction}%`, 'success');
      }
      else if (req.url === '/api/v1/games/session/start') {
        data = { session_id: `GAME_${Date.now()}`, node: 'Game_Engine_v1' };
      }
      // --- CORE ROUTES ---
      else if (req.url === '/api/auth/login') {
        data = db.authenticate(req.body.username, req.body.pin);
        if (!data) status = 401;
      } 
      else if (req.url === '/api/auth/register') {
        data = db.register(req.body.username, req.body.pin);
        status = 201;
      }
      else if (req.url === '/api/v1/frontier/journal') {
        data = db.insert('CHAT', { sub_type: 'JOURNAL', ...req.body });
      }
      else if (req.url === '/api/v1/frontier/art') {
        data = db.insert('BIOMETRIC', { sub_type: 'ART_THERAPY', ...req.body });
      }
      else if (req.url === '/api/v1/frontier/roadmap') {
        data = db.insert('QUEST', { sub_type: 'ROADMAP', ...req.body });
      }
      else if (req.url === '/api/v1/frontier/roleplay') {
        data = db.insert('ACTIVITY', { sub_type: 'ROLEPLAY', ...req.body });
        this.log(`FRONTIER: Roleplay session logged`, 'success');
      }
      else if (req.url === '/api/v1/frontier/habits') {
        data = db.insert('ACTIVITY', { sub_type: 'HABIT_SYNC', ...req.body });
        this.log(`FRONTIER: Habits synchronized`, 'success');
      }
      else if (req.url.startsWith('/api/v1/analytics/trends')) {
        data = db.aggregate_trends(14);
      }
      else if (req.url === '/api/v1/payments/init') {
        data = { tx_id: `TX_${Date.now()}`, status: 'PENDING' };
        this.log(`PAYMENT: Transaction initialized: ${data.tx_id}`, 'info');
      }
      else if (req.url === '/api/v1/payments/verify') {
        data = { tx_id: req.body.tx_id, status: 'SUCCESS' };
        this.log(`PAYMENT: Transaction verified: ${data.tx_id}`, 'success');
      }
      else if (req.url === '/api/v1/frontier/community') {
        data = [
          { user: 'Suman', text: 'Refreshing feel vayo!', time: 'Now' },
          { user: 'Aisha', text: 'Neural OS v9 is fast.', time: '1m' }
        ];
      }
      else if (req.url === '/api/v1/frontier/wisdom') {
        data = [
          { text: "Breathe in peace.", author: "Dr. Mindcore" },
          { text: "Progress is key.", author: "Clinical Agent" }
        ];
      }
      else if (req.url === '/api/v1/neural/train') {
        data = { status: 'SUCCESS', accuracy: 0.998 };
        this.log(`NEURAL: Training kernel complete. Accuracy: 99.8%`, 'success');
      }
      else if (req.url === '/api/v1/biometrics/process') {
        data = db.insert('BIOMETRIC', req.body);
        this.log(`BIOMETRICS: Processed facial landmarks`, 'success');
      }

      const latency = Math.round(performance.now() - start);
      return { status, data, message: 'OK', latency, source: 'LOCAL_SIMULATED', node_info: 'Fast_Bridge' };
    } catch (e: any) {
      return { status: 500, data: null, message: 'CRASH', latency: 0, source: 'ERROR', node_info: 'OFFLINE' };
    }
  }
}

export const Server = new NeuralBridge();
