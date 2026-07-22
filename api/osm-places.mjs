import { handleOsmPlacesRequest } from '../server/osmPlacesProxy.mjs';

export default async function handler(request, response) {
  const chunks = [];
  for await (const chunk of request) chunks.push(chunk);
  const event = {
    httpMethod: request.method,
    body: Buffer.concat(chunks).toString('utf8'),
    isBase64Encoded: false,
  };
  const result = await handleOsmPlacesRequest(event);
  response.statusCode = result.statusCode;
  for (const [key, value] of Object.entries(result.headers || {})) response.setHeader(key, value);
  response.end(result.body);
}
