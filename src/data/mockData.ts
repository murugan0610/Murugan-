/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Player, Academy, MatchSession } from '../types';

export const mockAcademies: Academy[] = [
  {
    id: "BAC-2026-9051",
    name: "Apex Badminton Arena",
    phone: "+19875550101",
    location: "North Court Hills, Sector 4",
    courtsCount: 8,
    ratings: 4.9,
    enrolledPlayersCount: 124,
    coaches: ["Coach Vikram Dev (Ex-National)", "Coach Lee Wei (Singles Specialist)"],
    services: ["Pro Coaching", "Court Booking", "Racket Stringing", "Tournament Hosting"],
    description: "State-of-the-art wooden court facility with premium LED lighting and specialized recovery zones. Home of national-tier junior training streams.",
    facilities: ["Elite Wooden Courts", "Showers & Lockers", "Badmin-Shop", "Cafeteria", "Video Analysis Lab"]
  },
  {
    id: "BAC-2026-1111",
    name: "Elite Smashers Academy",
    phone: "+19875550202",
    location: "Downtown Sports Complex, Arena Road",
    courtsCount: 6,
    ratings: 4.7,
    enrolledPlayersCount: 85,
    coaches: ["Coach Sarah Jenkins (Doubles Expert)", "Coach Maria Santos"],
    services: ["Group Coaching", "Court Booking", "Fitness Camp"],
    description: "Premium synthetic courts engineered specifically to reduce knee impact. Highly family-friendly with robust recreational internal leagues.",
    facilities: ["Impact-absorbing Synthetic Courts", "Pro-shop", "Observation Lounge", "Fitness Gym"]
  },
  {
    id: "BAC-2026-8800",
    name: "Aero Shuttle Pro Club",
    phone: "+19875550303",
    location: "Metro Plaza East, B-Wing",
    courtsCount: 10,
    ratings: 4.8,
    enrolledPlayersCount: 160,
    coaches: ["Coach Taufik H. (Honorary)", "Coach Rajan Sharma"],
    services: ["One-on-One Training", "Corporate leagues", "Stringing Hub"],
    description: "The largest indoor badminton complex in the metro region. Boasting 10 tournament-grade courts and real-time speed monitoring cameras.",
    facilities: ["Synthetic & Wooden Hybrid Courts", "Steam Rooms", "Premium Stringing Center", "Youth Hostel Rooms"]
  }
];

export const mockPlayers: Player[] = [
  {
    id: "BPA-2026-8021",
    name: "Aravind 'Smash' Kumar",
    phone: "+19875550101",
    academyId: "BAC-2026-9051",
    skillLevel: "Professional",
    preferredCategory: "Singles",
    racket: "YONEX Astrox 99 Pro",
    bio: "Attacking singles player modeled on heavy jumpsmashes and quick net drops. Current state quarter-finalist.",
    joinedDate: "2026-01-10",
    stats: {
      matchesPlayed: 48,
      matchesWon: 41,
      matchesLost: 7,
      winStreak: 9,
      totalPointsScored: 1012,
      averageSmashSpeed: 412, // km/h
      accuracyRate: 88,
      staminaScore: 92
    }
  },
  {
    id: "BPA-2026-4444",
    name: "Sarah 'The Wall' Chen",
    phone: "+19875550202",
    academyId: "BAC-2026-1111",
    skillLevel: "Advanced",
    preferredCategory: "Doubles",
    racket: "YONEX Nanoflare 1000Z",
    bio: "Superfast defensive doubles tactician. Excellent court coverage with highly accurate flat drives.",
    joinedDate: "2026-03-05",
    stats: {
      matchesPlayed: 32,
      matchesWon: 24,
      matchesLost: 8,
      winStreak: 3,
      totalPointsScored: 680,
      averageSmashSpeed: 325,
      accuracyRate: 91,
      staminaScore: 85
    }
  },
  {
    id: "BPA-2026-6284",
    name: "Rohan Bhatia",
    phone: "+19875550303",
    academyId: "BAC-2026-8800",
    skillLevel: "Intermediate",
    preferredCategory: "Mixed",
    racket: "Victor Thruster K Ryuga",
    bio: "Energetic all-rounder trying to transition from singles to mixed doubles. Working on overhead wrist clears.",
    joinedDate: "2026-05-18",
    stats: {
      matchesPlayed: 18,
      matchesWon: 10,
      matchesLost: 8,
      winStreak: 1,
      totalPointsScored: 310,
      averageSmashSpeed: 295,
      accuracyRate: 74,
      staminaScore: 78
    }
  }
];

export const mockMatches: MatchSession[] = [
  {
    id: "match-101",
    player1Name: "Aravind 'Smash' Kumar",
    player2Name: "Sarah 'The Wall' Chen",
    player1Id: "BPA-2026-8021",
    player2Id: "BPA-2026-4444",
    score1: 18,
    score2: 19,
    sets: [
      { score1: 21, score2: 17 },
      { score1: 18, score2: 21 }
    ],
    currentSetIndex: 2,
    status: "ongoing",
    courtNumber: 3,
    server: 2,
    winner: null,
    syncCode: "7749",
    updatedAt: Date.now(),
    history: [
      { score1: 0, score2: 0, action: "Match Started", timestamp: Date.now() - 3600000 },
      { score1: 21, score2: 17, action: "Set 1 completed", timestamp: Date.now() - 2400000 },
      { score1: 18, score2: 21, action: "Set 2 completed", timestamp: Date.now() - 1200000 },
      { score1: 18, score2: 19, action: "Point to Sarah Chen via cross smash", timestamp: Date.now() - 50000 }
    ]
  },
  {
    id: "match-102",
    player1Name: "Rohan Bhatia",
    player2Name: "Guest Player",
    player1Id: "BPA-2026-6284",
    player2Id: null,
    score1: 21,
    score2: 13,
    sets: [
      { score1: 21, score2: 18 }
    ],
    currentSetIndex: 1,
    status: "completed",
    courtNumber: 1,
    server: 1,
    winner: 1,
    syncCode: "5024",
    updatedAt: Date.now() - 86400000,
    history: [
      { score1: 0, score2: 0, action: "Match Started", timestamp: Date.now() - 88000000 },
      { score1: 21, score2: 18, action: "Set 1 completed", timestamp: Date.now() - 87000000 },
      { score1: 21, score2: 13, action: "Set 2 and match won by Rohan", timestamp: Date.now() - 86400000 }
    ]
  }
];
