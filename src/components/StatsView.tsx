/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Player } from '../types';
import { motion } from 'motion/react';
import { TrendingUp, Award, Zap, Activity, ShieldAlert, Crosshair, Sparkles, Scale, Heart, Compass } from 'lucide-react';

interface StatsViewProps {
  players: Player[];
}

export default function StatsView({ players }: StatsViewProps) {
  const [selectedPlayerId, setSelectedPlayerId] = useState<string>(players[0]?.id || '');
  const [comparePlayerId, setComparePlayerId] = useState<string>('');

  const activePlayer = players.find(p => p.id === selectedPlayerId) || players[0];
  const comparePlayer = players.find(p => p.id === comparePlayerId);

  // Custom Trigonometric coordinates for Radar (Spider) Chart
  // 6 dimensions: [Smash Speed, Accuracy, Stamina, Net-Play, Agility, Defense]
  const dimensions = [
    { label: 'Smash Speed', key: 'smash', max: 450 },
    { label: 'Accuracy %', key: 'accuracy', max: 100 },
    { label: 'Stamina', key: 'stamina', max: 100 },
    { label: 'Net Play', key: 'net', max: 100 },
    { label: 'Agility', key: 'agility', max: 100 },
    { label: 'Defense', key: 'defense', max: 100 }
  ];

  const getPlayerRadarValues = (player: Player) => {
    // Extract real and simulate supplemental radar nodes based on their category
    const stats = player.stats;
    const isProfessional = player.skillLevel === 'Professional';
    const isAdvanced = player.skillLevel === 'Advanced';
    
    return {
      smash: stats.averageSmashSpeed,
      accuracy: stats.accuracyRate,
      stamina: stats.staminaScore,
      net: isProfessional ? 90 : isAdvanced ? 82 : 72,
      agility: isProfessional ? 94 : isAdvanced ? 85 : 75,
      defense: player.preferredCategory === 'Doubles' ? 92 : 78
    };
  };

  const drawRadarPolygons = (p: Player, color: string, fill: string) => {
    const rawValues = getPlayerRadarValues(p);
    const center = 110;
    const maxRadius = 80;

    const points = dimensions.map((dim, index) => {
      const val = (rawValues as any)[dim.key] || 50;
      const ratio = val / dim.max;
      const radius = ratio * maxRadius;
      
      // Calculate angular vertices
      const angle = (index * 2 * Math.PI) / dimensions.length - Math.PI / 2;
      const x = center + radius * Math.cos(angle);
      const y = center + radius * Math.sin(angle);
      
      return `${x},${y}`;
    });

    return (
      <polygon
        points={points.join(' ')}
        fill={fill}
        stroke={color}
        strokeWidth="2.5"
        className="transition-all duration-300"
      />
    );
  };

  const renderRadarChartAxes = () => {
    const center = 110;
    const maxRadius = 80;

    return dimensions.map((dim, index) => {
      const angle = (index * 2 * Math.PI) / dimensions.length - Math.PI / 2;
      const x = center + maxRadius * Math.cos(angle);
      const y = center + maxRadius * Math.sin(angle);

      // Label coordinate placement
      const labelDistance = maxRadius + 22;
      const lx = center + labelDistance * Math.cos(angle);
      const ly = center + labelDistance * Math.sin(angle);

      return (
        <g key={dim.label}>
          {/* Axis Line */}
          <line
            x1={center} y1={center}
            x2={x} y2={y}
            stroke="rgba(148, 163, 184, 0.2)"
            strokeWidth="1"
            strokeDasharray="2 2"
          />
          {/* Outer Boundary Labels */}
          <text
            x={lx}
            y={ly}
            textAnchor="middle"
            dominantBaseline="middle"
            className="text-[10px] font-mono font-semibold fill-slate-400"
          >
            {dim.label}
          </text>
        </g>
      );
    });
  };

  const getWinRate = (p: Player) => {
    if (!p.stats.matchesPlayed) return 0;
    return Math.round((p.stats.matchesWon / p.stats.matchesPlayed) * 100);
  };

  return (
    <div className="space-y-6">
      
      {/* Selector & Comparer Bar */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 glass p-4 rounded-3xl mb-1.5">
        <div>
          <label className="block text-xs font-semibold text-slate-400 mb-1.5 font-sans mono uppercase tracking-wider text-[10px]">Active Player Profile Analytics</label>
          <select
            id="stats-player-select"
            value={selectedPlayerId}
            onChange={(e) => setSelectedPlayerId(e.target.value)}
            className="w-full bg-white/5 border border-white/10 hover:border-white/20 focus:border-[#CCFF00]/40 rounded-xl py-2 px-3 text-sm text-white focus:outline-none font-semibold transition-all cursor-pointer"
          >
            {players.map(p => (
              <option key={p.id} value={p.id} className="bg-[#020408] text-slate-300">{p.name} ({p.id})</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-400 mb-1.5 font-sans mono uppercase tracking-wider text-[10px]">Compare With Side-By-Side (Optional)</label>
          <select
            id="stats-compare-select"
            value={comparePlayerId}
            onChange={(e) => setComparePlayerId(e.target.value)}
            className="w-full bg-white/5 border border-white/10 hover:border-white/20 focus:border-[#CCFF00]/40 rounded-xl py-2 px-3 text-sm text-slate-300 focus:outline-none transition-all cursor-pointer"
          >
            <option value="" className="bg-[#020408] text-slate-455">-- Select Player to Compare --</option>
            {players.filter(p => p.id !== selectedPlayerId).map(p => (
              <option key={p.id} value={p.id} className="bg-[#020408] text-slate-300">{p.name} ({p.id})</option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

        {/* PROFILE INFORMATION DETAILS BOX (4 Columns) */}
        <div className="lg:col-span-4 glass p-6 rounded-3xl space-y-5">
          <div className="text-center pb-3 border-b border-white/5">
            <span className="inline-block bg-[#CCFF00]/15 text-[#CCFF00] text-[10px] font-mono px-3 py-1 rounded-full border border-[#CCFF00]/25 font-bold mb-2">
              ID: {activePlayer.id}
            </span>
            <h3 className="text-xl font-bold text-white font-sans">{activePlayer.name}</h3>
            <p className="text-xs text-slate-400 mt-1">{activePlayer.skillLevel} Contender • {activePlayer.preferredCategory}</p>
          </div>

          <div className="space-y-3.5 text-xs text-slate-350">
            <div className="flex justify-between border-b border-white/5 pb-2">
              <span className="text-slate-500">Contact Number</span>
              <span className="font-mono text-slate-300 font-semibold">{activePlayer.phone}</span>
            </div>
            <div className="flex justify-between border-b border-white/5 pb-2">
              <span className="text-slate-500">Fitted Racket</span>
              <span className="text-[#CCFF00] font-semibold">{activePlayer.racket}</span>
            </div>
            <div className="flex justify-between border-b border-white/5 pb-2">
              <span className="text-slate-500">Member Since</span>
              <span className="font-mono text-slate-400">{activePlayer.joinedDate}</span>
            </div>
            <div>
              <span className="text-slate-500 block mb-1">Coaching Bio</span>
              <p className="text-slate-450 text-[11px] leading-relaxed bg-white/5 p-3 rounded-2xl border border-white/5 italic">
                "{activePlayer.bio}"
              </p>
            </div>
          </div>

          {/* Core Metric Highlights */}
          <div className="grid grid-cols-2 gap-2 text-center pt-2">
            <div className="p-3 bg-white/5 rounded-2xl border border-white/5">
              <span className="text-[10px] text-zinc-500 block uppercase font-mono mb-1">Win Ratio</span>
              <span className="text-lg font-extrabold text-white font-mono">{getWinRate(activePlayer)}%</span>
              <span className="text-[9px] text-slate-450 block mt-0.5">{activePlayer.stats.matchesWon}W | {activePlayer.stats.matchesLost}L</span>
            </div>
            <div className="p-3 bg-white/5 rounded-2xl border border-white/5">
              <span className="text-[10px] text-zinc-500 block uppercase font-mono mb-1">Current Streak</span>
              <span className="text-lg font-bold text-[#CCFF00] font-mono">+{activePlayer.stats.winStreak} Win</span>
              <span className="text-[9px] text-slate-450 block mt-0.5">Consecutive Games</span>
            </div>
          </div>
        </div>

        {/* RADAR CHART RADIAL STATS GRAPHIC (5 Columns) */}
        <div className="lg:col-span-5 glass p-6 rounded-3xl flex flex-col items-center justify-center space-y-4">
          <div className="text-center w-full border-b border-white/5 pb-2">
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest font-mono flex items-center justify-center gap-1.5">
              <Compass className="w-4 h-4 text-[#CCFF00]" /> Attribute Vector Projection
            </h4>
            <p className="text-[10px] text-slate-500 mt-0.5 font-sans">Radar showing calibrated performance zones</p>
          </div>

          {/* SVG Radar Graphic Grid */}
          <div className="relative w-full aspect-square max-w-[280px]">
            <svg viewBox="0 0 220 220" className="w-[100%] h-[100%] mx-auto">
              {/* Outer Spider Grid Boundaries */}
              <circle cx="110" cy="110" r="80" stroke="rgba(148, 163, 184, 0.08)" fill="none" strokeWidth="1" />
              <circle cx="110" cy="110" r="60" stroke="rgba(148, 163, 184, 0.08)" fill="none" strokeWidth="1" />
              <circle cx="110" cy="110" r="40" stroke="rgba(148, 163, 184, 0.08)" fill="none" strokeWidth="1" />
              <circle cx="110" cy="110" r="20" stroke="rgba(148, 163, 184, 0.08)" fill="none" strokeWidth="1" />

              {/* Axes lines & labels */}
              {renderRadarChartAxes()}

              {/* Render Selected Primary Player Polygon */}
              {drawRadarPolygons(activePlayer, '#CCFF00', 'rgba(204, 255, 0, 0.15)')}

              {/* Render Comparison Player Polygon */}
              {comparePlayer && drawRadarPolygons(comparePlayer, '#6366f1', 'rgba(99, 102, 241, 0.15)')}
            </svg>
          </div>

          {/* Legend indicator */}
          <div className="flex gap-4 justify-center text-xs pt-1">
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 bg-[#CCFF00] rounded-full" />
              <span className="text-slate-350 font-medium">{activePlayer.name.split(' ')[0]}</span>
            </div>
            {comparePlayer && (
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 bg-[#6366f1] rounded-full" />
                <span className="text-slate-350 font-medium">{comparePlayer.name.split(' ')[0]}</span>
              </div>
            )}
          </div>
        </div>

        {/* COMPARATIVE PHYSICAL HIGHLIGHTS (3 Columns) */}
        <div className="lg:col-span-3 glass p-5 rounded-3xl space-y-4">
          <div className="border-b border-white/5 pb-2">
            <span className="text-[10px] text-slate-500 block uppercase font-mono">Physical Vectors</span>
            <h4 className="text-xs font-bold text-slate-200">Speed & Accuracies</h4>
          </div>

          <div className="space-y-4 pt-1 font-sans">
            {/* Average Smash Speed Card */}
            <div className="space-y-1">
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-400 font-medium flex items-center gap-1"><Zap className="w-3.5 h-3.5 text-[#CCFF00]" /> Peak Smash</span>
                <span className="font-mono text-slate-100 font-bold">{activePlayer.stats.averageSmashSpeed} km/h</span>
              </div>
              <div className="w-full bg-white/5 rounded-full h-1.5 overflow-hidden border border-white/5">
                <div
                  className="bg-gradient-to-r from-[#CCFF00] to-yellow-400 h-full rounded-full transition-all duration-350"
                  style={{ width: `${(activePlayer.stats.averageSmashSpeed / 450) * 100}%` }}
                />
              </div>
              {comparePlayer && (
                <div className="flex justify-between items-center text-[10px] text-zinc-550">
                  <span>{comparePlayer.name.split(' ')[0]}</span>
                  <span>{comparePlayer.stats.averageSmashSpeed} km/h</span>
                </div>
              )}
            </div>

            {/* Accuracy card */}
            <div className="space-y-1">
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-400 font-medium flex items-center gap-1"><Crosshair className="w-3.5 h-3.5 text-teal-400" /> Precision</span>
                <span className="font-mono text-slate-100 font-bold">{activePlayer.stats.accuracyRate}%</span>
              </div>
              <div className="w-full bg-white/5 rounded-full h-1.5 overflow-hidden border border-white/5">
                <div
                  className="bg-[#CCFF00] h-full rounded-full transition-all duration-350"
                  style={{ width: `${activePlayer.stats.accuracyRate}%` }}
                />
              </div>
              {comparePlayer && (
                <div className="flex justify-between items-center text-[10px] text-zinc-550">
                   <span>{comparePlayer.name.split(' ')[0]}</span>
                  <span>{comparePlayer.stats.accuracyRate}%</span>
                </div>
              )}
            </div>

            {/* Stamina card */}
            <div className="space-y-1">
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-400 font-medium flex items-center gap-1"><Heart className="w-3.5 h-3.5 text-rose-500" /> Stamina Cap</span>
                <span className="font-mono text-slate-100 font-bold">{activePlayer.stats.staminaScore}/100</span>
              </div>
              <div className="w-full bg-white/5 rounded-full h-1.5 overflow-hidden border border-white/5">
                <div
                  className="bg-rose-500 h-full rounded-full transition-all duration-355"
                  style={{ width: `${activePlayer.stats.staminaScore}%` }}
                />
              </div>
              {comparePlayer && (
                <div className="flex justify-between items-center text-[10px] text-zinc-550">
                  <span>{comparePlayer.name.split(' ')[0]}</span>
                  <span>{comparePlayer.stats.staminaScore}/100</span>
                </div>
              )}
            </div>

            {/* Total Points Gathered */}
            <div className="space-y-1">
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-400 font-medium flex items-center gap-1"><TrendingUp className="w-3.5 h-3.5 text-blue-400" /> Career Points</span>
                <span className="font-mono text-slate-100 font-bold">{activePlayer.stats.totalPointsScored} pts</span>
              </div>
              <div className="w-full bg-white/5 rounded-full h-1.5 overflow-hidden border border-white/5">
                <div
                  className="bg-blue-400 h-full rounded-full transition-all duration-360"
                  style={{ width: `${Math.min(100, (activePlayer.stats.totalPointsScored / 1200) * 100)}%` }}
                />
              </div>
              {comparePlayer && (
                <div className="flex justify-between items-center text-[10px] text-zinc-550">
                  <span>{comparePlayer.name.split(' ')[0]}</span>
                  <span>{comparePlayer.stats.totalPointsScored}pts</span>
                </div>
              )}
            </div>
            
          </div>
        </div>

      </div>

    </div>
  );
}
