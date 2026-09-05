import React, { useState, useEffect } from 'react';
import { SidebarHeader } from './SidebarHeader';
import { SearchBar } from '../common/SearchBar';
import { ChatList } from '../chat/ChatList';
import { ProfileDrawer } from './ProfileDrawer';
import { NewChatModal } from './NewChatModal';
import { CreateGroupModal } from './CreateGroupModal';
import { useChatStore } from '../../store/useChatStore';
import { MessageSquare, User, Users } from 'lucide-react';

export const Sidebar = () => {
  const { searchQuery, setSearchQuery, clearSearch, fetchChats } = useChatStore();
  const [activeFilter, setActiveFilter] = useState('all'); // 'all' | 'direct' | 'groups'

  useEffect(() => {
    fetchChats();
  }, [fetchChats]);

  return (
    <aside className="w-full md:w-[380px] lg:w-[410px] h-full flex flex-col bg-[#070b10] border-r border-emerald-500/10 relative flex-shrink-0 z-20">
      {/* Top Header */}
      <SidebarHeader />

      {/* Search & Filters */}
      <div className="px-3.5 py-3 bg-[#0a0f16]/90 border-b border-emerald-500/10 backdrop-blur-md">
        <SearchBar
          value={searchQuery}
          onChange={setSearchQuery}
          onClear={clearSearch}
          placeholder="Search encrypted conversations..."
        />

        {/* Filter Pills */}
        <div className="flex items-center gap-1.5 mt-2.5">
          <button
            type="button"
            onClick={() => setActiveFilter('all')}
            className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-medium transition-all ${
              activeFilter === 'all'
                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 shadow-[0_0_12px_rgba(16,185,129,0.15)]'
                : 'text-slate-400 hover:text-slate-200 hover:bg-white/5 border border-transparent'
            }`}
          >
            <MessageSquare className="w-3 h-3" />
            <span>All</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveFilter('direct')}
            className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-medium transition-all ${
              activeFilter === 'direct'
                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 shadow-[0_0_12px_rgba(16,185,129,0.15)]'
                : 'text-slate-400 hover:text-slate-200 hover:bg-white/5 border border-transparent'
            }`}
          >
            <User className="w-3 h-3" />
            <span>Direct</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveFilter('groups')}
            className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-medium transition-all ${
              activeFilter === 'groups'
                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 shadow-[0_0_12px_rgba(16,185,129,0.15)]'
                : 'text-slate-400 hover:text-slate-200 hover:bg-white/5 border border-transparent'
            }`}
          >
            <Users className="w-3 h-3" />
            <span>Groups</span>
          </button>
        </div>
      </div>

      {/* Chat List */}
      <ChatList activeFilter={activeFilter} />

      {/* Slide-out Drawers & Modals */}
      <ProfileDrawer />
      <NewChatModal />
      <CreateGroupModal />
    </aside>
  );
};

export default Sidebar;
