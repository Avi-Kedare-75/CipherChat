import React from 'react';
import { Sidebar } from '../components/sidebar/Sidebar';
import { ChatWindow } from '../components/chat/ChatWindow';
import { useUIStore } from '../store/useUIStore';
import { cn } from '../utils/cn';

export const Home = () => {
  const { showMobileChat } = useUIStore();

  return (
    <div className="h-screen w-screen bg-[#070a0e] cyber-grid-bg flex items-center justify-center overflow-hidden relative">
      {/* Ambient Cyber Neon Orbs */}
      <div className="absolute top-10 left-1/4 w-[500px] h-[300px] bg-emerald-500/10 rounded-full blur-[120px] pointer-events-none -z-10" />
      <div className="absolute bottom-10 right-1/4 w-[450px] h-[300px] bg-cyan-500/10 rounded-full blur-[120px] pointer-events-none -z-10" />

      {/* Main App Container */}
      <main className="w-full h-full md:h-[calc(100vh-2.5rem)] md:w-[calc(100vw-3rem)] max-w-[1760px] bg-[#0c121a]/95 md:rounded-3xl border border-white/10 shadow-[0_20px_50px_rgba(0,0,0,0.8)] backdrop-blur-2xl flex overflow-hidden relative">
        {/* Left Sidebar (hidden on mobile if chat is open) */}
        <div
          className={cn(
            'w-full md:w-auto h-full flex flex-shrink-0 transition-transform duration-200',
            showMobileChat ? 'hidden md:flex' : 'flex'
          )}
        >
          <Sidebar />
        </div>

        {/* Right Chat Area (hidden on mobile if sidebar is open) */}
        <div
          className={cn(
            'flex-1 h-full flex flex-col',
            showMobileChat ? 'flex' : 'hidden md:flex'
          )}
        >
          <ChatWindow />
        </div>
      </main>
    </div>
  );
};

export default Home;
