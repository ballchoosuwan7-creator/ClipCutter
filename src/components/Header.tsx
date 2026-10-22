import React, { useState } from 'react';
import { Scissors, Sparkles, FolderOpen, Volume2, VolumeX, ChevronDown } from 'lucide-react';
import { Project } from '../types';
import { soundEngine } from '../services/soundEffects';

interface HeaderProps {
  currentView: 'landing' | 'processing' | 'results' | 'editor';
  setCurrentView: (view: 'landing' | 'processing' | 'results' | 'editor') => void;
  projects: Project[];
  activeProject: Project | null;
  onSelectProject: (proj: Project) => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentView,
  setCurrentView,
  projects,
  activeProject,
  onSelectProject
}) => {
  const [isMuted, setIsMuted] = useState(false);
  const [isProjectDropdownOpen, setIsProjectDropdownOpen] = useState(false);

  const toggleSound = () => {
    const next = !isMuted;
    setIsMuted(next);
    soundEngine.setMuted(next);
  };

  return (
    <header className="sticky top-0 z-40 backdrop-blur-md bg-[#09090b]/85 border-b border-[#27272a]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand Logo */}
        <div
          className="flex items-center space-x-3 cursor-pointer select-none"
          onClick={() => setCurrentView('landing')}
        >
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-[#F5B800] to-[#A67B00] flex items-center justify-center text-black font-extrabold text-xl shadow-lg shadow-[#F5B800]/20">
            <Scissors className="w-5 h-5 stroke-[2.5]" />
          </div>
          <div>
            <span className="text-xl font-extrabold tracking-tight bg-gradient-to-r from-white via-[#FFF3C4] to-[#F5B800] bg-clip-text text-transparent">
              ClipCutter AI
            </span>
            <span className="hidden sm:inline-block ml-2 px-2 py-0.5 text-[10px] font-bold bg-[#F5B800]/10 text-[#F5B800] border border-[#F5B800]/30 rounded-full">
              Pro Studio
            </span>
          </div>
        </div>

        {/* Navigation items */}
        <nav className="hidden md:flex items-center space-x-6 text-xs font-semibold text-zinc-400">
          <button
            onClick={() => setCurrentView('landing')}
            className={`transition-colors ${currentView === 'landing' ? 'text-[#F5B800]' : 'hover:text-white'}`}
          >
            หน้าแรก
          </button>
          <button
            onClick={() => setCurrentView('results')}
            className={`transition-colors ${currentView === 'results' ? 'text-[#F5B800]' : 'hover:text-white'}`}
          >
            แดชบอร์ดคลิปสั้น
          </button>
        </nav>

        {/* Right Tools: Project Picker & Sound & CTA */}
        <div className="flex items-center space-x-3">
          {/* Global Sound FX Toggle */}
          <button
            onClick={toggleSound}
            className="p-2 bg-[#121216] hover:bg-zinc-800 border border-[#27272a] rounded-xl text-zinc-400 hover:text-[#F5B800] transition-colors"
            title={isMuted ? 'เปิดเสียง SFX & BGM' : 'ปิดเสียง SFX & BGM'}
          >
            {isMuted ? <VolumeX className="w-4 h-4 text-red-400" /> : <Volume2 className="w-4 h-4 text-[#F5B800]" />}
          </button>

          {/* Project Switcher Dropdown */}
          <div className="relative">
            <button
              onClick={() => setIsProjectDropdownOpen(!isProjectDropdownOpen)}
              className="hidden sm:inline-flex items-center space-x-2 px-3 py-2 text-xs font-semibold text-zinc-300 bg-[#121216] hover:bg-zinc-800 border border-[#27272a] rounded-xl transition-all"
            >
              <FolderOpen className="w-3.5 h-3.5 text-[#F5B800]" />
              <span className="max-w-[130px] truncate">
                {activeProject ? activeProject.title : 'โปรเจกต์ของฉัน'}
              </span>
              <ChevronDown className="w-3 h-3 text-zinc-500" />
            </button>

            {isProjectDropdownOpen && (
              <div className="absolute right-0 mt-2 w-72 bg-[#121216] border border-[#27272a] rounded-2xl p-2 shadow-2xl z-50">
                <div className="text-[10px] font-bold text-zinc-500 uppercase px-3 py-1.5">
                  สลับโปรเจกต์
                </div>
                {projects.map(p => (
                  <button
                    key={p.id}
                    onClick={() => {
                      onSelectProject(p);
                      setIsProjectDropdownOpen(false);
                      setCurrentView('results');
                    }}
                    className={`w-full text-left p-2.5 rounded-xl text-xs flex items-center justify-between transition-colors ${
                      activeProject?.id === p.id
                        ? 'bg-[#F5B800]/15 text-[#FFF3C4] font-semibold'
                        : 'text-zinc-300 hover:bg-zinc-800'
                    }`}
                  >
                    <span className="truncate pr-2">{p.title}</span>
                    <span className="text-[10px] text-zinc-500 font-mono flex-shrink-0">{p.clipsCount} คลิป</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Create New CTA */}
          <button
            onClick={() => setCurrentView('landing')}
            className="inline-flex items-center space-x-1.5 px-4 py-2 text-xs font-extrabold text-black bg-gradient-to-r from-[#F5B800] to-[#D49E00] hover:from-[#FFF3C4] hover:to-[#F5B800] rounded-xl shadow-lg shadow-[#F5B800]/20 transition-all active:scale-95"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>สร้างคลิปใหม่</span>
          </button>
        </div>
      </div>
    </header>
  );
};
