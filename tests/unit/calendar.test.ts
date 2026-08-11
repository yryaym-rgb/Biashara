import { describe, it, expect } from 'vitest';
import { partitionMiningEvents } from '@/lib/calendar/queries';
import type { MiningEventRow } from '@/lib/calendar/queries';

function makeEvent(overrides: Partial<MiningEventRow>): MiningEventRow {
  return {
    id: '00000000-0000-0000-0000-000000000001',
    title: 'Test event',
    description: 'Test description for the event.',
    event_date: '2026-01-01',
    category: 'conference',
    source_url: null,
    created_by: '00000000-0000-0000-0000-000000000099',
    created_at: '2026-01-01T00:00:00.000Z',
    updated_at: '2026-01-01T00:00:00.000Z',
    ...overrides,
  };
}

describe('partitionMiningEvents', () => {
  it('sorts upcoming ascending and past descending by event date', () => {
    const today = new Date().toISOString().slice(0, 10);
    const tomorrow = new Date(Date.now() + 86_400_000).toISOString().slice(0, 10);
    const yesterday = new Date(Date.now() - 86_400_000).toISOString().slice(0, 10);

    const result = partitionMiningEvents([
      makeEvent({ id: '1', event_date: tomorrow }),
      makeEvent({ id: '2', event_date: today }),
      makeEvent({ id: '3', event_date: yesterday }),
      makeEvent({ id: '4', event_date: '2025-01-01' }),
    ]);

    expect(result.upcoming.map((event) => event.id)).toEqual(['2', '1']);
    expect(result.past.map((event) => event.id)).toEqual(['3', '4']);
  });
});
