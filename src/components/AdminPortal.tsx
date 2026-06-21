/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ShieldAlert, 
  Trash2, 
  Plus, 
  Settings, 
  User, 
  Building, 
  Play, 
  Award, 
  Megaphone,
  CheckCircle2,
  Cpu,
  Tv,
  Sparkles,
  Smartphone,
  Save,
  Search,
  Activity
} from 'lucide-react';
import { Player, Academy, MatchSession } from '../types';

interface AdminPortalProps {
  players: Player[];
  setPlayers: React.Dispatch<React.SetStateAction<Player[]>>;
  academies: Academy[];
  setAcademies: React.Dispatch<React.SetStateAction<Academy[]>>;
  matches: MatchSession[];
  setMatches: React.Dispatch<React.SetStateAction<MatchSession[]>>;
}

export default function AdminPortal({
  players,
  setPlayers,
  academies,
  setAcademies,
  matches,
  setMatches
}: AdminPortalProps) {
  const [activeAdminSubTab, setActiveAdminSubTab] = useState<'matches' | 'players' | 'academies' | 'bulletin'>('matches');

  // Search filter states
  const [playerSearch, setPlayerSearch] = useState('');
  const [academySearch, setAcademySearch] = useState('');

  // Global Broadcast Notification State
  const [broadcastTitle, setBroadcastTitle] = useState('');
  const [broadcastText, setBroadcastText] = useState('');
  const [bulletinLogged, setBulletinLogged] = useState<string | null>(null);

  // New Player Form State
  const [showPlayerModal, setShowPlayerModal] = useState(false);
  const [newPName, setNewPName] = useState('');
  const [newPPhone, setNewPPhone] = useState('');
  const [newPRacket, setNewPRacket] = useState('');
  const [newPSkill, setNewPSkill] = useState<'Beginner' | 'Intermediate' | 'Advanced' | 'Professional'>('Intermediate');
  const [newPCategory, setNewPCategory] = useState<'Singles' | 'Doubles' | 'Mixed'>('Singles');

  // Score controller feedback
  const [matchStatusAction, setMatchStatusAction] = useState<string | null>(null);

  // Quick info metrics
  const totalPlayers = players.length;
  const totalAcademies = academies.length;
  const totalMatchesCount = matches.length;
  const liveOngoingMatches = matches.filter(m => m.status === 'ongoing').length;

  // Handles modifying ongoing/completed match score directly
  const adjustScore = (matchId: string, team: 1 | 2, amount: number) => {
    setMatches(prev => prev.map(m => {
      if (m.id === matchId) {
        let sc1 = m.score1;
        let sc2 = m.score2;
        if (team === 1) {
          sc1 = Math.max(0, sc1 + amount);
        } else {
          sc2 = Math.max(0, sc2 + amount);
        }

        // Auto append action to match referee log
        const timestamp = Date.now();
        const actionMsg = `Admin adjusted score of ${team === 1 ? m.player1Name : m.player2Name} by ${amount > 0 ? '+' : ''}${amount}`;
        
        return {
          ...m,
          score1: sc1,
          score2: sc2,
          updatedAt: timestamp,
          history: [
            { score1: sc1, score2: sc2, action: actionMsg, timestamp },
            ...m.history
          ]
        };
      }
      return m;
    }));
    triggerActionAlert("Match Score Overridden");
  };

  // Change status of Match referee slot
  const changeMatchStatus = (matchId: string, status: 'ongoing' | 'paused' | 'completed', winnerTeam?: 1 | 2) => {
    setMatches(prev => prev.map(m => {
      if (m.id === matchId) {
        const timestamp = Date.now();
        return {
          ...m,
          status,
          winner: winnerTeam || null,
          updatedAt: timestamp,
          history: [
            { score1: m.score1, score2: m.score2, action: `Admin forced match status to ${status.toUpperCase()}`, timestamp },
            ...m.history
          ]
        };
      }
      return m;
    }));
    triggerActionAlert(`Status set to ${status.toUpperCase()}`);
  };

  // Delete live match session completely
  const deleteMatchSession = (matchId: string) => {
    if (confirm("Are you sure you want to terminate this live session completely? This removes spectator links instantly.")) {
      setMatches(prev => prev.filter(m => m.id !== matchId));
      triggerActionAlert("Match Session Permanently Revoked");
    }
  };

  // Modify individual Player skill/racket directly from panel
  const updatePlayerParam = (playerId: string, skill: any, racket: string) => {
    setPlayers(prev => prev.map(p => {
      if (p.id === playerId) {
        return { ...p, skillLevel: skill, racket };
      }
      return p;
    }));
    triggerActionAlert("Player Equipment Profile Updated");
  };

  // Ban or remove player from academy list
  const deletePlayer = (playerId: string) => {
    if (confirm("Revoke this player's verified network license inside active databases?")) {
      setPlayers(prev => prev.filter(p => p.id !== playerId));
      triggerActionAlert("Player License Terminated");
    }
  };

  // Handle Admin dispatching a new announcement
  const dispatchBulletin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!broadcastTitle || !broadcastText) return;

    setBulletinLogged(`📢 Global Broadcast Sent: "${broadcastTitle}" successfully transmitted over satellite mesh to referee and academy nodes.`);
    setBroadcastTitle('');
    setBroadcastText('');

    setTimeout(() => {
      setBulletinLogged(null);
    }, 6000);
  };

  // Direct Create Player under Admin Control
  const handleAddNewPlayer = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPName || !newPPhone) return;

    const randomID = `BPA-ADMIN-${Math.floor(100+Math.random()*899)}`;
    const newPlayerRec: Player = {
      id: randomID,
      name: newPName,
      phone: newPPhone,
      academyId: academies[0]?.id || null,
      skillLevel: newPSkill,
      preferredCategory: newPCategory,
      racket: newPRacket || "YONEX Voltric Classic",
      bio: "Administrator manual certification record.",
      joinedDate: new Date().toISOString().split('T')[0],
      stats: {
        matchesPlayed: 4,
        matchesWon: 3,
        matchesLost: 1,
        winStreak: 2,
        totalPointsScored: 84,
        averageSmashSpeed: 285,
        accuracyRate: 78,
        staminaScore: 82
      }
    };

    setPlayers(prev => [newPlayerRec, ...prev]);
    setShowPlayerModal(false);
    setNewPName('');
    setNewPPhone('');
    setNewPRacket('');
    triggerActionAlert(`Registered ${newPName} with ID: ${randomID}`);
  };

  const triggerActionAlert = (text: string) => {
    setMatchStatusAction(text);
    setTimeout(() => {
      setMatchStatusAction(null);
    }, 3000);
  };

  const filteredPlayers = players.filter(p => 
    p.name.toLowerCase().includes(playerSearch.toLowerCase()) || 
    p.id.toLowerCase().includes(playerSearch.toLowerCase())
  );

  const filteredAcademies = academies.filter(ac => 
    ac.name.toLowerCase().includes(academySearch.toLowerCase()) || 
    ac.location.toLowerCase().includes(academySearch.toLowerCase())
  );

  return (
    <div className="space-y-6 max-h-[72vh] overflow-y-auto pr-1">
      
      {/* Header and top alerts */}
      <div className="glass p-5 rounded-3xl flex flex-col md:flex-row justify-between items-start md:items-center gap-3">
        <div>
          <div className="flex items-center gap-2 text-[#CCFF00] font-mono text-xs uppercase tracking-widest">
            <Cpu className="w-4 h-4 animate-spin text-[#CCFF00]" /> Network Control Active
          </div>
          <h2 className="text-xl font-bold text-white mt-1">Superuser Security Console</h2>
          <p className="text-xs text-slate-400">Manage real-time digital scoring sessions, player profiles, and academies</p>
        </div>
        
        {/* Connection health check status */}
        <div className="flex gap-2 text-[10px] font-mono text-zinc-400 bg-white/5 border border-white/5 px-3 py-1.5 rounded-xl">
          <span>Server status: <span className="text-[#CCFF00] font-bold">ONLINE</span></span>
          <span className="text-white/20">|</span>
          <span>Security-level: <span className="text-[#CCFF00] font-bold">MASTER-KEY</span></span>
        </div>
      </div>

      {/* Floating Match status alert */}
      <AnimatePresence>
        {matchStatusAction && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed top-12 left-1/2 -translate-x-1/2 bg-slate-950 font-mono text-xs font-bold text-[#CCFF00] border-2 border-[#CCFF00]/40 py-2.5 px-6 rounded-2xl shadow-xl z-50 flex items-center gap-2 tracking-wide uppercase"
          >
            <CheckCircle2 className="w-4 h-4 text-[#CCFF00]" /> {matchStatusAction}
          </motion.div>
        )}
      </AnimatePresence>

      {/* System Metrics Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="bg-white/5 border border-white/5 p-3.5 rounded-2xl text-left">
          <p className="text-[10px] text-slate-500 font-mono uppercase tracking-wider">Verified Athletes</p>
          <p className="text-2xl font-black text-white mt-1 font-mono">{totalPlayers}</p>
        </div>
        <div className="bg-white/5 border border-white/5 p-3.5 rounded-2xl text-left">
          <p className="text-[10px] text-slate-500 font-mono uppercase tracking-wider">Registered Clubs</p>
          <p className="text-2xl font-black text-white mt-1 font-mono">{totalAcademies}</p>
        </div>
        <div className="bg-white/5 border border-white/5 p-3.5 rounded-2xl text-left">
          <p className="text-[10px] text-slate-500 font-mono uppercase tracking-wider">Live Court Slots</p>
          <p className="text-2xl font-black text-[#CCFF00] mt-1 font-mono">{liveOngoingMatches} <span className="text-[10px] font-sans text-slate-400">Active</span></p>
        </div>
        <div className="bg-white/5 border border-white/5 p-3.5 rounded-2xl text-left">
          <p className="text-[10px] text-slate-500 font-mono uppercase tracking-wider">Total Matches Logged</p>
          <p className="text-2xl font-black text-white mt-1 font-mono">{totalMatchesCount}</p>
        </div>
      </div>

      {/* Selector Subtabs */}
      <div className="flex border-b border-white/5 gap-1 pt-1.5 overflow-x-auto">
        <button
          onClick={() => setActiveAdminSubTab('matches')}
          className={`px-4 py-2.5 text-xs font-bold border-b-2 transition-all cursor-pointer whitespace-nowrap ${activeAdminSubTab === 'matches' ? 'border-[#CCFF00] text-[#CCFF00]' : 'border-transparent text-slate-400 hover:text-slate-200'}`}
        >
          🏸 Match Control Room ({matches.length})
        </button>
        <button
          onClick={() => setActiveAdminSubTab('players')}
          className={`px-4 py-2.5 text-xs font-bold border-b-2 transition-all cursor-pointer whitespace-nowrap ${activeAdminSubTab === 'players' ? 'border-[#CCFF00] text-[#CCFF00]' : 'border-transparent text-slate-400 hover:text-slate-200'}`}
        >
          👤 Player Directory ({players.length})
        </button>
        <button
          onClick={() => setActiveAdminSubTab('academies')}
          className={`px-4 py-2.5 text-xs font-bold border-b-2 transition-all cursor-pointer whitespace-nowrap ${activeAdminSubTab === 'academies' ? 'border-[#CCFF00] text-[#CCFF00]' : 'border-transparent text-slate-400 hover:text-slate-200'}`}
        >
          🏢 Academy Centers ({academies.length})
        </button>
        <button
          onClick={() => setActiveAdminSubTab('bulletin')}
          className={`px-4 py-2.5 text-xs font-bold border-b-2 transition-all cursor-pointer whitespace-nowrap ${activeAdminSubTab === 'bulletin' ? 'border-[#CCFF00] text-[#CCFF00]' : 'border-transparent text-slate-400 hover:text-slate-200'}`}
        >
          📢 Dispatch Bulletin
        </button>
      </div>

      {/* Subtab Contents panels */}
      <div>
        
        {/* SUBTAB 1: LIVE MATCHES CONTROLLER */}
        {activeAdminSubTab === 'matches' && (
          <div className="space-y-4">
            <div className="flex justify-between items-center bg-white/5 px-4 py-3 rounded-2xl">
              <span className="text-xs font-mono text-slate-300">ADMIN SPORT COURT CONSOLE</span>
              <button
                onClick={() => {
                  // Trigger direct match seed helper
                  const randomSecId = `match-seeded-${Date.now()}`;
                  const names1 = ["Lee Chong Wei", "Lin Dan", "Vikram Sen", "Rudy Hartono", "An Se-young"];
                  const names2 = ["Viktor Axelsen", "Kento Momota", "Prannoy H.", "Loh Kean Yew", "Tai Tzu-ying"];
                  const p1 = names1[Math.floor(Math.random() * names1.length)];
                  const p2 = names2[Math.floor(Math.random() * names2.length)];
                  
                  const newM: MatchSession = {
                    id: randomSecId,
                    player1Name: p1,
                    player2Name: p2,
                    player1Id: "BPA-2026-MOCK-P1",
                    player2Id: "BPA-2026-MOCK-P2",
                    score1: 15,
                    score2: 14,
                    sets: [{ score1: 21, score2: 19 }],
                    currentSetIndex: 1,
                    status: 'ongoing',
                    courtNumber: Math.floor(1 + Math.random() * 6),
                    server: 1,
                    winner: null,
                    syncCode: String(Math.floor(1000 + Math.random()*8999)),
                    updatedAt: Date.now(),
                    history: [{ score1: 15, score2: 14, action: "Admin manual match injection point", timestamp: Date.now() }]
                  };
                  setMatches(prev => [newM, ...prev]);
                  triggerActionAlert("Seeded Match Injected!");
                }}
                className="px-3 py-1.5 bg-white/5 hover:bg-white/10 text-white font-bold text-[10px] uppercase tracking-wider rounded-xl border border-white/5 transition"
              >
                + Seed Live Match
              </button>
            </div>

            <div className="grid grid-cols-1 gap-3">
              {matches.map(m => (
                <div key={m.id} className="glass p-5 rounded-2xl flex flex-col space-y-4 border border-white/10">
                  <div className="flex justify-between items-center text-xs border-b border-white/5 pb-2.5">
                    <div>
                      <span className="text-[#CCFF00] font-bold uppercase tracking-wider font-mono mr-1.5 bg-[#CCFF00]/10 px-2 py-0.5 rounded text-[10px]">
                        COURT {m.courtNumber}
                      </span>
                      <span className="text-[10px] text-slate-500 font-mono">ID: {m.id}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase ${
                        m.status === 'ongoing' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 
                        m.status === 'paused' ? 'bg-amber-500/10 text-amber-500 border border-amber-500/20' :
                        'bg-slate-500/10 text-slate-400 border border-slate-500/10'
                      }`}>
                        {m.status}
                      </span>
                      <button
                        onClick={() => deleteMatchSession(m.id)}
                        className="p-1.5 bg-red-950/20 hover:bg-red-900/40 text-red-400 border border-red-500/20 rounded-xl transition cursor-pointer"
                        title="Delete session"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Core score manipulator columns */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    
                    {/* Team 1 Panel */}
                    <div className="bg-white/5 p-3 rounded-xl flex items-center justify-between">
                      <div>
                        <p className="text-[10px] text-zinc-500 font-mono">PLAYER 1/TEAM A</p>
                        <p className="text-sm font-extrabold text-white truncate">{m.player1Name}</p>
                        <div className="flex gap-1.5 mt-2">
                          <button
                            onClick={() => adjustScore(m.id, 1, -1)}
                            className="w-7 h-7 bg-white/5 hover:bg-white/10 text-white rounded-lg flex items-center justify-center font-bold font-mono transition-transform active:scale-90"
                          >
                            -
                          </button>
                          <button
                            onClick={() => adjustScore(m.id, 1, 1)}
                            className="w-7 h-7 bg-[#CCFF00] text-slate-950 hover:bg-white rounded-lg flex items-center justify-center font-bold font-mono transition-transform active:scale-90"
                          >
                            +
                          </button>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-3xl font-black text-[#CCFF00] font-mono leading-none">{m.score1}</p>
                        <p className="text-[9px] text-slate-400 font-mono mt-1">Sets total</p>
                      </div>
                    </div>

                    {/* Team 2 Panel */}
                    <div className="bg-white/5 p-3 rounded-xl flex items-center justify-between">
                      <div>
                        <p className="text-[10px] text-zinc-500 font-mono">PLAYER 2/TEAM B</p>
                        <p className="text-sm font-extrabold text-white truncate">{m.player2Name}</p>
                        <div className="flex gap-1.5 mt-2">
                          <button
                            onClick={() => adjustScore(m.id, 2, -1)}
                            className="w-7 h-7 bg-white/5 hover:bg-white/10 text-white rounded-lg flex items-center justify-center font-bold font-mono transition-transform active:scale-90"
                          >
                            -
                          </button>
                          <button
                            onClick={() => adjustScore(m.id, 2, 1)}
                            className="w-7 h-7 bg-[#CCFF00] text-slate-950 hover:bg-white rounded-lg flex items-center justify-center font-bold font-mono transition-transform active:scale-90"
                          >
                            +
                          </button>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-3xl font-black text-[#CCFF00] font-mono leading-none">{m.score2}</p>
                        <p className="text-[9px] text-slate-400 font-mono mt-1">Sets total</p>
                      </div>
                    </div>

                  </div>

                  {/* Status Force Triggers */}
                  <div className="flex flex-wrap items-center gap-1.5 pt-2 border-t border-white/5 justify-between">
                    <span className="text-[10px] text-slate-400 font-mono">OVERRIDE STATUS:</span>
                    <div className="flex gap-1">
                      <button
                        onClick={() => changeMatchStatus(m.id, 'ongoing')}
                        className={`text-[10px] font-mono font-bold px-2.5 py-1 rounded-lg transition-all ${m.status === 'ongoing' ? 'bg-emerald-500 text-slate-950' : 'bg-white/5 text-slate-400 hover:bg-white/10'}`}
                      >
                        SET ONGOING
                      </button>
                      <button
                        onClick={() => changeMatchStatus(m.id, 'paused')}
                        className={`text-[10px] font-mono font-bold px-2.5 py-1 rounded-lg transition-all ${m.status === 'paused' ? 'bg-amber-550 text-slate-950' : 'bg-white/5 text-slate-400 hover:bg-white/10'}`}
                      >
                        PAUSE LOCK
                      </button>
                      <button
                        onClick={() => changeMatchStatus(m.id, 'completed', 1)}
                        className="text-[10px] font-mono font-bold px-2.5 py-1 bg-[#CCFF00]/10 text-[#CCFF00] hover:bg-[#CCFF00] hover:text-slate-950 rounded-lg transition"
                      >
                        END (WINNER P1)
                      </button>
                      <button
                        onClick={() => changeMatchStatus(m.id, 'completed', 2)}
                        className="text-[10px] font-mono font-bold px-2.5 py-1 bg-[#CCFF00]/10 text-[#CCFF00] hover:bg-[#CCFF00] hover:text-slate-950 rounded-lg transition"
                      >
                        END (WINNER P2)
                      </button>
                    </div>
                  </div>
                </div>
              ))}

              {matches.length === 0 && (
                <div className="text-center py-10 text-slate-400 text-xs">
                  No active or historical matches exist. Click "Seed Live Match" above to populate mock tests.
                </div>
              )}
            </div>
          </div>
        )}

        {/* SUBTAB 2: PLAYER RECORDS DIRECTORY */}
        {activeAdminSubTab === 'players' && (
          <div className="space-y-4">
            
            {/* Control Bar */}
            <div className="flex flex-col sm:flex-row gap-3 justify-between items-stretch sm:items-center">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-2.5 text-slate-500 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Filter and search network athletes by name / ID..."
                  value={playerSearch}
                  onChange={(e) => setPlayerSearch(e.target.value)}
                  className="w-full bg-white/5 text-xs text-white pl-9 pr-4 py-2.5 rounded-xl border border-white/10 outline-none focus:border-[#CCFF00]/40 outline-none transition"
                />
              </div>
              <button
                onClick={() => setShowPlayerModal(true)}
                className="px-4 py-2.5 bg-[#CCFF00] hover:bg-white text-[#020408] font-bold text-xs rounded-xl flex items-center gap-1 transition"
              >
                <Plus className="w-4 h-4" /> Register Athlete
              </button>
            </div>

            {/* Quick manual register form modal */}
            {showPlayerModal && (
              <div className="bg-slate-950 p-5 rounded-2xl border border-[#CCFF00]/20 space-y-4 text-xs">
                <h4 className="font-bold text-[#CCFF00] flex items-center gap-1.5 uppercase tracking-wider text-[11px]">
                  ⚡ Certify New Network Player Record
                </h4>
                <form onSubmit={handleAddNewPlayer} className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[10px] text-slate-400 font-mono mb-1">FULL NAME</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Lakshya Sen"
                      value={newPName}
                      onChange={(e) => setNewPName(e.target.value)}
                      className="w-full bg-white/5 border border-white/10 rounded-lg p-2 text-white outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] text-slate-400 font-mono mb-1">PHONE NUMBER</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. +91 9999912345"
                      value={newPPhone}
                      onChange={(e) => setNewPPhone(e.target.value)}
                      className="w-full bg-white/5 border border-white/10 rounded-lg p-2 text-white outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] text-slate-400 font-mono mb-1">PREFERRED RACKET MODEL</label>
                    <input
                      type="text"
                      placeholder="e.g. YONEX Duora 10"
                      value={newPRacket}
                      onChange={(e) => setNewPRacket(e.target.value)}
                      className="w-full bg-white/5 border border-white/10 rounded-lg p-2 text-white outline-none"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-[10px] text-slate-400 font-mono mb-1">SKILL LEVEL</label>
                      <select
                        value={newPSkill}
                        onChange={(e: any) => setNewPSkill(e.target.value)}
                        className="w-full bg-[#020408] border border-white/10 rounded-lg p-2 text-white outline-none"
                      >
                        <option value="Beginner">Beginner</option>
                        <option value="Intermediate">Intermediate</option>
                        <option value="Advanced">Advanced</option>
                        <option value="Professional">Professional</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-[10px] text-slate-400 font-mono mb-1">CATEGORY</label>
                      <select
                        value={newPCategory}
                        onChange={(e: any) => setNewPCategory(e.target.value)}
                        className="w-full bg-[#020408] border border-[#ffffff10] rounded-lg p-2 text-white outline-none"
                      >
                        <option value="Singles">Singles</option>
                        <option value="Doubles">Doubles</option>
                        <option value="Mixed">Mixed</option>
                      </select>
                    </div>
                  </div>

                  <div className="sm:col-span-2 flex justify-end gap-2 pt-1">
                    <button
                      type="button"
                      onClick={() => setShowPlayerModal(false)}
                      className="px-3 py-1.5 bg-white/5 text-slate-400 font-bold rounded-lg"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-1.5 bg-[#CCFF00] hover:bg-white text-slate-900 font-bold rounded-lg transition"
                    >
                      Inject Active License
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* List players table */}
            <div className="space-y-3">
              {filteredPlayers.map(p => (
                <div key={p.id} className="glass p-4 rounded-2xl flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-white font-bold">{p.name}</span>
                      <span className="text-[10px] font-mono bg-white/5 border border-white/5 text-[#CCFF00] px-1.5 py-0.5 rounded">
                        {p.id}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-400 font-sans mt-0.5">
                      Phone: <span className="font-mono text-white/80">{p.phone}</span> • Joins: <span className="font-mono text-white/80">{p.joinedDate}</span>
                    </p>
                  </div>

                  {/* Inline update triggers */}
                  <div className="flex flex-wrap items-center gap-2">
                    <div className="text-left">
                      <span className="text-[9px] uppercase font-mono text-slate-550 block">Racket Equipment</span>
                      <input
                        type="text"
                        value={p.racket}
                        onChange={(e) => updatePlayerParam(p.id, p.skillLevel, e.target.value)}
                        className="bg-white/5 border border-white/10 text-white rounded px-2 py-0.5 text-xs w-36 outline-none focus:border-[#CCFF00]/40 transition"
                      />
                    </div>

                    <div className="text-left">
                      <span className="text-[9px] uppercase font-mono text-slate-550 block">Skill Grade</span>
                      <select
                        value={p.skillLevel}
                        onChange={(e) => updatePlayerParam(p.id, e.target.value, p.racket)}
                        className="bg-[#020408] border border-white/10 text-white rounded px-1.5 py-0.5 text-xs outline-none"
                      >
                        <option value="Beginner">Beginner</option>
                        <option value="Intermediate">Intermediate</option>
                        <option value="Advanced">Advanced</option>
                        <option value="Professional">Professional</option>
                      </select>
                    </div>

                    <button
                      onClick={() => deletePlayer(p.id)}
                      className="p-1.5 bg-red-950/20 hover:bg-red-900/40 text-red-400 border border-red-500/10 rounded-xl transition cursor-pointer self-end"
                      title="Terminate Athlete license record"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* SUBTAB 3: ACADEMIES MANAGEMENT */}
        {activeAdminSubTab === 'academies' && (
          <div className="space-y-4">
            <div className="relative">
              <Search className="absolute left-3 top-2.5 text-slate-500 w-4 h-4" />
              <input
                type="text"
                placeholder="Search and verify official badminton courts count, locations, helping numbers..."
                value={academySearch}
                onChange={(e) => setAcademySearch(e.target.value)}
                className="w-full bg-white/5 text-xs text-white pl-9 pr-4 py-2.5 rounded-xl border border-white/10 outline-none focus:border-[#CCFF00]/40 outline-none transition"
              />
            </div>

            <div className="space-y-3">
              {filteredAcademies.map(ac => (
                <div key={ac.id} className="glass p-4 rounded-2xl space-y-3 border border-white/5">
                  <div className="flex justify-between items-start border-b border-white/5 pb-2">
                    <div>
                      <h4 className="font-extrabold text-white text-sm">{ac.name}</h4>
                      <p className="text-[10px] text-slate-400 font-mono mt-0.5">{ac.id} • {ac.location}</p>
                    </div>
                    <div className="text-right">
                      <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-[#CCFF00]/10 text-[#CCFF00] font-bold border border-[#CCFF00]/25">
                        Rating: {ac.ratings} ★
                      </span>
                    </div>
                  </div>

                  {/* Quick properties adjustment */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                    <div>
                      <label className="block text-[10px] text-slate-500 font-mono mb-1">TOTAL INDOOR COURTS</label>
                      <input
                        type="number"
                        value={ac.courtsCount}
                        onChange={(e) => {
                          const val = Number(e.target.value);
                          setAcademies(prev => prev.map(item => item.id === ac.id ? { ...item, courtsCount: val } : item));
                          triggerActionAlert("Academy Court Count Count Updated");
                        }}
                        className="bg-white/5 border border-white/10 rounded p-1.5 text-white w-full text-xs outline-none focus:border-[#CCFF00]/40"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] text-slate-500 font-mono mb-1">ACADEMY RATINGS</label>
                      <input
                        type="number"
                        step="0.1"
                        max="5"
                        value={ac.ratings}
                        onChange={(e) => {
                          const val = Number(e.target.value);
                          setAcademies(prev => prev.map(item => item.id === ac.id ? { ...item, ratings: val } : item));
                        }}
                        className="bg-white/5 border border-white/10 rounded p-1.5 text-white w-full text-xs outline-none focus:border-[#CCFF00]/40"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] text-slate-500 font-mono mb-1 font-bold text-red-400">ADMIN ACTION</label>
                      <button
                        onClick={() => {
                          if (confirm(`Remove custom directory listings for ${ac.name}?`)) {
                            setAcademies(prev => prev.filter(item => item.id !== ac.id));
                            triggerActionAlert("Academy Branch Removed from Networks");
                          }
                        }}
                        className="w-full bg-red-950/20 hover:bg-red-900/40 text-red-400 border border-red-500/20 rounded-lg p-1.5 text-xs text-center transition cursor-pointer font-bold uppercase tracking-wider"
                      >
                        Remove Listing
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* SUBTAB 4: DISPATCH SYSTEM BULLETIN */}
        {activeAdminSubTab === 'bulletin' && (
          <div className="glass p-5 rounded-2xl space-y-4">
            <div>
              <h3 className="text-sm font-bold text-[#CCFF00] flex items-center gap-1.5 uppercase font-mono tracking-wider">
                <Megaphone className="w-4 h-4 text-[#CCFF00]" /> Broadcast Emergency Referee / Court Bulletin
              </h3>
              <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                Publish a global tournament declaration message. Handlers, line judges, coaching staff, and spectators will see this announcement in high priority.
              </p>
            </div>

            {bulletinLogged && (
              <div className="bg-white/10 text-white text-xs p-3.5 rounded-xl border-l-4 border-l-[#CCFF00] relative animate-pulse">
                <span>{bulletinLogged}</span>
              </div>
            )}

            <form onSubmit={dispatchBulletin} className="space-y-3.5 text-xs">
              <div>
                <label className="block text-[10px] text-slate-500 font-mono mb-1">BULLETIN DISPATCH HEADER</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. TOURNAMENT WEATHER DEFERRAL"
                  value={broadcastTitle}
                  onChange={(e) => setBroadcastTitle(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 focus:border-[#CCFF00]/30 rounded-xl p-2.5 text-white outline-none"
                />
              </div>

              <div>
                <label className="block text-[10px] text-slate-500 font-mono mb-1">BULLETIN CONTENT / BODY MESSAGE</label>
                <textarea
                  rows={3}
                  required
                  placeholder="e.g. Due to humidity levels on outer lines, all singles qualifiers are delayed by 30 minutes on Court #3 and #4. Report to referee table immediately."
                  value={broadcastText}
                  onChange={(e) => setBroadcastText(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 focus:border-[#CCFF00]/30 rounded-xl p-2.5 text-white outline-none"
                />
              </div>

              <button
                type="submit"
                className="w-full bg-[#CCFF00] hover:bg-white text-slate-950 font-black py-2.5 rounded-xl transition duration-150 cursor-pointer active:scale-95 text-center uppercase tracking-wider"
              >
                📡 Dispatch Bulletin Over Network Nodes
              </button>
            </form>
          </div>
        )}

      </div>

    </div>
  );
}
