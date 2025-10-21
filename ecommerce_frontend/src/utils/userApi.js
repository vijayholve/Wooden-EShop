// Frontend API helper to fetch current user details using an access token
import { API_BASE_URL } from "./config.js";

/**
 * Fetch the authenticated user's profile using a Bearer access token.
 * Throws on non-2xx responses with an Error that contains status and details.
 * @param {string} accessToken - JWT access token
 * @returns {Promise<object>} - Parsed user JSON
 */
export async function fetchCurrentUser(accessToken) {
  if (!accessToken) {
    throw new Error("Missing access token");
  }

  const res = await fetch(`${API_BASE_URL}/users/me/`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
  });

  const text = await res.text();
  const data = text ? JSON.parse(text) : null;

  if (!res.ok) {
    const detail = data?.detail || res.statusText || "Failed to fetch user";
    const err = new Error(detail);
    err.status = res.status;
    err.data = data;
    throw err;
  }

  return data;
}

/**
 * Update the authenticated user's profile using a Bearer access token.
 * Accepts a payload like:
 * {
 *   first_name: 'John',
 *   last_name: 'Doe',
 *   email: 'john@example.com',
 *   customer_profile: {
 *     phone_number: '1234567890',
 *     street_address: '123 Main St'
 *   }
 * }
 * @param {string} accessToken
 * @param {object} payload
 * @param {'PATCH'|'PUT'} method
 * @returns {Promise<object>} Updated user JSON
 */
export async function updateCurrentUser(
  accessToken,
  payload,
  method = "PATCH"
) {
  if (!accessToken) throw new Error("Missing access token");

  const res = await fetch(`${API_BASE_URL}/users/me/`, {
    method,
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  const text = await res.text();
  const data = text ? JSON.parse(text) : null;

  if (!res.ok) {
    const detail = data?.detail || res.statusText || "Failed to update user";
    const err = new Error(detail);
    err.status = res.status;
    err.data = data;
    throw err;
  }

  return data;
}
