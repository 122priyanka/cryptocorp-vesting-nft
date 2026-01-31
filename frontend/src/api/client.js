import { config } from "@/config/env";

const API_URL = config.apiBase;

async function request(endpoint, options = {}) {
  const url = `${API_URL}${endpoint}`;

  const headers = {
    "Content-Type": "application/json",
    ...options.headers,
  };

  const response = await fetch(url, { ...options, headers });

  // Try to parse JSON, handle empty responses
  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(data.message || `Request failed with status ${response.status}`);
  }

  return data;
}

export const api = {
  login: (walletAddress) => request("/login", {
    method: "POST",
    body: JSON.stringify({ walletAddress })
  }),

  signup: (userData) => request("/signup", {
    method: "POST",
    body: JSON.stringify(userData)
  }),

  getVesting: (address) => request(`/vesting/${address}`),
};
