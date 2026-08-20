import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import AlarmModal from '@/components/AlarmModal';
import { Task } from '@/lib/types';

function makeTask(overrides: Partial<Task> = {}): Task {
  return {
    id: 'alarm-task',
    listId: 'today',
    title: 'Wake up',
    repeat: 'once',
    startTime: '07:00',
    alarm: true,
    completed: false,
    createdAt: Date.now(),
    ...overrides,
  };
}

const defaultProps = {
  task: makeTask(),
  onDismiss: vi.fn(),
  onSnooze: vi.fn(),
};

describe('AlarmModal', () => {
  it('renders "Time for:" heading', () => {
    render(<AlarmModal {...defaultProps} />);
    expect(screen.getByText('Time for:')).toBeInTheDocument();
  });

  it('renders task title', () => {
    render(<AlarmModal {...defaultProps} />);
    expect(screen.getByText('Wake up')).toBeInTheDocument();
  });

  it('renders task start time', () => {
    render(<AlarmModal {...defaultProps} />);
    expect(screen.getByText('07:00')).toBeInTheDocument();
  });

  it('renders Snooze 5m button', () => {
    render(<AlarmModal {...defaultProps} />);
    expect(screen.getByText('Snooze 5m')).toBeInTheDocument();
  });

  it('renders Dismiss button', () => {
    render(<AlarmModal {...defaultProps} />);
    expect(screen.getByText('Dismiss')).toBeInTheDocument();
  });

  it('calls onDismiss when Dismiss is clicked', () => {
    const onDismiss = vi.fn();
    render(<AlarmModal {...defaultProps} onDismiss={onDismiss} />);
    fireEvent.click(screen.getByText('Dismiss'));
    expect(onDismiss).toHaveBeenCalled();
  });

  it('calls onSnooze when Snooze is clicked', () => {
    const onSnooze = vi.fn();
    render(<AlarmModal {...defaultProps} onSnooze={onSnooze} />);
    fireEvent.click(screen.getByText('Snooze 5m'));
    expect(onSnooze).toHaveBeenCalled();
  });

  it('renders without startTime gracefully', () => {
    render(
      <AlarmModal
        {...defaultProps}
        task={makeTask({ startTime: undefined })}
      />
    );
    expect(screen.getByText('Time for:')).toBeInTheDocument();
    expect(screen.getByText('Wake up')).toBeInTheDocument();
  });

  it('has the red border styling', () => {
    const { container } = render(<AlarmModal {...defaultProps} />);
    const modal = container.querySelector('.border-red-500\\/30');
    expect(modal).not.toBeNull();
  });
});
