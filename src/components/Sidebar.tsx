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
        className="fixed top-4 left-4 z-50 p-2 rounded-lg bg-zinc-800 text-zinc-300 hover:bg-zinc-700 lg:hidden"
      >
        {isOpen ? <ChevronLeft className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
      </button>

      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-30 lg:hidden"
          onClick={onToggle}
        />
      )}

      <aside
        className={`fixed lg:static top-0 left-0 z-40 h-full w-64 bg-zinc-900 border-r border-zinc-800 flex flex-col transition-transform duration-200 ${
          isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        <div className="p-4 border-b border-zinc-800">
          <h1 className="text-lg font-bold text-zinc-100 tracking-tight">TaskManager</h1>
        </div>

        <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
          {lists.map((list) => (
            <button
              key={list.id}
              onClick={() => {
                onSelectList(list.id);
                if (window.innerWidth < 1024) onToggle();
              }}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors ${
                activeListId === list.id
                  ? 'bg-zinc-800 text-zinc-100 font-medium'
                  : 'text-zinc-400 hover:bg-zinc-800/50 hover:text-zinc-200'
              }`}
            >
              {LIST_ICONS[list.id] || <FolderOpen className="w-4 h-4" />}
              <span className="flex-1 text-left">{list.name}</span>
              {(taskCounts[list.id] || 0) > 0 && (
                <span
                  className={`text-xs px-1.5 py-0.5 rounded-full ${
                    list.id === 'overdue'
                      ? 'bg-red-500/20 text-red-400'
                      : 'bg-zinc-700 text-zinc-400'
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
                  className="text-zinc-600 hover:text-red-400 text-xs"
                >
                  ×
                </button>
              )}
            </button>
          ))}
        </nav>

        <div className="p-3 border-t border-zinc-800">
          {showNewList ? (
            <div className="flex gap-2">
              <input
                autoFocus
                value={newListName}
                onChange={(e) => setNewListName(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleCreate();
                  if (e.key === 'Escape') setShowNewList(false);
                }}
                placeholder="List name..."
                className="flex-1 px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-sm text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-zinc-500"
              />
              <button
                onClick={handleCreate}
                className="px-3 py-2 bg-zinc-700 text-zinc-200 rounded-lg text-sm hover:bg-zinc-600"
              >
                Add
              </button>
            </div>
          ) : (
            <button
              onClick={() => setShowNewList(true)}
              className="w-full flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm text-zinc-500 hover:bg-zinc-800/50 hover:text-zinc-300 transition-colors"
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
