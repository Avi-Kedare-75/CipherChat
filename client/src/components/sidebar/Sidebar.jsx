import React from 'react';
import { SidebarHeader } from './SidebarHeader';
import { SearchBar } from '../common/SearchBar';
import { ChatList } from '../chat/ChatList';
import { ProfileDrawer } from './ProfileDrawer';
import { NewChatModal } from './NewChatModal';
import { useChatStore } from '../../store/useChatStore';

export const Sidebar = () => {
  const { searchQuery, setSearchQuery, clearSearch } = useChatStore();

  return (
    <aside className="w-full md:w-[380px] lg:w-[420px] h-full flex flex-col bg-dark-sidebar border-r border-dark-border relative flex-shrink-0 z-20">
      {/* Top Header */}
      <SidebarHeader />

      {/* Search Input Bar */}
      <div className="p-3 bg-dark-sidebar border-b border-dark-border/40">
        <SearchBar
          value={searchQuery}
          onChange={setSearchQuery}
          onClear={clearSearch}
          placeholder="Search or start new chat"
        />
      </div>

      {/* Chat List */}
      <ChatList />

      {/* Slide-out Drawers & Modals */}
      <ProfileDrawer />
      <NewChatModal />
    </aside>
  );
};

export default Sidebar;
