// @flow strict

/*::
export type HTTPStatus =
  | 'ok'
  | 'created'
  | 'accepted'
  | 'no-content'
*/

// 4XX
class HTTPNotFoundError extends Error {}
class HTTPBadRequestError extends Error {}
class HTTPUnauthorizedError extends Error {}
class HTTPForbiddenError extends Error {}
// 5XX
class HTTPInternalError extends Error {}

const getStatusFromCode = (statusCode/*: number*/)/*: HTTPStatus*/ => {
  switch (statusCode) {
    case 200:
      return 'ok';
    case 201:
      return 'created';
    case 202:
      return 'accepted';
    case 204:
      return 'no-content';
    case 400:
      throw new HTTPBadRequestError();
    case 401:
      throw new HTTPUnauthorizedError();
    case 403:
      throw new HTTPForbiddenError();
    case 404:
      throw new HTTPNotFoundError();
    case 500:
      throw new HTTPInternalError();
    default:
      throw new Error();
  }
};

module.exports = {
  HTTPNotFoundError,
  HTTPBadRequestError,
  HTTPUnauthorizedError,
  HTTPForbiddenError,
  HTTPInternalError,
  getStatusFromCode,
}