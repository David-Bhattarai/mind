import React, { useState, useEffect } from 'react';
// Added Zap to the import list from lucide-react
import { RotateCcw, Brain, Sparkles, ChevronRight, Info, Award, Loader2, Zap } from 'lucide-react';
import { API } from '../api';

type Piece = string | null;
type Board = Piece[][];

const INITIAL_BOARD: Board = [
  ['♜', '♞', '♝', '♛', '♚', '♝', '♞', '♜'],
  ['♟', '♟', '♟', '♟', '♟', '♟', '♟', '♟'],
  Array(8).fill(null),
  Array(8).fill(null),
  Array(8).fill(null),
  Array(8).fill(null),
  ['♙', '♙', '♙', '♙', '♙', '♙', '♙', '♙'],
  ['♖', '♘', '♗', '♕', '♔', '♗', '♘', '♖'],
];

const ChessGame: React.FC = () => {
  const [board, setBoard] = useState<Board>(INITIAL_BOARD);
  const [selected, setSelected] = useState<[number, number] | null>(null);
  const [turn, setTurn] = useState<'white' | 'black'>('white');
  const [moveCount, setMoveCount] = useState(0);
  const [isSyncing, setIsSyncing] = useState(false);
  const [session, setSession] = useState<any>(null);

  useEffect(() => {
    const start = async () => {
      const res = await API.games.startSession('Chess');
      setSession(res.data);
    };
    start();
  }, []);

  const handleSquareClick = async (row: number, col: number) => {
    if (isSyncing) return;

    if (selected) {
      const [sRow, sCol] = selected;
      if (sRow === row && sCol === col) {
        setSelected(null);
        return;
      }
      
      const sourcePiece = board[sRow][sCol];
      if (sourcePiece) {
        setIsSyncing(true);
        const newBoard = board.map(r => [...r]);
        newBoard[row][col] = sourcePiece;
        newBoard[sRow][sCol] = null;
        
        const newMoveCount = moveCount + 1;
        
        // SYNC MOVE TO PYTHON BACKEND
        await API.games.logChessMove(newMoveCount, newBoard);
        
        setBoard(newBoard);
        setSelected(null);
        setTurn(turn === 'white' ? 'black' : 'white');
        setMoveCount(newMoveCount);
        setIsSyncing(false);
      }
    } else {
      if (board[row][col]) {
        setSelected([row, col]);
      }
    }
  };

  const resetGame = () => {
    setBoard(INITIAL_BOARD);
    setSelected(null);
    setTurn('white');
    setMoveCount(0);
  };

  return (
    <div className="animate-in fade-in duration-700 max-w-5xl mx-auto">
      <div className="mb-12 text-center lg:text-left flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex items-center gap-4">
           <div className="p-4 bg-slate-900 text-white rounded-[1.5rem] shadow-2xl relative">
              <Brain className="w-8 h-8" />
              {isSyncing && <div className="absolute -top-1 -right-1 w-4 h-4 bg-emerald-500 rounded-full border-4 border-slate-900 animate-pulse" />}
           </div>
           <div>
              <p className="text-indigo-600 font-black text-[10px] uppercase tracking-[0.4em]">Strategic Mindfulness</p>
              <h1 className="text-4xl font-black text-slate-900 font-serif tracking-tight">Mindful Chess</h1>
              <p className="text-[8px] font-black text-emerald-500 uppercase tracking-widest mt-1">
                {isSyncing ? 'Syncing with Python Node...' : 'Neural Link Active'}
              </p>
           </div>
        </div>
        <div className="flex gap-4">
           <div className="px-6 py-4 bg-white border border-slate-100 rounded-2xl shadow-sm">
              <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1">Session ID</p>
              <p className="text-xs font-black text-slate-900">{session?.session_id?.slice(-8) || '...'}</p>
           </div>
           <div className="px-6 py-4 bg-white border border-slate-100 rounded-2xl shadow-sm">
              <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1">Moves</p>
              <p className="text-xl font-black text-slate-900">{moveCount}</p>
           </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-12 gap-12 items-start">
        <div className="lg:col-span-8 flex justify-center">
          <div className="bg-white p-8 rounded-[4rem] shadow-3xl border-2 border-slate-50 relative group">
            {isSyncing && (
              <div className="absolute inset-0 z-20 bg-white/10 backdrop-blur-[2px] rounded-[4rem] flex items-center justify-center">
                <div className="bg-slate-900 px-6 py-3 rounded-full flex items-center gap-3 shadow-2xl">
                  <Loader2 className="w-4 h-4 text-indigo-400 animate-spin" />
                  <span className="text-[10px] font-black text-white uppercase tracking-widest">Validating Strategy...</span>
                </div>
              </div>
            )}
            <div className="grid grid-cols-8 rounded-2xl overflow-hidden shadow-2xl border-4 border-slate-900">
              {board.map((row, rIdx) => 
                row.map((piece, cIdx) => {
                  const isDark = (rIdx + cIdx) % 2 === 1;
                  const isSelected = selected && selected[0] === rIdx && selected[1] === cIdx;
                  return (
                    <div 
                      key={`${rIdx}-${cIdx}`}
                      onClick={() => handleSquareClick(rIdx, cIdx)}
                      className={`
                        w-10 h-10 sm:w-16 sm:h-16 lg:w-[4.5rem] lg:h-[4.5rem] flex items-center justify-center text-4xl sm:text-5xl cursor-pointer transition-all
                        ${isDark ? 'bg-slate-800 text-white/90' : 'bg-slate-100 text-slate-800'}
                        ${isSelected ? 'bg-indigo-600 !text-white z-10 scale-110 rounded-xl shadow-2xl' : ''}
                        hover:bg-indigo-500/20
                      `}
                    >
                      <span className={`select-none transform transition-all duration-300 ${piece ? 'hover:scale-125' : ''}`}>
                        {piece}
                      </span>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>

        <div className="lg:col-span-4 space-y-6">
          <div className="bg-slate-900 p-10 rounded-[3.5rem] text-white shadow-3xl relative overflow-hidden group">
            <div className={`absolute top-0 right-0 p-8 opacity-10 group-hover:scale-125 transition-transform duration-1000`}>
              <Award className="w-40 h-40" />
            </div>
            <div className="relative z-10">
              <div className="flex items-center gap-3 mb-8">
                <div className={`w-3 h-3 rounded-full ${turn === 'white' ? 'bg-emerald-500 animate-pulse shadow-[0_0_10px_#10b981]' : 'bg-indigo-500'}`}></div>
                <h3 className="font-black text-xs uppercase tracking-widest opacity-60">Current Turn</h3>
              </div>
              <p className="text-4xl font-black font-serif capitalize mb-2">{turn} Phase</p>
              <p className="text-slate-400 text-sm font-medium leading-relaxed mb-10 italic">"Focusing on the board reduces mental clutter and anxiety. Every move is logged for wellness analysis."</p>
              
              <button 
                onClick={resetGame}
                className="w-full flex items-center justify-center gap-3 bg-white/10 hover:bg-white/20 text-white font-black py-5 rounded-2xl transition-all uppercase text-[10px] tracking-widest border border-white/5"
              >
                <RotateCcw className="w-4 h-4" /> Reset Board
              </button>
            </div>
          </div>
          
          <div className="p-8 bg-indigo-50 rounded-[2.5rem] border border-indigo-100">
             <div className="flex items-center gap-3 mb-4">
                <Zap className="w-4 h-4 text-indigo-600" />
                <span className="text-[10px] font-black uppercase tracking-widest text-indigo-600">Cognitive Load Check</span>
             </div>
             <div className="w-full h-2 bg-indigo-200 rounded-full overflow-hidden">
                <div className="h-full bg-indigo-600 transition-all duration-500" style={{ width: `${Math.min(100, moveCount * 4)}%` }}></div>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChessGame;