import React, { useState } from 'react';
import Sidebar from './components/Sidebar';
import ChatView from './components/ChatView';
import HoleDesigner from './components/HoleDesigner';
import FindCourses from './components/FindCourses';
import InstructionalContent from './components/InstructionalContent';
import ShotTracker from './components/ShotTracker';
import Community from './components/Community';
import { AppView } from './types';

const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<AppView>(AppView.Coach);

  const renderView = () => {
    switch (currentView) {
      case AppView.Coach:
        return <ChatView />;
      case AppView.InstructionalContent:
        return <InstructionalContent />;
      case AppView.ShotTracker:
        return <ShotTracker />;
      case AppView.FindCourses:
        return <FindCourses />;
      case AppView.HoleDesigner:
        return <HoleDesigner />;
      case AppView.Community:
        return <Community />;
      default:
        return <ChatView />;
    }
  };

  return (
    <div className="flex h-screen w-screen font-sans">
      <Sidebar currentView={currentView} setView={setCurrentView} />
      <main className="flex-1 h-screen overflow-hidden">
        {renderView()}
      </main>
    </div>
  );
};

export default App;
