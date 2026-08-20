# Task Manager — Build Spec

## Tech Stack
- Next.js 16 (App Router)
- TypeScript
- Tailwind CSS v4
- React useState/useReducer + localStorage
- Web Notifications API + HTML5 Audio API
- Lucide React icons

## Data Models

```typescript
interface TaskList {
  id: string;
  name: string;
  isDefault: boolean;
  createdAt: number;
}

interface Task {
  id: string;
  listId: string;
  title: string;
  notes?: string;
  repeat: 'once' | 'daily' | 'weekly';
  startTime?: string;     // "14:30" (HH:MM, 24h)
  endTime?: string;       // "16:00" (HH:MM, 24h)
  alarm: boolean;
  ringtone?: string;
  completed: boolean;
  completedAt?: number;
  createdAt: number;
}
```

## Default Lists
- Today
- Tomorrow
- Upcoming
- Overdue
- Main Goals

## Features
1. List CRUD (create custom lists, default lists can't be deleted)
2. Task CRUD (add/edit/delete/complete)
3. Repetition (once/daily/weekly)
4. Time engine (30s interval, moves tasks between lists)
5. Alarm (browser notification + audio ringtone)
6. Stopwatch (auto-start when task time hits, only if endTime set)
7. Overdue detection (auto-move at midnight or on load)

## File Structure
```
src/
├── app/
│   ├── layout.tsx
│   ├── page.tsx
│   └── globals.css
├── components/
│   ├── Sidebar.tsx
│   ├── TaskList.tsx
│   ├── TaskCard.tsx
│   ├── AddTaskDialog.tsx
│   ├── Stopwatch.tsx
│   ├── AlarmModal.tsx
│   ├── CreateListDialog.tsx
│   └── CompletedSection.tsx
├── lib/
│   ├── store.ts
│   ├── types.ts
│   ├── timeEngine.ts
│   ├── defaults.ts
│   └── alarms.ts
└── hooks/
    ├── useTimeEngine.ts
    ├── useAlarm.ts
    └── useStopwatch.ts
```

## Implementation Order
1. Scaffold Next.js app
2. Types + localStorage store
3. Sidebar + list view
4. AddTaskDialog
5. TaskCard + TaskList
6. Time engine
7. Stopwatch
8. Alarm system
9. CreateListDialog
10. Polish UI
