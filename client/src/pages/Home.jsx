import React from 'react';
import { Sidebar } from '../components/sidebar/Sidebar';
import { ChatWindow } from '../components/chat/ChatWindow';
import { useUIStore } from '../store/useUIStore';
import { cn } from '../utils/cn';

export const Home = () => {
  const { showMobileChat } = useUIStore();

  return (
    <div className="h-screen w-screen bg-dark-bg flex items-center justify-center overflow-hidden">
      {/* WhatsApp style green top header band */}
      <div className="hidden md:block absolute top-0 left-0 right-0 h-32 bg-cipher-800/40 -z-10" />

      {/* Main App Container */}
      <main className="w-full h-full md:h-[calc(100vh-2rem)] md:w-[calc(100vw-2rem)] max-w-[1700px] bg-dark-sidebar md:rounded-2xl border border-dark-border/60 shadow-2xl flex overflow-hidden relative">
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
