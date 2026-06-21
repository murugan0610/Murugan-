/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type SkillLevel = 'Beginner' | 'Intermediate' | 'Advanced' | 'Professional';
export type MatchCategory = 'Singles' | 'Doubles' | 'Mixed';

export interface PlayerStats {
  matchesPlayed: number;
  matchesWon: number;
  matchesLost: number;
  winStreak: number;
  totalPointsScored: number;
  averageSmashSpeed: number; // in km/h
  accuracyRate: number; // percentage
  staminaScore: number; // 0 - 100
}

export interface Player {
  id: string; // Unique Registered ID e.g., BPA-2026-X
  name: string;
  phone: string;
  academyId: string | null; // Associated Academy
  skillLevel: SkillLevel;
  preferredCategory: MatchCategory;
  racket: string;
  bio: string;
  stats: PlayerStats;
  joinedDate: string;
}

export interface Academy {
  id: string; // Unique Registered ID e.g., BAC-2026-Y
  name: string;
  phone: string;
  location: string;
  courtsCount: number;
  ratings: number;
  enrolledPlayersCount: number;
  coaches: string[];
  services: string[];
  description: string;
  facilities: string[];
}

export interface SetScore {
  score1: number;
  score2: number;
}

export interface MatchSession {
  id: string;
  player1Name: string;
  player2Name: string;
  player1Id: string | null;
  player2Id: string | null;
  score1: number; // Current set score P1
  score2: number; // Current set score P2
  sets: SetScore[]; // Previous sets' scores (e.g. Set 1: 21-19)
  currentSetIndex: number; // 0, 1, or 2
  status: 'ongoing' | 'completed' | 'paused';
  courtNumber: number;
  server: 1 | 2; // Serving side
  winner: 1 | 2 | null;
  syncCode: string; // 4-digit code for remote real-time referee sync
  updatedAt: number;
  history: {
    score1: number;
    score2: number;
    action: string;
    timestamp: number;
  }[];
}

export interface AuthState {
  user: {
    role: 'player' | 'academy' | 'spectator' | 'admin';
    id: string; // Player or Academy ID
    name: string;
    phone: string;
  } | null;
}
