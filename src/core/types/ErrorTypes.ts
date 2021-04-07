/* eslint-disable max-len */
/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
// eslint-disable-next-line max-classes-per-file
export class ErrorBase {
  type?: string;

  code?: string;

  httpCode?: number;

  message: string;

  additionalProperties?: any;

  constructor(msg: string, type?: string, code?: string, httpCode?: number, additionalProperties?: any) {
    this.message = msg || 'Internal server error';
    this.httpCode = httpCode || 500;
    this.type = type || 'internal_server_error';
    this.code = String(code || this.type).toUpperCase();
    this.additionalProperties = additionalProperties || {};
  }
}
export class UnauthorizedError extends ErrorBase {
  constructor(msg?: string, code?: string, additionalProperties?: any) {
    super(
      msg || 'Insufficient permission',
      code || 'unauthorized',
      'unauthorized',
      401,
      additionalProperties,
    );
  }
}

export class UnAuthenticated extends ErrorBase {
  constructor(msg?: string, code?: string, additionalProperties?: any) {
    super(
      msg || 'Unauthenticated request',
      code || 'unauthenticated',
      'unauthenticated',
      401,
      additionalProperties,
    );
  }
}

export class NotFoundError extends ErrorBase {
  constructor(msg?: string, code?: string, httpCode?: number, type?: string, additionalProperties?: any) {
    super(
      msg || 'Item not found',
      type || 'not_found',
      code || 'not_found',
      httpCode || 404,
      additionalProperties || {},
    );
  }
}

export class ValidationFailedError extends ErrorBase {
  constructor(msg?: string, code?: string, httpCode?: number, type?: string, additionalProperties?: any) {
    super(
      msg || 'Please verify the input data',
      type || 'validation_failed',
      code || 'validation_failed',
      httpCode || 400,
      additionalProperties || {},
    );
  }
}

export class InternalServerError extends ErrorBase {
  constructor(msg?: string, code?: string, httpCode?: number, type?: string, additionalProperties?: any) {
    super(
      msg || 'Internal server error',
      type || 'internal_server_error',
      code || 'internal_server_error',
      httpCode || 500,
      additionalProperties || {},
    );
  }
}

export class ForbiddenError extends ErrorBase {
  constructor(msg?: string, additionalProperties?: any) {
    super(
      msg || 'You don’t have permission to access this resource',
      'forbidden',
      'forbidden',
      403,
      additionalProperties,
    );
  }
}
