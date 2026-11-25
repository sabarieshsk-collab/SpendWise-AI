import swaggerJSDoc from 'swagger-jsdoc';

const swaggerDefinition = {
  openapi: '3.0.0',
  info: {
    title: 'SpendWise AI — Backend API Documentation',
    version: '1.0.0',
    description:
      'Interactive OpenAPI 3.0 documentation for the SpendWise AI Personal Finance Assistant backend. Covers authentication, financial records management, and AI financial analysis.',
    contact: {
      name: 'SpendWise AI Engineering Team',
      email: 'support@spendwise.ai'
    }
  },
  servers: [
    {
      url: 'http://localhost:5000',
      description: 'SpendWise AI Local Development Server (Backend Port 5000)'
    },
    {
      url: 'http://localhost:3000',
      description: 'Vite Frontend Proxy Server (Port 3000)'
    }
  ],
  components: {
    securitySchemes: {
      bearerAuth: {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        description: 'Provide your JWT bearer token in the Authorization header: `Bearer <token>`'
      },
      cookieAuth: {
        type: 'apiKey',
        in: 'cookie',
        name: 'token',
        description: 'HttpOnly session cookie automatically managed by the browser upon login or registration.'
      }
    },
    schemas: {
      ErrorResponse: {
        type: 'object',
        properties: {
          success: { type: 'boolean', example: false },
          message: { type: 'string', example: 'Operation failed due to validation or server error.' },
          errors: {
            type: 'array',
            items: { type: 'string' },
            example: ['Detailed validation reason']
          }
        }
      },
      UserSafe: {
        type: 'object',
        properties: {
          id: { type: 'string', example: '6745ef12a34b5c6d7890ef12' },
          fullName: { type: 'string', example: 'Alex Morgan' },
          email: { type: 'string', format: 'email', example: 'alex.morgan@spendwise.ai' },
          createdAt: { type: 'string', format: 'date-time', example: '2026-11-20T12:00:00.000Z' },
          updatedAt: { type: 'string', format: 'date-time', example: '2026-11-20T12:00:00.000Z' }
        }
      },
      Transaction: {
        type: 'object',
        required: ['description', 'category', 'type', 'amount', 'date'],
        properties: {
          id: { type: 'string', example: 'tx-101' },
          description: { type: 'string', example: 'Organic Grocery Supermarket' },
          category: { type: 'string', example: 'Food' },
          type: { type: 'string', enum: ['income', 'expense'], example: 'expense' },
          amount: { type: 'number', minimum: 0, example: 3450 },
          date: { type: 'string', example: '2026-11-20' },
          paymentMethod: { type: 'string', example: 'UPI' },
          notes: { type: 'string', example: 'Weekly household supplies' }
        }
      },
      BudgetEnvelope: {
        type: 'object',
        properties: {
          limit: { type: 'number', minimum: 0, example: 14000 }
        }
      },
      SavingsContribution: {
        type: 'object',
        required: ['amount', 'date'],
        properties: {
          id: { type: 'string', example: 'c-101' },
          amount: { type: 'number', minimum: 0, example: 15000 },
          date: { type: 'string', example: '2026-11-10' },
          note: { type: 'string', example: 'Monthly surplus contribution' }
        }
      },
      SavingsGoal: {
        type: 'object',
        required: ['name', 'category', 'targetAmount', 'targetDate'],
        properties: {
          id: { type: 'string', example: 'goal-1' },
          name: { type: 'string', example: 'Emergency Reserve Fund' },
          category: { type: 'string', example: 'Emergency Fund' },
          targetAmount: { type: 'number', minimum: 0, example: 250000 },
          savedAmount: { type: 'number', minimum: 0, example: 180000 },
          targetDate: { type: 'string', example: '2026-12-31' },
          description: { type: 'string', example: '6 months of living expenses' },
          contributions: {
            type: 'array',
            items: { $ref: '#/components/schemas/SavingsContribution' }
          }
        }
      },
      LoanRepayment: {
        type: 'object',
        required: ['amount', 'date'],
        properties: {
          id: { type: 'string', example: 'r-101' },
          amount: { type: 'number', minimum: 0, example: 8209 },
          date: { type: 'string', example: '2026-10-23' },
          method: { type: 'string', example: 'Bank Transfer' },
          notes: { type: 'string', example: 'Monthly EMI installment' }
        }
      },
      Loan: {
        type: 'object',
        required: ['name', 'loanType', 'lender', 'principal', 'balance', 'interestRate', 'startDate', 'tenureMonths', 'emi'],
        properties: {
          id: { type: 'string', example: 'loan-1' },
          name: { type: 'string', example: 'Home Purchase Loan' },
          loanType: { type: 'string', example: 'Home Loan' },
          lender: { type: 'string', example: 'HDFC Housing Finance' },
          principal: { type: 'number', minimum: 0, example: 400000 },
          balance: { type: 'number', minimum: 0, example: 345000 },
          interestRate: { type: 'number', minimum: 0, example: 8.5 },
          startDate: { type: 'string', example: '2024-01-10' },
          tenureMonths: { type: 'integer', minimum: 1, example: 60 },
          emi: { type: 'number', minimum: 0, example: 8209 },
          nextDueDate: { type: 'string', example: '2026-11-23' },
          repayments: {
            type: 'array',
            items: { $ref: '#/components/schemas/LoanRepayment' }
          }
        }
      },
      Subscription: {
        type: 'object',
        required: ['name', 'provider', 'category', 'amount'],
        properties: {
          id: { type: 'string', example: 'sub-1' },
          name: { type: 'string', example: 'Cloud Workspace Suite' },
          provider: { type: 'string', example: 'Google Cloud Platform' },
          category: { type: 'string', example: 'Cloud Storage' },
          amount: { type: 'number', minimum: 0, example: 1499 },
          frequency: {
            type: 'string',
            enum: ['Weekly', 'Monthly', 'Quarterly', 'Half-yearly', 'Yearly'],
            example: 'Monthly'
          },
          paymentMethod: { type: 'string', example: 'Credit Card' },
          startDate: { type: 'string', example: '2025-01-15' },
          nextRenewalDate: { type: 'string', example: '2026-11-25' },
          expiryDate: { type: 'string', example: '2027-11-25' },
          autoRenewal: { type: 'boolean', example: true },
          status: { type: 'string', enum: ['Active', 'Paused', 'Cancelled'], example: 'Active' }
        }
      },
      FinanceDocument: {
        type: 'object',
        properties: {
          id: { type: 'string', example: '67460123abcd45ef67890123' },
          userId: { type: 'string', example: '6745ef12a34b5c6d7890ef12' },
          transactions: {
            type: 'array',
            items: { $ref: '#/components/schemas/Transaction' }
          },
          budgets: {
            type: 'object',
            additionalProperties: { $ref: '#/components/schemas/BudgetEnvelope' },
            example: {
              Food: { limit: 14000 },
              Housing: { limit: 20000 },
              Shopping: { limit: 8000 }
            }
          },
          savingsGoals: {
            type: 'array',
            items: { $ref: '#/components/schemas/SavingsGoal' }
          },
          loans: {
            type: 'array',
            items: { $ref: '#/components/schemas/Loan' }
          },
          subscriptions: {
            type: 'array',
            items: { $ref: '#/components/schemas/Subscription' }
          },
          createdAt: { type: 'string', format: 'date-time', example: '2026-11-20T12:00:00.000Z' },
          updatedAt: { type: 'string', format: 'date-time', example: '2026-11-20T12:00:00.000Z' }
        }
      }
    }
  },
  paths: {
    '/api/auth/register': {
      post: {
        summary: 'Register a new user account',
        description: 'Creates a new user profile with cryptographically hashed password (bcrypt 10 rounds), sets an HttpOnly JWT cookie, and returns sanitized profile details.',
        tags: ['Authentication'],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['fullName', 'email', 'password', 'confirmPassword'],
                properties: {
                  fullName: { type: 'string', minLength: 2, maxLength: 100, example: 'Alex Morgan' },
                  email: { type: 'string', format: 'email', example: 'alex.morgan@spendwise.ai' },
                  password: { type: 'string', minLength: 6, example: 'SpendWise2026!Secure' },
                  confirmPassword: { type: 'string', minLength: 6, example: 'SpendWise2026!Secure' }
                }
              }
            }
          }
        },
        responses: {
          201: {
            description: 'Registration successful. User created and session cookie set.',
            headers: {
              'Set-Cookie': {
                schema: { type: 'string', example: 'token=eyJhbGciOiJIUzI1...; Path=/; HttpOnly; SameSite=Lax' }
              }
            },
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean', example: true },
                    message: { type: 'string', example: 'Registration successful! Welcome to SpendWise AI.' },
                    user: { $ref: '#/components/schemas/UserSafe' },
                    token: { type: 'string', example: 'eyJhbGciOiJIUzI1NiIsInR5...' }
                  }
                }
              }
            }
          },
          400: {
            description: 'Validation error (missing field, password mismatch, invalid email format)',
            content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } }
          },
          409: {
            description: 'Email address already registered',
            content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } }
          },
          503: {
            description: 'Database unavailable',
            content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } }
          }
        }
      }
    },
    '/api/auth/login': {
      post: {
        summary: 'Log in with existing credentials',
        description: 'Verifies user email and password against MongoDB using bcrypt. Sets an HttpOnly JWT session cookie on success.',
        tags: ['Authentication'],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['email', 'password'],
                properties: {
                  email: { type: 'string', format: 'email', example: 'alex.morgan@spendwise.ai' },
                  password: { type: 'string', example: 'SpendWise2026!Secure' }
                }
              }
            }
          }
        },
        responses: {
          200: {
            description: 'Authentication successful. HttpOnly session cookie issued.',
            headers: {
              'Set-Cookie': {
                schema: { type: 'string', example: 'token=eyJhbGciOiJIUzI1...; Path=/; HttpOnly; SameSite=Lax' }
              }
            },
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean', example: true },
                    message: { type: 'string', example: 'Login successful.' },
                    user: { $ref: '#/components/schemas/UserSafe' },
                    token: { type: 'string', example: 'eyJhbGciOiJIUzI1NiIsInR5...' }
                  }
                }
              }
            }
          },
          400: {
            description: 'Missing email or password',
            content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } }
          },
          401: {
            description: 'Invalid email or password',
            content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } }
          },
          503: {
            description: 'Database unavailable',
            content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } }
          }
        }
      }
    },
    '/api/auth/me': {
      get: {
        summary: 'Get current authenticated user profile',
        description: 'Returns the profile of the user identified by the HttpOnly session cookie or Bearer token.',
        tags: ['Authentication'],
        security: [{ cookieAuth: [] }, { bearerAuth: [] }],
        responses: {
          200: {
            description: 'Authenticated user profile retrieved successfully.',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean', example: true },
                    user: { $ref: '#/components/schemas/UserSafe' }
                  }
                }
              }
            }
          },
          401: {
            description: 'Authentication required or token expired',
            content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } }
          },
          503: {
            description: 'Database unavailable',
            content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } }
          }
        }
      }
    },
    '/api/auth/logout': {
      post: {
        summary: 'Log out user',
        description: 'Clears the HttpOnly JWT authentication cookie in the client browser.',
        tags: ['Authentication'],
        responses: {
          200: {
            description: 'Session terminated successfully.',
            headers: {
              'Set-Cookie': {
                schema: { type: 'string', example: 'token=; Path=/; Expires=Thu, 01 Jan 1970 00:00:00 GMT' }
              }
            },
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean', example: true },
                    message: { type: 'string', example: 'Logged out successfully.' }
                  }
                }
              }
            }
          }
        }
      }
    },
    '/api/finance': {
      get: {
        summary: 'Retrieve authenticated user financial records',
        description: 'Returns the single financial document associated with the logged-in user. Cross-user access is strictly blocked.',
        tags: ['Finance'],
        security: [{ cookieAuth: [] }, { bearerAuth: [] }],
        responses: {
          200: {
            description: 'Financial document retrieved successfully.',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean', example: true },
                    finance: { $ref: '#/components/schemas/FinanceDocument' }
                  }
                }
              }
            }
          },
          401: {
            description: 'Authentication required',
            content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } }
          },
          404: {
            description: 'Financial document not found for this user',
            content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } }
          },
          503: {
            description: 'Database unavailable',
            content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } }
          }
        }
      },
      put: {
        summary: 'Create or update financial records (Upsert)',
        description: 'Creates or updates the authenticated user\'s financial document using atomic MongoDB upsert. Accepts only the 5 whitelisted fields: transactions, budgets, savingsGoals, loans, subscriptions. Never accepts caller-controlled userId.',
        tags: ['Finance'],
        security: [{ cookieAuth: [] }, { bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  transactions: {
                    type: 'array',
                    items: { $ref: '#/components/schemas/Transaction' }
                  },
                  budgets: {
                    type: 'object',
                    additionalProperties: { $ref: '#/components/schemas/BudgetEnvelope' },
                    example: {
                      Food: { limit: 14000 },
                      Housing: { limit: 20000 }
                    }
                  },
                  savingsGoals: {
                    type: 'array',
                    items: { $ref: '#/components/schemas/SavingsGoal' }
                  },
                  loans: {
                    type: 'array',
                    items: { $ref: '#/components/schemas/Loan' }
                  },
                  subscriptions: {
                    type: 'array',
                    items: { $ref: '#/components/schemas/Subscription' }
                  }
                }
              }
            }
          }
        },
        responses: {
          200: {
            description: 'Financial records saved successfully.',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean', example: true },
                    message: { type: 'string', example: 'Financial records saved successfully.' },
                    finance: { $ref: '#/components/schemas/FinanceDocument' }
                  }
                }
              }
            }
          },
          400: {
            description: 'Validation error (negative amounts, invalid transaction type, or invalid structure)',
            content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } }
          },
          401: {
            description: 'Authentication required',
            content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } }
          },
          503: {
            description: 'Database unavailable',
            content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } }
          }
        }
      }
    },
    '/api/ai/analyze-spending': {
      post: {
        summary: 'Deep AI Spending Diagnostic Analysis',
        description: 'Sends deterministic ledger metrics (totals, burn rate, category allocations, detected patterns, anomalies) to the configured OpenRouter model to synthesize an executive financial diagnostic report.',
        tags: ['AI Analysis'],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['spendingSummary'],
                properties: {
                  spendingSummary: {
                    type: 'object',
                    required: ['totalSpending'],
                    properties: {
                      period: { type: 'string', example: 'November 2026' },
                      totalSpending: { type: 'number', minimum: 0, example: 48500 },
                      averageDailySpending: { type: 'number', minimum: 0, example: 2425 },
                      effectiveDays: { type: 'integer', minimum: 1, example: 20 },
                      highestCategory: {
                        type: 'object',
                        properties: {
                          name: { type: 'string', example: 'Housing' },
                          amount: { type: 'number', example: 20000 },
                          percentage: { type: 'number', example: 41 }
                        }
                      },
                      categories: {
                        type: 'array',
                        items: {
                          type: 'object',
                          properties: {
                            name: { type: 'string', example: 'Food' },
                            total: { type: 'number', example: 12500 },
                            percentage: { type: 'number', example: 26 },
                            budgetLimit: { type: 'number', example: 14000 },
                            utilization: { type: 'number', example: 89 }
                          }
                        }
                      },
                      patterns: {
                        type: 'array',
                        items: {
                          type: 'object',
                          properties: {
                            title: { type: 'string', example: 'Frequent Micro-Transactions Accumulation' },
                            category: { type: 'string', example: 'Discretionary Outflows' },
                            severity: { type: 'string', example: 'Medium' },
                            supportingData: { type: 'string', example: '4 purchases under ₹2,000 totaling ₹4,200' },
                            action: { type: 'string', example: 'Establish a weekly cash allowance' }
                          }
                        }
                      },
                      unusualFindings: {
                        type: 'array',
                        items: {
                          type: 'object',
                          properties: {
                            target: { type: 'string', example: 'Weekend Flight Booking' },
                            category: { type: 'string', example: 'Travel' },
                            actualAmount: { type: 'number', example: 8500 },
                            rule: { type: 'string', example: 'Expense is 3.5x above mean' }
                          }
                        }
                      },
                      savingsOpportunities: {
                        type: 'object',
                        properties: {
                          totalPotential: { type: 'number', example: 4500 }
                        }
                      }
                    }
                  }
                }
              }
            }
          }
        },
        responses: {
          200: {
            description: 'AI spending analysis successfully compiled.',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean', example: true },
                    analysis: {
                      type: 'string',
                      example: '# SpendWise AI — Financial Diagnostic Report\n\n## 1. Executive Spending Diagnosis\n...'
                    },
                    model: { type: 'string', example: 'nvidia/nemotron-3-ultra-550b-a55b:free' },
                    timestamp: { type: 'string', format: 'date-time', example: '2026-11-21T04:30:00.000Z' }
                  }
                }
              }
            }
          },
          400: {
            description: 'Missing spendingSummary or negative totalSpending',
            content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } }
          },
          503: {
            description: 'OpenRouter API key not configured',
            content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } }
          }
        }
      }
    }
  }
};

const options = {
  swaggerDefinition,
  apis: [] // Explicitly defined in swaggerDefinition to avoid fragile JSDoc scanning
};

const swaggerSpec = swaggerJSDoc(options);

export default swaggerSpec;
