import { API_BASE_URL } from "./api-config.js";

let accessToken = null;
let refreshPromise = null;

function extractAccessToken(responseBody) {
  const data = responseBody?.data;
  if (typeof data === "string") return data;
  return data?.accessToken ?? data?.access_token ?? null;
}

async function parseResponse(response) {
  if (response.status === 204) return null;
  const text = await response.text();
  if (!text) return null;
  const contentType = response.headers.get("content-type") ?? "";
  return contentType.includes("application/json") ? JSON.parse(text) : text;
}

function hasCsrfCookie() {
  if (typeof document === "undefined") return false;
  return document.cookie.split(";").some((cookie) => /^(csrf|csrf-token|xsrf-token)=/i.test(cookie.trim()));
}

export function getAccessToken() {
  return accessToken;
}

export function clearAccessToken() {
  accessToken = null;
}

export async function ensureCsrfToken() {
  if (hasCsrfCookie()) return;
  const response = await fetch(`${API_BASE_URL}/auth/csrf`, { credentials: "include" });
  if (!response.ok) throw new Error(`CSRF 토큰 발급에 실패했습니다. (${response.status})`);
}

export async function authenticate(credentials) {
  const response = await fetch(`${API_BASE_URL}/auth/login`, {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(credentials),
  });
  const body = await parseResponse(response);
  if (!response.ok) throw new Error(body?.message ?? "로그인에 실패했습니다.");
  accessToken = extractAccessToken(body);
  if (!accessToken) throw new Error("로그인 응답에 Access Token이 없습니다.");
  return body;
}

export async function refreshAccessToken() {
  if (refreshPromise) return refreshPromise;
  refreshPromise = (async () => {
    await ensureCsrfToken();
    const response = await fetch(`${API_BASE_URL}/auth/refresh`, {
      method: "POST",
      credentials: "include",
    });
    const body = await parseResponse(response);
    if (!response.ok) {
      clearAccessToken();
      throw new Error(body?.message ?? "Access Token 갱신에 실패했습니다.");
    }
    accessToken = extractAccessToken(body);
    if (!accessToken) throw new Error("갱신 응답에 Access Token이 없습니다.");
    return accessToken;
  })().finally(() => { refreshPromise = null; });
  return refreshPromise;
}

export async function terminateSession() {
  try {
    await ensureCsrfToken();
    const response = await fetch(`${API_BASE_URL}/auth/logout`, {
      method: "POST",
      credentials: "include",
      headers: accessToken ? { Authorization: `Bearer ${accessToken}` } : {},
    });
    const body = await parseResponse(response);
    if (!response.ok) throw new Error(body?.message ?? "로그아웃에 실패했습니다.");
    return body;
  } finally {
    clearAccessToken();
  }
}
