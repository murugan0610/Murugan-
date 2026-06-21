/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Academy, Player } from '../types';
import { motion, AnimatePresence } from 'motion/react';
import { Search, MapPin, Award, BookOpen, Star, Sparkles, Plus, Calendar, CheckCircle2, Phone, Club, Users } from 'lucide-react';

interface AcademyTrackerProps {
  academies: Academy[];
  players: Player[];
  onRegisterAcademy: (academy: Academy) => void;
  onEnrollPlayer: (playerId: string, academyId: string) => void;
  currentUser: { id: string; role: string; name: string } | null;
}

export default function AcademyTracker({
  academies,
  players,
  onRegisterAcademy,
  onEnrollPlayer,
  currentUser
}: AcademyTrackerProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedAcademyId, setSelectedAcademyId] = useState<string | null>(academies[0]?.id || null);
  
  // Court Booking State Simulator
  const [bookingCourt, setBookingCourt] = useState<number>(1);
  const [bookingTime, setBookingTime] = useState('18:00');
  const [bookingDate, setBookingDate] = useState('2026-06-22');
  const [bookingReceipt, setBookingReceipt] = useState<string | null>(null);

  // New Academy Register form state
  const [showRegisterForm, setShowRegisterForm] = useState(false);
  const [newAcName, setNewAcName] = useState('');
  const [newAcPhone, setNewAcPhone] = useState('');
  const [newAcLoc, setNewAcLoc] = useState('');
  const [newAcCourts, setNewAcCourts] = useState(4);
  const [newAcServices, setNewAcServices] = useState('Coaching, Court Booking');
  const [newAcDesc, setNewAcDesc] = useState('');

  const filteredAcademies = academies.filter(ac => 
    ac.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    ac.location.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const activeAcademy = academies.find(ac => ac.id === selectedAcademyId) || academies[0];

  const handleBookSlot = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) {
      alert("Please login via credentials to book a court slot.");
      return;
    }
    const receiptNum = `BK-${activeAcademy.id.slice(-4)}-${Math.floor(1000 + Math.random() * 9000)}`;
    setBookingReceipt(`🎉 Court slot reserved successfully! Receipt: ${receiptNum}. Court #${bookingCourt} is locked for you on ${bookingDate} at ${bookingTime}. See you on court!`);
  };

  const handleCreateAcademySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAcName || !newAcPhone || !newAcLoc) {
      alert("Please fill all required fields to register an academy");
      return;
    }

    const newId = `BAC-2026-${Math.floor(1000 + Math.random() * 9000)}`;
    const newAc: Academy = {
      id: newId,
      name: newAcName,
      phone: newAcPhone,
      location: newAcLoc,
      courtsCount: Number(newAcCourts),
      ratings: 5.0,
      enrolledPlayersCount: 0,
      coaches: ['Head Coach Dev'],
      services: newAcServices.split(',').map(s => s.trim()),
      description: newAcDesc || 'High-performance badminton training facility.',
      facilities: ['Standard synthetic mats', 'Lobby recovery counter']
    };

    onRegisterAcademy(newAc);
    setSelectedAcademyId(newId);
    setShowRegisterForm(false);
    
    // reset form
    setNewAcName('');
    setNewAcPhone('');
    setNewAcLoc('');
    setNewAcDesc('');
  };

  // Find enrolled roster inside this academy
  const enrolledPlayers = players.filter(p => p.academyId === activeAcademy?.id);

  return (
    <div className="space-y-6">
      
      {/* Header and top tools */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center glass p-5 rounded-3xl gap-3 mb-1">
        <div>
          <h2 className="text-lg font-bold text-white font-sans flex items-center gap-2">
            <Club className="w-5 h-5 text-[#CCFF00]" /> Academy Networks
          </h2>
          <p className="text-xs text-slate-400">Discover and book accredited premier training courts</p>
        </div>
        <button
          onClick={() => setShowRegisterForm(!showRegisterForm)}
          className="px-4 py-2 bg-[#CCFF00] hover:bg-white text-[#020408] font-bold text-xs rounded-xl flex items-center gap-1.5 transition cursor-pointer active:scale-95 shadow-md hover:shadow-[0_0_15px_rgba(204,255,0,0.4)]"
        >
          <Plus className="w-4 h-4 shadow-sm text-[#020408]" />
          {showRegisterForm ? "Back to Directories" : "Register New Academy"}
        </button>
      </div>

      <AnimatePresence mode="wait">
        {showRegisterForm ? (
          <motion.div
            key="register-academy"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            className="glass p-6 rounded-3xl max-w-lg mx-auto border-white/15"
          >
            <h3 className="text-base font-bold text-white mb-4 flex items-center gap-2 font-sans">
              <Sparkles className="w-4 h-4 text-[#CCFF00]" /> Register Academy Branch
            </h3>
            <form onSubmit={handleCreateAcademySubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div>
                  <label className="block text-slate-400 mb-1 font-semibold">Academy Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Apex Smashers Hub"
                    value={newAcName}
                    onChange={(e) => setNewAcName(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-xl p-2.5 text-white focus:outline-none focus:border-[#CCFF00]/40 outline-none transition-all"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1 font-semibold">Phone Number *</label>
                  <input
                    type="tel"
                    required
                    placeholder="e.g. +19875550999"
                    value={newAcPhone}
                    onChange={(e) => setNewAcPhone(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-xl p-2.5 text-white focus:outline-none focus:border-[#CCFF00]/40 outline-none transition-all"
                  />
                </div>
              </div>

              <div className="text-xs">
                <label className="block text-slate-400 mb-1 font-semibold">Official Court Location *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Sector 5 Mall, 3rd Floor Sports Deck"
                  value={newAcLoc}
                  onChange={(e) => setNewAcLoc(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-xl p-2.5 text-white focus:outline-none focus:border-[#CCFF00]/40 outline-none transition-all"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div>
                  <label className="block text-slate-400 mb-1 font-semibold">Number of Courts (Clubs count)</label>
                  <input
                    type="number"
                    min={1}
                    max={30}
                    value={newAcCourts}
                    onChange={(e) => setNewAcCourts(Number(e.target.value))}
                    className="w-full bg-white/5 border border-white/10 rounded-xl p-2.5 text-white focus:outline-none focus:border-[#CCFF00]/40 outline-none transition-all"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1 font-semibold">Offered Services (Comma separated)</label>
                  <input
                    type="text"
                    placeholder="Coaching, Court Booking, Pro Store"
                    value={newAcServices}
                    onChange={(e) => setNewAcServices(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-xl p-2.5 text-white focus:outline-none focus:border-[#CCFF00]/40 outline-none transition-all"
                  />
                </div>
              </div>

              <div className="text-xs">
                <label className="block text-slate-400 mb-1 font-semibold">Short Profile Description</label>
                <textarea
                  rows={3}
                  placeholder="Tell us about your coaches, achievements, or training philosophies..."
                  value={newAcDesc}
                  onChange={(e) => setNewAcDesc(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-xl p-2.5 text-white focus:outline-none focus:border-[#CCFF00]/40 text-xs outline-none transition-all"
                />
              </div>

              <div className="text-[11px] text-zinc-500 font-mono bg-white/5 p-2 rounded-lg">
                Submit completes immediate inclusion into custom databases. A registered Unique Academy ID is automatically generated.
              </div>

              <button
                type="submit"
                className="w-full bg-[#CCFF00] hover:bg-white text-[#020408] font-bold py-2.5 rounded-xl text-xs transition cursor-pointer active:scale-95"
              >
                Launch Academy Branch
              </button>
            </form>
          </motion.div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            
            {/* LEFT: SEARCH & DIRECTORY LIST (5 Columns) */}
            <div className="lg:col-span-12 xl:col-span-5 glass p-5 rounded-3xl space-y-4">
              
              {/* Dynamic search bar */}
              <div className="relative">
                <Search className="absolute left-3.5 top-3 w-4 h-4 text-slate-500" />
                <input
                  type="text"
                  placeholder="Search Academies by name or city..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-white/5 border border-white/15 rounded-xl py-2.5 pl-9 pr-4 text-xs text-white focus:outline-none focus:border-[#CCFF00]/40 transition-all outline-none font-sans"
                />
              </div>

              {/* List of filtered academies */}
              <div className="space-y-2.5 overflow-y-auto max-h-[480px] pr-1">
                {filteredAcademies.map(ac => (
                  <button
                    key={ac.id}
                    onClick={() => { setSelectedAcademyId(ac.id); setBookingReceipt(null); }}
                    className={`w-full text-left p-3.5 rounded-2xl border transition-all duration-200 block cursor-pointer ${
                      ac.id === selectedAcademyId 
                        ? 'bg-white/10 border-[#CCFF00]/40 shadow-lg' 
                        : 'bg-white/5 border-white/5 hover:border-white/10 hover:bg-white/10'
                    }`}
                  >
                    <div className="flex justify-between items-start">
                      <span className="text-[10px] bg-white/5 border border-white/5 text-slate-400 font-mono px-2 py-0.5 rounded-md">
                        ID: {ac.id}
                      </span>
                      <div className="flex items-center gap-0.5 text-amber-500 font-mono text-[10px] font-bold">
                        <Star className="w-3.5 h-3.5 fill-amber-550 mr-0.5" /> {ac.ratings}
                      </div>
                    </div>

                    <h4 className="text-sm font-bold text-white mt-1.5">{ac.name}</h4>
                    
                    <div className="flex items-center gap-1 text-[11px] text-slate-400 mt-1">
                      <MapPin className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                      <span className="truncate">{ac.location}</span>
                    </div>

                    <div className="flex items-center justify-between text-[10px] text-slate-500 mt-2.5 pt-2.5 border-t border-white/5">
                      <span>🏸 Courts: <span className="text-[#CCFF00] font-bold">{ac.courtsCount} Indoor</span></span>
                      <span>Enrolled: {ac.enrolledPlayersCount || enrolledPlayers.length} Active</span>
                    </div>

                  </button>
                ))}
                
                {filteredAcademies.length === 0 && (
                  <p className="text-xs text-slate-600 text-center py-6">No academies match search keyword.</p>
                )}
              </div>

            </div>

            {/* RIGHT: DYNAMIC COMPREHENSIVE PROFILE & COURT BOOKER (7 Columns) */}
            {activeAcademy && (
              <div className="lg:col-span-12 xl:col-span-7 space-y-6">
                
                {/* Profile panel */}
                <div className="glass p-6 rounded-3xl space-y-5">
                  <div className="flex justify-between items-start border-b border-white/5 pb-4">
                    <div>
                      <span className="text-[10px] bg-white/5 px-2 py-0.5 rounded text-[#CCFF00] font-mono border border-white/10 font-bold">
                        REGID: {activeAcademy.id}
                      </span>
                      <h3 className="text-xl font-bold text-white mt-1.5 font-sans">{activeAcademy.name}</h3>
                      <p className="text-xs text-slate-350 mt-1 flex items-center gap-1.5">
                        <MapPin className="w-3.5 h-3.5 text-slate-550 shrink-0" /> {activeAcademy.location}
                      </p>
                    </div>
                    <div className="text-right flex flex-col items-end">
                      <div className="flex items-center gap-1 bg-amber-500/10 text-amber-500 border border-amber-500/20 px-2 pl-1.5 py-0.5 rounded-full text-xs font-bold font-mono">
                        <Star className="w-3.5 h-3.5 fill-amber-500" /> {activeAcademy.ratings} Rating
                      </div>
                      <span className="text-[10px] text-slate-550 mt-1 block font-mono">Accredited Club</span>
                    </div>
                  </div>

                  {/* Summary / Description */}
                  <p className="text-xs text-slate-400 leading-relaxed italic">
                    "{activeAcademy.description}"
                  </p>

                  {/* Roster & Coaches listing (Academy management) */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs pt-1">
                    
                    {/* Coaches list */}
                    <div className="bg-white/5 p-3.5 rounded-2xl border border-white/5">
                      <span className="text-[10px] text-slate-500 uppercase tracking-wider font-mono font-bold flex items-center gap-1 mb-2">
                        <Award className="w-3.5 h-3.5 text-[#CCFF00]" /> Coaching Faculty
                      </span>
                      <ul className="space-y-1.5">
                        {activeAcademy.coaches.map((coach, idx) => (
                          <li key={idx} className="text-slate-300 flex items-center gap-1.5">
                            <span className="w-1.5 h-1.5 bg-[#CCFF00] rounded-full" />
                            {coach}
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* Services of Club */}
                    <div className="bg-white/5 p-3.5 rounded-2xl border border-white/5">
                      <span className="text-[10px] text-slate-500 uppercase tracking-wider font-mono font-bold flex items-center gap-1 mb-2">
                        <Club className="w-3.5 h-3.5 text-[#CCFF00]" /> Club Amenities
                      </span>
                      <div className="flex flex-wrap gap-1.5">
                        {activeAcademy.services.map((serv, idx) => (
                          <span
                             key={idx}
                             className="bg-white/5 text-slate-300 px-20 py-0.5 border border-white/10 rounded-md text-[10px] whitespace-nowrap px-2 py-0.5"
                          >
                            {serv}
                          </span>
                        ))}
                      </div>
                    </div>

                  </div>

                  {/* Registered Enrolled Badminton Players (Roster) */}
                  <div className="bg-white/5 p-4 rounded-2xl border border-white/5 text-xs">
                    <span className="text-[10px] text-slate-500 uppercase tracking-widest font-mono font-semibold flex items-center gap-1 mb-2.5">
                      <Users className="w-3.5 h-3.5 text-[#CCFF00]" /> Enrolled Players Roster ({enrolledPlayers.length})
                    </span>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                      {enrolledPlayers.map(p => (
                        <div key={p.id} className="p-2.5 bg-white/5 border border-white/5 rounded-xl transition-all hover:bg-white/10">
                          <p className="font-bold text-white truncate">{p.name}</p>
                          <p className="text-[10px] text-slate-500 font-mono mt-0.5 truncate">{p.id} • {p.skillLevel}</p>
                        </div>
                      ))}
                      {enrolledPlayers.length === 0 && (
                        <p className="text-[11px] text-slate-600 block col-span-3 italic">No registered players belong to this academy roster yet. Register with their ID code.</p>
                      )}
                    </div>
                  </div>

                  {/* Booking Receipt validation */}
                  {bookingReceipt && (
                    <div className="bg-white/10 border-2 border-[#CCFF00]/40 p-4 rounded-2xl text-xs text-white relative animate-fade">
                      <p className="font-bold text-[#CCFF00] flex items-center gap-1.5 uppercase font-mono tracking-wider"><CheckCircle2 className="w-4 h-4 text-[#CCFF00] shrink-0" /> booking successful</p>
                      <p className="mt-1.5 leading-relaxed font-sans">{bookingReceipt}</p>
                    </div>
                  )}

                  {/* QUICK COURT BOOKER (Simulates instant court slot locks) */}
                  <div className="bg-white/5 p-4.5 rounded-2xl border border-white/10">
                    <h4 className="text-xs font-bold text-[#CCFF00] flex items-center gap-1.5 mb-3 font-sans uppercase tracking-wider text-[10px]">
                      <Calendar className="w-4 h-4 text-[#CCFF00]" /> Book Court Slot at {activeAcademy.name}
                    </h4>

                    <form onSubmit={handleBookSlot} className="grid grid-cols-1 sm:grid-cols-4 gap-3 text-xs items-end">
                      <div>
                        <label className="block text-slate-500 mb-1">Select Court</label>
                        <select
                          value={bookingCourt}
                          onChange={(e) => setBookingCourt(Number(e.target.value))}
                          className="w-full bg-[#020408]/60 border border-white/10 rounded-xl p-2 text-white text-xs cursor-pointer focus:border-[#CCFF00]/30 outline-none transition-all"
                        >
                          {Array.from({ length: activeAcademy.courtsCount }, (_, i) => i + 1).map(num => (
                            <option key={num} value={num} className="bg-[#020408] text-white">Court #{num}</option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="block text-slate-400 mb-1">Date</label>
                        <input
                          type="date"
                          value={bookingDate}
                          onChange={(e) => setBookingDate(e.target.value)}
                          className="w-full bg-[#020408]/60 border border-white/10 rounded-xl p-2 text-white text-xs focus:border-[#CCFF00]/30 outline-none transition-all font-mono"
                        />
                      </div>

                      <div>
                        <label className="block text-slate-400 mb-1">Time Slot</label>
                        <select
                          value={bookingTime}
                          onChange={(e) => setBookingTime(e.target.value)}
                          className="w-full bg-[#020408]/60 border border-white/10 rounded-xl p-2 text-white text-xs cursor-pointer focus:border-[#CCFF00]/30 outline-none transition-all font-semibold font-mono"
                        >
                          <option value="06:00" className="bg-[#020408] text-white">06:00 AM - 07:00 AM</option>
                          <option value="08:00" className="bg-[#020408] text-white">08:00 AM - 09:00 AM</option>
                          <option value="16:00" className="bg-[#020408] text-white">04:00 PM - 05:00 PM</option>
                          <option value="17:00" className="bg-[#020408] text-white">05:00 PM - 06:00 PM</option>
                          <option value="18:00" className="bg-[#020408] text-white">06:00 PM - 07:00 PM</option>
                          <option value="19:00" className="bg-[#020408] text-white">07:00 PM - 08:00 PM</option>
                          <option value="20:00" className="bg-[#020408] text-white">08:00 PM - 09:00 PM</option>
                          <option value="21:00" className="bg-[#020408] text-white">09:05 PM - 10:00 PM</option>
                        </select>
                      </div>

                      <button
                        type="submit"
                        className="w-full bg-[#CCFF00] hover:bg-white text-[#020408] font-bold py-2 px-3 rounded-xl text-xs cursor-pointer transition-colors active:scale-95 transition-transform"
                      >
                        Reserve Spot
                      </button>
                    </form>
                  </div>

                  {/* Phone contact shortcut footer */}
                  <div className="flex items-center justify-between text-[11px] text-slate-500 border-t border-white/5 pt-3">
                    <span className="flex items-center gap-1 text-slate-400">
                      <Phone className="w-3.5 h-3.5 text-slate-550 shrink-0" /> Helpdesk: {activeAcademy.phone}
                    </span>
                    <span className="font-mono text-[10px]">Instant Booking Active</span>
                  </div>

                </div>

              </div>
            )}

          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
