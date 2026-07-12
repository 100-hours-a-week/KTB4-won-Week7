import { API_BASE_URL } from "./api-config.js";
import { getAccessToken, refreshAccessToken } from "./auth-session.js";

export class ApiError extends Error {
  constructor(message, status, data = null) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.data = data;
  }
}

export async function request(path, options = {}) {
  const { method = "GET", body, headers = {}, auth = false, retryOnUnauthorized = true, ...fetchOptions } = options;
  const requestHeaders = new Headers(headers);
  let accessToken = auth ? getAccessToken() : null;

  if (auth && !accessToken) accessToken = await refreshAccessToken();

  if (accessToken) requestHeaders.set("Authorization", `Bearer ${accessToken}`);
  if (body !== undefined && !(body instanceof FormData)) {
    requestHeaders.set("Content-Type", "application/json");
  }

  let response = await fetch(`${API_BASE_URL}${path}`, {
    method,
    credentials: "include",
    headers: requestHeaders,
    body: body instanceof FormData ? body : body === undefined ? undefined : JSON.stringify(body),
    ...fetchOptions,
  });

  if (auth && response.status === 401 && retryOnUnauthorized) {
    accessToken = await refreshAccessToken();
    requestHeaders.set("Authorization", `Bearer ${accessToken}`);
    response = await fetch(`${API_BASE_URL}${path}`, {
      method,
      credentials: "include",
      headers: requestHeaders,
      body: body instanceof FormData ? body : body === undefined ? undefined : JSON.stringify(body),
      ...fetchOptions,
    });
  }

  const contentType = response.headers.get("content-type") ?? "";
  const responseText = response.status === 204 ? "" : await response.text();
  let data = responseText || null;

  if (responseText && contentType.includes("application/json")) {
    try {
      data = JSON.parse(responseText);
    } catch (error) {
      throw new ApiError("서버 응답을 해석할 수 없습니다.", response.status, responseText);
    }
  }

  if (!response.ok) {
    throw new ApiError(data?.message ?? `요청에 실패했습니다. (${response.status})`, response.status, data);
  }

  return data;
}
