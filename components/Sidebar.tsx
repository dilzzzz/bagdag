import React from 'react';
import { AppView } from '../types';
import { ChatIcon, BrushIcon, GolfIcon, BookOpenIcon, TargetIcon, MapPinIcon, UsersIcon } from './icons';

interface SidebarProps {
  currentView: AppView;
  setView: (view: AppView) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ currentView, setView }) => {
  const navItems = [
    { view: AppView.Coach, icon: ChatIcon, label: 'AI Coach' },
    { view: AppView.InstructionalContent, icon: BookOpenIcon, label: 'Instruction' },
    { view: AppView.ShotTracker, icon: TargetIcon, label: 'Shot Tracker' },
    { view: AppView.FindCourses, icon: MapPinIcon, label: 'Find Courses' },
    { view: AppView.HoleDesigner, icon: BrushIcon, label: 'Hole Designer' },
    { view: AppView.Community, icon: UsersIcon, label: 'Community' },
  ];

  return (
    <div className="flex flex-col w-16 md:w-64 bg-gray-900 text-white h-screen p-2 md:p-4 border-r border-gray-700">
      <div className="flex items-center mb-10 p-2">
        <GolfIcon className="h-8 w-8 text-green-400" />
        <h1 className="text-xl font-bold ml-2 hidden md:block">Golf AI Pro</h1>
      </div>
      <nav className="flex flex-col space-y-2">
        {navItems.map((item) => (
          <button
            key={item.view}
            onClick={() => setView(item.view)}
            className={`flex items-center p-3 rounded-lg transition-colors duration-200 ${
              currentView === item.view
                ? 'bg-green-600 text-white'
                : 'text-gray-400 hover:bg-gray-700 hover:text-white'
            }`}
          >
            <item.icon className="h-6 w-6" />
            <span className="ml-4 hidden md:block">{item.label}</span>
          </button>
        ))}
      </nav>
    </div>
  );
};

export default Sidebar;
