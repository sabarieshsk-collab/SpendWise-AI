import mongoose from 'mongoose';

/**
 * Loan Reminder Log Schema
 * 
 * Provides atomic reservation and idempotency tracking for Loan EMI email reminders.
 * Guarantees that at most one reminder per stage (and at most one overdue reminder per calendar day)
 * is dispatched per loan.
 */
const loanReminderLogSchema = new mongoose.Schema(
  {
    reminderKey: {
      type: String,
      required: true,
      unique: true,
      index: true,
      trim: true
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true
    },
    loanId: {
      type: String,
      required: true,
      trim: true,
      index: true
    },
    dueDate: {
      type: String,
      required: true,
      trim: true
    },
    reminderStage: {
      type: String,
      required: true,
      enum: ['UPCOMING_7D', 'UPCOMING_3D', 'UPCOMING_1D', 'DUE_TODAY', 'OVERDUE']
    },
    status: {
      type: String,
      required: true,
      enum: ['reserved', 'sent', 'failed'],
      default: 'reserved',
      index: true
    },
    attempts: {
      type: Number,
      default: 1
    },
    lastAttemptAt: {
      type: Date,
      default: Date.now
    },
    sentAt: {
      type: Date,
      default: null
    },
    error: {
      type: String,
      default: null
    },
    payload: {
      type: mongoose.Schema.Types.Mixed,
      default: null
    }
  },
  {
    timestamps: true
  }
);

const LoanReminderLog = mongoose.model('LoanReminderLog', loanReminderLogSchema);

export default LoanReminderLog;
