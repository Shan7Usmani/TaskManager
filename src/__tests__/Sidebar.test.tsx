import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import Sidebar from '@/components/Sidebar';
import { TaskList } from '@/lib/types';

const defaultLists: TaskList[] = [
  { id: 'today', name: 'Today', isDefault: true, createdAt: 1 },
  { id: 'tomorrow', name: 'Tomorrow', isDefault: true, createdAt: 2 },
  { id: 'upcoming', name: 'Upcoming', isDefault: true, createdAt: 3 },
  { id: 'overdue', name: 'Overdue', isDefault: true, createdAt: 4 },
  { id: 'goals', name: 'Main Goals', isDefault: true, createdAt: 5 },
];

const customLists: TaskList[] = [
  ...defaultLists,
  { id: 'custom-1', name: 'Hackathon Prep', isDefault: false, createdAt: 6 },
];

const defaultProps = {
  lists: defaultLists,
  activeListId: 'today',
  onSelectList: vi.fn(),
  onCreateList: vi.fn(),
  onDeleteList: vi.fn(),
  taskCounts: { today: 3, overdue: 1 },
  isOpen: true,
  onToggle: vi.fn(),
};

describe('Sidebar', () => {
  it('renders all default list names', () => {
    render(<Sidebar {...defaultProps} />);
    expect(screen.getByText('Today')).toBeInTheDocument();
    expect(screen.getByText('Tomorrow')).toBeInTheDocument();
    expect(screen.getByText('Upcoming')).toBeInTheDocument();
    expect(screen.getByText('Overdue')).toBeInTheDocument();
    expect(screen.getByText('Main Goals')).toBeInTheDocument();
  });

  it('renders the TaskManager title', () => {
    render(<Sidebar {...defaultProps} />);
    expect(screen.getByText('Task')).toBeInTheDocument();
    expect(screen.getByText('Manager')).toBeInTheDocument();
  });

  it('shows task counts when > 0', () => {
    render(<Sidebar {...defaultProps} />);
    expect(screen.getByText('3')).toBeInTheDocument();
    expect(screen.getByText('1')).toBeInTheDocument();
  });

  it('calls onSelectList when clicking a list', () => {
    const onSelectList = vi.fn();
    render(<Sidebar {...defaultProps} onSelectList={onSelectList} />);
    fireEvent.click(screen.getByText('Tomorrow'));
    expect(onSelectList).toHaveBeenCalledWith('tomorrow');
  });

  it('does not show delete button for default lists', () => {
    render(<Sidebar {...defaultProps} />);
    // Default lists should not have the × delete button
    const allButtons = screen.getAllByText('Today');
    // The Today text is inside a button, and there should be no nested delete button for defaults
    expect(allButtons.length).toBe(1);
  });

  it('shows delete button (×) for custom lists', () => {
    render(<Sidebar {...defaultProps} lists={customLists} />);
    // The × character should exist for custom lists
    const customButton = screen.getByText('Hackathon Prep').closest('button')!;
    const deleteBtn = customButton.querySelector('button');
    expect(deleteBtn).not.toBeNull();
  });

  it('calls onDeleteList when delete is clicked on custom list', () => {
    const onDeleteList = vi.fn();
    render(<Sidebar {...defaultProps} lists={customLists} onDeleteList={onDeleteList} />);
    const customButton = screen.getByText('Hackathon Prep').closest('button')!;
    const deleteBtn = customButton.querySelector('button')!;
    fireEvent.click(deleteBtn);
    expect(onDeleteList).toHaveBeenCalledWith('custom-1');
  });

  it('shows New List button', () => {
    render(<Sidebar {...defaultProps} />);
    expect(screen.getByText('New List')).toBeInTheDocument();
  });

  it('shows inline input when New List is clicked', () => {
    render(<Sidebar {...defaultProps} />);
    fireEvent.click(screen.getByText('New List'));
    expect(screen.getByPlaceholderText('List name...')).toBeInTheDocument();
  });

  it('calls onCreateList when Enter is pressed with a name', () => {
    const onCreateList = vi.fn();
    render(<Sidebar {...defaultProps} onCreateList={onCreateList} />);
    fireEvent.click(screen.getByText('New List'));
    const input = screen.getByPlaceholderText('List name...');
    fireEvent.change(input, { target: { value: 'My List' } });
    fireEvent.keyDown(input, { key: 'Enter' });
    expect(onCreateList).toHaveBeenCalledWith('My List');
  });

  it('does not call onCreateList for empty/whitespace names', () => {
    const onCreateList = vi.fn();
    render(<Sidebar {...defaultProps} onCreateList={onCreateList} />);
    fireEvent.click(screen.getByText('New List'));
    const input = screen.getByPlaceholderText('List name...');
    fireEvent.keyDown(input, { key: 'Enter' });
    expect(onCreateList).not.toHaveBeenCalled();
  });
});
