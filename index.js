import searchGithub from './lib/github.js';
import mime from 'mime-types';
import {
  analyze,
  getAverageScore
} from './lib/sentiment.js';
import {
  getPath,
  getFilePath
} from './lib/files.js';

//Simply checks if all the API keys are set. If not logs error.
import './lib/checkEnv.js'; 


/**
 * Creates HTTP response for static file request when success happens
 * 
 * @param {string} text  Response text (could be html, js, img, etc.)
 * @param {string} [filePath]   The file's path to identify the mime's content-type 
 */
function createFileResponseSuccess(text, filePath) {
  const resp = new Response(text, {
    status: 200
  });
  resp.headers.set('content-type', mime.lookup(filePath) || 'text/plain');
  return resp;
}

/**
 * Creates HTTP response for when something bad happens
 * 
 * @param e Exception
 */
function ceateResponseFail(e) {
  return new Response({
    error: 'Something went wrong: ' + e.messge
  }, {
    status: 500
  });
}

/**
 * Creates a success JSON response
 * 
 * @param json    The response body
 * @param status  HTTP status to send
 */
function createJSONResponse(json, status) {
  const resp = new Response(JSON.stringify(json), {
    status: status
  });
  resp.headers.set('content-type', 'application/json');
  return resp;
}

/**
 * Process and respond to HTTP GET request
 * 
 * @param {obj} req HTTP GET request
 * @return HTTP response
 */
async function handleGet(req) {
  try {
    const filePath = getFilePath(getPath(req.url));
    const file = await fetch(filePath);
    const text = await file.text();
    return createFileResponseSuccess(text, filePath);
  } catch (e) {
    return ceateResponseFail(e);
  }
}

/**
 * Process and respond to HTTP POST request
 * 
 * @param {obj} req HTTP POST request
 * @return HTTP response
 */

async function handlePost(req) {
  const body = await req.json();
  try {
    const result = await searchGithub(body.accountAndRepo, body.user);
    const issuesWithSentiments = await analyze(result);
    const score = getAverageScore(issuesWithSentiments);

    return createJSONResponse({
      issuesWithSentiments,
      score
    }, 200);
  } catch (e) {
    console.dir(e)
    console.log('!!Exception!!', e)
    return createJSONResponse(e.message, 500);
  }
}

/**
 * Fly.io's main respondWith API.
 * Note: This is wherea all the rquests hit and the response are returned back to the client
 */
fly.http.respondWith(async function (req) {
  return req.method === 'GET' ? handleGet(req) : handlePost(req);
})