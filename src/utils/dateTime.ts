/**
 * Real-Time Date & Time Utilities for Kisan Procurement Intelligence Platform (KPIP)
 */

export interface CalendarDayOption {
  date: string;       // YYYY-MM-DD
  dayNum: string;     // '25'
  dayName: string;    // 'Tue'
  monthName: string;  // 'Aug'
  fullLabel: string;  // 'Today, 25 Aug' or 'Tomorrow, 26 Aug'
  isToday: boolean;
  isTomorrow: boolean;
  isBooked?: boolean;
}

/**
 * Returns the current date in YYYY-MM-DD format
 */
export const getTodayISODate = (offsetDays: number = 0): string => {
  const d = new Date();
  if (offsetDays !== 0) {
    d.setDate(d.getDate() + offsetDays);
  }
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

/**
 * Returns formatted localized date (e.g. "Tuesday, 25 Aug 2026" or "25 Aug 2026")
 */
export const formatRealDate = (dateInput?: string | Date, includeDayName: boolean = true): string => {
  let d: Date;
  if (!dateInput) {
    d = new Date();
  } else if (typeof dateInput === 'string') {
    // If it's YYYY-MM-DD
    if (/^\d{4}-\d{2}-\d{2}$/.test(dateInput)) {
      const [y, m, day] = dateInput.split('-').map(Number);
      d = new Date(y, m - 1, day);
    } else {
      d = new Date(dateInput);
    }
  } else {
    d = dateInput;
  }

  if (isNaN(d.getTime())) {
    d = new Date();
  }

  const options: Intl.DateTimeFormatOptions = {
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  };

  if (includeDayName) {
    options.weekday = 'short';
  }

  return d.toLocaleDateString('en-IN', options);
};

/**
 * Returns formatted 12-hour time string with AM/PM (e.g. "08:30 AM")
 */
export const formatRealTime = (dateInput?: string | Date): string => {
  const d = dateInput ? (typeof dateInput === 'string' ? new Date(dateInput) : dateInput) : new Date();
  if (isNaN(d.getTime())) return new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
  return d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
};

/**
 * Returns formatted 12-hour time string with seconds (e.g. "08:30:45 AM")
 */
export const formatRealTimeWithSeconds = (dateInput?: string | Date): string => {
  const d = dateInput ? (typeof dateInput === 'string' ? new Date(dateInput) : dateInput) : new Date();
  if (isNaN(d.getTime())) return new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  return d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
};

/**
 * Generates the upcoming 7 consecutive days starting from today in real-time
 */
export const getUpcomingCalendarDays = (numDays: number = 7): CalendarDayOption[] => {
  const days: CalendarDayOption[] = [];
  const now = new Date();

  for (let i = 0; i < numDays; i++) {
    const d = new Date(now);
    d.setDate(now.getDate() + i);

    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    const isoDate = `${year}-${month}-${day}`;

    const dayNum = String(d.getDate());
    const dayName = d.toLocaleDateString('en-IN', { weekday: 'short' });
    const monthName = d.toLocaleDateString('en-IN', { month: 'short' });

    let fullLabel = `${dayName}, ${dayNum} ${monthName}`;
    if (i === 0) fullLabel = `Today (${dayNum} ${monthName})`;
    if (i === 1) fullLabel = `Tomorrow (${dayNum} ${monthName})`;

    days.push({
      date: isoDate,
      dayNum,
      dayName,
      monthName,
      fullLabel,
      isToday: i === 0,
      isTomorrow: i === 1,
      isBooked: false
    });
  }

  return days;
};

/**
 * Calculate dynamic estimated arrival/turn time string from current time + waitMinutes
 */
export const calculateDynamicETA = (waitMinutes: number = 18): string => {
  const target = new Date(Date.now() + waitMinutes * 60 * 1000);
  return formatRealTime(target);
};

/**
 * Format relative time (e.g. "Just now", "4 mins ago", "1 hour ago")
 */
export const formatRelativeTime = (isoString?: string): string => {
  if (!isoString) return 'Just now';
  const timestamp = new Date(isoString).getTime();
  if (isNaN(timestamp)) return 'Just now';

  const diffSeconds = Math.max(0, Math.floor((Date.now() - timestamp) / 1000));
  if (diffSeconds < 45) return 'Just now';
  if (diffSeconds < 3600) {
    const mins = Math.floor(diffSeconds / 60);
    return `${mins} min${mins > 1 ? 's' : ''} ago`;
  }
  const hours = Math.floor(diffSeconds / 3600);
  if (hours < 24) {
    return `${hours} hour${hours > 1 ? 's' : ''} ago`;
  }
  const days = Math.floor(hours / 24);
  return `${days} day${days > 1 ? 's' : ''} ago`;
};
