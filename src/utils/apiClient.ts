export class ApiClientError extends Error {
  status: number;

  constructor(message: string, status: number) {
    super(message);
    this.name = "ApiClientError";
    this.status = status;
  }
}

const API_BASE_URL =
  process.env.REACT_APP_API_BASE_URL || "http://localhost:5000";

type RequestConfig = {
  method?: "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
  headers?: Record<string, string>;
  body?: unknown;
};

async function request<T>(
  path: string,
  config: RequestConfig = {},
): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    method: config.method || "GET",
    headers: {
      "Content-Type": "application/json",
      ...(config.headers || {}),
    },
    body: config.body !== undefined ? JSON.stringify(config.body) : undefined,
  });

  const contentType = response.headers.get("content-type") || "";
  const hasJson = contentType.includes("application/json");
  const payload = hasJson ? await response.json() : null;

  if (!response.ok) {
    const errorMessage =
      (payload && typeof payload.message === "string" && payload.message) ||
      `Request failed with status ${response.status}`;
    throw new ApiClientError(errorMessage, response.status);
  }

  return payload as T;
}

export const apiClient = {
  get: <T>(path: string, headers?: Record<string, string>) =>
    request<T>(path, { method: "GET", headers }),
  post: <T>(path: string, body?: unknown, headers?: Record<string, string>) =>
    request<T>(path, { method: "POST", body, headers }),
};
