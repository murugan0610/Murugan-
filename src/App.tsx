/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Tv, 
  Activity, 
  Building, 
  CircleUser, 
  LogOut, 
  Smartphone, 
  Wifi, 
  Battery, 
  Signal, 
  Sparkles, 
  Play, 
  Award, 
  Target,
  QrCode,
  ShieldCheck,
  Club,
  BookOpen,
  ShieldAlert
} from 'lucide-react';

import { Player, Academy, MatchSession, AuthState } from './types';
import { mockPlayers, mockAcademies, mockMatches } from './data/mockData';
import AuthScreen from './components/AuthScreen';
import ScoreBoard from './components/ScoreBoard';
import StatsView from './components/StatsView';
import AcademyTracker from './components/AcademyTracker';
import AdminPortal from './components/AdminPortal';

export default function App() {
  // Load state from local storage or fallback to mock data
  const [players, setPlayers] = useState<Player[]>(() => {
    const saved = localStorage.getItem('badm_players');
    return saved ? JSON.parse(saved) : mockPlayers;
  });

  const [academies, setAcademies] = useState<Academy[]>(() => {
    const saved = localStorage.getItem('badm_academies');
    return saved ? JSON.parse(saved) : mockAcademies;
  });

  const [matches, setMatches] = useState<MatchSession[]>(() => {
    const saved = localStorage.getItem('badm_matches');
    return saved ? JSON.parse(saved) : mockMatches;
  });

  const [auth, setAuth] = useState<AuthState | null>(() => {
    const saved = localStorage.getItem('badm_auth');
    if (saved) return JSON.parse(saved);
    // Default to a spectator if not logged in
    return null;
  });

  const [activeTab, setActiveTab] = useState<'tracker' | 'stats' | 'academies' | 'profile' | 'admin'>('tracker');
  const [activeMatchId, setActiveMatchId] = useState<string | null>(null);

  // Sync to localStorage
  useEffect(() => {
    localStorage.setItem('badm_players', JSON.stringify(players));
  }, [players]);

  useEffect(() => {
    localStorage.setItem('badm_academies', JSON.stringify(academies));
  }, [academies]);

  useEffect(() => {
    localStorage.setItem('badm_matches', JSON.stringify(matches));
  }, [matches]);

  useEffect(() => {
    if (auth) {
      localStorage.setItem('badm_auth', JSON.stringify(auth));
    } else {
      localStorage.removeItem('badm_auth');
    }
  }, [auth]);

  const handleRegisterPlayer = (newPlayer: Player) => {
    setPlayers(prev => [...prev, newPlayer]);
  };

  const handleRegisterAcademy = (newAcademy: Academy) => {
    setAcademies(prev => [...prev, newAcademy]);
    
    // Increment academy count in state
    if (auth && auth.user && auth.user.role === 'academy') {
      setAuth({
        user: {
          ...auth.user,
          id: newAcademy.id,
          name: newAcademy.name
        }
      });
    }
  };

  const handleEnrollPlayer = (playerId: string, academyId: string) => {
    setPlayers(prev => prev.map(p => {
      if (p.id === playerId) {
        return { ...p, academyId };
      }
      return p;
    }));

    setAcademies(prev => prev.map(ac => {
      if (ac.id === academyId) {
        return { ...ac, enrolledPlayersCount: (ac.enrolledPlayersCount || 0) + 1 };
      }
      return ac;
    }));
  };

  const handleLoginSuccess = (user: { role: 'player' | 'academy' | 'spectator' | 'admin'; id: string; name: string; phone: string }) => {
    setAuth({ user });
    // Redirect to score tracker initially on login, unless admin
    if (user.role === 'admin') {
      setActiveTab('admin');
    } else {
      setActiveTab('tracker');
    }
  };

  const handleLogout = () => {
    setAuth(null);
    setActiveMatchId(null);
  };

  const handleCreateNewMatch = () => {
    const defaultP1 = players[0]?.name || "Local Contender 1";
    const defaultP2 = players[1]?.name || "Local Contender 2";
    
    const newSession: MatchSession = {
      id: `match-${Date.now()}`,
      player1Name: defaultP1,
      player2Name: defaultP2,
      player1Id: players[0]?.id || null,
      player2Id: players[1]?.id || null,
      score1: 0,
      score2: 0,
      sets: [],
      currentSetIndex: 0,
      status: 'ongoing',
      courtNumber: Math.floor(1 + Math.random() * 5),
      server: 1,
      winner: null,
      syncCode: String(Math.floor(1000 + Math.random() * 9000)),
      updatedAt: Date.now(),
      history: [{ score1: 0, score2: 0, action: "Match session initially booted", timestamp: Date.now() }]
    };

    setMatches(prev => [newSession, ...prev]);
    setActiveMatchId(newSession.id);
  };

  // Mock time display for status bar
  const [deviceTime, setDeviceTime] = useState('05:00 AM');
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      let hrs = now.getHours();
      const mins = String(now.getMinutes()).padStart(2, '0');
      const ampm = hrs >= 12 ? 'PM' : 'AM';
      hrs = hrs % 12;
      hrs = hrs ? hrs : 12; // early hours
      setDeviceTime(`${hrs}:${mins} ${ampm}`);
    };
    updateTime();
    const interval = setInterval(updateTime, 10000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-0 md:p-6 select-none font-sans relative overflow-x-hidden">
      
      {/* Decorative ambient gradients */}
      <div className="absolute top-1/4 -left-40 w-96 h-96 bg-[#CCFF00]/5 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute bottom-1/4 -right-40 w-96 h-96 bg-[#CCFF00]/10 rounded-full blur-[100px] pointer-events-none" />

      {/* CORE MOBILE SMARTPHONE FRAME CONTAINER */}
      <div className="w-full max-w-[1080px] min-h-screen md:min-h-[850px] bg-[#030611] md:rounded-[40px] md:border-[12px] border-slate-950 flex flex-col shadow-2xl relative overflow-hidden">
        
        {/* Smartphone Hardware top Notch */}
        <div className="hidden md:block absolute top-0 left-1/2 -translate-x-1/2 w-40 h-6 bg-slate-950 rounded-b-xl z-50">
          <div className="w-16 h-1 w-full bg-[#030611] rounded mx-auto mt-1" />
          <div className="absolute right-6 top-1 h-2 w-2 rounded-full bg-[#CCFF00]/50 blink" />
        </div>

        {/* DEVICE STATUS BAR */}
        <div className="bg-[#020408]/90 text-slate-400 py-1.5 px-6 flex justify-between items-center text-[11px] font-mono border-b border-white/5 shrink-0 z-40 backdrop-blur-md">
          <div>{deviceTime}</div>
          <div className="flex items-center gap-2">
            <Signal className="w-3.5 h-3.5" />
            <span className="font-mono text-[9px] text-[#CCFF00] font-bold">5G LTE</span>
            <Wifi className="w-3.5 h-3.5 text-[#CCFF00]" />
            <Battery className="w-4 h-4 text-[#CCFF00] fill-[#CCFF00]/20" />
          </div>
        </div>

        {/* APPLICATION BODY HEIGHT FLEX */}
        <div className="flex-1 flex flex-col overflow-y-auto p-4 md:p-6 pb-20 relative">
          
          <AnimatePresence mode="wait">
            {!auth ? (
              <motion.div
                key="auth"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="flex-1 flex items-center justify-center"
              >
                <AuthScreen
                  onLoginSuccess={handleLoginSuccess}
                  players={players}
                  academies={academies}
                  onRegisterPlayer={handleRegisterPlayer}
                  onRegisterAcademy={handleRegisterAcademy}
                />
              </motion.div>
            ) : (
              <motion.div
                key="authenticated"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex-1 flex flex-col space-y-4"
              >
                
                {/* Authed Header Bar */}
                <div className="flex justify-between items-center bg-white/5 p-3.5 rounded-2xl border border-white/5">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-full bg-[#CCFF00]/15 flex items-center justify-center border border-[#CCFF00]/25 text-[#CCFF00] font-bold text-xs uppercase font-mono">
                      {auth.user?.name.slice(0, 2)}
                    </div>
                    <div>
                      <p className="text-[9px] text-zinc-500 font-mono leading-none">ACTIVE USER SESSION</p>
                      <h4 className="text-xs font-bold text-white leading-normal font-sans">{auth.user?.name}</h4>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-[10px] uppercase bg-white/5 text-[#CCFF00] px-2.5 py-1 rounded-lg border border-white/5 font-mono font-bold">
                      {auth.user?.role}
                    </span>
                    <button
                      onClick={handleLogout}
                      className="p-1.5 bg-red-950/20 hover:bg-red-900/30 text-red-450 rounded-lg border border-red-500/25 transition cursor-pointer"
                      title="Terminate Session"
                    >
                      <LogOut className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* TAB RENDERING ROUTER SYSTEM */}
                <div className="flex-1">
                  
                  {activeTab === 'tracker' && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="space-y-4"
                    >
                      {activeMatchId ? (
                        <ScoreBoard
                          initialMatches={matches}
                          onMatchesChange={setMatches}
                          activeMatchId={activeMatchId}
                          onBackToDashboard={() => setActiveMatchId(null)}
                        />
                      ) : (
                        <div className="space-y-4">
                          <div className="glass p-6 rounded-3xl text-center space-y-4">
                            <h3 className="text-base font-bold text-slate-200">Start New Scoring Session</h3>
                            <p className="text-xs text-slate-405 max-w-sm mx-auto leading-relaxed">
                              Initialize a live referee score tracker. Supports voice control commands and remote spectator displays.
                            </p>
                            <button
                              id="btn-new-match"
                              onClick={handleCreateNewMatch}
                              className="px-6 py-2.5 bg-[#CCFF00] hover:bg-white text-[#020408] font-bold text-sm rounded-xl inline-flex items-center gap-2 shadow-lg transition cursor-pointer active:scale-95 transition-transform"
                            >
                              <Play className="w-4 h-4 fill-[#020408]" />
                              Initialize Scoreboard
                            </button>
                          </div>

                          <div className="glass p-4.5 rounded-3xl">
                            <span className="text-[10px] text-slate-400 uppercase tracking-widest font-mono font-bold block mb-3">Recent Matches Feed</span>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                              {matches.map(m => (
                                <button
                                  key={m.id}
                                  onClick={() => setActiveMatchId(m.id)}
                                  className="text-left bg-white/5 hover:bg-white/10 p-3.5 rounded-2xl border border-white/5 hover:border-white/10 transition cursor-pointer"
                                >
                                  <div className="flex justify-between items-center text-[10px] text-slate-500 mb-1.5 font-mono">
                                    <span>COURT {m.courtNumber}</span>
                                    <span className={m.status === 'completed' ? 'text-amber-500 font-semibold' : 'text-[#CCFF00] font-semibold'}>
                                      ● {m.status.toUpperCase()}
                                    </span>
                                  </div>
                                  <div className="text-xs font-bold text-white flex justify-between">
                                    <span>{m.player1Name}</span>
                                    <span>{m.score1}</span>
                                  </div>
                                  <div className="text-xs font-bold text-white flex justify-between mt-1">
                                    <span>{m.player2Name}</span>
                                    <span>{m.score2}</span>
                                  </div>
                                  {m.sets.length > 0 && (
                                    <p className="text-[9px] text-slate-600 font-mono mt-2 border-t border-white/5 pt-1.5">
                                      Sets: {m.sets.map(s => `(${s.score1}-${s.score2})`).join(', ')}
                                    </p>
                                  )}
                                </button>
                              ))}
                            </div>
                          </div>
                        </div>
                      )}
                    </motion.div>
                  )}

                  {activeTab === 'stats' && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                    >
                      <StatsView players={players} />
                    </motion.div>
                  )}

                  {activeTab === 'academies' && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                    >
                      <AcademyTracker
                        academies={academies}
                        players={players}
                        onRegisterAcademy={handleRegisterAcademy}
                        onEnrollPlayer={handleEnrollPlayer}
                        currentUser={auth.user}
                      />
                    </motion.div>
                  )}

                  {activeTab === 'profile' && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                    >
                      <div className="max-w-md mx-auto glass p-6 rounded-3xl space-y-6">
                        <div className="text-center space-y-2">
                          <div className="relative py-2 inline-block">
                            <div className="w-16 h-16 rounded-full bg-[#CCFF00]/15 border-2 border-[#CCFF00]/25 flex items-center justify-center mx-auto text-xl font-mono text-[#CCFF00]">
                              <QrCode className="w-8 h-8" />
                            </div>
                            <span className="absolute bottom-1 right-1/2 translate-x-4 bg-[#CCFF00] w-3 h-3 rounded-full border-2 border-slate-955" />
                          </div>
                          
                          <h3 className="text-lg font-bold text-slate-200">Official Membership ID Pass</h3>
                          <p className="text-xs text-slate-550 leading-relaxed font-sans">Scan at entrance gates or match desks for automatic check-in</p>
                        </div>

                        {/* Digital ID badge */}
                        <div className="bg-white/5 border border-white/10 rounded-2xl p-5 relative overflow-hidden">
                          <div className="absolute top-0 right-0 p-3 text-[10px] font-mono text-[#CCFF00] font-bold">
                            VERIFIED LICENSE
                          </div>

                          <div className="space-y-4">
                            <div>
                              <span className="text-[10px] text-slate-500 block uppercase font-mono tracking-wider">MEMBER NAME</span>
                              <span className="text-sm font-bold text-white block font-sans">{auth?.user?.name}</span>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                              <div>
                                <span className="text-[10px] text-slate-500 block uppercase font-mono tracking-wider">REGISTERED ID</span>
                                <span className="text-xs font-bold text-[#CCFF00] font-mono block">{auth?.user?.id}</span>
                              </div>
                              <div>
                                <span className="text-[10px] text-slate-500 block uppercase font-mono tracking-wider">CONTACT</span>
                                <span className="text-xs font-bold text-zinc-350 font-mono block">{auth?.user?.phone}</span>
                              </div>
                            </div>

                            <div className="pt-2 border-t border-white/5 text-[10px] text-slate-500 font-mono">
                              SYSTEM CERTIFICATE REGISTRATION ID: S-BADM-{auth?.user?.id.slice(-4)}
                            </div>
                          </div>
                        </div>

                        {/* Enroll / Connect academy form */}
                        {auth?.user?.role === 'player' && (
                          <div className="p-4 bg-white/5 rounded-2xl border border-white/5 space-y-3">
                            <span className="text-[10px] font-bold text-[#CCFF00] uppercase font-mono tracking-wide flex items-center gap-1">
                              <Club className="w-4 h-4 text-[#CCFF00]" /> Connect Academy Membership
                            </span>
                            <div className="text-xs text-slate-400">
                              Attach your registration ID to an active academy so their coaching staff can monitor your career metrics.
                            </div>
                            <div className="flex gap-2 text-xs font-sans">
                              <select
                                id="profile-academy-connect"
                                className="flex-1 bg-[#020408]/60 border border-white/10 rounded-xl p-2 text-white text-xs cursor-pointer focus:outline-none"
                              >
                                {academies.map(ac => (
                                  <option key={ac.id} value={ac.id} className="bg-[#020408] text-white">{ac.name}</option>
                                ))}
                              </select>
                              <button
                                onClick={() => {
                                  let selector = document.getElementById('profile-academy-connect') as HTMLSelectElement;
                                  if (selector && auth?.user) {
                                    handleEnrollPlayer(auth.user.id, selector.value);
                                    alert("Membership successfully updated on tournament lists!");
                                  }
                                }}
                                className="px-3 bg-[#CCFF00] hover:bg-white text-[#020408] font-bold rounded-xl active:scale-95 transition-transform cursor-pointer"
                              >
                                Enroll Now
                              </button>
                            </div>
                          </div>
                        )}

                        <button
                          onClick={handleLogout}
                          className="w-full bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 font-bold py-2.5 rounded-xl text-xs transition cursor-pointer active:scale-95 transition-all text-center font-sans"
                        >
                          Sign Out Credentials
                        </button>

                      </div>
                    </motion.div>
                  )}

                  {activeTab === 'admin' && auth?.user?.role === 'admin' && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                    >
                      <AdminPortal
                        players={players}
                        setPlayers={setPlayers}
                        academies={academies}
                        setAcademies={setAcademies}
                        matches={matches}
                        setMatches={setMatches}
                      />
                    </motion.div>
                  )}

                </div>

              </motion.div>
            )}
          </AnimatePresence>

        </div>

        {/* BOTTOM EMBEDDED NAVIGATION BAR */}
        {auth && (
          <div className="absolute bottom-0 inset-x-0 bg-[#020408]/90 h-16 border-t border-white/5 flex justify-around items-center px-4 shrink-0 z-40 backdrop-blur-md">
            <button
              onClick={() => { setActiveTab('tracker'); setActiveMatchId(null); }}
              className={`flex flex-col items-center justify-center p-2 text-center transition-colors cursor-pointer ${
                activeTab === 'tracker' ? 'text-[#CCFF00]' : 'text-slate-500 hover:text-slate-300'
              }`}
            >
              <Tv className="w-5 h-5 animate-pulse" />
              <span className="text-[10px] mt-1 font-semibold font-sans">Umpire Sync</span>
            </button>

            <button
              id="nav-stats"
              onClick={() => setActiveTab('stats')}
              className={`flex flex-col items-center justify-center p-2 text-center transition-colors cursor-pointer ${
                activeTab === 'stats' ? 'text-[#CCFF00]' : 'text-slate-500 hover:text-slate-300'
              }`}
            >
              <Activity className="w-5 h-5" />
              <span className="text-[10px] mt-1 font-semibold font-sans">Performance</span>
            </button>

            <button
              id="nav-academies"
              onClick={() => setActiveTab('academies')}
              className={`flex flex-col items-center justify-center p-2 text-center transition-colors cursor-pointer ${
                activeTab === 'academies' ? 'text-[#CCFF00]' : 'text-slate-500 hover:text-slate-300'
              }`}
            >
              <Building className="w-5 h-5" />
              <span className="text-[10px] mt-1 font-semibold font-sans">Academies</span>
            </button>

            <button
              id="nav-profile"
              onClick={() => setActiveTab('profile')}
              className={`flex flex-col items-center justify-center p-2 text-center transition-colors cursor-pointer ${
                activeTab === 'profile' ? 'text-[#CCFF00]' : 'text-slate-500 hover:text-slate-300'
              }`}
            >
              <CircleUser className="w-5 h-5" />
              <span className="text-[10px] mt-1 font-semibold font-sans">ID Pass</span>
            </button>

            {auth.user?.role === 'admin' && (
              <button
                id="nav-admin"
                onClick={() => { setActiveTab('admin'); setActiveMatchId(null); }}
                className={`flex flex-col items-center justify-center p-2 text-center transition-colors cursor-pointer ${
                  activeTab === 'admin' ? 'text-[#CCFF00]' : 'text-slate-500 hover:text-slate-300'
                }`}
              >
                <ShieldAlert className="w-5 h-5" />
                <span className="text-[10px] mt-1 font-semibold font-sans">Admin Control</span>
              </button>
            )}
          </div>
        )}

      </div>
    </div>
  );
}
