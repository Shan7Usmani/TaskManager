import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import AddTaskDialog from '@/components/AddTaskDialog';

const defaultProps = {
  listId: 'today',
  onClose: vi.fn(),
  onAdd: vi.fn(),
};

describe('AddTaskDialog', () => {
  it('renders the New Task heading', () => {
    render(<AddTaskDialog {...defaultProps} />);
    expect(screen.getByText('New Task')).toBeInTheDocument();
  });

  it('renders title input with correct placeholder', () => {
    render(<AddTaskDialog {...defaultProps} />);
    expect(screen.getByPlaceholderText('What needs to be done?')).toBeInTheDocument();
  });

  it('renders notes textarea', () => {
    render(<AddTaskDialog {...defaultProps} />);
    expect(screen.getByPlaceholderText('Notes (optional)...')).toBeInTheDocument();
  });

  it('renders repeat select with 3 options', () => {
    render(<AddTaskDialog {...defaultProps} />);
    expect(screen.getByText('Once')).toBeInTheDocument();
    expect(screen.getByText('Daily')).toBeInTheDocument();
    expect(screen.getByText('Weekly')).toBeInTheDocument();
  });

  it('renders alarm checkbox', () => {
    render(<AddTaskDialog {...defaultProps} />);
    expect(screen.getByText('Alarm')).toBeInTheDocument();
  });

  it('does not show ringtone selector when alarm is unchecked', () => {
    render(<AddTaskDialog {...defaultProps} />);
    expect(screen.queryByText('Classic Alarm')).toBeNull();
  });

  it('shows ringtone selector when alarm is checked', () => {
    render(<AddTaskDialog {...defaultProps} />);
    fireEvent.click(screen.getByText('Alarm'));
    expect(screen.getByText('Classic Alarm')).toBeInTheDocument();
  });

  it('calls onClose when Cancel is clicked', () => {
    const onClose = vi.fn();
    render(<AddTaskDialog {...defaultProps} onClose={onClose} />);
    fireEvent.click(screen.getByText('Cancel'));
    expect(onClose).toHaveBeenCalled();
  });

  it('does not call onAdd with empty title', () => {
    const onAdd = vi.fn();
    render(<AddTaskDialog {...defaultProps} onAdd={onAdd} />);
    fireEvent.click(screen.getByText('Add Task'));
    expect(onAdd).not.toHaveBeenCalled();
  });

  it('calls onAdd with task data when form is submitted', () => {
    const onAdd = vi.fn();
    render(<AddTaskDialog {...defaultProps} onAdd={onAdd} />);

    fireEvent.change(screen.getByPlaceholderText('What needs to be done?'), {
      target: { value: 'New Task' },
    });
    fireEvent.click(screen.getByText('Add Task'));

    expect(onAdd).toHaveBeenCalledWith(
      expect.objectContaining({
        listId: 'today',
        title: 'New Task',
        repeat: 'once',
        alarm: false,
      })
    );
  });

  it('trims whitespace from title', () => {
    const onAdd = vi.fn();
    render(<AddTaskDialog {...defaultProps} onAdd={onAdd} />);

    fireEvent.change(screen.getByPlaceholderText('What needs to be done?'), {
      target: { value: '  Trimmed  ' },
    });
    fireEvent.click(screen.getByText('Add Task'));

    expect(onAdd).toHaveBeenCalledWith(
      expect.objectContaining({ title: 'Trimmed' })
    );
  });

  it('calls onClose after successful submission', () => {
    const onClose = vi.fn();
    render(<AddTaskDialog {...defaultProps} onClose={onClose} />);

    fireEvent.change(screen.getByPlaceholderText('What needs to be done?'), {
      target: { value: 'Task' },
    });
    fireEvent.click(screen.getByText('Add Task'));

    expect(onClose).toHaveBeenCalled();
  });

  it('includes notes when provided', () => {
    const onAdd = vi.fn();
    render(<AddTaskDialog {...defaultProps} onAdd={onAdd} />);

    fireEvent.change(screen.getByPlaceholderText('What needs to be done?'), {
      target: { value: 'Task' },
    });
    fireEvent.change(screen.getByPlaceholderText('Notes (optional)...'), {
      target: { value: 'Some notes' },
    });
    fireEvent.click(screen.getByText('Add Task'));

    expect(onAdd).toHaveBeenCalledWith(
      expect.objectContaining({ notes: 'Some notes' })
    );
  });

  it('sends undefined notes when empty', () => {
    const onAdd = vi.fn();
    render(<AddTaskDialog {...defaultProps} onAdd={onAdd} />);

    fireEvent.change(screen.getByPlaceholderText('What needs to be done?'), {
      target: { value: 'Task' },
    });
    fireEvent.click(screen.getByText('Add Task'));

    expect(onAdd).toHaveBeenCalledWith(
      expect.objectContaining({ notes: undefined })
    );
  });

  it('can change repeat type', () => {
    const onAdd = vi.fn();
    render(<AddTaskDialog {...defaultProps} onAdd={onAdd} />);

    fireEvent.change(screen.getByPlaceholderText('What needs to be done?'), {
      target: { value: 'Task' },
    });
    fireEvent.change(screen.getByDisplayValue('Once'), {
      target: { value: 'daily' },
    });
    fireEvent.click(screen.getByText('Add Task'));

    expect(onAdd).toHaveBeenCalledWith(
      expect.objectContaining({ repeat: 'daily' })
    );
  });

  it('passes listId to onAdd', () => {
    const onAdd = vi.fn();
    render(<AddTaskDialog {...defaultProps} onAdd={onAdd} listId="tomorrow" />);

    fireEvent.change(screen.getByPlaceholderText('What needs to be done?'), {
      target: { value: 'Task' },
    });
    fireEvent.click(screen.getByText('Add Task'));

    expect(onAdd).toHaveBeenCalledWith(
      expect.objectContaining({ listId: 'tomorrow' })
    );
  });
});
