import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import TaskList from '@/components/TaskList';
import { Task } from '@/lib/types';

function makeTask(overrides: Partial<Task> = {}): Task {
  return {
    id: 'task-1',
    listId: 'today',
    title: 'Test Task',
    repeat: 'once',
    alarm: false,
    completed: false,
    createdAt: Date.now(),
    ...overrides,
  };
}

const defaultProps = {
  title: 'Today',
  tasks: [],
  completedTasks: [],
  activeTaskId: null,
  onComplete: vi.fn(),
  onDelete: vi.fn(),
};

describe('TaskList', () => {
  it('renders empty state when no tasks', () => {
    render(<TaskList {...defaultProps} />);
    expect(screen.getByText('No tasks here yet')).toBeInTheDocument();
  });

  it('renders task cards', () => {
    const tasks = [makeTask({ title: 'Buy milk' }), makeTask({ id: 't2', title: 'Walk dog' })];
    render(<TaskList {...defaultProps} tasks={tasks} />);
    expect(screen.getByText('Buy milk')).toBeInTheDocument();
    expect(screen.getByText('Walk dog')).toBeInTheDocument();
  });

  it('renders completed section header', () => {
    const completed = [makeTask({ title: 'Done task', completed: true })];
    render(<TaskList {...defaultProps} completedTasks={completed} />);
    expect(screen.getByText(/Completed/)).toBeInTheDocument();
    expect(screen.getByText(/1/)).toBeInTheDocument();
  });

  it('renders completed tasks', () => {
    const completed = [makeTask({ title: 'Finished', completed: true })];
    render(<TaskList {...defaultProps} completedTasks={completed} />);
    expect(screen.getByText('Finished')).toBeInTheDocument();
  });

  it('does not render completed section when no completed tasks', () => {
    render(<TaskList {...defaultProps} />);
    expect(screen.queryByText(/Completed/)).toBeNull();
  });

  it('does not show empty state when completed tasks exist', () => {
    const completed = [makeTask({ completed: true })];
    render(<TaskList {...defaultProps} completedTasks={completed} />);
    expect(screen.queryByText('No tasks here yet')).toBeNull();
  });

  it('passes activeTaskId to TaskCard for highlighting', () => {
    const task = makeTask({ id: 'active-one' });
    const { container } = render(
      <TaskList {...defaultProps} tasks={[task]} activeTaskId="active-one" />
    );
    // Active card should have glow-green class
    const card = container.querySelector('.glow-green');
    expect(card).not.toBeNull();
  });

  it('renders multiple active tasks', () => {
    const tasks = [
      makeTask({ id: 'a', title: 'Task A' }),
      makeTask({ id: 'b', title: 'Task B' }),
      makeTask({ id: 'c', title: 'Task C' }),
    ];
    render(<TaskList {...defaultProps} tasks={tasks} />);
    expect(screen.getByText('Task A')).toBeInTheDocument();
    expect(screen.getByText('Task B')).toBeInTheDocument();
    expect(screen.getByText('Task C')).toBeInTheDocument();
  });

  it('shows empty state only when both lists are empty', () => {
    const tasks = [makeTask()];
    const { container } = render(<TaskList {...defaultProps} tasks={tasks} />);
    // The "No tasks here yet" message should NOT appear
    expect(screen.queryByText('No tasks here yet')).toBeNull();
  });
});
