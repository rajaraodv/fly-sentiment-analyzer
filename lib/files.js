/**
 * This file is responsible for dealing with static files and making sure the paths are correct
 */


/**
 * The base folder where the client library is located. 
 * Note: This is relative to the main server folder. By default it's at `client/build`
 */
const STATIC_FILES_BASE_FOLDER = app.config.STATIC_FILES_BASE_FOLDER || 'client/build';


/**
 *  Extracts URL path after the domain name from an URL string
 * 
 * @param {String} url  A URL from the request
 * @return {String} just the url path after the domain name
 */
const getPath = url => {
    let [proto, empty, domain, ...path] = url.split('/');
    path = path.join('/');
    path = path.indexOf("?") > 0 ? path.split('?')[0] : path; //remove ? and query params
    return path || 'index.html'; //return path or index.html
}

/**
 * Prepends static file path to the URL path so that we can serve static files
 * 
 * @param  {string} urlPath The static file path from the URL
 * @return {String} Creates a source path
 */
const getFilePath = urlPath => `file://${STATIC_FILES_BASE_FOLDER}/${urlPath}`;

export {
    getPath,
    getFilePath
}