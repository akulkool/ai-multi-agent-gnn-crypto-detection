// ============================================================
// CryptoTradeGuard API Service
// ============================================================
// FastAPI backend
// ============================================================

const API_BASE_URL = 'http://127.0.0.1:8000';


// ============================================================
// Generic API Request
// ============================================================

async function apiRequest(endpoint) {

  const response = await fetch(
    `${API_BASE_URL}${endpoint}`,
    {
      method: 'GET',

      headers: {
        'Content-Type': 'application/json',
      },
    }
  );


  if (!response.ok) {

    let errorMessage =
      `API request failed: ${response.status}`;


    try {

      const errorData =
        await response.json();


      if (errorData.detail) {
        errorMessage =
          errorData.detail;
      }

    } catch {

      // Ignore JSON parsing errors

    }


    throw new Error(
      errorMessage
    );

  }


  return response.json();

}


// ============================================================
// API STATUS
// ============================================================

export async function getApiStatus() {

  return apiRequest(
    '/api/status'
  );

}


// ============================================================
// GET LATEST FEATURES
// ============================================================

export async function getLatestFeatures() {

  return apiRequest(
    '/api/latest'
  );

}


// ============================================================
// GET LATEST FEATURES FOR SYMBOL
// ============================================================

export async function getLatestFeaturesBySymbol(
  symbol
) {

  const normalizedSymbol =
    symbol.toUpperCase();


  return apiRequest(
    `/api/latest/${normalizedSymbol}`
  );

}


// ============================================================
// GET RISK FOR SYMBOL
// ============================================================

export async function getRisk(
  symbol
) {

  const normalizedSymbol =
    symbol.toUpperCase();


  return apiRequest(
    `/api/risk/${normalizedSymbol}`
  );

}


// ============================================================
// GET ALL CRYPTO RISK DATA
// ============================================================

export async function getRiskSummary() {

  return apiRequest(
    '/api/summary'
  );

}


// ============================================================
// GET ALL SUPPORTED SYMBOLS
// ============================================================

export const SUPPORTED_SYMBOLS = [

  'BTCUSDT',

  'ETHUSDT',

  'SOLUSDT',

];


// ============================================================
// API BASE URL EXPORT
// ============================================================

export {
  API_BASE_URL,
};