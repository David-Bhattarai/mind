
/**
 * MINDCORE NEURAL PERSISTENCE (V-DB 4.0)
 * Simulating a real MongoDB/Atlas instance for Next.js/Node integration.
 * Includes Seed Data for immediate access and Case-Insensitive Collection handling.
 */

export type Collection = 'users' | 'chats' | 'biometrics' | 'games' | 'activities' | 'journals' | 'alerts' | 'transactions';

class NeuralDB {
  private STORAGE_KEY = 'mindcore_cluster_v4';

  private _getStore() {
    try {
      const raw = localStorage.getItem(this.STORAGE_KEY);
      if (raw) return JSON.parse(raw);
    } catch (e) {
      console.error("NeuralDB: Corruption detected. Purging cluster...");
    }

    // SEED INITIAL STORE
    const initialStore = {
      users: [
        { 
          _id: 'id_admin_root', 
          username: 'admin', 
          pin: '1234', 
          role: 'admin', 
          xp: 9999, 
          plan: 'PRO', 
          joinedAt: Date.now() 
        }
      ],
      chats: [],
      biometrics: [],
      games: [],
      activities: [],
      journals: [],
      alerts: [],
      transactions: []
    };
    this._save(initialStore);
    return initialStore;
  }

  private _save(store: any) {
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(store));
    window.dispatchEvent(new CustomEvent('neural_db_sync'));
  }

  // Normalize collection name to lowercase
  private _norm(col: string): string {
    return col.toLowerCase();
  }

  public find(collection: string, query: any = {}) {
    const store = this._getStore();
    const col = this._norm(collection);
    if (!store[col]) return [];
    return store[col].filter((item: any) => 
      Object.keys(query).every(key => item[key] === query[key])
    );
  }

  public findOne(collection: string, query: any) {
    return this.find(collection, query)[0] || null;
  }

  public insert(collection: string, data: any) {
    const store = this._getStore();
    const col = this._norm(collection);
    
    if (!store[col]) {
      store[col] = [];
    }
    
    let processedData = { ...data };
    
    if (col === 'biometrics') {
      const embedding = Array.from({ length: 128 }, () => Math.random().toFixed(6));
      processedData.ml_metadata = {
        neural_embedding: embedding,
        bio_hash: `BIO_${Math.random().toString(16).substr(2, 8).toUpperCase()}`,
        arousal: (Math.random() * 100).toFixed(2),
        valence: (Math.random() * 2 - 1).toFixed(3),
        cognitive_entropy: (Math.random() * 0.4 + 0.1).toFixed(4),
        landmark_confidence: 0.9841,
        model: 'Cortex-Tensor-v4.1'
      };
    }

    const entry = { 
      ...processedData, 
      _id: `id_${Math.random().toString(36).substr(2, 9)}`, 
      createdAt: Date.now() 
    };
    
    store[col].push(entry);
    this._save(store);
    return entry;
  }

  public update(collection: string, query: any, updates: any) {
    const store = this._getStore();
    const col = this._norm(collection);
    if (!store[col]) return;
    
    store[col] = store[col].map((item: any) => 
      Object.keys(query).every(key => item[key] === query[key]) 
        ? { ...item, ...updates, updatedAt: Date.now() } 
        : item
    );
    this._save(store);
  }

  public delete(collection: string, query: any) {
    const store = this._getStore();
    const col = this._norm(collection);
    if (!store[col]) return;
    
    store[col] = store[col].filter((item: any) => 
      !Object.keys(query).every(key => item[key] === query[key])
    );
    this._save(store);
  }

  public getSystemWideStats() {
    const store = this._getStore();
    return {
      users: store.users?.length || 0,
      activities: store.activities?.length || 0,
      chats: store.chats?.length || 0,
      alerts: store.alerts?.length || 0,
      storageUsed: (JSON.stringify(store).length / 1024).toFixed(2)
    };
  }
}

export const db = new NeuralDB();
