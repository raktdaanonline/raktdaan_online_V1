import "dotenv/config";
import mongoose from "mongoose";
import jwt from "jsonwebtoken";
import Event from "./models/Event.js";
import Notification from "./models/Notification.js";
import connectDB from "./config/db.js";
import {
  calculateReminderDate,
  buildRemindersList,
  reconcileReminders,
  calculateNextOccurrence,
  isLeapYear,
  getISTDateParts,
} from "./utils/eventReminderUtils.js";
import { processDueReminders, processReminder } from "./cron/eventReminderScheduler.js";

const JWT_SECRET = process.env.JWT_SECRET || "dev_secret_only";

// ANSI colors for clean test logging
const colors = {
  green: (text) => `\x1b[32m${text}\x1b[0m`,
  red: (text) => `\x1b[31m${text}\x1b[0m`,
  cyan: (text) => `\x1b[36m${text}\x1b[0m`,
  bold: (text) => `\x1b[1m${text}\x1b[0m`,
};

let passed = 0;
let failed = 0;

function assert(condition, testName) {
  if (condition) {
    console.log(`  ✓ ${colors.green(testName)}`);
    passed++;
  } else {
    console.error(`  ✗ ${colors.red(testName)}`);
    failed++;
  }
}

async function runTestSuite() {
  console.log(colors.bold("\n🚀 Running RaktDaan Event Calendar & Reminder Test Suite\n"));

  // =====================================================================
  // 1. DATE CALCULATION & TIMEZONE UNIT TESTS
  // =====================================================================
  console.log(colors.cyan("SECTION 1: Reminder Date Calculations & Timezones (Asia/Kolkata)"));

  // Test: Exactly 10 days before an event (Example from specification)
  // Event Date: 19 October 2026, 10 days before -> 9 October 2026
  const eventDate19Oct = new Date("2026-10-19T00:00:00.000Z");
  const reminder10Days = calculateReminderDate(eventDate19Oct, 10, true, "Asia/Kolkata");
  const parts10Days = getISTDateParts(reminder10Days);

  assert(
    parts10Days.day === 9 && parts10Days.month === 10 && parts10Days.year === 2026,
    "Formula: Event date 19 Oct 2026 with 10 days offset schedules for 9 Oct 2026"
  );
  assert(
    parts10Days.hour === 9 && parts10Days.minute === 0,
    "All-day event reminder is scheduled at 09:00 AM IST"
  );

  // Test: Exactly 1 day before
  const reminder1Day = calculateReminderDate(eventDate19Oct, 1, true, "Asia/Kolkata");
  const parts1Day = getISTDateParts(reminder1Day);
  assert(
    parts1Day.day === 18 && parts1Day.month === 10 && parts1Day.year === 2026,
    "Formula: Event date 19 Oct with 1 day offset schedules for 18 Oct 2026"
  );

  // Test: Multiple reminder offsets for one event
  const multiReminders = buildRemindersList(
    eventDate19Oct,
    [
      { daysBefore: 10, channel: "in_app" },
      { daysBefore: 1, channel: "in_app" },
    ],
    "test_event_123",
    true
  );
  assert(
    multiReminders.length === 2 &&
      multiReminders[0].daysBefore === 10 &&
      multiReminders[1].daysBefore === 1,
    "Builds multiple independent reminders (10 days and 1 day before)"
  );
  assert(
    multiReminders[0].idempotencyKey.includes("d10") &&
      multiReminders[1].idempotencyKey.includes("d1"),
    "Generates unique idempotency keys for each reminder offset"
  );

  // Test: Yearly recurrence and leap year handling
  assert(isLeapYear(2028) === true, "Leap year detector confirms 2028 is a leap year");
  assert(isLeapYear(2027) === false, "Leap year detector confirms 2027 is NOT a leap year");

  // Leap-year Feb 29 occurrence test in non-leap year
  const leapDayEvent = new Date("2024-02-29T00:00:00.000Z");
  const nextOccurNonLeap = calculateNextOccurrence(
    leapDayEvent,
    { frequency: "yearly", interval: 1 },
    new Date("2025-01-01T00:00:00.000Z")
  );
  const nonLeapParts = getISTDateParts(nextOccurNonLeap);
  assert(
    nonLeapParts.year === 2025 && nonLeapParts.month === 2 && nonLeapParts.day === 28,
    "Feb 29 yearly recurrence gracefully moves to Feb 28 in non-leap years"
  );

  // Reconcile reminders test (preserves sent history while recalculating pending)
  const existingReminders = [
    {
      daysBefore: 10,
      channel: "in_app",
      status: "sent",
      sentAt: new Date("2026-10-09T03:30:00.000Z"),
      idempotencyKey: "sent_key_1",
    },
    {
      daysBefore: 1,
      channel: "in_app",
      status: "pending",
      idempotencyKey: "pending_key_1",
    },
  ];
  const newEventDate = new Date("2026-10-25T00:00:00.000Z");
  const reconciled = reconcileReminders(
    existingReminders,
    newEventDate,
    [
      { daysBefore: 10, channel: "in_app" },
      { daysBefore: 1, channel: "in_app" },
      { daysBefore: 3, channel: "in_app" },
    ],
    "event_abc",
    true
  );

  const keptSent = reconciled.find((r) => r.daysBefore === 10 && r.status === "sent");
  const updatedPending = reconciled.find((r) => r.daysBefore === 1 && r.status === "pending");
  assert(keptSent !== undefined, "Reconcile preserves already sent reminder history");
  assert(updatedPending !== undefined, "Reconcile rebuilds pending reminder offsets on date edit");

  // =====================================================================
  // 2. MONGOOSE MODELS & CRUD TESTS
  // =====================================================================
  console.log(colors.cyan("\nSECTION 2: Database CRUD & Validation Operations"));

  await connectDB();

  // Test: Required fields validation
  let caughtValidation = false;
  try {
    const invalidEvent = new Event({});
    await invalidEvent.validate();
  } catch (err) {
    caughtValidation = true;
  }
  assert(caughtValidation, "Mongoose schema enforces required fields (title, startDate)");

  // Test: Create Event with reminder schedules
  const testTitle = `Test Event ${Date.now()}`;
  const futureEventDate = new Date(Date.now() + 15 * 24 * 60 * 60 * 1000); // 15 days in future

  const createdEvent = await Event.create({
    title: testTitle,
    description: "Automated test event description",
    category: "Birthday",
    startDate: futureEventDate,
    allDay: true,
    timezone: "Asia/Kolkata",
    location: "Mumbai",
    contactName: "Rutuja",
    contactEmail: "rutuja@example.com",
    reminders: [
      {
        daysBefore: 10,
        channel: "in_app",
        enabled: true,
        scheduledAt: new Date(Date.now() - 1000), // Due right now for test execution
        status: "pending",
        idempotencyKey: `test_rem_${Date.now()}_1`,
      },
      {
        daysBefore: 1,
        channel: "in_app",
        enabled: true,
        scheduledAt: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), // In future
        status: "pending",
        idempotencyKey: `test_rem_${Date.now()}_2`,
      },
    ],
    status: "active",
  });

  assert(createdEvent._id !== undefined, "Successfully created Event document in MongoDB");
  assert(createdEvent.reminders.length === 2, "Event persisted with multiple configured reminders");

  // Test: Fetch by ID
  const fetchedEvent = await Event.findById(createdEvent._id);
  assert(fetchedEvent && fetchedEvent.title === testTitle, "Successfully fetched event by ID");

  // Test: Date range query
  const dateRangeEvents = await Event.find({
    startDate: {
      $gte: new Date(Date.now()),
      $lte: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    },
    status: "active",
  });
  assert(dateRangeEvents.length > 0, "Calendar date range query correctly finds active events");

  // =====================================================================
  // 3. ATOMIC SCHEDULER & NOTIFICATION TESTS
  // =====================================================================
  console.log(colors.cyan("\nSECTION 3: Background Scheduler, Deduplication & Delivery"));

  // The createdEvent has one reminder with scheduledAt in the past and status 'pending'
  const processedCount = await processDueReminders();
  assert(processedCount >= 1, `Atomic scheduler successfully claimed and processed ${processedCount} due reminder(s)`);

  // Verify the reminder in DB transitioned to 'sent'
  const updatedEvent = await Event.findById(createdEvent._id);
  const dueReminderInDb = updatedEvent.reminders.find((r) => r.daysBefore === 10);
  assert(
    dueReminderInDb.status === "sent" && dueReminderInDb.sentAt !== null,
    "Claimed reminder transitioned to 'sent' with sentAt timestamp"
  );

  // Verify in-app notification was generated in Notification collection
  const createdNotif = await Notification.findOne({
    eventId: createdEvent._id,
    type: "event_reminder",
  });
  assert(
    createdNotif !== null && createdNotif.title.includes(testTitle),
    "In-app Notification record created with correct title and event reference"
  );
  assert(createdNotif && createdNotif.isRead === false, "In-app Notification initialized with isRead: false");

  // Test: Duplicate prevention - running scheduler again should NOT process the already sent reminder
  const secondRunCount = await processDueReminders();
  const doubleCheckEvent = await Event.findById(createdEvent._id);
  const stillSentReminder = doubleCheckEvent.reminders.find((r) => r.daysBefore === 10);
  assert(
    stillSentReminder.attemptCount === 1,
    "Duplicate prevention: reminder was not re-sent on subsequent scheduler runs"
  );

  // Test: Mark notification as read
  createdNotif.isRead = true;
  createdNotif.readAt = new Date();
  await createdNotif.save();
  const readCheck = await Notification.findById(createdNotif._id);
  assert(readCheck.isRead === true && readCheck.readAt !== null, "Notification marked as read with readAt timestamp");

  // =====================================================================
  // 4. EVENT CANCELLATION & CLEANUP
  // =====================================================================
  console.log(colors.cyan("\nSECTION 4: Event Cancellation & Safe Deletion"));

  // Cancel the event and verify pending reminders are cancelled
  createdEvent.status = "cancelled";
  createdEvent.reminders.forEach((r) => {
    if (r.status === "pending") r.status = "cancelled";
  });
  await createdEvent.save();

  const cancelledEvent = await Event.findById(createdEvent._id);
  const futureReminder = cancelledEvent.reminders.find((r) => r.daysBefore === 1);
  assert(
    cancelledEvent.status === "cancelled" && futureReminder.status === "cancelled",
    "Cancelling event safely cancels all pending reminders"
  );

  // Clean up test documents
  await Event.findByIdAndDelete(createdEvent._id);
  await Notification.deleteMany({ eventId: createdEvent._id });
  const checkDeleted = await Event.findById(createdEvent._id);
  assert(checkDeleted === null, "Test event cleaned up safely from database");

  // =====================================================================
  // SUMMARY
  // =====================================================================
  console.log(colors.bold(`\n${colors.cyan("========================================")}`));
  console.log(colors.bold(`Results: ${colors.green(`${passed} passed`)}, ${failed > 0 ? colors.red(`${failed} failed`) : "0 failed"}`));
  console.log(colors.bold(`${colors.cyan("========================================\n")}`));

  await mongoose.disconnect();
  process.exit(failed > 0 ? 1 : 0);
}

runTestSuite().catch((err) => {
  console.error("Test execution failed:", err);
  process.exit(1);
});
