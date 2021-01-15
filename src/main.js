// @flow strict
/*:: import type { JSONValue } from '@lukekaalim/cast'; */
/*:: import type { HTTPClient, HTTPRequest, HTTPResponse, HTTPMethod } from '@lukekaalim/http-client'; */

/*:: import type { CacheControlResponseDirective } from './cache'; */
/*:: import type { Authorization } from './authorization'; */
/*:: import type { HTTPStatus } from './status'; */
const { parse, stringify } = require('@lukekaalim/cast');

const { createNoneAuthorization, createAuthorizationHeader } = require('./authorization');
const { getObjectEntries } = require('./object');
const { getResponseDirectivesFromHeader } = require('./cache');
const { getStatusFromCode } = require('./status');  

/*::
export type BaseRequest = {
  path: string,
  headers?: { [string]: string },
  query?: { [string]: string },
  authorize?: boolean,
};

export type POSTRequest = BaseRequest & {
  body: JSONValue,
};
export type HEADRequest = BaseRequest;
export type GETRequest = BaseRequest;
export type PUTRequest = BaseRequest & {
  body: JSONValue,
};
export type PATCHRequest = BaseRequest & {
  body: JSONValue,
};
export type DELETERequest = BaseRequest & {
  body?: JSONValue,
};

export type BaseResponse = {
  headers: { [string]: string },
  statusCode: number,
  status: HTTPStatus,
  httpResponse: HTTPResponse,
};

export type HEADResponse = BaseResponse & {
  cache: CacheControlResponseDirective[],
};
export type GETResponse = BaseResponse & {
  body: JSONValue,
  cache: CacheControlResponseDirective[],
};

export type POSTResponse = BaseResponse & {
  body: JSONValue,
  location?: string,
}
export type PUTResponse = BaseResponse;
export type PATCHResponse = BaseResponse & {
  body: JSONValue,
}
export type DELETEResponse = BaseResponse & {
  body: JSONValue,
}

export type RESTClient = {
  post: (input: POSTRequest) => Promise<POSTResponse>,
  get: (input: GETRequest) => Promise<GETResponse>,
  head: (input: HEADRequest) => Promise<HEADResponse>,
  put: (input: PUTRequest) => Promise<PUTResponse>,
  patch: (input: PATCHRequest) => Promise<PATCHResponse>,
  delete: (input: DELETERequest) => Promise<DELETEResponse>,
};

export type RESTClientArgs = {
  client: HTTPClient,
  baseURL: URL,
  authorization?: Authorization,
};
*/

const createRESTClient = ({
  client,
  baseURL,
  authorization = createNoneAuthorization(),
}/*: RESTClientArgs*/)/*: RESTClient*/ => {
  const authorizationHeader = createAuthorizationHeader(authorization);
  
  const toHTTPRequest = (method/*: HTTPMethod*/, request/*: BaseRequest*/)/*: HTTPRequest*/ => {
    const requestHeaders = [
      ['accept', 'application/json'],
      ...getObjectEntries(request.headers || {}),
      request.authorize ? authorizationHeader : null,
    ].filter(Boolean);

    return {
      url: new URL(request.path, baseURL.href),
      method,
      headers: requestHeaders,
    };
  };
  const toHTTPBodyRequest = (method/*: HTTPMethod*/, request/*: BaseRequest & { body: JSONValue }*/)/*: HTTPRequest*/ => {
    const baseRequest = toHTTPRequest(method, request);
    const bodyString = stringify(request.body);

    return {
      ...baseRequest,
      headers: [
        ['content-type', 'application/json'],
        ['content-length', Buffer.from(bodyString).byteLength.toString()],
        ...baseRequest.headers,
      ],
      body: bodyString,
    }
  };

  const post = async (postRequest) => {
    const httpRequest = toHTTPBodyRequest('POST', postRequest)
    const httpResponse = await client.sendRequest(httpRequest);
    return toPostResponse(httpResponse);
  };

  const get = async (getRequest) => {
    const httpRequest = toHTTPRequest('GET', getRequest)
    const httpResponse = await client.sendRequest(httpRequest);
    return toGetResponse(httpResponse);
  };

  const head = async (headRequest) => {
    const httpRequest = toHTTPRequest('HEAD', headRequest)
    const httpResponse = await client.sendRequest(httpRequest);
    return toHeadResponse(httpResponse);
  };

  const put = async (putRequest) => {
    const httpRequest = toHTTPBodyRequest('PUT', putRequest)
    const httpResponse = await client.sendRequest(httpRequest);
    return toPutResponse(httpResponse);
  };
  const patch = async (patchRequest) => {
    const httpRequest = toHTTPBodyRequest('PATCH', patchRequest)
    const httpResponse = await client.sendRequest(httpRequest);
    return toPatchResponse(httpResponse);
  };
  const _delete = async (deleteRequest) => {
    const httpRequest = toHTTPRequest('DELETE', deleteRequest)
    const httpResponse = await client.sendRequest(httpRequest);
    return toDeleteResponse(httpResponse);
  };

  return {
    post,
    get,
    head,
    put,
    patch,
    delete: _delete
  };
};

const toRestResponse = (response/*: HTTPResponse*/) => {
  const headers = Object.fromEntries(response.headers);
  const statusCode = response.status;
  const status = getStatusFromCode(statusCode);

  return {
    httpResponse: response,
    statusCode,
    status,
    headers,
  }
};
const toRestBodyResponse = (response/*: HTTPResponse*/) => {
  const restResponse = toRestResponse(response);
  return {
    ...restResponse,
    body: restResponse.status === 'no-content' ? null : parse(response.body),
  }
};

const toHeadResponse = (response/*: HTTPResponse*/)/*: HEADResponse*/ => {
  const baseResponse = toRestResponse(response);

  return {
    ...baseResponse,
    cache: getResponseDirectivesFromHeader(baseResponse.headers['cache-control']),
  }
};
const toGetResponse = (response/*: HTTPResponse*/)/*: GETResponse*/ => {
  const baseResponse = toRestBodyResponse(response);

  return {
    ...baseResponse,
    cache: getResponseDirectivesFromHeader(baseResponse.headers['cache-control']),
  }
};
const toPostResponse = (response/*: HTTPResponse*/)/*: POSTResponse*/ => {
  const baseResponse = toRestBodyResponse(response);

  return {
    ...baseResponse,
    location: baseResponse.headers['location'],
  }
};
const toPutResponse = (response/*: HTTPResponse*/)/*: PUTResponse*/ => {
  return toRestResponse(response);
};
const toPatchResponse = (response/*: HTTPResponse*/)/*: PATCHResponse*/ => {
  return toRestBodyResponse(response);
};
const toDeleteResponse = (response/*: HTTPResponse*/)/*: DELETEResponse*/ => {
  return toRestBodyResponse(response);
};


module.exports = {
  ...require('./authorization'),
  createRESTClient,
};
