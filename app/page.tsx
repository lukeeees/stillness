'use client';

import React, { useState, useEffect, useRef } from 'react';

// Types
interface Session {
  id: number;
  title: string;
  duration: string;
  category: string;
  level: string;
  desc: string;
  script: string;
}

const sessions: Session[] = [
  { 
    id: 1, 
    title: "Morning Calm", 
    duration: "10 min", 
    category: "morning", 
    level: "Beginner", 
    desc: "Gentle start to your day",
    script: "Begin by settling into a comfortable seated position. Let your spine be tall but not rigid. Take three deep breaths with me. Inhale through your nose for a count of four, hold for four, and exhale slowly through your mouth. Feel your body becoming heavier, more grounded with each breath."
  },
  { 
    id: 2, 
    title: "Body Scan", 
    duration: "15 min", 
    category: "stress", 
    level: "Beginner", 
    desc: "Release tension",
    script: "We'll scan your body from head to toe. Close your eyes. Notice any sensations in your scalp and forehead. Release any tension. Moving down to your jaw, neck, shoulders. Let them drop away from your ears."
  },
  { 
    id: 3, 
    title: "Evening Wind-Down", 
    duration: "12 min", 
    category: "evening", 
    level: "Beginner", 
    desc: "Prepare for rest",
    script: "As the day comes to a close, allow yourself to let go of everything that happened. Breathe in calm, breathe out tension. Your day is complete. You did your best."
  },
  { 
    id: 4, 
    title: "Deep Sleep Story", 
    duration: "20 min", 
    category: "sleep", 
    level: "Beginner", 
    desc: "Guided relaxation",
    script: "Imagine yourself in a peaceful place. A soft breeze touches your skin. You are completely safe here. Your body is heavy and warm. With each breath, you drift deeper into relaxation."
  },
  { 
    id: 5, 
    title: "5-Minute Reset", 
    duration: "5 min", 
    category: "stress", 
    level: "Beginner", 
    desc: "Quick stress relief",
    script: "Take a moment to pause. Notice your breath. It's your anchor to this present moment. Breathe in peace. Breathe out worry. You are here, now, and that is enough."
  },
  { 
    id: 6, 
    title: "Gratitude Practice", 
    duration: "8 min", 
    category: "morning", 
    level: "Beginner", 
    desc: "Start with appreciation",
    script: "Think of three things you're grateful for today. They can be small. A warm cup of tea. A kind word. A moment of peace. Feel the warmth of gratitude in your heart."
  },
];

// Text-to-Speech guided voice with better control
const speak = (text: string, rate = 0.8, pitch = 1.0) => {
  if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
    // Cancel any ongoing speech
    window.speechSynthesis.cancel();
    
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = rate;
    utterance.pitch = pitch;
    utterance.volume = 0.9;
    utterance.lang = 'en-US';
    
    // Try to use a calming voice if available
    const voices = window.speechSynthesis.getVoices();
    const femaleVoice = voices.find(v => v.name.includes('Female') || v.name.includes('female'));
    if (femaleVoice) {
      utterance.voice = femaleVoice;
    }
    
    window.speechSynthesis.speak(utterance);
  }
};

// Inline SVG icons
const PlayIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132z" />
  </svg>
);

const PauseIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 9v6m4-6v6m7-3a9 9 0 01-9 9 9 9 0 01-9-9 9 9 0 019-9 9 9 0 019 9z" />
  </svg>
);

const XIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
  </svg>
);

const RainIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-3-3m0 0l-3 3m3-3V4M3 21h18M3 10h18" />
  </svg>
);

const LeafIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-12v4m-2-2h4m5 4v4m-2-2h4" />
  </svg>
);

const UserIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
  </svg>
);

export default function StillnessApp() {
  const [currentSection, setCurrentSection] = useState<'home' | 'library' | 'progress' | 'profile'>('home');
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [isPlayerOpen, setIsPlayerOpen] = useState(false);
  const [currentSession, setCurrentSession] = useState<Session | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const [totalSeconds, setTotalSeconds] = useState(600);
  const [isSoundOn, setIsSoundOn] = useState(false);
  const [isBreatheOpen, setIsBreatheOpen] = useState(false);
  const [breathePhase, setBreathePhase] = useState('Ready');

  // Audio refs
  const rainAudioRef = useRef<HTMLAudioElement>(null);
  const bellAudioRef = useRef<HTMLAudioElement>(null);

  // Timer
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isPlaying && elapsed < totalSeconds) {
      interval = setInterval(() => {
        setElapsed(prev => {
          const newTime = prev + 1;
          if (newTime >= totalSeconds) {
            endSession();
            return totalSeconds;
          }
          return newTime;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isPlaying, elapsed, totalSeconds]);

  // Play rain sound when toggled
  useEffect(() => {
    if (rainAudioRef.current) {
      if (isSoundOn) {
        rainAudioRef.current.play();
      } else {
        rainAudioRef.current.pause();
      }
    }
  }, [isSoundOn]);

  const filteredSessions = sessions
    .filter(s =>
      (categoryFilter === 'all' || s.category === categoryFilter) &&
      (s.title.toLowerCase().includes(searchTerm.toLowerCase()) || s.desc.toLowerCase().includes(searchTerm.toLowerCase()))
    );

  const formatTime = (seconds: number) => {
    const min = Math.floor(seconds / 60);
    const sec = seconds % 60;
    return `${min.toString().padStart(2, '0')}:${sec.toString().padStart(2, '0')}`;
  };

  const startSession = (session: Session) => {
    setCurrentSession(session);
    const minutes = parseInt(session.duration) || 10;
    setTotalSeconds(minutes * 60);
    setElapsed(0);
    setIsPlaying(false);
    setIsPlayerOpen(true);
    setIsSoundOn(false);
  };

  const togglePlay = () => {
    const newPlaying = !isPlaying;
    setIsPlaying(newPlaying);

    if (newPlaying && currentSession) {
      // Play bell sound
      if (bellAudioRef.current) {
        bellAudioRef.current.play();
      }

      // Speak introduction
      speak(`Welcome to ${currentSession.title}. ${currentSession.script}`, 0.85, 1.0);
    } else {
      window.speechSynthesis?.cancel();
    }
  };

  const endSession = () => {
    window.speechSynthesis?.cancel();
    setIsPlaying(false);
    setIsSoundOn(false);

    // Play bell to signal end
    if (bellAudioRef.current) {
      bellAudioRef.current.play();
    }

    // Final message
    speak("Your session is complete. Namaste.", 0.8, 0.95);

    setIsPlayerOpen(false);
    setElapsed(0);

    const toast = document.createElement('div');
    toast.className = 'fixed bottom-6 left-1/2 -translate-x-1/2 bg-[#8FAE8F] text-[#0F2A4D] px-8 py-3 rounded-3xl flex items-center gap-3 shadow-xl z-50';
    toast.innerHTML = `<span>✨ Session complete. Well done.</span><button onclick="this.parentElement.remove()" class="font-medium">Close</button>`;
    document.body.appendChild(toast);
    setTimeout(() => toast.parentElement?.removeChild(toast), 5000);
  };

  const endEarly = () => {
    if (window.confirm('End this session now?')) {
      window.speechSynthesis?.cancel();
      setIsPlaying(false);
      setIsSoundOn(false);
      setIsPlayerOpen(false);
      setElapsed(0);
    }
  };

  const toggleBackgroundSound = () => {
    const newState = !isSoundOn;
    setIsSoundOn(newState);
    if (newState) {
      speak("Rain sounds enabled.", 0.8);
    }
  };

  // Box Breathing
  const startBreathing = () => {
    const phases = [
      { text: 'Inhale', time: 4000 },
      { text: 'Hold', time: 4000 },
      { text: 'Exhale', time: 4000 },
      { text: 'Hold', time: 4000 },
    ];
    let i = 0;
    setBreathePhase(phases[0].text);

    const interval = setInterval(() => {
      i = (i + 1) % phases.length;
      setBreathePhase(phases[i].text);
    }, 4000);

    (window as any).breatheInterval = interval;
  };

  const closeBreathe = () => {
    setIsBreatheOpen(false);
    setBreathePhase('Ready');
    if ((window as any).breatheInterval) {
      clearInterval((window as any).breatheInterval);
      (window as any).breatheInterval = null;
    }
  };

  return (
    <div className="min-h-screen bg-[#0F2A4D] text-white font-light">
      {/* Hidden Audio Elements */}
      <audio ref={rainAudioRef} src="https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3" loop />
      <audio ref={bellAudioRef} src="https://assets.mixkit.co/active_storage/sfx/1194/1194-preview.mp3" />

      {/* NAV */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-[#0F2A4D]/95 backdrop-blur-md border-b border-white/10">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-[#8FAE8F] rounded-full flex items-center justify-center">
              <LeafIcon />
            </div>
            <span className="logo-font text-3xl font-bold tracking-tighter">Stillness</span>
          </div>

          <div className="hidden md:flex gap-8 text-sm">
            {(['home', 'library', 'progress', 'profile'] as const).map(s => (
              <button
                key={s}
                onClick={() => setCurrentSection(s)}
                className={`hover:text-[#8FAE8F] transition-colors capitalize ${currentSection === s ? 'text-[#8FAE8F] border-b-2 border-[#8FAE8F]' : ''}`}
              >
                {s}
              </button>
            ))}
          </div>

          <button onClick={() => setIsBreatheOpen(true)} className="flex items-center gap-2 px-4 py-1.5 text-sm bg-white/10 hover:bg-white/15 rounded-full">
            <LeafIcon /> Quick Breathe
          </button>
        </div>
      </nav>

      {/* HOME SECTION */}
      {currentSection === 'home' && (
        <div className="pt-16 min-h-screen flex items-center justify-center calm-gradient">
          <div className="max-w-2xl text-center px-6">
            <div className="inline-flex items-center gap-2 bg-white/5 px-4 py-1.5 rounded-full mb-6 text-sm">
              <div className="w-2 h-2 bg-[#8FAE8F] rounded-full animate-pulse" /> New: Sleep Stories with audio
            </div>
            <h1 className="logo-font text-8xl tracking-tighter mb-3">Stillness</h1>
            <p className="text-2xl text-[#D9E1E8]">Breathe. Rest. Be.</p>

            <div className="mt-12">
              <button onClick={() => startSession(sessions[0])} className="group bg-[#8FAE8F] hover:bg-[#A3C3A3] text-[#0F2A4D] font-medium text-lg py-4 px-10 rounded-3xl flex items-center justify-center gap-3 mx-auto active:scale-[0.985]">
                Begin Session <PlayIcon />
              </button>
              <button onClick={() => setCurrentSection('library')} className="mt-4 text-sm text-[#D9E1E8] hover:text-white">Browse library →</button>
            </div>
          </div>
        </div>
      )}

      {/* LIBRARY SECTION */}
      {currentSection === 'library' && (
        <div className="max-w-6xl mx-auto px-6 pt-20 pb-16">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4">
            <div>
              <h2 className="text-4xl font-medium">Library</h2>
              <p className="text-[#D9E1E8]">Choose a guided practice</p>
            </div>
            <input
              type="text"
              placeholder="Search sessions..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="bg-white/5 border border-white/10 rounded-3xl py-3 pl-10 w-full md:w-72 text-sm focus:outline-none focus:border-[#8FAE8F]/60"
            />
          </div>

          <div className="flex flex-wrap gap-2 mb-8">
            {['all', 'morning', 'stress', 'evening', 'sleep'].map(cat => (
              <button
                key={cat}
                onClick={() => setCategoryFilter(cat)}
                className={`px-5 py-1.5 rounded-full text-sm transition-all ${categoryFilter === cat ? 'bg-[#8FAE8F] text-[#0F2A4D]' : 'bg-white/5 hover:bg-white/10'}`}
              >
                {cat === 'all' ? 'All' : cat.charAt(0).toUpperCase() + cat.slice(1)}
              </button>
            ))}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {filteredSessions.map(session => (
              <div key={session.id} onClick={() => startSession(session)} className="session-card bg-white/5 border border-white/10 rounded-3xl p-6 cursor-pointer hover:border-[#8FAE8F]/40">
                <div className="flex justify-between mb-6">
                  <div>
                    <div className="font-medium text-xl tracking-tight">{session.title}</div>
                    <div className="text-sm text-[#D9E1E8]">{session.desc}</div>
                  </div>
                  <div className="font-mono text-xs px-3 py-1 bg-white/10 rounded-full self-start">{session.duration}</div>
                </div>
                <div className="flex justify-between items-center">
                  <span className="px-3 py-1 text-xs rounded-full border border-[#8FAE8F]/30 text-[#8FAE8F]">{session.level}</span>
                  <button className="flex items-center gap-2 text-sm px-5 py-1.5 bg-[#8FAE8F] text-[#0F2A4D] rounded-full hover:bg-white">
                    Start <PlayIcon />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* PROGRESS SECTION */}
      {currentSection === 'progress' && (
        <div className="max-w-4xl mx-auto px-6 pt-20 pb-16">
          <h2 className="text-4xl font-medium mb-8">Your Journey</h2>
          <div className="grid md:grid-cols-3 gap-6 mb-10">
            <div className="bg-white/5 border border-white/10 rounded-3xl p-7">
              <div className="text-[#8FAE8F] text-sm">CURRENT STREAK</div>
              <div className="text-6xl font-medium mt-1">12 <span className="text-2xl">days</span></div>
            </div>
            <div className="bg-white/5 border border-white/10 rounded-3xl p-7">
              <div className="text-[#8FAE8F] text-sm">TOTAL MINUTES</div>
              <div className="text-6xl font-medium mt-1">184 <span className="text-2xl">min</span></div>
            </div>
            <div className="bg-white/5 border border-white/10 rounded-3xl p-7">
              <div className="text-[#8FAE8F] text-sm">THIS WEEK</div>
              <div className="text-6xl font-medium mt-1">47 <span className="text-2xl">min</span></div>
            </div>
          </div>

          <div className="bg-white/5 border border-white/10 rounded-3xl p-8">
            <div className="font-medium mb-6">Weekly Minutes</div>
            <div className="flex gap-2 items-end h-52">
              {[65, 45, 85, 55, 75, 40, 90].map((h, i) => (
                <div key={i} className="flex-1 flex flex-col items-center">
                  <div className="w-full bg-[#8FAE8F] rounded-t" style={{ height: `${h}%` }} />
                  <div className="text-xs text-[#D9E1E8] mt-3">{['M','T','W','T','F','S','S'][i]}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* PROFILE SECTION */}
      {currentSection === 'profile' && (
        <div className="max-w-3xl mx-auto px-6 pt-20 pb-16">
          <div className="flex items-center gap-5 mb-10">
            <div className="w-20 h-20 bg-[#8FAE8F]/20 rounded-full flex items-center justify-center">
              <UserIcon />
            </div>
            <div>
              <div className="text-3xl">Luke Nigel Laylo</div>
              <div className="text-[#D9E1E8]">Meditating since Jan 2026</div>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <div className="bg-white/5 border border-white/10 rounded-3xl p-7">
              <div className="font-medium mb-4">Preferences</div>
              <div className="space-y-4 text-sm">
                <div className="flex justify-between"><span>Daily reminder</span><span className="font-mono text-[#8FAE8F]">7:30 PM</span></div>
                <div className="flex justify-between"><span>Background sound</span><span className="text-[#8FAE8F]">Rain</span></div>
                <div className="flex justify-between"><span>Sleep integration</span><span className="text-emerald-400">On</span></div>
              </div>
            </div>
            <div className="bg-white/5 border border-white/10 rounded-3xl p-7">
              <div className="font-medium mb-1">Favorite time of day</div>
              <div className="text-4xl text-[#8FAE8F]">Evening</div>
            </div>
          </div>
        </div>
      )}

      {/* SESSION PLAYER MODAL */}
      {isPlayerOpen && currentSession && (
        <div className="fixed inset-0 bg-black/80 z-[100] flex items-center justify-center p-6" onClick={() => setIsPlayerOpen(false)}>
          <div className="w-full max-w-md bg-[#0F2A4D] border border-white/10 rounded-3xl p-8" onClick={e => e.stopPropagation()}>
            <div className="flex justify-between mb-8">
              <div>
                <div className="text-2xl tracking-tight">{currentSession.title}</div>
                <div className="text-sm text-[#D9E1E8]">{currentSession.duration} • {currentSession.level}</div>
              </div>
              <button onClick={() => setIsPlayerOpen(false)}><XIcon /></button>
            </div>

            <div className="flex justify-center mb-8">
              <button 
                onClick={togglePlay}
                className="breathing-circle w-56 h-56 bg-gradient-to-br from-[#8FAE8F] to-[#6E8F6E] rounded-full flex items-center justify-center cursor-pointer active:scale-[0.97]"
              >
                <div className="w-24 h-24 bg-[#0F2A4D] rounded-full flex items-center justify-center">
                  {isPlaying ? <PauseIcon /> : <PlayIcon />}
                </div>
              </button>
            </div>

            <div className="flex items-center gap-4 px-1">
              <div className="font-mono text-sm w-12 text-right">{formatTime(elapsed)}</div>
              <div className="flex-1 h-1.5 bg-white/10 rounded-full overflow-hidden">
                <div className="h-full bg-[#8FAE8F] transition-all" style={{ width: `${(elapsed / totalSeconds) * 100}%` }} />
              </div>
              <div className="font-mono text-sm text-[#D9E1E8] w-12">{formatTime(totalSeconds)}</div>
            </div>

            <div className="flex justify-center gap-9 mt-8">
              <button onClick={toggleBackgroundSound} className={`flex flex-col items-center text-sm ${isSoundOn ? 'text-[#8FAE8F]' : 'text-[#D9E1E8]'} hover:text-white transition-colors`}>
                <RainIcon />
                <span className="text-xs mt-1">Rain</span>
              </button>
              <button onClick={endEarly} className="flex flex-col items-center text-sm text-[#D9E1E8] hover:text-white transition-colors">
                <XIcon />
                <span className="text-xs mt-1">End early</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* QUICK BREATHE MODAL */}
      {isBreatheOpen && (
        <div className="fixed inset-0 bg-black/80 z-[110] flex items-center justify-center" onClick={closeBreathe}>
          <div className="max-w-xs w-full mx-6 bg-[#0F2A4D] border border-white/10 rounded-3xl p-8 text-center" onClick={e => e.stopPropagation()}>
            <div className="mb-6">
              <h3 className="font-medium text-xl">Box Breathing</h3>
              <p className="text-sm text-[#D9E1E8]">4 seconds each</p>
            </div>

            <div className="text-4xl font-medium h-14 mb-8">{breathePhase}</div>

            <button onClick={startBreathing} className="mx-auto w-40 h-40 border-4 border-[#8FAE8F] rounded-full flex items-center justify-center mb-10 active:scale-95">
              <div className="w-28 h-28 bg-[#8FAE8F]/20 rounded-full" />
            </button>

            <button onClick={closeBreathe} className="text-sm px-6 py-2 border border-white/20 rounded-2xl hover:bg-white/5">Close</button>
          </div>
        </div>
      )}
    </div>
  );
}