// @flow strict
const { createServer, request } = require('http');
const { createRESTClient, createBasicAuthorization } = require('@lukekaalim/rest-client');
const { createNodeClient } = require('@lukekaalim/http-client');
const { Readable } = require("stream")
const { createListener, methods, json: { ok, notFound }, stream: { noContent }, getResourceRequest } = require('@lukekaalim/server');

const main = async () => {
  const server = createServer(createListener([
    methods.post('/echo', async (a) => ok(
      await getResourceRequest(a).validateJSON(a => a),
      { location: '/here' }
    )),
    methods.delete('/echo', async a => noContent(Readable.from([]))),
    methods.delete('/gone', async a => notFound('??? Where did it go?'))
  ]));

  await new Promise(r => server.listen(0, 'localhost', () => r()));
  const { port, address } = server.address()

  try {
    const httpClient = createNodeClient(request);
    const restClient = createRESTClient({
      client: httpClient,
      baseURL: new URL(`http://${address}:${port}`),
      authorization: createBasicAuthorization('luke', 'kaalim')
    });
  
    console.log(await restClient.post({ path: '/echo', body: { hello: 'friend' } }));
    console.log(await restClient.delete({ path: '/echo' }));
    console.log(await restClient.get({ path: '/gone' }));
  } catch(error) {
    console.error(error);
  } finally {
    server.close();
  }
};

main();