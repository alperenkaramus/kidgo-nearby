import { handleGooglePlacesRequest } from '../../server/googlePlacesProxy.mjs';

export async function handler(event) {
  return handleGooglePlacesRequest(event);
}
