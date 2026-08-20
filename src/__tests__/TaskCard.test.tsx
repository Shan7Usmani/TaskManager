import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import TaskCard from '@/components/TaskCard';
import { Task } from '@/lib/types';
import * as useStopwatchMod from '@/hooks/useStopwatch';

vi.mock('@/hooks/useStopwatch', () => ({
  useStopwatch: vi.fn(() => ({
    elapsed: 0,
    remaining: 0,
    progress: 0,
    elapsedFormatted: '0:00',
    remainingFormatted: '0:00',
    isActive: false,
  })),
}));

function makeTask(overrides: Partial<Task> = {}): Task {
  return {
    id: 'task-1',
    listId: 'today',
    title: 'Buy groceries',
    repeat: 'once',
    alarm: false,
    completed: false,
    createdAt: Date.now(),
    ...overrides,
  };
}

beforeEach(() => {
  vi.clearAllMocks();
});

describe('TaskCard', () => {
  it('renders task title', () => {
    render(
      <TaskCard
        task={makeTask()}
        isActive={false}
        onComplete={vi.fn()}
        onDelete={vi.fn()}
      />
    );
    expect(screen.getByText('Buy groceries')).toBeInTheDocument();
  });

  it('renders notes when provided', () => {
    render(
      <TaskCard
        task={makeTask({ notes: 'Milk, eggs, bread' })}
        isActive={false}
        onComplete={vi.fn()}
        onDelete={vi.fn()}
      />
    );
    expect(screen.getByText('Milk, eggs, bread')).toBeInTheDocument();
  });

  it('does not render notes when not provided', () => {
    render(
      <TaskCard
        task={makeTask({ notes: undefined })}
        isActive={false}
        onComplete={vi.fn()}
        onDelete={vi.fn()}
      />
    );
    expect(screen.queryByText('Milk, eggs, bread')).toBeNull();
  });

  it('renders time range when startTime is set', () => {
    render(
      <TaskCard
        task={makeTask({ startTime: '10:00', endTime: '11:00' })}
        isActive={false}
        onComplete={vi.fn()}
        onDelete={vi.fn()}
      />
    );
    expect(screen.getByText('10:00')).toBeInTheDocument();
    expect(screen.getByText(/11:00/)).toBeInTheDocument();
  });

  it('renders Daily badge for daily tasks', () => {
    render(
      <TaskCard
        task={makeTask({ repeat: 'daily' })}
        isActive={false}
        onComplete={vi.fn()}
        onDelete={vi.fn()}
      />
    );
    expect(screen.getByText('Daily')).toBeInTheDocument();
  });

  it('renders Weekly badge for weekly tasks', () => {
    render(
      <TaskCard
        task={makeTask({ repeat: 'weekly' })}
        isActive={false}
        onComplete={vi.fn()}
        onDelete={vi.fn()}
      />
    );
    expect(screen.getByText('Weekly')).toBeInTheDocument();
  });

  it('does not render repeat badge for once tasks', () => {
    render(
      <TaskCard
        task={makeTask({ repeat: 'once' })}
        isActive={false}
        onComplete={vi.fn()}
        onDelete={vi.fn()}
      />
    );
    expect(screen.queryByText('Daily')).toBeNull();
    expect(screen.queryByText('Weekly')).toBeNull();
  });

  it('calls onComplete when checkbox is clicked', () => {
    const onComplete = vi.fn();
    const { container } = render(
      <TaskCard
        task={makeTask()}
        isActive={false}
        onComplete={onComplete}
        onDelete={vi.fn()}
      />
    );
    // The checkbox is the first button inside the card
    const checkbox = container.querySelector('button.mt-0\\.5') || container.querySelectorAll('button')[0];
    fireEvent.click(checkbox!);
    expect(onComplete).toHaveBeenCalledWith('task-1');
  });

  it('calls onDelete when delete button is clicked', () => {
    const onDelete = vi.fn();
    const { container } = render(
      <TaskCard
        task={makeTask()}
        isActive={false}
        onComplete={vi.fn()}
        onDelete={onDelete}
      />
    );
    // Delete button has the Trash2 icon - it's the last button in the card
    const buttons = container.querySelectorAll('button');
    const deleteBtn = buttons[buttons.length - 1];
    fireEvent.click(deleteBtn);
    expect(onDelete).toHaveBeenCalledWith('task-1');
  });

  it('shows completed state with line-through', () => {
    render(
      <TaskCard
        task={makeTask({ completed: true })}
        isActive={false}
        onComplete={vi.fn()}
        onDelete={vi.fn()}
      />
    );
    const title = screen.getByText('Buy groceries');
    expect(title.className).toContain('line-through');
  });

  it('shows active styling when isActive is true', () => {
    const { container } = render(
      <TaskCard
        task={makeTask()}
        isActive={true}
        onComplete={vi.fn()}
        onDelete={vi.fn()}
      />
    );
    const card = container.firstElementChild!;
    expect(card.className).toContain('glow-green');
  });

  it('shows "Active" when active and has start/end time', () => {
    vi.mocked(useStopwatchMod.useStopwatch).mockReturnValue({
      elapsed: 300,
      remaining: 3300,
      progress: 8.33,
      elapsedFormatted: '5:00',
      remainingFormatted: '55:00',
      isActive: true,
    });

    render(
      <TaskCard
        task={makeTask({ startTime: '10:00', endTime: '11:00' })}
        isActive={true}
        onComplete={vi.fn()}
        onDelete={vi.fn()}
      />
    );
    expect(screen.getByText('Active')).toBeInTheDocument();
    expect(screen.getByText('5:00')).toBeInTheDocument();
  });

  it('does not show stopwatch when not active', () => {
    render(
      <TaskCard
        task={makeTask({ startTime: '10:00', endTime: '11:00' })}
        isActive={false}
        onComplete={vi.fn()}
        onDelete={vi.fn()}
      />
    );
    expect(screen.queryByText('Active')).toBeNull();
  });
});
