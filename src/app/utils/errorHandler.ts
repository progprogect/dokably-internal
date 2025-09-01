import { AxiosError } from 'axios';
import { ErrorCodes, HttpStatus, HttpStatusType } from './httpStatus';
import { toast } from 'react-hot-toast';
import { BASE_API } from '@app/constants/endpoints';
import { errorToastOptions } from '@shared/common/Toast';

interface ErrorResponse {
  msg?: string;
  error?: string;
  message?: string;
}

const handleUnauthorized = (data: ErrorResponse) => {
  const tokenStorage = localStorage.getItem('tokens');
  let tokens = tokenStorage && JSON.parse(tokenStorage);
  
  fetch(`${BASE_API}/frontend/auth/refresh-token`, {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      refresh_token: tokens.refresh_token,
    }),
  }).then((refreshResult) => {
    if (refreshResult.ok) {
      refreshResult.json().then((tokens) => {
        localStorage.setItem('tokens', JSON.stringify(tokens));
        window.location.reload();
      });
    }
  });
};

const handleForbiddenOrNotFound = (status: number, data: ErrorResponse) => {
  if (data.error) {
    toast.error(data.error, errorToastOptions);
  } else if (data.msg) {
    toast.error(data.msg, errorToastOptions);
  }
};

const handleBadRequest = (status: number, data: ErrorResponse) => {
  if (data.error) {
    toast.error(data.error, errorToastOptions);
  }
};

const handlePayloadTooLarge = (data: ErrorResponse) => {
  toast.error('File size is too large. Maximum allowed size is 50 MB.', errorToastOptions);
};

const handleAxiosTimeOut = (data: ErrorResponse) => {
  toast.error(data.message ?? 'Timeout', errorToastOptions);
};

const handleUnknownError = (status: number, data: ErrorResponse) => {
  if (data?.error) {
    toast.error(data.error, errorToastOptions);
  } else if (data?.message) {
    toast.error(data.message, errorToastOptions);
  } else {
    toast.error('Server error', errorToastOptions);
  }
};

export const errorHandler = (error: unknown) => {
  if (error instanceof AxiosError) {
    const errorResponse = error.response;

    const errorHandlerError = errorResponse?.data;

    const errorStatus =
      (errorResponse?.status as HttpStatusType) ||
      HttpStatus.InternalServerError;

    if (!errorHandlerError) {
      return handleUnknownError(
        HttpStatus.InternalServerError,
        errorHandlerError,
      );
    }

    const handlers = {
      [HttpStatus.Unauthorized]: () => handleUnauthorized(errorHandlerError),
      [HttpStatus.Forbidden]: () =>
        handleForbiddenOrNotFound(HttpStatus.Forbidden, errorHandlerError),
      [HttpStatus.NotFound]: () =>
        handleForbiddenOrNotFound(HttpStatus.NotFound, errorHandlerError),
      [HttpStatus.PayloadTooLarge]: () => handlePayloadTooLarge(errorHandlerError),
      [HttpStatus.InternalServerError]: () =>
        handleUnknownError(HttpStatus.InternalServerError, errorHandlerError),
      [HttpStatus.NotAllowed]: () =>
        handleBadRequest(HttpStatus.NotAllowed, errorHandlerError),
      [HttpStatus.BadRequest]: () =>
        handleBadRequest(HttpStatus.BadRequest, errorHandlerError),
      [ErrorCodes.ECONNABORTED]: () => handleAxiosTimeOut(errorHandlerError),
    };

    const handler = handlers[errorStatus];
    if (typeof handler === 'function') {
      handler();
    } else {
      handleUnknownError(HttpStatus.InternalServerError, errorHandlerError);
    }
  } else {
    console.log('server error');
  }
};
