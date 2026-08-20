import { describe, it, expect } from 'vitest';
import { DEFAULT_LISTS, RINGTONES } from '@/lib/defaults';

describe('DEFAULT_LISTS', () => {
  it('contains exactly 5 default lists', () => {
    expect(DEFAULT_LISTS).toHaveLength(5);
  });

  it('has Today list', () => {
    expect(DEFAULT_LISTS.find((l) => l.id === 'today')).toBeDefined();
  });

  it('has Tomorrow list', () => {
    expect(DEFAULT_LISTS.find((l) => l.id === 'tomorrow')).toBeDefined();
  });

  it('has Upcoming list', () => {
    expect(DEFAULT_LISTS.find((l) => l.id === 'upcoming')).toBeDefined();
  });

  it('has Overdue list', () => {
    expect(DEFAULT_LISTS.find((l) => l.id === 'overdue')).toBeDefined();
  });

  it('has Main Goals list', () => {
    expect(DEFAULT_LISTS.find((l) => l.id === 'goals')).toBeDefined();
  });

  it('all lists are marked as default', () => {
    DEFAULT_LISTS.forEach((list) => {
      expect(list.isDefault).toBe(true);
    });
  });

  it('all lists have unique ids', () => {
    const ids = DEFAULT_LISTS.map((l) => l.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('all lists have non-empty names', () => {
    DEFAULT_LISTS.forEach((list) => {
      expect(list.name.length).toBeGreaterThan(0);
    });
  });

  it('all lists have numeric createdAt', () => {
    DEFAULT_LISTS.forEach((list) => {
      expect(typeof list.createdAt).toBe('number');
      expect(list.createdAt).toBeGreaterThan(0);
    });
  });
});

describe('RINGTONES', () => {
  it('contains 3 ringtones', () => {
    expect(RINGTONES).toHaveLength(3);
  });

  it('each ringtone has id, name, and file', () => {
    RINGTONES.forEach((ringtone) => {
      expect(typeof ringtone.id).toBe('string');
      expect(typeof ringtone.name).toBe('string');
      expect(typeof ringtone.file).toBe('string');
    });
  });

  it('ringtone files point to /sounds/', () => {
    RINGTONES.forEach((ringtone) => {
      expect(ringtone.file).toMatch(/^\/sounds\//);
    });
  });

  it('has unique ids', () => {
    const ids = RINGTONES.map((r) => r.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('includes alarm1, alarm2, alarm3', () => {
    expect(RINGTONES.find((r) => r.id === 'alarm1')).toBeDefined();
    expect(RINGTONES.find((r) => r.id === 'alarm2')).toBeDefined();
    expect(RINGTONES.find((r) => r.id === 'alarm3')).toBeDefined();
  });
});
