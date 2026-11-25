import Finance from '../models/Finance.js';
import { isDBConnected } from '../config/db.js';
import { processFinanceAlertsAsync } from '../services/budgetAlertService.js';

const ALLOWED_FIELDS = ['transactions', 'budgets', 'savingsGoals', 'loans', 'subscriptions'];

/**
 * GET /api/finance
 * Retrieves the authenticated user's financial document.
 * Requires protect middleware.
 */
export const getFinance = async (req, res) => {
  try {
    if (!isDBConnected()) {
      return res.status(503).json({
        success: false,
        message: 'Database service is currently unavailable. Please verify MongoDB connection in backend configuration.'
      });
    }

    // Identify user exclusively from req.user.id attached by auth middleware
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required. No valid user session identified.'
      });
    }

    const finance = await Finance.findOne({ userId });

    if (!finance) {
      return res.status(404).json({
        success: false,
        message: 'Financial document not found for this user.'
      });
    }

    return res.status(200).json({
      success: true,
      finance: finance.toSafeJSON ? finance.toSafeJSON() : finance
    });
  } catch (error) {
    console.error('[SpendWise Finance] getFinance error:', error.message);
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve financial document due to a server error.'
    });
  }
};

/**
 * PUT /api/finance
 * Creates or updates the authenticated user's financial document using MongoDB upsert.
 * Whitelists the five allowed fields: transactions, budgets, savingsGoals, loans, subscriptions.
 * Never accepts userId from the request body.
 */
export const updateFinance = async (req, res) => {
  try {
    if (!isDBConnected()) {
      return res.status(503).json({
        success: false,
        message: 'Database service is currently unavailable. Please verify MongoDB connection in backend configuration.'
      });
    }

    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required. No valid user session identified.'
      });
    }

    // Validate request body structure
    if (!req.body || typeof req.body !== 'object' || Array.isArray(req.body)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid request payload. Expected a JSON object.'
      });
    }

    // Whitelist only the five financial categories; never accept or trust caller-provided userId
    const updateData = {};
    let hasAllowedField = false;

    for (const field of ALLOWED_FIELDS) {
      if (req.body[field] !== undefined) {
        updateData[field] = req.body[field];
        hasAllowedField = true;
      }
    }

    if (!hasAllowedField) {
      return res.status(400).json({
        success: false,
        message: 'Request payload must include at least one of the allowed financial fields: transactions, budgets, savingsGoals, loans, subscriptions.'
      });
    }

    // ADD THIS NEW CODE BELOW
    const validationDoc = new Finance({
      userId,
      ...updateData
    });

    await validationDoc.validate();




    // Perform atomic MongoDB upsert strictly constrained to authenticated user's ID
    const updatedFinance = await Finance.findOneAndUpdate(
      { userId },
      { $set: updateData },
      {
        returnDocument: 'after',
        upsert: true,
        runValidators: true,
        setDefaultsOnInsert: true
      }
    );

    // Asynchronously evaluate budget utilization and dispatch alerts without delaying the HTTP response
    setImmediate(async () => {
      try {
        await processFinanceAlertsAsync(updatedFinance, req.user);
      } catch (alertError) {
        console.error('[SpendWise Finance] Background budget alert processing error:', alertError.message);
      }
    });

    return res.status(200).json({
      success: true,
      message: 'Financial records saved successfully.',
      finance: updatedFinance.toSafeJSON ? updatedFinance.toSafeJSON() : updatedFinance
    });
  } catch (error) {
    console.error('[SpendWise Finance] updateFinance error:', error.message);

    // Handle Mongoose schema validation errors
    if (error.name === 'ValidationError') {
      const errorMessages = Object.values(error.errors || {}).map((err) => err.message);
      return res.status(400).json({
        success: false,
        message: 'Validation failed for financial data.',
        errors: errorMessages.length > 0 ? errorMessages : [error.message]
      });
    }

    // Handle Mongoose casting/type errors (e.g., passing invalid types)
    if (error.name === 'CastError') {
      return res.status(400).json({
        success: false,
        message: `Invalid data format for field '${error.path}'.`
      });
    }

    return res.status(500).json({
      success: false,
      message: 'Failed to save financial records due to a server error.'
    });
  }
};
