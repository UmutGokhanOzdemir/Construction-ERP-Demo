import { TENANT_STORAGE_KEY, TOKEN_STORAGE_KEY } from "@/lib/constants";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

function getTenantId(): string | null {
  if (typeof window === "undefined") return null;
  try {
    return localStorage.getItem(TENANT_STORAGE_KEY);
  } catch {
    return null;
  }
}

function getAuthToken(): string | null {
  if (typeof window === "undefined") return null;
  try {
    return localStorage.getItem(TOKEN_STORAGE_KEY);
  } catch {
    return null;
  }
}

function buildUrl(endpoint: string, queryParams?: Record<string, string | number | undefined>): string {
  const base = `${API_BASE_URL}${endpoint.startsWith("/") ? "" : "/"}${endpoint}`;
  if (!queryParams || Object.keys(queryParams).length === 0) return base;
  const search = new URLSearchParams(
    Object.entries(queryParams)
      .filter(([, v]) => v !== null && v !== undefined && v !== "")
      .map(([k, v]) => [k, String(v)])
  );
  const qs = search.toString();
  return qs ? `${base}?${qs}` : base;
}

function getHeaders(): HeadersInit {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };

  const tenantId = getTenantId();
  if (tenantId) headers["X-Tenant-Id"] = tenantId;

  const token = getAuthToken();
  if (token) headers["Authorization"] = `Bearer ${token}`;

  return headers;
}

export class ApiError extends Error {
  constructor(
    message: string,
    public readonly status: number,
    public readonly body?: unknown
  ) {
    super(message);
    this.name = "ApiError";
    Object.setPrototypeOf(this, ApiError.prototype);
  }
}

async function handleResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    if (response.status === 401) {
      if (typeof window !== "undefined") {
        const isAlreadyOnLogin = window.location.pathname === "/login";
        if (!isAlreadyOnLogin) {
          localStorage.removeItem(TOKEN_STORAGE_KEY);
          localStorage.removeItem("authUser");
          document.cookie = "token=; path=/; max-age=0";
          window.location.href = "/login";
        }
      }
      throw new ApiError("Unauthorized", 401);
    }

    let body: unknown;
    try {
      const contentType = response.headers.get("content-type");
      body = contentType?.includes("application/json") ? await response.json() : await response.text();
    } catch {
      body = undefined;
    }

    const message =
      typeof body === "object" && body !== null && "message" in body && typeof (body as { message: unknown }).message === "string"
        ? (body as { message: string }).message
        : response.statusText || `Request failed: ${response.status}`;

    throw new ApiError(message, response.status, body);
  }

  const contentType = response.headers.get("content-type");
  if (contentType?.includes("application/json")) {
    return response.json() as Promise<T>;
  }
  return response.text() as unknown as T;
}

export const api = {
  async get<T>(endpoint: string, queryParams?: Record<string, string | number | undefined>): Promise<T> {
    const response = await fetch(buildUrl(endpoint, queryParams), { method: "GET", headers: getHeaders() });
    return handleResponse<T>(response);
  },

  async post<T>(endpoint: string, body?: unknown): Promise<T> {
    const response = await fetch(buildUrl(endpoint), {
      method: "POST",
      headers: getHeaders(),
      body: body !== undefined ? JSON.stringify(body) : undefined,
    });
    return handleResponse<T>(response);
  },

  async put<T>(endpoint: string, body?: unknown): Promise<T> {
    const response = await fetch(buildUrl(endpoint), {
      method: "PUT",
      headers: getHeaders(),
      body: body !== undefined ? JSON.stringify(body) : undefined,
    });
    return handleResponse<T>(response);
  },

  async delete<T = void>(endpoint: string): Promise<T> {
    const response = await fetch(buildUrl(endpoint), { method: "DELETE", headers: getHeaders() });
    return handleResponse<T>(response);
  },

  async downloadFile(endpoint: string, defaultFilename: string): Promise<void> {
    const response = await fetch(buildUrl(endpoint), { method: "GET", headers: getHeaders() });

    if (!response.ok) {
      throw new ApiError(`Download failed: ${response.status}`, response.status);
    }

    const disposition = response.headers.get("content-disposition") ?? "";
    let filename = defaultFilename;
    const match = /filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/.exec(disposition);
    if (match?.[1]) {
      filename = match[1].replace(/['"]/g, "");
    }

    const blob = await response.blob();
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  },
};
