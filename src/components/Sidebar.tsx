'use client';

import { useState } from 'react';
import { TaskList } from '@/lib/types';
import {
  Calendar,
  CalendarClock,
  CalendarDays,
  AlertTriangle,
  Target,
  Plus,
  FolderOpen,
  ChevronLeft,
  Menu,
  Zap,
} from 'lucide-react';

interface SidebarProps {
  lists: TaskList[];
  activeListId: string;
  onSelectList: (id: string) => void;
  onCreateList: (name: string) => void;
  onDeleteList: (id: string) => void;
  taskCounts: Record<string, number>;
  isOpen: boolean;
  onToggle: () => void;
}

const LIST_ICONS: Record<string, React.ReactNode> = {
  today: <Calendar className="w-4 h-4" />,
  tomorrow: <CalendarClock className="w-4 h-4" />,
  upcoming: <CalendarDays className="w-4 h-4" />,
  overdue: <AlertTriangle className="w-4 h-4" />,
  goals: <Target className="w-4 h-4" />,
};

const LIST_COLORS: Record<string, string> = {
  today: 'text-neon-green',
  tomorrow: 'text-neon-cyan',
  upcoming: 'text-[#a78bfa]',
  overdue: 'text-neon-red',
  goals: 'text-neon-amber',
};

const LIST_ACTIVE_BG: Record<string, string> = {
  today: 'bg-[rgba(0,255,122,0.08)] border-[rgba(0,255,122,0.2)]',
  tomorrow: 'bg-[rgba(0,217,255,0.08)] border-[rgba(0,217,255,0.2)]',
  upcoming: 'bg-[rgba(167,139,250,0.08)] border-[rgba(167,139,250,0.2)]',
  overdue: 'bg-[rgba(255,59,92,0.08)] border-[rgba(255,59,92,0.2)]',
  goals: 'bg-[rgba(255,176,46,0.08)] border-[rgba(255,176,46,0.2)]',
};

export default function Sidebar({
  lists,
  activeListId,
  onSelectList,
  onCreateList,
  onDeleteList,
  taskCounts,
  isOpen,
  onToggle,
}: SidebarProps) {
  const [showNewList, setShowNewList] = useState(false);
  const [newListName, setNewListName] = useState('');

  const handleCreate = () => {
    if (newListName.trim()) {
      onCreateList(newListName.trim());
      setNewListName('');
      setShowNewList(false);
    }
  };

  return (
    <>
      <button
        onClick={onToggle}
        className="fixed top-4 left-4 z-50 p-2.5 rounded-xl glass glow-green lg:hidden"
      >
        {isOpen ? (
          <ChevronLeft className="w-5 h-5 text-neon-green" />
        ) : (
          <Menu className="w-5 h-5 text-neon-green" />
        )}
      </button>

      {isOpen && (
        <div
          className="fixed inset-0 bg-black/70 backdrop-blur-sm z-30 lg:hidden"
          onClick={onToggle}
        />
      )}

      <aside
        className={`fixed lg:static top-0 left-0 z-40 h-full w-72 glass-strong flex flex-col transition-transform duration-300 ease-out ${
          isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        <div className="p-5 border-b border-[rgba(0,255,122,0.1)]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[rgba(0,255,122,0.2)] to-[rgba(0,217,255,0.2)] flex items-center justify-center glow-green">
              <Zap className="w-4 h-4 text-neon-green" />
            </div>
            <div>
              <h1 className="text-sm font-bold tracking-[0.2em] uppercase" style={{ fontFamily: 'Orbitron, monospace' }}>
                <span className="text-neon-green">Task</span>
                <span className="text-neon-cyan">Manager</span>
              </h1>
              <p className="text-[10px] text-[#606060] tracking-widest uppercase">Command Center</p>
            </div>
          </div>
        </div>

        <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
          {lists.map((list, i) => {
            const isActive = activeListId === list.id;
            const colorClass = LIST_COLORS[list.id] || 'text-[#a0a0a0]';
            const activeBg = LIST_ACTIVE_BG[list.id] || 'bg-[rgba(160,160,160,0.08)] border-[rgba(160,160,160,0.2)]';

            return (
              <button
                key={list.id}
                onClick={() => {
                  onSelectList(list.id);
                  if (window.innerWidth < 1024) onToggle();
                }}
                className={`w-full flex items-center gap-3 px-3.5 py-3 rounded-xl text-sm transition-all duration-200 animate-slide-in border border-transparent ${
                  isActive
                    ? `${activeBg} font-medium`
                    : 'text-[#a0a0a0] hover:bg-[rgba(0,255,122,0.04)] hover:text-[#e8e8e8] hover:border-[rgba(0,255,122,0.08)]'
                }`}
                style={{ animationDelay: `${i * 40}ms` }}
              >
                <span className={isActive ? colorClass : ''}>
                  {LIST_ICONS[list.id] || <FolderOpen className="w-4 h-4" />}
                </span>
                <span className="flex-1 text-left">{list.name}</span>
                {(taskCounts[list.id] || 0) > 0 && (
                  <span
                    className={`text-xs px-2 py-0.5 rounded-full font-mono ${
                      list.id === 'overdue'
                        ? 'bg-[rgba(255,59,92,0.15)] text-neon-red'
                        : 'bg-[rgba(0,255,122,0.1)] text-neon-green'
                    }`}
                  >
                    {taskCounts[list.id]}
                  </span>
                )}
                {!list.isDefault && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onDeleteList(list.id);
                    }}
                    className="opacity-0 group-hover:opacity-100 text-[#606060] hover:text-neon-red text-xs transition-all"
                  >
                    ×
                  </button>
                )}
              </button>
            );
          })}
        </nav>

        <div className="p-3 border-t border-[rgba(0,255,122,0.1)]">
          {showNewList ? (
            <div className="flex gap-2 animate-fade-in">
              <input
                autoFocus
                value={newListName}
                onChange={(e) => setNewListName(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleCreate();
                  if (e.key === 'Escape') setShowNewList(false);
                }}
                placeholder="List name..."
                className="flex-1 px-3 py-2.5 alien-input rounded-xl text-sm"
              />
              <button
                onClick={handleCreate}
                className="px-4 py-2.5 btn-neon rounded-xl text-sm"
              >
                Add
              </button>
            </div>
          ) : (
            <button
              onClick={() => setShowNewList(true)}
              className="w-full flex items-center gap-2 px-3.5 py-3 rounded-xl text-sm text-[#606060] hover:bg-[rgba(0,255,122,0.04)] hover:text-neon-green transition-all duration-200 border border-transparent hover:border-[rgba(0,255,122,0.1)]"
            >
              <Plus className="w-4 h-4" />
              <span>New List</span>
            </button>
          )}
        </div>
      </aside>
    </>
  );
}
