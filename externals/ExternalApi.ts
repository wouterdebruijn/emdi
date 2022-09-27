export class ApiError extends Error {
  status: number;
  statusText: string;
  bodyText: string;

  constructor(response: Response, body: string) {
    super(`Unexpected response from external API.`);

    this.status = response.status;
    this.statusText = response.statusText;
    this.bodyText = body;
  }
}

export class ApiAuthenticationError extends Error {
  status: number;
  statusText: string;
  bodyText: string;

  constructor(response: Response, body: string) {
    super(`Authentication error response from external API`);

    this.status = response.status;
    this.statusText = response.statusText;
    this.bodyText = body;
  }
}

export class ExternalApi {
  private baseURL: URL;

  constructor(base: URL) {
    this.baseURL = base;
  }

  protected get<T>(endpoint: string, init?: RequestInit): Promise<T> {
    return fetch(new URL(endpoint, this.baseURL), init).then(
      async (response) => {
        if (
          response.ok &&
          response.headers.get("Content-Type")?.toLowerCase().includes(
            "application/json",
          )
        ) {
          return response.json();
        }

        if (response.status === 401) {
          throw new ApiAuthenticationError(response, await response.text());
        }

        throw new ApiError(response, await response.text());
      },
    );
  }

  protected post<T extends Promise<unknown>>(
    endpoint: string,
    body: unknown,
    init?: RequestInit,
  ) {
    return fetch(new URL(endpoint, this.baseURL), {
      method: "POST",
      body: JSON.stringify(body),
      ...init,
    }).then(async (response) => {
      if (
        response.ok &&
        response.headers.get("Content-Type")?.toLowerCase().includes(
          "application/json",
        )
      ) {
        return response.json() as T;
      }

      throw new ApiError(response, await response.text());
    });
  }

  protected put<T extends Promise<unknown>>(
    endpoint: string,
    body: unknown,
    init?: RequestInit,
  ) {
    return fetch(new URL(endpoint, this.baseURL), {
      method: "PUT",
      body: JSON.stringify(body),
      ...init,
    }).then(async (response) => {
      if (
        response.ok &&
        response.headers.get("Content-Type")?.toLowerCase().includes(
          "application/json",
        )
      ) {
        return response.json() as T;
      }

      throw new ApiError(response, await response.text());
    });
  }

  protected delete<T extends Promise<unknown>>(
    endpoint: string,
    body: unknown,
    init?: RequestInit,
  ) {
    return fetch(new URL(endpoint, this.baseURL), {
      method: "DELETE",
      body: JSON.stringify(body),
      ...init,
    }).then(async (response) => {
      if (
        response.ok &&
        response.headers.get("Content-Type")?.toLowerCase().includes(
          "application/json",
        )
      ) {
        return response.json() as T;
      }

      throw new ApiError(response, await response.text());
    });
  }
}
