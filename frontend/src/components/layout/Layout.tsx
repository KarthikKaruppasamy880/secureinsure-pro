import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Header from './Header';
import AssistantPanel from '../chatbot/AssistantPanel';

const Layout: React.FC = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [assistantOpen, setAssistantOpen] = useState(false);
  const [assistantMinimized, setAssistantMinimized] = useState(false);

  return (
    <div className="flex h-screen bg-gray-100 dark:bg-gray-900">
      {/* Sidebar */}
      <Sidebar open={sidebarOpen} setOpen={setSidebarOpen} />
      
      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <Header 
          onMenuClick={() => setSidebarOpen(true)}
          onAssistantToggle={() => setAssistantOpen(!assistantOpen)}
          assistantOpen={assistantOpen}
        />
        
        {/* Main content area */}
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-50 dark:bg-gray-800">
          <div className="container mx-auto px-6 py-8">
            <Outlet />
          </div>
        </main>
      </div>

      {/* AI Assistant Panel */}
      <AssistantPanel
        isOpen={assistantOpen}
        onToggle={() => setAssistantOpen(!assistantOpen)}
        onMinimize={() => setAssistantMinimized(!assistantMinimized)}
      />
    </div>
  );
};

export default Layout; 