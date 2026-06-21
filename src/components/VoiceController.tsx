/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { Mic, MicOff, Volume2, ShieldAlert, Sparkles, Send, Play, CornerDownLeft } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface VoiceControllerProps {
  onScoreIncrement: (playerNum: 1 | 2) => void;
  onUndo: () => void;
  onToggleServer: () => void;
  player1Name: string;
  player2Name: string;
}

export default function VoiceController({
  onScoreIncrement,
  onUndo,
  onToggleServer,
  player1Name,
  player2Name
}: VoiceControllerProps) {
  const [isListening, setIsListening] = useState(false);
  const [voiceSupported, setVoiceSupported] = useState(true);
  const [transcript, setTranscript] = useState('');
  const [recognizedCommand, setRecognizedCommand] = useState<string | null>(null);
  
  // Custom manual voice commands typing simulator for sandboxed environment demos
  const [simText, setSimText] = useState('');
  
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    // Check compatibility
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setVoiceSupported(false);
      return;
    }

    const rec = new SpeechRecognition();
    rec.continuous = true;
    rec.interimResults = false;
    rec.lang = 'en-US';

    rec.onresult = (event: any) => {
      const lastIndex = event.results.length - 1;
      const text = event.results[lastIndex][0].transcript.trim().toLowerCase();
      setTranscript(text);
      parseCommand(text);
    };

    rec.onerror = (e: any) => {
      console.warn('Speech Recognition error:', e);
      setIsListening(false);
    };

    rec.onend = () => {
      setIsListening(false);
    };

    recognitionRef.current = rec;
  }, []);

  const toggleListening = () => {
    if (!voiceSupported || !recognitionRef.current) return;

    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    } else {
      setTranscript('');
      setRecognizedCommand(null);
      try {
        recognitionRef.current.start();
        setIsListening(true);
      } catch (err) {
        console.error('Failed to start speech recognition:', err);
      }
    }
  };

  const parseCommand = (phrase: string) => {
    const text = phrase.toLowerCase().trim();
    
    // Command combinations for Player 1
    const p1Triggers = [
      'one', '1', 'player one', 'player 1', 'point one', 'point 1', 
      'score one', 'score 1', 'point to ' + player1Name.toLowerCase(), 
      player1Name.toLowerCase() + ' score', 'left', 'left side', 'add one', 'p1'
    ];
    
    // Command combinations for Player 2
    const p2Triggers = [
      'two', '2', 'player two', 'player 2', 'point two', 'point 2', 
      'score two', 'score 2', 'point to ' + player2Name.toLowerCase(), 
      player2Name.toLowerCase() + ' score', 'right', 'right side', 'add two', 'p2'
    ];

    // Other utilities
    const undoTriggers = ['undo', 'go back', 'cancel last', 'mistake', 'revert', 'back'];
    const serviceTriggers = ['serve', 'server', 'change serve', 'service', 'switch server', 'toggle server'];

    // Matching
    if (undoTriggers.some(trigger => text.includes(trigger))) {
      setRecognizedCommand('🔄 Revert Last Point (Undo)');
      onUndo();
      triggerBeep(600, 150);
    } else if (serviceTriggers.some(trigger => text.includes(trigger))) {
      setRecognizedCommand('🏸 Switched Server');
      onToggleServer();
      triggerBeep(520, 150);
    } else if (p1Triggers.some(trigger => text === trigger || text.endsWith(' ' + trigger) || text.startsWith(trigger + ' '))) {
      setRecognizedCommand(`🟢 Point to: ${player1Name}`);
      onScoreIncrement(1);
      triggerBeep(880, 100);
    } else if (p2Triggers.some(trigger => text === trigger || text.endsWith(' ' + trigger) || text.startsWith(trigger + ' '))) {
      setRecognizedCommand(`🟢 Point to: ${player2Name}`);
      onScoreIncrement(2);
      triggerBeep(880, 100);
    } else {
      // Fuzzy checks
      if (text.includes('one') || text.includes('1') || text.includes(player1Name.toLowerCase().split(' ')[0])) {
        setRecognizedCommand(`🟢 Point to (Fuzzy): ${player1Name}`);
        onScoreIncrement(1);
        triggerBeep(880, 100);
      } else if (text.includes('two') || text.includes('2') || text.includes(player2Name.toLowerCase().split(' ')[0])) {
        setRecognizedCommand(`🟢 Point to (Fuzzy): ${player2Name}`);
        onScoreIncrement(2);
        triggerBeep(880, 100);
      } else {
        setRecognizedCommand('❓ Phrase heard, but command not decoded. Say "Player One" or "Player Two"');
      }
    }
  };

  // Beep sound feedback block using browser Audio Synthesis
  const triggerBeep = (freq: number, duration: number) => {
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.frequency.setValueAtTime(freq, ctx.currentTime);
      gain.gain.setValueAtTime(0.1, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + duration / 1000);
      osc.start();
      osc.stop(ctx.currentTime + duration / 1000);
    } catch (e) {
      // Silently ignore if audio context is blocked
    }
  };

  const handleSimulatedSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!simText.trim()) return;
    setTranscript(simText);
    parseCommand(simText);
    setSimText('');
  };

  const quickDemoTrigger = (phrase: string) => {
    setTranscript(phrase);
    parseCommand(phrase);
  };

  return (
    <div className="glass p-5 rounded-3xl relative overflow-hidden">
      <div className="flex items-center justify-between mb-3 border-b border-white/10 pb-2">
        <h3 className="text-sm font-semibold tracking-wide uppercase text-slate-350 flex items-center gap-2 font-sans">
          <Sparkles className="w-4 h-4 text-[#CCFF00] animate-pulse" />
          Voice Control Command Center
        </h3>
        {voiceSupported ? (
          <span className="text-[10px] bg-[#CCFF00]/15 text-[#CCFF00] border border-[#CCFF00]/25 px-2 py-0.5 rounded-full font-mono">
            H/W Capable
          </span>
        ) : (
          <span className="text-[10px] bg-[#CCFF00]/10 text-[#CCFF00]/70 border border-white/5 px-2 py-0.5 rounded-full font-mono">
            Iframe Simulator Active
          </span>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Continuous Speech Mic Interaction Panel */}
        <div className="flex flex-col items-center justify-center bg-white/5 p-4 rounded-2xl border border-white/5 text-center relative overflow-hidden min-h-[140px] shadow-inner">
          {isListening && (
            <div className="absolute inset-x-0 bottom-0 top-0 flex items-center justify-center opacity-10 pointer-events-none">
              <div className="w-24 h-24 bg-[#CCFF00] rounded-full animate-ping" />
            </div>
          )}

          {voiceSupported ? (
            <button
              onClick={toggleListening}
              className={`p-5 rounded-full shadow-lg transition-all border outline-none cursor-pointer ${
                isListening
                  ? 'bg-red-500 border-red-400 text-white animate-pulse'
                  : 'bg-[#CCFF00] text-[#020408] hover:bg-white border-[#CCFF00] hover:shadow-[0_0_15px_rgba(204,255,0,0.5)]'
              }`}
            >
              {isListening ? <MicOff className="w-7 h-7" /> : <Mic className="w-7 h-7" />}
            </button>
          ) : (
            <div className="p-4 rounded-xl bg-[#020408]/30 border border-white/5 text-slate-500 mb-2">
              <MicOff className="w-7 h-7 mx-auto mb-2 text-slate-600" />
              <p className="text-xs">Browser Speech Engine restricted inside isolated container frame.</p>
            </div>
          )}

          <p className="text-xs font-semibold mt-3 text-slate-350">
            {isListening ? '🎙️ Listening... Speak Badminton keywords' : 'Click to Activate Mic Referee'}
          </p>

          <AnimatePresence mode="wait">
            {transcript && (
              <motion.div
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="mt-2 text-xs py-1 px-3 bg-white/5 border border-white/5 rounded-lg text-[#CCFF00] font-mono"
              >
                Heard: <span className="text-white font-sans italic">"{transcript}"</span>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Command Simulator and Cheat-Sheet Controls */}
        <div className="flex flex-col justify-between bg-white/5 p-3.5 rounded-2xl border border-white/5 text-xs">
          <div>
            <span className="text-slate-400 font-semibold block mb-2 font-mono">Quick Reference:</span>
            <div className="grid grid-cols-2 gap-1.5 mb-3">
              <button
                onClick={() => quickDemoTrigger(`point ${player1Name}`)}
                className="text-left bg-white/5 hover:bg-white/10 p-1.5 rounded-xl border border-white/5 text-[11px] text-slate-350 hover:text-[#CCFF00] transition-all flex items-center justify-between cursor-pointer"
              >
                <span>"Point {player1Name.split(' ')[0]}"</span>
                <Play className="w-2.5 h-2.5 text-zinc-650 shrink-0" />
              </button>
              <button
                onClick={() => quickDemoTrigger(`point ${player2Name}`)}
                className="text-left bg-white/5 hover:bg-white/10 p-1.5 rounded-xl border border-white/5 text-[11px] text-slate-350 hover:text-[#CCFF00] transition-all flex items-center justify-between cursor-pointer"
              >
                <span>"Point {player2Name.split(' ')[0]}"</span>
                <Play className="w-2.5 h-2.5 text-zinc-650 shrink-0" />
              </button>
              <button
                onClick={() => quickDemoTrigger('undo')}
                className="text-left bg-white/5 hover:bg-white/10 p-1.5 rounded-xl border border-white/5 text-[11px] text-slate-350 hover:text-[#CCFF00] transition-all flex items-center justify-between cursor-pointer"
              >
                <span>"Undo mistake"</span>
                <Play className="w-2.5 h-2.5 text-zinc-650 shrink-0" />
              </button>
              <button
                onClick={() => quickDemoTrigger('switch server')}
                className="text-left bg-white/5 hover:bg-white/10 p-1.5 rounded-xl border border-white/5 text-[11px] text-slate-350 hover:text-[#CCFF00] transition-all flex items-center justify-between cursor-pointer"
              >
                <span>"Toggle server"</span>
                <Play className="w-2.5 h-2.5 text-zinc-650 shrink-0" />
              </button>
            </div>
          </div>

          {/* Simulated Speech Bar */}
          <form onSubmit={handleSimulatedSubmit} className="relative mt-2">
            <span className="block text-[10px] text-zinc-500 mb-1 mono">Simulator (Type voice query to referee)</span>
            <div className="flex gap-1.5">
              <input
                type="text"
                placeholder='e.g., "point player two"'
                value={simText}
                onChange={(e) => setSimText(e.target.value)}
                className="flex-1 bg-white/5 border border-white/10 rounded-xl px-2.5 py-1.5 text-xs text-slate-200 placeholder:text-zinc-650 focus:outline-none focus:border-[#CCFF00]/40 transition-all font-sans"
              />
              <button
                type="submit"
                className="bg-[#CCFF00] hover:bg-white text-[#020408] p-1.5 rounded-lg font-bold flex items-center justify-center shrink-0 cursor-pointer active:scale-95 transition-transform"
              >
                <CornerDownLeft className="w-4 h-4" />
              </button>
            </div>
          </form>
        </div>
      </div>

      {recognizedCommand && (
        <div className="mt-3 bg-white/5 p-2.5 rounded-xl border border-white/5 flex items-center gap-2 text-xs font-mono">
          <Volume2 className="w-4 h-4 text-[#CCFF05] shrink-0" />
          <span className="text-slate-400">Action Decoded:</span>
          <span className="text-white font-semibold">{recognizedCommand}</span>
        </div>
      )}
    </div>
  );
}
