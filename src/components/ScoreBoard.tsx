/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Play, RotateCcw, Volume2, ShieldAlert, Wifi, Award, ArrowLeftRight, UserCheck, Plus, Minus, Tv, PhoneCall, HelpCircle } from 'lucide-react';
import { MatchSession, SetScore } from '../types';
import VoiceController from './VoiceController';

interface ScoreBoardProps {
  initialMatches: MatchSession[];
  onMatchesChange: (matches: MatchSession[]) => void;
  activeMatchId: string | null;
  onBackToDashboard: () => void;
}

export default function ScoreBoard({
  initialMatches,
  onMatchesChange,
  activeMatchId,
  onBackToDashboard
}: ScoreBoardProps) {
  // Find current match or fallback to the mock matchmaking session
  const currentMatch = initialMatches.find(m => m.id === activeMatchId) || initialMatches[0];
  
  // Local reactive mirror for the match session state
  const [match, setMatch] = useState<MatchSession>(currentMatch);
  const [winThreshold, setWinThreshold] = useState(21);
  const [isSynthesizerOn, setIsSynthesizerOn] = useState(true);
  const [simulatorMessage, setSimulatorMessage] = useState<string | null>(null);

  // Sync state back to core mock database when changed
  useEffect(() => {
    const updated = initialMatches.map(m => m.id === match.id ? match : m);
    onMatchesChange(updated);
  }, [match]);

  // Keep in sync with parent selections
  useEffect(() => {
    if (activeMatchId && activeMatchId !== match.id) {
      const selected = initialMatches.find(m => m.id === activeMatchId);
      if (selected) setMatch(selected);
    }
  }, [activeMatchId, initialMatches]);

  // Synthesis Voice score announcer (mimics real international umpire)
  const announceScore = (playerScoredName: string, p1Score: number, p2Score: number, serverSide: number) => {
    if (!isSynthesizerOn) return;
    try {
      const synth = window.speechSynthesis;
      if (!synth) return;
      synth.cancel(); // Stop current speech
      
      let speechPhrase = "";
      if (p1Score === 0 && p2Score === 0) {
        speechPhrase = "Love all. Play.";
      } else {
        const leadingScore = serverSide === 1 ? p1Score : p2Score;
        const trailingScore = serverSide === 1 ? p2Score : p1Score;
        const leadingPlayer = serverSide === 1 ? match.player1Name : match.player2Name;
        
        speechPhrase = `${playerScoredName} point. ${leadingScore}, ${trailingScore === 0 ? 'love' : trailingScore}.`;
        
        if (p1Score >= winThreshold - 1 && p2Score >= winThreshold - 1) {
          speechPhrase += " Setting.";
        }
      }
      
      const utterance = new SpeechSynthesisUtterance(speechPhrase);
      utterance.rate = 1.05;
      utterance.pitch = 0.95;
      synth.speak(utterance);
    } catch (e) {
      // Voice synthesis blocked or unsupported
    }
  };

  const handleScoreChange = (playerNum: 1 | 2, increment: boolean) => {
    if (match.status === 'completed') return;

    let p1 = match.score1;
    let p2 = match.score2;
    const historyActionName = increment 
      ? `Point to ${playerNum === 1 ? match.player1Name : match.player2Name}`
      : `Reverted point from ${playerNum === 1 ? match.player1Name : match.player2Name}`;

    if (playerNum === 1) {
      p1 = increment ? p1 + 1 : Math.max(0, p1 - 1);
    } else {
      p2 = increment ? p2 + 1 : Math.max(0, p2 - 1);
    }

    // Server determination inside modern court rules
    // Server alternates based on rally winner in doubles/singles
    const nextServer = playerNum;

    // Check set-completed threshold
    // Must win by 2 points (e.g. 21-19, or 22-20, up to max limit of 30)
    let finalStatus = match.status;
    let setsLog = [...match.sets];
    let currentSetIdx = match.currentSetIndex;
    let winner: 1 | 2 | null = null;

    if (increment && ((p1 >= winThreshold && p1 - p2 >= 2) || p1 === 30)) {
      // Player 1 wins the current set
      setsLog.push({ score1: p1, score2: p2 });
      setSimulatorMessage(`🏆 SET completed (Set ${setsLog.length}) won by ${match.player1Name}!`);
      
      // Reset values for next set or finish match (best of 3 sets)
      const wonSetsP1 = setsLog.filter(s => s.score1 > s.score2).length;
      if (wonSetsP1 >= 2 || setsLog.length === 3) {
        finalStatus = 'completed';
        winner = wonSetsP1 >= 2 ? 1 : 2;
      } else {
        p1 = 0;
        p2 = 0;
        currentSetIdx += 1;
      }
    } else if (increment && ((p2 >= winThreshold && p2 - p1 >= 2) || p2 === 30)) {
      // Player 2 wins the current set
      setsLog.push({ score1: p1, score2: p2 });
      setSimulatorMessage(`🏆 SET completed (Set ${setsLog.length}) won by ${match.player2Name}!`);
      
      // Reset values for next set or finish match (best of 3 sets)
      const wonSetsP2 = setsLog.filter(s => s.score2 > s.score1).length;
      if (wonSetsP2 >= 2 || setsLog.length === 3) {
        finalStatus = 'completed';
        winner = wonSetsP2 >= 2 ? 2 : 1;
      } else {
        p1 = 0;
        p2 = 0;
        currentSetIdx += 1;
      }
    }

    const updatedSession: MatchSession = {
      ...match,
      score1: p1,
      score2: p2,
      sets: setsLog,
      currentSetIndex: currentSetIdx,
      status: finalStatus,
      server: nextServer,
      winner: winner,
      updatedAt: Date.now(),
      history: [
        {
          score1: p1,
          score2: p2,
          action: historyActionName,
          timestamp: Date.now()
        },
        ...match.history
      ].slice(0, 20) // Limit log rows for performance
    };

    setMatch(updatedSession);
    
    // Announce point readbacks
    if (increment) {
      announceScore(playerNum === 1 ? match.player1Name : match.player2Name, p1, p2, nextServer);
    }
  };

  const handleUndo = () => {
    if (match.history.length === 0) return;
    const historyPool = [...match.history];
    const lastAction = historyPool.shift(); // Remove last logged item
    
    // Fall back to previous scores if available in the history sequence
    if (historyPool.length > 0) {
      const prev = historyPool[0];
      setMatch({
        ...match,
        score1: prev.score1,
        score2: prev.score2,
        history: historyPool,
        updatedAt: Date.now()
      });
    } else {
      setMatch({
        ...match,
        score1: 0,
        score2: 0,
        history: [],
        updatedAt: Date.now()
      });
    }
    setSimulatorMessage("🔄 Corrected last rally entry.");
  };

  const toggleManualServer = () => {
    const next = match.server === 1 ? 2 : 1;
    setMatch({ ...match, server: next });
    setSimulatorMessage(`🏸 Serving priority manually switched to ${next === 1 ? match.player1Name : match.player2Name}`);
  };

  const resetMatchState = () => {
    if (window.confirm("Are you sure you want to clean-slate this match session?")) {
      setMatch({
        ...match,
        score1: 0,
        score2: 0,
        sets: [],
        currentSetIndex: 0,
        status: 'ongoing',
        winner: null,
        history: [{ score1: 0, score2: 0, action: "Session Clean Restarted", timestamp: Date.now() }]
      });
      setSimulatorMessage("🧼 Score log purged. Score 0-0.");
    }
  };

  // Determine active side of service based on score (Even server serves from right, Odd server from left)
  // Player 1 (even scores -> Right Court, odd scores -> Left Court)
  // For UI representation, displays current active server side
  const currentTotal = match.server === 1 ? match.score1 : match.score2;
  const isRightCourtServe = currentTotal % 2 === 0;

  return (
    <div className="space-y-6">
      
      {/* Top action bar buttons */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center p-4 bg-slate-900 border border-slate-800 rounded-2xl gap-3">
        <div>
          <button
            onClick={onBackToDashboard}
            className="inline-flex items-center gap-2 text-xs text-emerald-400 hover:text-emerald-300 font-semibold transition"
          >
            ← Back to Performance Hub
          </button>
          <div className="flex items-center gap-2 mt-1">
            <h2 className="text-lg font-bold text-white font-sans">Active Court Tracker</h2>
            <span className="text-xs font-mono bg-slate-950 border border-slate-800 px-2 py-0.5 rounded text-indigo-400">
              Court #{match.courtNumber}
            </span>
          </div>
        </div>

        {/* Global Match Rules Configurations */}
        <div className="flex items-center gap-3 overflow-x-auto w-full sm:w-auto">
          <div className="flex items-center bg-slate-950 px-2.5 py-1.5 rounded-lg border border-slate-800 text-xs">
            <span className="text-slate-500 mr-2">Set-Caps:</span>
            <select
              value={winThreshold}
              onChange={(e) => setWinThreshold(Number(e.target.value))}
              className="bg-transparent text-emerald-400 font-bold focus:outline-none cursor-pointer"
            >
              <option value="21">21 Points (Standard)</option>
              <option value="15">15 Points (Fast-Set)</option>
              <option value="11">11 Points (Sprint-Rally)</option>
            </select>
          </div>

          <button
            onClick={() => setIsSynthesizerOn(!isSynthesizerOn)}
            className={`p-2 rounded-lg border flex items-center gap-1 text-xs cursor-pointer transition-all ${
              isSynthesizerOn 
                ? 'bg-[#CCFF00]/10 border-[#CCFF00]/30 text-[#CCFF00] font-semibold' 
                : 'glass border-white/5 text-slate-500'
            }`}
            title="Toggle Umpire audio announcements"
          >
            <Volume2 className="w-4 h-4 shadow-sm" />
            <span className="hidden md:inline">{isSynthesizerOn ? 'Umpire Audio ON' : 'Audio Muted'}</span>
          </button>

          <button
            onClick={resetMatchState}
            className="p-2 bg-slate-950 hover:bg-slate-900 border border-slate-800 text-slate-400 hover:text-slate-200 rounded-lg text-xs"
            title="Reset score logs"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {simulatorMessage && (
        <div className="bg-gradient-to-r from-emerald-950/40 to-slate-900 border border-emerald-500/20 px-4 py-2.5 rounded-xl text-xs text-emerald-300 flex justify-between items-center animate-fade-in">
          <span>{simulatorMessage}</span>
          <button onClick={() => setSimulatorMessage(null)} className="text-[11px] underline text-slate-500 hover:text-slate-400 ml-1">dismiss</button>
        </div>
      )}

      {/* DUAL SIMULATOR LAYOUT: splits referee on left, live scoreboard on right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* VIEW 1: REFEREE UMPIRE CONTROL TIER (Columns 1-5) */}
        <div className="lg:col-span-5 glass p-5 rounded-3xl space-y-4">
          <div className="border-b border-white/15 pb-2">
            <span className="text-[10px] uppercase font-bold tracking-widest text-[#CCFF00]">Device Controller</span>
            <h3 className="text-sm font-semibold text-slate-200 flex items-center gap-1">
              <UserCheck className="w-4 h-4 text-[#CCFF00]" />
              Referee Interactive Terminal
            </h3>
          </div>

          {/* Player Matchup Setup Block */}
          <div className="space-y-3 bg-white/5 p-3.5 rounded-2xl border border-white/5">
            <span className="text-[10px] text-zinc-400 uppercase tracking-wider block font-semibold">Match lineup</span>
            
            <div className="space-y-2">
              <div>
                <label className="text-[10px] text-slate-500 block mb-0.5">Player 1 (Left Side)</label>
                <input
                  type="text"
                  value={match.player1Name}
                  onChange={(e) => setMatch({...match, player1Name: e.target.value})}
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-[#CCFF00]/40 transition-all"
                  placeholder="Player 1"
                />
              </div>
              <div>
                <label className="text-[10px] text-slate-500 block mb-0.5">Player 2 (Right Side)</label>
                <input
                  type="text"
                  value={match.player2Name}
                  onChange={(e) => setMatch({...match, player2Name: e.target.value})}
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-[#CCFF00]/40 transition-all"
                  placeholder="Player 2"
                />
              </div>
            </div>
          </div>

          {/* Referee Score Increment Buttons */}
          <div className="grid grid-cols-2 gap-3 pt-1">
            <div className="p-2.5 bg-white/5 rounded-2xl border border-white/5 text-center flex flex-col justify-between">
              <span className="text-xs text-slate-400 font-semibold truncate block mb-2">{match.player1Name}</span>
              <div className="flex gap-1 justify-center items-center">
                <button
                  onClick={() => handleScoreChange(1, false)}
                  className="p-1.5 glass rounded-lg text-slate-350 hover:text-white"
                >
                  <Minus className="w-4 h-4" />
                </button>
                <button
                  id="btn-add-p1"
                  onClick={() => handleScoreChange(1, true)}
                  className="px-4 py-2 neon-glow-btn font-extrabold rounded-lg flex items-center justify-center gap-1 active:scale-95 transition-all cursor-pointer"
                >
                  <Plus className="w-4 h-4" /> Point
                </button>
              </div>
            </div>

            <div className="p-2.5 bg-white/5 rounded-2xl border border-white/5 text-center flex flex-col justify-between">
              <span className="text-xs text-slate-400 font-semibold truncate block mb-2">{match.player2Name}</span>
              <div className="flex gap-1 justify-center items-center">
                <button
                  onClick={() => handleScoreChange(2, false)}
                  className="p-1.5 glass rounded-lg text-slate-350 hover:text-white"
                >
                  <Minus className="w-4 h-4" />
                </button>
                <button
                  id="btn-add-p2"
                  onClick={() => handleScoreChange(2, true)}
                  className="px-4 py-2 neon-glow-btn font-extrabold rounded-lg flex items-center justify-center gap-1 active:scale-95 transition-all cursor-pointer"
                >
                  <Plus className="w-4 h-4" /> Point
                </button>
              </div>
            </div>
          </div>

          {/* Quick Referee Tools */}
          <div className="grid grid-cols-2 gap-2 text-xs">
            <button
              onClick={toggleManualServer}
              className="py-1.5 px-2 bg-slate-900 hover:bg-slate-850 rounded-lg text-slate-300 font-medium border border-slate-800 flex items-center justify-center gap-1"
            >
              <ArrowLeftRight className="w-3.5 h-3.5 text-emerald-400" />
              Swap Server
            </button>
            <button
              id="referee-undo-btn"
              onClick={handleUndo}
              disabled={match.history.length === 0}
              className={`py-1.5 px-2 rounded-lg text-xs font-semibold flex items-center justify-center gap-1 ${
                match.history.length === 0 
                  ? 'bg-slate-900 text-slate-600 border border-slate-950 cursor-not-allowed' 
                  : 'bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800'
              }`}
            >
              🔄 Code Undo
            </button>
          </div>

          {/* Voice controlled component nested neatly here */}
          <div className="pt-2">
            <VoiceController
              onScoreIncrement={(playerNum) => handleScoreChange(playerNum, true)}
              onUndo={handleUndo}
              onToggleServer={toggleManualServer}
              player1Name={match.player1Name}
              player2Name={match.player2Name}
            />
          </div>

          {/* Log of current Set transactions */}
          <div className="glass p-3.5 rounded-2xl text-xs">
            <span className="text-[10px] text-[#CCFF00] block mb-1.5 font-mono font-bold tracking-wider">COURT DIARY (LATEST ACTIONS)</span>
            <div className="space-y-1.5 max-h-[100px] overflow-y-auto pr-1">
              {match.history.map((h, i) => (
                <div key={i} className="flex justify-between items-center text-[11px] border-b border-white/5 pb-1">
                  <span className="text-zinc-500 font-mono">
                    [{new Date(h.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}]
                  </span>
                  <span className="text-slate-300 font-medium">{h.action}</span>
                  <span className="font-mono text-[#CCFF00] font-bold bg-black/45 px-1.5 border border-white/5 rounded">
                    {h.score1}-{h.score2}
                  </span>
                </div>
              ))}
              {match.history.length === 0 && (
                <p className="text-slate-600 italic">No score registered yet. Umpire is waiting.</p>
              )}
            </div>
          </div>
        </div>

        {/* VIEW 2: HIGH-TECH SPECTATOR LIVE SCOREBOARD (Columns 6-12) */}
        <div className="lg:col-span-7 glass border border-white/10 p-6 rounded-3xl relative overflow-hidden shadow-2xl space-y-6">
          
          {/* Futuristic subtle scoreboard lines background */}
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_var(--tw-gradient-stops))] from-[#CCFF00]/5 via-transparent to-transparent pointer-events-none" />
          
          {/* Header containing court sync validation details */}
          <div className="flex justify-between items-center border-b border-white/10 pb-3 relative">
            <div>
              <span className="text-[10px] uppercase font-mono tracking-widest text-[#CCFF00] font-bold flex items-center gap-1.5 animate-pulse">
                <span className="w-2 h-2 bg-[#CCFF00] rounded-full" />
                Live Network Stream
              </span>
              <h2 className="text-base font-bold text-white font-sans mt-0.5">Court #{match.courtNumber} Stadium Feed</h2>
            </div>

            <div className="flex flex-col items-end">
              <span className="text-xs text-[#CCFF00] bg-[#CCFF00]/10 border border-[#CCFF00]/20 px-2.5 py-1 rounded-full font-mono flex items-center gap-1.5">
                <Wifi className="w-3.5 h-3.5" />
                SYNC CODE: <span className="text-white font-bold">{match.syncCode}</span>
              </span>
              <span className="text-[9px] text-zinc-500 mt-1 font-mono">Synced Umpire Node ID: badm-{match.id.slice(-6)}</span>
            </div>
          </div>

          {/* STATE INDICATOR FOR GAME */}
          <div className="flex justify-center">
            {match.status === 'completed' ? (
              <div className="bg-amber-500/15 border border-amber-500/30 text-amber-300 font-bold text-xs uppercase tracking-widest px-4 py-1.5 rounded-full flex items-center gap-1 font-sans">
                <Award className="w-4 h-4 animate-bounce" /> Match Finished - Winner: {match.winner === 1 ? match.player1Name : match.player2Name}
              </div>
            ) : (
              <div className="glass border border-[#CCFF00]/25 text-[#CCFF00] font-bold text-[10px] uppercase tracking-wider px-3.5 py-1.5 rounded-full font-mono">
                Set #{match.currentSetIndex + 1} Ongoing
              </div>
            )}
          </div>

          {/* CORE SCORES LAYOUT */}
          <div className="grid grid-cols-11 gap-4 items-center">
            
            {/* Player 1 details (Left) */}
            <div className="col-span-4 text-center space-y-2">
              <span className="text-[10px] text-slate-500 font-mono block uppercase tracking-wider">PLAYER ONE</span>
              <div className="truncate font-sans font-bold text-[15px] text-slate-200">
                {match.player1Name}
              </div>
              <div className="flex justify-center">
                {match.server === 1 ? (
                  <span className="bg-[#CCFF00] text-[#020408] font-bold text-[9px] font-mono px-2 py-1 roundeduppercase tracking-wider flex items-center gap-1 shadow-sm leading-none">
                    🏸 Serving
                  </span>
                ) : (
                  <span className="text-[9px] text-slate-600 block py-1 uppercase tracking-wider">Receiver</span>
                )}
              </div>
            </div>

            {/* Point Indicators (Numbers) */}
            <div className="col-span-3 flex justify-center items-center font-sans">
              <div className="text-center">
                <div className="text-6xl md:text-7xl font-bold tracking-tighter neon-text">
                  {match.score1}
                </div>
              </div>
              <div className="text-2xl font-light text-slate-700 px-3 opacity-50 font-mono">:</div>
              <div className="text-center">
                <div className="text-6xl md:text-7xl font-bold tracking-tighter text-white/50">
                  {match.score2}
                </div>
              </div>
            </div>

            {/* Player 2 details (Right) */}
            <div className="col-span-4 text-center space-y-2">
              <span className="text-[10px] text-slate-500 font-mono block uppercase tracking-wider">PLAYER TWO</span>
              <div className="truncate font-sans font-bold text-[15px] text-slate-200">
                {match.player2Name}
              </div>
              <div className="flex justify-center">
                {match.server === 2 ? (
                  <span className="bg-[#CCFF00] text-[#020408] font-bold text-[9px] font-mono px-2 py-1 rounded uppercase tracking-wider flex items-center gap-1 shadow-sm leading-none">
                    🏸 Serving
                  </span>
                ) : (
                  <span className="text-[9px] text-slate-600 block py-1 uppercase tracking-wider">Receiver</span>
                )}
              </div>
            </div>

          </div>

          {/* Serve position diagram helper (Court mapping) */}
          <div className="glass p-3.5 rounded-2xl relative">
            <div className="flex justify-between items-center text-[10px] text-slate-500 border-b border-zinc-800 pb-1.5 mb-2 font-mono">
              <span>🏸 SERVING COURT GRAPHIC</span>
              <span className="text-[#CCFF00]">Total sets played: {match.sets.length}</span>
            </div>

            {/* Mock court illustration */}
            <div className="grid grid-cols-2 gap-1 border border-white/5 rounded-xl h-14 relative bg-white/5 p-1">
              {/* Mid court net */}
              <div className="absolute inset-y-0 left-1/2 w-0.5 bg-white/20 z-10 flex flex-col justify-between items-center">
                <span className="bg-[#CCFF00] text-[8px] text-black font-bold px-1 rounded-sm scale-75 -mt-2">Net</span>
              </div>

              {/* Left court block */}
              <div className={`rounded flex items-center justify-center text-[10px] relative ${
                match.server === 1 
                  ? 'bg-[#CCFF00]/10 border border-[#CCFF00]/30'
                  : ''
              }`}>
                <div className="text-center font-sans">
                  <span className="block font-bold text-slate-300">{match.player1Name.split(' ')[0]}</span>
                  <span className="text-[9px] text-slate-500 font-mono">
                    {match.server === 1 ? (isRightCourtServe ? 'Right Court (Even)' : 'Left Court (Odd)') : 'Receiving'}
                  </span>
                </div>
              </div>

              {/* Right court block */}
              <div className={`rounded flex items-center justify-center text-[10px] relative ${
                match.server === 2 
                  ? 'bg-[#CCFF00]/10 border border-[#CCFF00]/30'
                  : ''
              }`}>
                <div className="text-center font-sans">
                  <span className="block font-bold text-slate-300">{match.player2Name.split(' ')[0]}</span>
                  <span className="text-[9px] text-slate-500 font-mono">
                    {match.server === 2 ? (isRightCourtServe ? 'Right Court (Even)' : 'Left Court (Odd)') : 'Receiving'}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* PREVIOUS SET RESUMES */}
          <div className="glass p-3 rounded-2xl border border-white/5">
            <h4 className="text-[10px] uppercase font-mono tracking-wider text-[#CCFF00] mb-2 font-bold">Previous Sets Summary</h4>
            <div className="grid grid-cols-3 gap-2 text-center text-xs font-mono font-bold">
              
              <div className={`p-2.5 rounded-xl border ${match.sets.length >= 1 ? 'bg-[#CCFF00]/10 border-[#CCFF00]/20 text-[#CCFF00]' : 'bg-white/5 border-white/5 text-slate-600'}`}>
                <div className="text-[9px] text-slate-500 mb-0.5">SET 1</div>
                <div>{match.sets[0] ? `${match.sets[0].score1} - ${match.sets[0].score2}` : 'Pending'}</div>
              </div>

              <div className={`p-2.5 rounded-xl border ${match.sets.length >= 2 ? 'bg-[#CCFF00]/10 border-[#CCFF00]/20 text-[#CCFF00]' : 'bg-white/5 border-white/5 text-slate-600'}`}>
                <div className="text-[9px] text-slate-500 mb-0.5">SET 2</div>
                <div>{match.sets[1] ? `${match.sets[1].score1} - ${match.sets[1].score2}` : 'Pending'}</div>
              </div>

              <div className={`p-2.5 rounded-xl border ${match.sets.length >= 3 ? 'bg-[#CCFF00]/10 border-[#CCFF00]/20 text-[#CCFF00]' : 'bg-white/5 border-white/5 text-slate-600'}`}>
                <div className="text-[9px] text-slate-500 mb-0.5">SET 3</div>
                <div>{match.sets[2] ? `${match.sets[2].score1} - ${match.sets[2].score2}` : 'Pending'}</div>
              </div>

            </div>
          </div>

        </div>

      </div>

    </div>
  );
}
