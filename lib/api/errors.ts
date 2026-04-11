export class ApiContractNotConfiguredError extends Error {
  constructor(operation: string) {
    super(
      `A operacao "${operation}" depende da especificacao OpenAPI e ainda nao foi conectada ao cliente gerado.`
    );
    this.name = "ApiContractNotConfiguredError";
  }
}

export class UnauthorizedApiError extends Error {
  constructor() {
    super("Sua sessao expirou. Faca login novamente.");
    this.name = "UnauthorizedApiError";
  }
}

export class ApiRequestError extends Error {
  statusCode?: number;
  code?: string;
  details?: Record<string, unknown>;

  constructor(
    message: string,
    options?: {
      statusCode?: number;
      code?: string;
      details?: Record<string, unknown>;
    }
  ) {
    super(message);
    this.name = "ApiRequestError";
    this.statusCode = options?.statusCode;
    this.code = options?.code;
    this.details = options?.details;
  }
}
