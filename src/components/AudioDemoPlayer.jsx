import React, { useState, useEffect, useRef } from 'react';
import { 
  Play, 
  Pause, 
  Volume2, 
  VolumeX, 
  Sparkles, 
  Headphones, 
  Waves, 
  ShieldCheck 
} from 'lucide-react';

export default function AudioDemoPlayer({ productName = 'Aura Studio Wireless' }) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [audioMode, setAudioMode] = useState('anc'); // 'standard' | 'anc' | 'spatial'
  const [isMuted, setIsMuted] = useState(false);
  const audioContextRef = useRef(null);
  const oscillatorRef = useRef(null);
  const filterRef = useRef(null);
  const gainRef = useRef(null);
  const [bars, setBars] = useState(Array.from({ length: 24 }, () => 15));

  // Visualizer Animation Loop
  useEffect(() => {
    let animId;
    if (isPlaying) {
      const updateBars = () => {
        setBars(prev => prev.map(() => {
          if (audioMode === 'anc') {
            return Math.floor(25 + Math.random() * 65);
          } else if (audioMode === 'spatial') {
            return Math.floor(40 + Math.random() * 55);
          } else {
            return Math.floor(10 + Math.random() * 45);
          }
        }));
        animId = requestAnimationFrame(updateBars);
      };
      animId = requestAnimationFrame(updateBars);
    } else {
      setBars(Array.from({ length: 24 }, () => 15));
    }
    return () => cancelAnimationFrame(animId);
  }, [isPlaying, audioMode]);

  // Audio Context Synthesizer
  const startAudio = () => {
    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (!AudioCtx) return;

      if (!audioContextRef.current) {
        audioContextRef.current = new AudioCtx();
      }

      if (audioContextRef.current.state === 'suspended') {
        audioContextRef.current.resume();
      }

      const ctx = audioContextRef.current;
      const osc = ctx.createOscillator();
      const filter = ctx.createBiquadFilter();
      const gain = ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(220, ctx.currentTime);

      // Filter settings based on mode
      if (audioMode === 'anc') {
        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(800, ctx.currentTime);
      } else if (audioMode === 'spatial') {
        filter.type = 'bandpass';
        filter.frequency.setValueAtTime(1500, ctx.currentTime);
      } else {
        filter.type = 'allpass';
      }

      gain.gain.setValueAtTime(isMuted ? 0 : 0.08, ctx.currentTime);

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(ctx.destination);

      osc.start();
      oscillatorRef.current = osc;
      filterRef.current = filter;
      gainRef.current = gain;
    } catch (e) {
      console.warn('Web Audio playback simulation:', e);
    }
  };

  const stopAudio = () => {
    try {
      if (oscillatorRef.current) {
        oscillatorRef.current.stop();
        oscillatorRef.current.disconnect();
        oscillatorRef.current = null;
      }
    } catch (e) {}
  };

  const togglePlay = () => {
    if (isPlaying) {
      stopAudio();
      setIsPlaying(false);
    } else {
      startAudio();
      setIsPlaying(true);
    }
  };

  const handleModeChange = (mode) => {
    setAudioMode(mode);
    if (filterRef.current && audioContextRef.current) {
      const ctx = audioContextRef.current;
      if (mode === 'anc') {
        filterRef.current.type = 'lowpass';
        filterRef.current.frequency.setTargetAtTime(800, ctx.currentTime, 0.1);
      } else if (mode === 'spatial') {
        filterRef.current.type = 'bandpass';
        filterRef.current.frequency.setTargetAtTime(1500, ctx.currentTime, 0.1);
      } else {
        filterRef.current.type = 'allpass';
      }
    }
  };

  useEffect(() => {
    return () => {
      stopAudio();
      if (audioContextRef.current) {
        audioContextRef.current.close().catch(() => {});
      }
    };
  }, []);

  return (
    <div className="p-6 rounded-3xl bg-slate-900 text-white shadow-xl relative overflow-hidden border border-slate-800">
      {/* Background glow */}
      <div className="absolute -right-20 -top-20 w-64 h-64 bg-brand-500/20 rounded-full blur-3xl pointer-events-none" />

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-brand-500/20 text-brand-400">
            <Headphones className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-white flex items-center gap-1.5">
              <span>Interactive Acoustic Demonstration</span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase bg-brand-500 text-white">Live</span>
            </h4>
            <p className="text-[11px] text-slate-400">Experience Active Noise Cancellation & Spatial Audio staging</p>
          </div>
        </div>

        {/* Audio Mode Selectors */}
        <div className="flex items-center gap-1.5 bg-slate-800/80 p-1 rounded-xl text-xs">
          {[
            { id: 'standard', label: 'Standard Master' },
            { id: 'anc', label: 'ANC Active (Noise Cut)' },
            { id: 'spatial', label: '3D Spatial Staging' }
          ].map((mode) => (
            <button
              key={mode.id}
              onClick={() => handleModeChange(mode.id)}
              className={`px-3 py-1.5 rounded-lg font-semibold transition-all ${
                audioMode === mode.id
                  ? 'bg-brand-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              {mode.label}
            </button>
          ))}
        </div>
      </div>

      {/* Waveform Frequency Bars Visualizer */}
      <div className="py-4 px-3 rounded-2xl bg-black/40 border border-slate-800 flex items-center justify-between gap-1.5 h-20 mb-4">
        {bars.map((height, idx) => (
          <div
            key={idx}
            className="flex-1 rounded-full transition-all duration-100"
            style={{
              height: `${isPlaying ? height : 15}%`,
              backgroundColor: isPlaying
                ? audioMode === 'anc' ? '#10b981' : audioMode === 'spatial' ? '#6366f1' : '#f59e0b'
                : '#334155'
            }}
          />
        ))}
      </div>

      {/* Audio Controller Bar */}
      <div className="flex items-center justify-between pt-1">
        <div className="flex items-center gap-3">
          <button
            onClick={togglePlay}
            className="w-10 h-10 rounded-full bg-white text-slate-900 flex items-center justify-center hover:scale-105 active:scale-95 transition-all shadow-md font-bold"
            aria-label={isPlaying ? 'Pause Audio Preview' : 'Play Audio Preview'}
          >
            {isPlaying ? <Pause className="w-5 h-5 fill-slate-900" /> : <Play className="w-5 h-5 fill-slate-900 ml-0.5" />}
          </button>

          <div>
            <span className="text-xs font-bold text-white block">
              {isPlaying ? 'Synthesizing Studio Audio Stream' : 'Press Play to Preview'}
            </span>
            <span className="text-[10px] text-slate-400">
              {audioMode === 'anc' 
                ? 'High-frequency cancellation: -42dB ambient reduction' 
                : audioMode === 'spatial' 
                ? 'Head-tracking binaural surround dispersion' 
                : 'Direct linear uncolored audiophile response'}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2 text-xs text-slate-400">
          <Waves className="w-4 h-4 text-brand-400 animate-pulse" />
          <span className="hidden sm:inline font-mono">48kHz / 24-Bit FLAC</span>
        </div>
      </div>
    </div>
  );
}
