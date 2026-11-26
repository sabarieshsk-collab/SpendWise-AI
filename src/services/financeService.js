
const BACKEND_URL = (
    import.meta.env.VITE_API_URL || ''
).replace(/\/$/, '');

const API_URL = `${BACKEND_URL}/api/finance`;

/**
 * Fetch the authenticated user's financial data.
 */
export const getFinance = async () => {
    const response = await fetch(API_URL, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
        },
        credentials: 'include',
    });

    const data = await response.json();

    if (!response.ok) {
        const error = new Error(data.message || 'Failed to fetch financial data.');
        error.status = response.status;
        throw error;
    }

    return data.finance;
};

/**
 * Save or update the authenticated user's financial data.
 */
export const updateFinance = async (financeData) => {
    const response = await fetch(API_URL, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(financeData),
    });

    const data = await response.json();

    if (!response.ok) {
        const error = new Error(data.message || 'Failed to save financial data.');
        error.status = response.status;
        throw error;
    }

    return data.finance;
};
