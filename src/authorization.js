// @flow strict

const { toBase64 } = require("./base64");

/*::
export type Authorization =
  | { type: 'basic', username: string, password: string }
  | { type: 'none' }
  | { type: 'bearer', token: string }
*/

const createBasicAuthorization = (username/*: string*/, password/*: string*/)/*: Authorization*/ => ({
  type: 'basic',
  username,
  password,
});

const createBearerAuthorization = (token/*: string*/)/*: Authorization*/ => ({
  type: 'bearer',
  token,
});

const createNoneAuthorization = ()/*: Authorization*/ => ({
  type: 'none'
});

const createAuthorizationHeader = (authorization/*: Authorization*/)/*: ?[string, string]*/ => {
  switch (authorization.type) {
    default:
    case 'none':
      return null;
    case 'basic':
      return ['Authorization', `Basic ${toBase64(authorization.username + ':' + authorization.password)}`];
    case 'bearer':
      return ['Authorization', `Bearer ${authorization.token}`];
  }
};

module.exports = {
  createBasicAuthorization,
  createNoneAuthorization,
  createBearerAuthorization,
  createAuthorizationHeader
};