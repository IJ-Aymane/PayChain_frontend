const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? "http://localhost:4000/api";
const TOKEN_KEY = "paychain_token";

export function getStoredToken() {
  return localStorage.getItem(TOKEN_KEY);
}

export function storeToken(token) {
  localStorage.setItem(TOKEN_KEY, token);
}

export function clearToken() {
  localStorage.removeItem(TOKEN_KEY);
}

export async function signup(payload) {
  const data = await request("/auth/signup", { method: "POST", body: payload, auth: false });
  storeToken(data.token);
  return data;
}

export async function login(payload) {
  const data = await request("/auth/login", { method: "POST", body: payload, auth: false });
  storeToken(data.token);
  return data;
}

export async function logout() {
  return request("/auth/logout", { method: "POST" });
}

export async function getMe() {
  return request("/auth/me");
}

export async function getSessions() {
  return request("/auth/sessions");
}

export async function logoutOtherSessions() {
  return request("/auth/logout-other-sessions", { method: "POST" });
}

export async function changePassword(payload) {
  return request("/auth/change-password", { method: "POST", body: payload });
}

export async function getBalance() {
  return request("/balance");
}

export async function getHistory(params = {}) {
  return request(`/history${toQuery(params)}`);
}

export async function getStatement(params = {}) {
  return request(`/statement${toQuery(params)}`);
}

export async function getReceipt(id) {
  return request(`/transactions/${encodeURIComponent(id)}/receipt`);
}

export async function getLocalChainStatus(params = {}) {
  return request(`/local-chain/status${toQuery(params)}`);
}

export async function claimFaucet() {
  return request("/faucet/claim", { method: "POST" });
}

export async function transferPayTokens(payload) {
  return request("/transfer", { method: "POST", body: payload });
}

export async function sendMoney(payload) {
  return transferPayTokens(payload);
}

export async function createEscrow(payload) {
  return request("/escrow", { method: "POST", body: payload });
}

export async function releaseEscrow(id) {
  return request(`/escrow/${id}/release`, { method: "POST" });
}

export async function disputeEscrow(id) {
  return request(`/escrow/${id}/dispute`, { method: "POST" });
}

export async function refundEscrow(id) {
  return request(`/escrow/${id}/refund`, { method: "POST" });
}

export async function getAdminSummary() {
  return request("/admin/summary");
}

export async function getAdminUsers(params = {}) {
  return request(`/admin/users${toQuery(params)}`);
}

export async function getAdminTransactions(params = {}) {
  return request(`/admin/transactions${toQuery(params)}`);
}

export async function resetUserDemoBalance(id) {
  return request(`/admin/users/${encodeURIComponent(id)}/reset-demo-balance`, { method: "POST" });
}

export async function setUserDemoBalance(id, amount) {
  return request(`/admin/users/${encodeURIComponent(id)}/set-demo-balance`, { method: "POST", body: { amount } });
}

export async function suspendAdminUser(id) {
  return request(`/admin/users/${encodeURIComponent(id)}/suspend`, { method: "POST" });
}

export async function unsuspendAdminUser(id) {
  return request(`/admin/users/${encodeURIComponent(id)}/unsuspend`, { method: "POST" });
}

async function request(path, options = {}) {
  const headers = { "content-type": "application/json" };
  const token = getStoredToken();

  if (options.auth !== false && token) {
    headers.authorization = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE_URL}${path}`, {
    method: options.method ?? "GET",
    headers,
    body: options.body ? JSON.stringify(options.body) : undefined
  });

  const data = await readJson(response);

  if (!response.ok) {
    throw new Error(data?.error ?? `Request failed with status ${response.status}`);
  }

  return data;
}

function toQuery(params) {
  const query = new URLSearchParams();

  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== null && String(value).trim() !== "") {
      query.set(key, String(value));
    }
  }

  const serialized = query.toString();
  return serialized ? `?${serialized}` : "";
}

async function readJson(response) {
  try {
    return await response.json();
  } catch {
    return null;
  }
}
