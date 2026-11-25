import mongoose from 'mongoose';

/**
 * Subschema for individual transaction records
 */
const transactionSchema = new mongoose.Schema(
  {
    id: {
      type: String,
      trim: true
    },
    description: {
      type: String,
      required: [true, 'Transaction description is required'],
      trim: true,
      maxlength: [200, 'Description cannot exceed 200 characters']
    },
    category: {
      type: String,
      required: [true, 'Transaction category is required'],
      trim: true
    },
    type: {
      type: String,
      required: [true, 'Transaction type is required'],
      enum: {
        values: ['income', 'expense'],
        message: 'Transaction type must be either income or expense'
      },
      default: 'expense'
    },
    amount: {
      type: Number,
      required: [true, 'Transaction amount is required'],
      min: [0, 'Transaction amount cannot be negative']
    },
    date: {
      type: String,
      required: [true, 'Transaction date is required'],
      trim: true
    },
    paymentMethod: {
      type: String,
      trim: true,
      default: 'Other'
    },
    notes: {
      type: String,
      trim: true,
      default: '',
      maxlength: [500, 'Notes cannot exceed 500 characters']
    }
  },
  {
    _id: true,
    timestamps: true
  }
);

/**
 * Subschema for category budget envelope limit
 */
const budgetItemSchema = new mongoose.Schema(
  {
    limit: {
      type: Number,
      required: [true, 'Budget limit is required'],
      min: [0, 'Budget limit cannot be negative'],
      default: 0
    }
  },
  { _id: false }
);

/**
 * Subschema for individual contributions towards a savings goal
 */
const savingsContributionSchema = new mongoose.Schema(
  {
    id: {
      type: String,
      trim: true
    },
    amount: {
      type: Number,
      required: [true, 'Contribution amount is required'],
      min: [0, 'Contribution amount cannot be negative']
    },
    date: {
      type: String,
      required: [true, 'Contribution date is required'],
      trim: true
    },
    note: {
      type: String,
      trim: true,
      default: '',
      maxlength: [300, 'Contribution note cannot exceed 300 characters']
    }
  },
  {
    _id: true,
    timestamps: true
  }
);

/**
 * Subschema for savings goals
 */
const savingsGoalSchema = new mongoose.Schema(
  {
    id: {
      type: String,
      trim: true
    },
    name: {
      type: String,
      required: [true, 'Savings goal name is required'],
      trim: true,
      maxlength: [100, 'Goal name cannot exceed 100 characters']
    },
    category: {
      type: String,
      required: [true, 'Savings goal category is required'],
      trim: true
    },
    targetAmount: {
      type: Number,
      required: [true, 'Target amount is required'],
      min: [0, 'Target amount cannot be negative']
    },
    savedAmount: {
      type: Number,
      default: 0,
      min: [0, 'Saved amount cannot be negative']
    },
    targetDate: {
      type: String,
      required: [true, 'Target completion date is required'],
      trim: true
    },
    description: {
      type: String,
      trim: true,
      default: '',
      maxlength: [500, 'Description cannot exceed 500 characters']
    },
    contributions: {
      type: [savingsContributionSchema],
      default: []
    }
  },
  {
    _id: true,
    timestamps: true
  }
);

/**
 * Subschema for loan repayment installment records
 */
const loanRepaymentSchema = new mongoose.Schema(
  {
    id: {
      type: String,
      trim: true
    },
    amount: {
      type: Number,
      required: [true, 'Repayment amount is required'],
      min: [0, 'Repayment amount cannot be negative']
    },
    date: {
      type: String,
      required: [true, 'Repayment date is required'],
      trim: true
    },
    method: {
      type: String,
      trim: true,
      default: 'Bank Transfer'
    },
    notes: {
      type: String,
      trim: true,
      default: '',
      maxlength: [300, 'Repayment notes cannot exceed 300 characters']
    },
    paymentType: {
      type: String,
      enum: {
        values: ['EMI', 'PARTIAL', 'PREPAYMENT'],
        message: 'Invalid payment type. Must be EMI, PARTIAL, or PREPAYMENT'
      },
      default: 'EMI'
    },
    paidDueDate: {
      type: String,
      trim: true,
      default: ''
    }
  },
  {
    _id: true,
    timestamps: true
  }
);

/**
 * Subschema for debt and loan tracking
 */
const loanSchema = new mongoose.Schema(
  {
    id: {
      type: String,
      trim: true
    },
    name: {
      type: String,
      required: [true, 'Loan name is required'],
      trim: true,
      maxlength: [100, 'Loan name cannot exceed 100 characters']
    },
    loanType: {
      type: String,
      required: [true, 'Loan type is required'],
      trim: true
    },
    lender: {
      type: String,
      required: [true, 'Lender name is required'],
      trim: true,
      maxlength: [100, 'Lender name cannot exceed 100 characters']
    },
    principal: {
      type: Number,
      required: [true, 'Loan principal amount is required'],
      min: [0, 'Principal cannot be negative']
    },
    balance: {
      type: Number,
      required: [true, 'Remaining loan balance is required'],
      min: [0, 'Balance cannot be negative']
    },
    interestRate: {
      type: Number,
      required: [true, 'Interest rate is required'],
      min: [0, 'Interest rate cannot be negative']
    },
    startDate: {
      type: String,
      required: [true, 'Start date is required'],
      trim: true
    },
    tenureMonths: {
      type: Number,
      required: [true, 'Tenure in months is required'],
      min: [1, 'Tenure must be at least 1 month']
    },
    emi: {
      type: Number,
      required: [true, 'Monthly EMI amount is required'],
      min: [0, 'EMI cannot be negative']
    },
    nextDueDate: {
      type: String,
      trim: true
    },
    paidDueDates: {
      type: [String],
      default: []
    },
    lastPaidDueDate: {
      type: String,
      trim: true,
      default: ''
    },
    repayments: {
      type: [loanRepaymentSchema],
      default: []
    }
  },
  {
    _id: true,
    timestamps: true
  }
);

/**
 * Subschema for recurring subscriptions
 */
const subscriptionSchema = new mongoose.Schema(
  {
    id: {
      type: String,
      trim: true
    },
    name: {
      type: String,
      required: [true, 'Subscription name is required'],
      trim: true,
      maxlength: [100, 'Subscription name cannot exceed 100 characters']
    },
    provider: {
      type: String,
      required: [true, 'Provider is required'],
      trim: true,
      maxlength: [100, 'Provider name cannot exceed 100 characters']
    },
    category: {
      type: String,
      required: [true, 'Subscription category is required'],
      trim: true
    },
    amount: {
      type: Number,
      required: [true, 'Subscription amount is required'],
      min: [0, 'Subscription amount cannot be negative']
    },
    frequency: {
      type: String,
      required: [true, 'Billing frequency is required'],
      enum: {
        values: ['Weekly', 'Monthly', 'Quarterly', 'Half-yearly', 'Yearly'],
        message: 'Invalid subscription billing frequency'
      },
      default: 'Monthly'
    },
    paymentMethod: {
      type: String,
      trim: true,
      default: 'Credit Card'
    },
    startDate: {
      type: String,
      trim: true
    },
    nextRenewalDate: {
      type: String,
      trim: true
    },
    expiryDate: {
      type: String,
      trim: true,
      default: ''
    },
    autoRenewal: {
      type: Boolean,
      default: true
    },
    status: {
      type: String,
      enum: {
        values: ['Active', 'Paused', 'Cancelled'],
        message: 'Status must be Active, Paused, or Cancelled'
      },
      default: 'Active'
    }
  },
  {
    _id: true,
    timestamps: true
  }
);

/**
 * Root Finance Schema - Exactly one document per user
 */
const financeSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User ID reference is required'],
      unique: true,
      index: true
    },
    transactions: {
      type: [transactionSchema],
      default: []
    },
    budgets: {
      type: Map,
      of: budgetItemSchema,
      default: () => new Map()
    },
    savingsGoals: {
      type: [savingsGoalSchema],
      default: []
    },
    loans: {
      type: [loanSchema],
      default: []
    },
    subscriptions: {
      type: [subscriptionSchema],
      default: []
    }
  },
  {
    timestamps: true,
    toJSON: { flattenMaps: true },
    toObject: { flattenMaps: true }
  }
);

/**
 * Helper to return sanitized JSON structure
 */
financeSchema.methods.toSafeJSON = function () {
  return {
    id: this._id.toString(),
    userId: this.userId ? this.userId.toString() : null,
    transactions: this.transactions,
    budgets: this.budgets,
    savingsGoals: this.savingsGoals,
    loans: this.loans,
    subscriptions: this.subscriptions,
    createdAt: this.createdAt,
    updatedAt: this.updatedAt
  };
};

const Finance = mongoose.model('Finance', financeSchema);

export default Finance;
