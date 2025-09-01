export enum HttpStatus {
  BadRequest = 400,
  Unauthorized = 401,
  TFARequired = 402,
  Forbidden = 403,
  NotFound = 404,
  NotAllowed = 405,
  PayloadTooLarge = 413,
  InternalServerError = 500,
}
export type HttpStatusType = 400 | 401 | 403 | 404 | 405 | 413 | 500;

export enum ErrorCodes {
  ECONNABORTED = 'ECONNABORTED',
}

export type errorCodesType = ErrorCodes.ECONNABORTED;
