/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Phone, Lock, Key, ShieldCheck, User, Building, ArrowRight, BookOpen, AlertCircle, RefreshCw, Smartphone } from 'lucide-react';
import { Player, Academy } from '../types';

interface AuthScreenProps {
  onLoginSuccess: (user: { role: 'player' | 'academy' | 'spectator' | 'admin'; id: string; name: string; phone: string }) => void;
  players: Player[];
  academies: Academy[];
  onRegisterPlayer: (player: Player) => void;
  onRegisterAcademy: (academy: Academy) => void;
}

export default function AuthScreen({
  onLoginSuccess,
  players,
  academies,
  onRegisterPlayer,
  onRegisterAcademy
}: AuthScreenProps) {
  const [activeTab, setActiveTab] = useState<'login' | 'register'>('login');
  const [loginMethod, setLoginMethod] = useState<'password' | 'otp'>('password');
  
  // Login Form States
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  
  // Register Form States
  const [regRole, setRegRole] = useState<'player' | 'academy'>('player');
  const [regName, setRegName] = useState('');
  const [regPhone, setRegPhone] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regExtraField, setRegExtraField] = useState(''); // Racket model for player, Location for Academy
  const [selectedAcademyId, setSelectedAcademyId] = useState('');

  // OTP Verification States
  const [otpSent, setOtpSent] = useState(false);
  const [otpCode, setOtpCode] = useState(['', '', '', '']);
  const [otpCountdown, setOtpCountdown] = useState(0);
  const [verificationError, setVerificationError] = useState('');
  const [infoMessage, setInfoMessage] = useState('');
  const [generatedId, setGeneratedId] = useState('');

  // Countdown timer for OTP
  useEffect(() => {
    let timer: any;
    if (otpCountdown > 0) {
      timer = setInterval(() => {
        setOtpCountdown((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [otpCountdown]);

  const handleSendOTP = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!phone || phone.length < 9) {
      setVerificationError('Please enter a valid mobile number');
      return;
    }
    setVerificationError('');
    setOtpSent(true);
    setOtpCountdown(60);
    setInfoMessage('A simulated OTP code [2 0 2 6] sent via secure gateway to ' + phone);
  };

  const verifyOTP = () => {
    const codeStr = otpCode.join('');
    if (codeStr === '2026') {
      // Find matching user by phone
      let matchedUser = null;
      if (regRole === 'player') {
        const found = players.find(p => p.phone === phone || p.phone.includes(phone) || phone.includes(p.phone));
        if (found) {
          matchedUser = { role: 'player' as const, id: found.id, name: found.name, phone: found.phone };
        }
      } else {
        const found = academies.find(a => a.phone === phone || a.phone.includes(phone) || phone.includes(a.phone));
        if (found) {
          matchedUser = { role: 'academy' as const, id: found.id, name: found.name, phone: found.phone };
        }
      }

      if (!matchedUser) {
        // If not found in mock database, sign in as a dynamic premium spectator / new user-in-transit
        matchedUser = {
          role: regRole,
          id: regRole === 'player' ? 'BPA-2026-TEMP' : 'BAC-2026-TEMP',
          name: regRole === 'player' ? 'New Player' : 'Sports Academy Hub',
          phone: phone
        };
      }

      onLoginSuccess(matchedUser);
    } else {
      setVerificationError('Invalid security code. Please use the passcode [2026] for testing.');
    }
  };

  const handlePasswordLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!phone || !password) {
      setVerificationError('Please fill in all phone and credentials fields');
      return;
    }

    // CHECK FOR THE SINGLE ADMINISTRATOR SECURE PORTAL ACCESS
    const normalizedPhone = phone.trim().toLowerCase();
    const normalizedPassword = password.trim().toLowerCase();
    if (
      (normalizedPhone === 'admin' || normalizedPhone === '9999999999') && 
      (normalizedPassword === 'admin' || normalizedPassword === 'admin2026')
    ) {
      onLoginSuccess({
        role: 'admin',
        id: 'BADM-ADMIN-01',
        name: 'Badminton Network Director',
        phone: '9999999999'
      });
      return;
    }

    // Checking match in existing pool
    const matchedPlayer = players.find(p => p.phone && (p.phone.includes(phone) || phone.includes(p.phone)));
    const matchedAcademy = academies.find(a => a.phone && (a.phone.includes(phone) || phone.includes(a.phone)));

    if (matchedPlayer) {
      onLoginSuccess({
        role: 'player',
        id: matchedPlayer.id,
        name: matchedPlayer.name,
        phone: matchedPlayer.phone
      });
    } else if (matchedAcademy) {
      onLoginSuccess({
        role: 'academy',
        id: matchedAcademy.id,
        name: matchedAcademy.name,
        phone: matchedAcademy.phone
      });
    } else {
      // For instant showcase ease, let them login instantly with credentials as a mock user!
      const randomSuffix = Math.floor(1000 + Math.random() * 9000);
      onLoginSuccess({
        role: regRole,
        id: regRole === 'player' ? `BPA-2026-${randomSuffix}` : `BAC-2026-${randomSuffix}`,
        name: phone === '1234567890' ? 'Pro Badminton Player' : `User (${phone.slice(-4)})`,
        phone: phone
      });
    }
  };

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    if (!regName || !regPhone || !regPassword) {
      setVerificationError('All primary fields are required');
      return;
    }

    const randomSuffix = Math.floor(1000 + Math.random() * 9000);

    if (regRole === 'player') {
      const newId = `BPA-2026-${randomSuffix}`;
      const newPlayer: Player = {
        id: newId,
        name: regName,
        phone: regPhone,
        academyId: selectedAcademyId || null,
        skillLevel: 'Intermediate',
        preferredCategory: 'Singles',
        racket: regExtraField || 'YONEX Voltric Pro',
        bio: 'Self-registered aspiring tournament contender.',
        joinedDate: new Date().toISOString().split('T')[0],
        stats: {
          matchesPlayed: 0,
          matchesWon: 0,
          matchesLost: 0,
          winStreak: 0,
          totalPointsScored: 0,
          averageSmashSpeed: 240,
          accuracyRate: 65,
          staminaScore: 70
        }
      };
      onRegisterPlayer(newPlayer);
      setGeneratedId(newId);
      setInfoMessage(`Registration successful! Your Unique Player ID is ${newId}.`);
    } else {
      const newId = `BAC-2026-${randomSuffix}`;
      const newAcademy: Academy = {
        id: newId,
        name: regName,
        phone: regPhone,
        location: regExtraField || 'Central Court Complex',
        courtsCount: 4,
        ratings: 5.0,
        enrolledPlayersCount: 1,
        coaches: ['Head Coach Dev'],
        services: ['Court Booking', 'Coaching Academy'],
        description: 'Elite training facility curated for local club rankings.',
        facilities: ['Standard Synthetic Courts', 'Equipment Store']
      };
      onRegisterAcademy(newAcademy);
      setGeneratedId(newId);
      setInfoMessage(`Registration successful! Your Unique Academy ID is ${newId}.`);
    }

    // Auto sign-in after brief delay
    setTimeout(() => {
      onLoginSuccess({
        role: regRole,
        id: `BA-${regRole === 'player' ? 'P' : 'C'}-2026-${randomSuffix}`,
        name: regName,
        phone: regPhone
      });
    }, 2500);
  };

  const handleOtpKeyUp = (index: number, val: string) => {
    if (val.length <= 1) {
      const newOtp = [...otpCode];
      newOtp[index] = val;
      setOtpCode(newOtp);
      
      // Auto focus next input
      if (val && index < 3) {
        const nextInput = document.getElementById(`otp-input-${index + 1}`);
        nextInput?.focus();
      }
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[80vh] w-full p-4 text-slate-100">
      <div className="w-full max-w-md glass rounded-3xl p-8 relative overflow-hidden shadow-2xl">
        
        {/* Ambient indicator background glow */}
        <div className="absolute top-[-40%] left-[-20%] w-72 h-72 rounded-full bg-[#CCFF00]/10 blur-[80px] pointer-events-none" />

        {/* Header Display */}
        <div className="text-center mb-6 relative z-10">
          <div className="w-12 h-12 glass rounded-xl flex items-center justify-center neon-border mb-3 mx-auto">
            <Smartphone className="w-6 h-6 text-[#CCFF00]" />
          </div>
          <h2 className="text-2xl font-bold tracking-tight text-white uppercase">
            AERO<span className="neon-text">SYNC</span> PRO
          </h2>
          <p className="text-xs text-slate-400 mt-1 mono tracking-wider uppercase">Global Network ID: AS-2026-ACTIVE</p>
        </div>

        {/* Tab List */}
        <div className="flex glass p-1.5 rounded-2xl mb-6 relative z-10">
          <button
            id="tab-login"
            onClick={() => { setActiveTab('login'); setVerificationError(''); setInfoMessage(''); }}
            className={`flex-1 py-2 text-xs font-semibold rounded-xl transition-all cursor-pointer ${
              activeTab === 'login'
                ? 'neon-glow-btn font-bold'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Terminal SignIn
          </button>
          <button
            id="tab-register"
            onClick={() => { setActiveTab('register'); setVerificationError(''); setInfoMessage(''); }}
            className={`flex-1 py-2 text-xs font-semibold rounded-xl transition-all cursor-pointer ${
              activeTab === 'register'
                ? 'neon-glow-btn font-bold'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            New Registration
          </button>
        </div>

        {/* Error / Information Prompts */}
        {verificationError && (
          <div className="flex items-start gap-2 glass border-l-2 border-l-red-500 bg-red-950/20 p-3.5 rounded-xl mb-4 text-xs text-red-300 relative z-10">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-red-400" />
            <span>{verificationError}</span>
          </div>
        )}

        {infoMessage && (
          <div className="flex items-start gap-2 glass border border-[#CCFF00]/30 bg-[#CCFF00]/5 p-3.5 rounded-xl mb-4 text-xs text-slate-200 relative z-10">
            <ShieldCheck className="w-4 h-4 shrink-0 mt-0.5 text-[#CCFF00]" />
            <div>
              <p className="font-semibold text-white">{infoMessage}</p>
              {generatedId && (
                <p className="mt-1 text-[10px] text-zinc-400 font-mono">
                  Save this ID for tournament entry sheets.
                </p>
              )}
            </div>
          </div>
        )}

        <AnimatePresence mode="wait">
          {activeTab === 'login' ? (
            <motion.div
              key="login"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
            >
              {/* Method Switch: Mobile PIN / Mobile OTP */}
              <div className="mb-4 flex justify-between items-center glass p-2 rounded-xl text-xs relative z-10">
                <span className="text-slate-400">SignIn Method</span>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => { setLoginMethod('password'); setOtpSent(false); }}
                    className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer text-[11px] ${loginMethod === 'password' ? 'bg-[#CCFF00]/15 text-[#CCFF00] font-semibold border border-[#CCFF00]/25' : 'text-slate-500'}`}
                  >
                    Mobile + PIN
                  </button>
                  <button
                    type="button"
                    onClick={() => { setLoginMethod('otp'); setOtpSent(false); }}
                    className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer text-[11px] ${loginMethod === 'otp' ? 'bg-[#CCFF00]/15 text-[#CCFF00] font-semibold border border-[#CCFF00]/25' : 'text-slate-500'}`}
                  >
                    One-Time OTP
                  </button>
                </div>
              </div>

              {!otpSent ? (
                <form onSubmit={loginMethod === 'password' ? handlePasswordLogin : handleSendOTP} className="space-y-4 relative z-10">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 mb-1.5 mono uppercase tracking-wider">Mobile Number</label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-3 w-4 h-4 text-slate-500" />
                      <input
                        id="login-phone"
                        type="tel"
                        required
                        placeholder="e.g. +19875550101"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        className="w-full bg-white/5 border border-white/10 focus:border-[#CCFF55]/40 hover:border-white/20 rounded-xl py-2.5 pl-10 pr-4 text-sm text-slate-100 placeholder:text-slate-600 outline-none transition-all duration-200"
                      />
                    </div>
                  </div>

                  {loginMethod === 'password' ? (
                    <div>
                      <div className="flex justify-between items-center mb-1.5">
                        <label className="block text-[10px] font-bold text-slate-400 mono uppercase tracking-wider">Pass Password / PIN</label>
                        <button
                          type="button"
                          onClick={() => {
                            setLoginMethod('otp');
                            setOtpSent(false);
                            handleSendOTP();
                          }}
                          className="text-[10px] text-[#CCFF00] hover:underline hover:text-white"
                        >
                          Login with OTP
                        </button>
                      </div>
                      <div className="relative">
                        <Lock className="absolute left-3 top-3 w-4 h-4 text-slate-500" />
                        <input
                          id="login-password"
                          type="password"
                          required
                          placeholder="••••••"
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          className="w-full bg-white/5 border border-white/10 focus:border-[#CCFF55]/40 hover:border-white/20 rounded-xl py-2.5 pl-10 pr-4 text-sm text-slate-100 placeholder:text-slate-600 outline-none transition-all duration-200"
                        />
                      </div>
                    </div>
                  ) : null}

                  {/* Auth Mode Indicator Tip */}
                  <div className="text-[11.5px] text-slate-400 glass p-3.5 rounded-2xl relative z-10 leading-relaxed font-sans space-y-3">
                    <div>
                      <p className="mono font-bold text-[#CCFF00] mb-0.5 uppercase tracking-wide">💡 Verification Tip:</p>
                      <p>Enter an existing player's mobile (e.g. <span className="font-mono font-bold text-white bg-white/10 px-1.5 py-0.5 rounded">+19875550101</span>) to access stats and academy cards instantly.</p>
                    </div>

                    <div className="pt-2.5 border-t border-white/5 flex items-center justify-between gap-2">
                      <div className="flex-1">
                        <p className="mono font-bold text-[#CCFF00] mb-0.5 uppercase tracking-wide">🛡️ Admin Portal Account:</p>
                        <p className="text-[10.5px]">Access is restricted to exactly one administrator.</p>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          setPhone('admin');
                          setPassword('admin');
                          setLoginMethod('password');
                          setVerificationError('');
                        }}
                        className="bg-[#CCFF00] text-[#020408] font-bold text-[10px] uppercase tracking-wider px-2.5 py-1.5 rounded-lg shrink-0 hover:bg-white active:scale-95 transition-all transition-transform duration-150"
                      >
                        Auto Fill Key
                      </button>
                    </div>
                  </div>

                  <button
                    id="btn-login-submit"
                    type="submit"
                    className="w-full flex items-center justify-center gap-2 neon-glow-btn font-bold py-3 rounded-xl transition-all mt-4 cursor-pointer font-sans"
                  >
                    <span>{loginMethod === 'password' ? 'Authorize Secure Access' : 'Send OTP Verification Code'}</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </form>
              ) : (
                <div className="space-y-4 relative z-10">
                  <div className="text-center">
                    <p className="text-xs text-slate-400">Security code sent. Enter it below:</p>
                  </div>

                  {/* 4 Digit OTP Entry */}
                  <div className="flex justify-center gap-3 py-2">
                    {otpCode.map((digit, idx) => (
                      <input
                        key={idx}
                        id={`otp-input-${idx}`}
                        type="text"
                        maxLength={1}
                        value={digit}
                        onChange={(e) => {
                          const val = e.target.value.replace(/[^0-9]/g, '');
                          handleOtpKeyUp(idx, val);
                        }}
                        onKeyDown={(e) => {
                          if (e.key === 'Backspace' && !digit && idx > 0) {
                            const prevInput = document.getElementById(`otp-input-${idx - 1}`);
                            prevInput?.focus();
                          }
                        }}
                        className="w-12 h-14 bg-white/5 text-center text-xl font-bold border border-white/10 rounded-xl focus:outline-none focus:border-[#CCFF00] text-[#CCFF00] font-mono transition-all"
                      />
                    ))}
                  </div>

                  <div className="flex justify-between items-center text-xs">
                    <span className="text-zinc-500">
                      {otpCountdown > 0 ? `Resend authorized in ${otpCountdown}s` : 'System ready for new code request'}
                    </span>
                    <button
                      type="button"
                      disabled={otpCountdown > 0}
                      onClick={() => handleSendOTP()}
                      className={`text-[11px] underline flex items-center gap-1 cursor-pointer ${otpCountdown > 0 ? 'text-slate-600 cursor-not-allowed' : 'text-[#CCFF00] hover:text-white'}`}
                    >
                      <RefreshCw className="w-3 h-3" /> Resend Pin
                    </button>
                  </div>

                  <div className="p-3.5 glass rounded-2xl text-[11px] text-slate-400 border border-white/5">
                    Enter the system mock bypass code <span className="neon-text font-mono font-bold">2026</span> to authenticate securely.
                  </div>

                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => setOtpSent(false)}
                      className="flex-1 glass text-slate-300 hover:text-white py-2.5 rounded-xl text-xs font-semibold cursor-pointer"
                    >
                      Change Number
                    </button>
                    <button
                      id="btn-verify-otp"
                      type="button"
                      onClick={verifyOTP}
                      className="flex-1 neon-glow-btn font-bold py-2.5 rounded-xl text-xs cursor-pointer"
                    >
                      Confirm OTP
                    </button>
                  </div>
                </div>
              )}
            </motion.div>
          ) : (
            <motion.div
              key="register"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
            >
              <form onSubmit={handleRegister} className="space-y-4 relative z-10">
                {/* Select Registration Role */}
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 mb-1.5 mono uppercase tracking-wider">Registering As</label>
                  <div className="grid grid-cols-2 gap-2 p-1.5 glass rounded-2xl">
                    <button
                      type="button"
                      onClick={() => { setRegRole('player'); setRegExtraField(''); }}
                      className={`flex items-center justify-center gap-1.5 py-2 text-xs font-semibold rounded-xl transition-all cursor-pointer ${
                        regRole === 'player'
                          ? 'bg-[#CCFF00]/15 text-[#CCFF00] border border-[#CCFF00]/30'
                          : 'text-slate-400 hover:text-slate-250'
                      }`}
                    >
                      <User className="w-3.5 h-3.5" />
                      Player
                    </button>
                    <button
                      type="button"
                      onClick={() => { setRegRole('academy'); setRegExtraField(''); }}
                      className={`flex items-center justify-center gap-1.5 py-2 text-xs font-semibold rounded-xl transition-all cursor-pointer ${
                        regRole === 'academy'
                          ? 'bg-[#CCFF00]/15 text-[#CCFF00] border border-[#CCFF00]/30'
                          : 'text-slate-400 hover:text-slate-250'
                      }`}
                    >
                      <Building className="w-3.5 h-3.5" />
                      Academy
                    </button>
                  </div>
                </div>

                {/* Name */}
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 mb-1 mono uppercase tracking-wider">
                    {regRole === 'player' ? 'Full Legal Name' : 'Official Academy Name'}
                  </label>
                  <input
                    id="register-name"
                    type="text"
                    required
                    placeholder={regRole === 'player' ? 'Aravind Kumar' : 'Apex Badminton Arena'}
                    value={regName}
                    onChange={(e) => setRegName(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 focus:border-[#CCFF55]/40 hover:border-white/20 rounded-xl py-2 px-3 text-sm text-slate-100 placeholder:text-slate-600 outline-none transition-all duration-200"
                  />
                </div>

                {/* Phone */}
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 mb-1 mono uppercase tracking-wider">Secure Mobile Number</label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-2.5 w-4 h-4 text-slate-500" />
                    <input
                      id="register-phone"
                      type="tel"
                      required
                      placeholder="+19875550404"
                      value={regPhone}
                      onChange={(e) => setRegPhone(e.target.value)}
                      className="w-full bg-white/5 border border-white/10 focus:border-[#CCFF55]/40 hover:border-white/20 rounded-xl py-2 pl-9 pr-3 text-sm text-slate-100 placeholder:text-slate-600 outline-none transition-all duration-200"
                    />
                  </div>
                </div>

                {/* Password / Pin */}
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 mb-1 mono uppercase tracking-wider">Create Security PIN (4-6 digits)</label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-2.5 w-4 h-4 text-slate-500" />
                    <input
                      id="register-password"
                      type="password"
                      required
                      placeholder="e.g. 2026"
                      value={regPassword}
                      onChange={(e) => setRegPassword(e.target.value)}
                      className="w-full bg-white/5 border border-white/10 focus:border-[#CCFF55]/40 hover:border-white/20 rounded-xl py-2 pl-9 pr-3 text-sm text-slate-100 outline-none transition-all duration-200"
                    />
                  </div>
                </div>

                {/* Extra dynamic field based on selection */}
                {regRole === 'player' ? (
                  <>
                    <div>
                      <label className="block text-[10px] font-bold text-slate-400 mb-1 mono uppercase tracking-wider">Preferred Court Racket model</label>
                      <input
                        id="register-racket"
                        type="text"
                        placeholder="e.g. YONEX Astrox 99"
                        value={regExtraField}
                        onChange={(e) => setRegExtraField(e.target.value)}
                        className="w-full bg-white/5 border border-white/10 focus:border-[#CCFF55]/40 hover:border-white/20 rounded-xl py-2 px-3 text-sm text-slate-100 placeholder:text-slate-600 outline-none transition-all duration-200"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-slate-400 mb-1 mono uppercase tracking-wider">Link to Academy (Optional)</label>
                      <select
                        id="register-academy-select"
                        value={selectedAcademyId}
                        onChange={(e) => setSelectedAcademyId(e.target.value)}
                        className="w-full bg-white/5 border border-white/10 focus:border-[#CCFF00]/40 rounded-xl py-2 px-3 text-sm text-slate-300 outline-none cursor-pointer"
                      >
                        <option value="" className="bg-[#020408] text-slate-300">-- No Academy / Freelancer --</option>
                        {academies.map(ac => (
                          <option key={ac.id} value={ac.id} className="bg-[#020408] text-slate-300">{ac.name}</option>
                        ))}
                      </select>
                    </div>
                  </>
                ) : (
                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 mb-1 mono uppercase tracking-wider">Academy Main Location</label>
                    <input
                      id="register-location"
                      type="text"
                      placeholder="e.g. Downtown Sports Park, Court 2"
                      value={regExtraField}
                      onChange={(e) => setRegExtraField(e.target.value)}
                      className="w-full bg-white/5 border border-white/10 focus:border-[#CCFF55]/40 hover:border-white/20 rounded-xl py-2 px-3 text-sm text-slate-100 placeholder:text-slate-600 outline-none transition-all duration-200"
                    />
                  </div>
                )}

                <div className="text-[10.5px] text-slate-400 mono leading-relaxed">
                  Registered profiles receive a secure registration certificate and QR format ID hash compatible with active smash tournaments.
                </div>

                <button
                  id="btn-register-submit"
                  type="submit"
                  className="w-full neon-glow-btn font-bold py-3 rounded-xl transition-all mt-3 cursor-pointer"
                >
                  Create Account & Generate ID
                </button>
              </form>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Footnote */}
        <div className="mt-6 pt-4 border-t border-white/5 text-center text-[10px] text-slate-500 mono">
          Secure biometric-proof OTP simulation engine active.
        </div>
      </div>
    </div>
  );
}
