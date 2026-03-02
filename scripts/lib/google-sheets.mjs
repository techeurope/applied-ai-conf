/**
 * google-sheets.mjs - Shared Google Sheets API client
 *
 * Uses native fetch + URLSearchParams (no npm deps).
 * Requires GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, GOOGLE_REFRESH_TOKEN
 * in environment.
 */

const TOKEN_URL = "https://oauth2.googleapis.com/token";
const SHEETS_BASE = "https://sheets.googleapis.com/v4/spreadsheets";

/**
 * Exchange refresh token for a short-lived access token.
 */
export async function getAccessToken() {
  const clientId = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
  const refreshToken = process.env.GOOGLE_REFRESH_TOKEN;

  if (!clientId || !clientSecret || !refreshToken) {
    console.error(
      "ERROR: GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, and GOOGLE_REFRESH_TOKEN must be set"
    );
    process.exit(1);
  }

  const res = await fetch(TOKEN_URL, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      client_id: clientId,
      client_secret: clientSecret,
      refresh_token: refreshToken,
      grant_type: "refresh_token",
    }),
  });

  if (!res.ok) {
    const body = await res.text();
    console.error(`ERROR: Google OAuth token exchange failed ${res.status}: ${body}`);
    process.exit(1);
  }

  const json = await res.json();
  return json.access_token;
}

/**
 * Clear a range in a spreadsheet.
 */
export async function clearSheet(spreadsheetId, range, accessToken) {
  const url = `${SHEETS_BASE}/${spreadsheetId}/values/${encodeURIComponent(range)}:clear`;
  const res = await fetch(url, {
    method: "POST",
    headers: { Authorization: `Bearer ${accessToken}` },
  });

  if (!res.ok) {
    const body = await res.text();
    console.error(`ERROR: Google Sheets clear failed ${res.status}: ${body}`);
    process.exit(1);
  }

  return res.json();
}

/**
 * Read values from a range in a spreadsheet.
 * @param {string} spreadsheetId
 * @param {string} range - e.g. "Sheet1!A1:Z1000"
 * @param {string} accessToken
 * @returns {string[][]} 2D array of cell values (empty array if no data)
 */
export async function readSheet(spreadsheetId, range, accessToken) {
  const url = `${SHEETS_BASE}/${spreadsheetId}/values/${encodeURIComponent(range)}`;
  const res = await fetch(url, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });

  if (!res.ok) {
    const body = await res.text();
    console.error(`ERROR: Google Sheets read failed ${res.status}: ${body}`);
    process.exit(1);
  }

  const json = await res.json();
  return json.values || [];
}

/**
 * Write values to a range in a spreadsheet.
 * @param {string} spreadsheetId
 * @param {string} range - e.g. "Sheet1!A1:F100"
 * @param {string[][]} values - 2D array of cell values
 * @param {string} accessToken
 */
export async function writeToSheet(spreadsheetId, range, values, accessToken) {
  const url = `${SHEETS_BASE}/${spreadsheetId}/values/${encodeURIComponent(range)}?valueInputOption=RAW`;
  const res = await fetch(url, {
    method: "PUT",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ values }),
  });

  if (!res.ok) {
    const body = await res.text();
    console.error(`ERROR: Google Sheets write failed ${res.status}: ${body}`);
    process.exit(1);
  }

  return res.json();
}
