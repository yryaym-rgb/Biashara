export type GreetingPeriod = 'morning' | 'afternoon' | 'evening';

/**
 * Returns the time-of-day greeting period for a given date.
 * Morning: 05:00–11:59, Afternoon: 12:00–17:59, Evening: 18:00–04:59.
 */
export function getGreetingPeriod(date: Date = new Date()): GreetingPeriod {
  const hour = date.getHours();

  if (hour >= 5 && hour < 12) {
    return 'morning';
  }
  if (hour >= 12 && hour < 18) {
    return 'afternoon';
  }
  return 'evening';
}
