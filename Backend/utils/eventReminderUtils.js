/**
 * Utility functions for Event Reminders, Scheduling, and Recurrence Calculations
 * Default Timezone: Asia/Kolkata (+05:30)
 */

const DEFAULT_TIMEZONE = "Asia/Kolkata";
const MS_PER_DAY = 24 * 60 * 60 * 1000;

/**
 * Format a Date object to "DD Month YYYY" in Asia/Kolkata
 */
export const formatEventDateIST = (date) => {
  if (!date) return "";
  const d = new Date(date);
  return d.toLocaleDateString("en-IN", {
    timeZone: DEFAULT_TIMEZONE,
    day: "numeric",
    month: "long",
    year: "numeric",
  });
};

/**
 * Get date parts in Asia/Kolkata timezone
 */
export const getISTDateParts = (date) => {
  const d = new Date(date);
  const formatter = new Intl.DateTimeFormat("en-US", {
    timeZone: DEFAULT_TIMEZONE,
    year: "numeric",
    month: "numeric",
    day: "numeric",
    hour: "numeric",
    minute: "numeric",
    second: "numeric",
    hour12: false,
  });

  const parts = formatter.formatToParts(d);
  const map = {};
  for (const part of parts) {
    map[part.type] = part.value;
  }
  return {
    year: parseInt(map.year, 10),
    month: parseInt(map.month, 10), // 1-12
    day: parseInt(map.day, 10),
    hour: parseInt(map.hour || "9", 10),
    minute: parseInt(map.minute || "0", 10),
  };
};

/**
 * Create a UTC Date corresponding to a specific year, month, day, hour, minute in Asia/Kolkata (UTC+05:30)
 */
export const createISTDate = (year, month, day, hour = 9, minute = 0) => {
  // Asia/Kolkata is UTC+5:30, offset is -330 minutes
  const utcMillis = Date.UTC(year, month - 1, day, hour, minute) - (5.5 * 60 * 60 * 1000);
  return new Date(utcMillis);
};

/**
 * Calculate the reminder date given an event date and daysBefore offset.
 * Formula: reminderDate = eventDate - reminderDaysBefore
 *
 * For all-day events, schedule at 09:00 AM IST on the reminder date.
 * For timed events, schedule at 09:00 AM IST or exact time of event on the reminder date.
 */
export const calculateReminderDate = (eventDate, daysBefore, isAllDay = true, timezone = DEFAULT_TIMEZONE) => {
  if (!eventDate) return null;
  const d = new Date(eventDate);
  const offsetDays = Number(daysBefore) || 0;

  // Extract IST calendar components of the event date
  const ist = getISTDateParts(d);

  // Target calendar day:
  // Using pure date arithmetic in IST
  const targetDateInIST = new Date(Date.UTC(ist.year, ist.month - 1, ist.day) - (offsetDays * MS_PER_DAY));
  const targetYear = targetDateInIST.getUTCFullYear();
  const targetMonth = targetDateInIST.getUTCMonth() + 1;
  const targetDay = targetDateInIST.getUTCDate();

  // For all-day events, set reminder to fire at 09:00 AM IST on that day
  const reminderHour = isAllDay ? 9 : (ist.hour || 9);
  const reminderMinute = isAllDay ? 0 : (ist.minute || 0);

  return createISTDate(targetYear, targetMonth, targetDay, reminderHour, reminderMinute);
};

/**
 * Build reminder subdocuments with calculated dates and idempotency keys
 */
export const buildRemindersList = (eventDate, reminderConfigs = [], eventId = null, isAllDay = true) => {
  const now = new Date();
  const baseId = eventId ? eventId.toString() : `temp_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;

  return (reminderConfigs || []).map((cfg, idx) => {
    const daysBefore = Math.max(0, parseInt(cfg.daysBefore, 10) || 0);
    const channel = ["in_app", "email", "whatsapp"].includes(cfg.channel) ? cfg.channel : "in_app";
    const enabled = cfg.enabled !== false;
    const scheduledAt = calculateReminderDate(eventDate, daysBefore, isAllDay);

    const idempotencyKey = `rem_${baseId}_d${daysBefore}_${channel}_idx${idx}`;

    // If reminder is scheduled in the past, mark cancelled so past events don't trigger backlogged reminders
    const isPast = scheduledAt < now;
    const status = isPast ? "cancelled" : (cfg.status || "pending");

    return {
      daysBefore,
      channel,
      enabled,
      scheduledAt,
      status,
      attemptCount: 0,
      lastError: isPast ? "Event reminder was scheduled in the past" : "",
      idempotencyKey,
    };
  });
};

/**
 * Rebuild or update reminders when event dates or reminder configs change
 */
export const reconcileReminders = (existingReminders = [], newEventDate, newConfigs = [], eventId, isAllDay = true) => {
  const now = new Date();
  const result = [];

  // Map of existing reminders by key or by daysBefore+channel
  const sentMap = new Map();
  for (const rem of existingReminders) {
    if (rem.status === "sent") {
      sentMap.set(`${rem.daysBefore}_${rem.channel}`, rem);
    }
  }

  for (let i = 0; i < (newConfigs || []).length; i++) {
    const cfg = newConfigs[i];
    const daysBefore = Math.max(0, parseInt(cfg.daysBefore, 10) || 0);
    const channel = cfg.channel || "in_app";
    const key = `${daysBefore}_${channel}`;

    if (sentMap.has(key)) {
      // Keep previously sent reminder history
      result.push(sentMap.get(key));
    } else {
      const scheduledAt = calculateReminderDate(newEventDate, daysBefore, isAllDay);
      const isPast = scheduledAt < now;

      result.push({
        daysBefore,
        channel,
        enabled: cfg.enabled !== false,
        scheduledAt,
        status: isPast ? "cancelled" : "pending",
        attemptCount: 0,
        lastError: isPast ? "Event reminder was scheduled in the past" : "",
        idempotencyKey: `rem_${eventId}_d${daysBefore}_${channel}_${Date.now()}_${i}`,
      });
    }
  }

  return result;
};

/**
 * Check if a year is a leap year
 */
export const isLeapYear = (year) => {
  return (year % 4 === 0 && year % 100 !== 0) || (year % 400 === 0);
};

/**
 * Calculate the next occurrence date for recurring events
 * Handles yearly (with leap years), monthly, and weekly recurrence
 */
export const calculateNextOccurrence = (startDate, recurrenceRule, referenceDate = new Date()) => {
  if (!startDate || !recurrenceRule || recurrenceRule.frequency === "none") {
    return new Date(startDate);
  }

  const start = new Date(startDate);
  const ref = new Date(referenceDate);
  const { frequency, interval = 1, endDate, count } = recurrenceRule;

  if (start >= ref) {
    return start;
  }

  const istStart = getISTDateParts(start);
  let next = new Date(start);

  if (frequency === "yearly") {
    let year = getISTDateParts(ref).year;
    // Leap year Feb 29 check
    const isFeb29 = istStart.month === 2 && istStart.day === 29;

    let candidateDay = istStart.day;
    if (isFeb29 && !isLeapYear(year)) {
      candidateDay = 28; // fallback to Feb 28 in non-leap year
    }

    next = createISTDate(year, istStart.month, candidateDay, istStart.hour, istStart.minute);

    if (next < ref) {
      year += interval;
      candidateDay = isFeb29 && !isLeapYear(year) ? 28 : istStart.day;
      next = createISTDate(year, istStart.month, candidateDay, istStart.hour, istStart.minute);
    }
  } else if (frequency === "monthly") {
    let curr = new Date(start);
    while (curr < ref) {
      const istCurr = getISTDateParts(curr);
      let targetMonth = istCurr.month + interval;
      let targetYear = istCurr.year;
      while (targetMonth > 12) {
        targetMonth -= 12;
        targetYear += 1;
      }

      // Clamp day to max days in target month
      const maxDaysInMonth = new Date(Date.UTC(targetYear, targetMonth, 0)).getUTCDate();
      const clampedDay = Math.min(istStart.day, maxDaysInMonth);

      curr = createISTDate(targetYear, targetMonth, clampedDay, istStart.hour, istStart.minute);
    }
    next = curr;
  } else if (frequency === "weekly") {
    let curr = new Date(start);
    const step = (interval || 1) * 7 * MS_PER_DAY;
    const diff = ref.getTime() - curr.getTime();
    const periods = Math.ceil(diff / step);
    next = new Date(curr.getTime() + (periods * step));
  }

  if (endDate && next > new Date(endDate)) {
    return null; // Past recurrence end date
  }

  return next;
};
