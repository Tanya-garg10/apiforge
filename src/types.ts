export type HttpMethod = "GET" | "POST" | "PUT" | "DELETE" | "PATCH" | "HEAD";

export interface KeyValuePair {
  key: string;
  value: string;
  enabled: boolean;
  description?: string;
}

export type AuthType = "none" | "bearer" | "basic" | "apikey";

export interface AuthConfig {
  type: AuthType;
  bearerToken: string;
  basicUsername: string;
  basicPassword?: string;
  apiKeyKey: string;
  apiKeyValue: string;
  apiKeyAddTo: "header" | "query";
}

export type BodyType = "none" | "json" | "text" | "form-data";

export interface RequestConfig {
  id: string;
  name: string;
  url: string;
  method: HttpMethod;
  headers: KeyValuePair[];
  params: KeyValuePair[];
  bodyType: BodyType;
  bodyContent: string;
  auth: AuthConfig;
}

export interface WebResponse {
  status: number;
  statusText: string;
  headers: Record<string, string>;
  body: any;
  contentType: string;
  durationMs: number;
  sizeBytes: number;
  error?: string;
}

export interface HistoryItem {
  id: string;
  config: Omit<RequestConfig, "id">;
  timestamp: string;
  response: Omit<WebResponse, "error"> & { error?: string };
}

export interface Collection {
  id: string;
  name: string;
  description?: string;
  requests: RequestConfig[];
}

export interface EnvironmentVariable {
  key: string;
  value: string;
  enabled: boolean;
}

export interface Environment {
  id: string;
  name: string;
  variables: EnvironmentVariable[];
}

export interface ApiPreset {
  name: string;
  description: string;
  method: HttpMethod;
  url: string;
  headers?: { key: string; value: string }[];
  bodyType?: BodyType;
  bodyContent?: string;
}
