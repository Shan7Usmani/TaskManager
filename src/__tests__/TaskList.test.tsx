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
  it('renders the list title', () => {
    render(<TaskList {...defaultProps} title="My List" />);
    expect(screen.getByText('My List')).toBeInTheDocument();
  });

  it('shows task count', () => {
    const tasks = [makeTask(), makeTask({ id: 'task-2', title: 'Task 2' })];
    render(<TaskList {...defaultProps} tasks={tasks} />);
    expect(screen.getByText('2 tasks')).toBeInTheDocument();
  });

  it('shows singular "1 task"', () => {
    render(<TaskList {...defaultProps} tasks={[makeTask()]} />);
    expect(screen.getByText('1 task')).toBeInTheDocument();
  });

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

  it('shows empty state only when both lists are empty', () => {
    const completed = [makeTask({ completed: true })];
    const { container } = render(
      <TaskList {...defaultProps} completedTasks={completed} />
    );
    expect(container.querySelector('.py-16')).toBeNull();
  });

  it('passes activeTaskId to TaskCard', () => {
    const task = makeTask({ id: 'active-one' });
    const { container } = render(
      <TaskList {...defaultProps} tasks={[task]} activeTaskId="active-one" />
    );
    const card = container.querySelector('.shadow-lg');
    expect(card).not.toBeNull();
  });
});
