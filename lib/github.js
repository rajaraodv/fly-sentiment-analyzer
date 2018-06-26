/**
 * This file is responsible to construct Github GraphQL query and handle the result
 */

/**
 * Number of items to fetch from Github
 */
const FETCH_COUNT = app.config.FETCH_COUNT || 100;

/**
 * Constructs a GraphQL query to fetch issues by user
 * 
 * @param  {string} accountAndRepo    Github account and repo string in the format "<account>/<repo>"
 * @param  {string} user              The Github user's Id
 * @param  {string} [afterCursor]     A string that represent the cursor of an issue that's used for pagination
 * @return {string} Returns a GraphQL Query
 */
const constructQuery = (accountAndRepo, user, afterCursor) => {
  return `{
    search(
      first: ${FETCH_COUNT}, 
      ${ afterCursor ? `after: "${afterCursor}",` : ''} 
      type: ISSUE, 
      query: "type:issue author:${user} repo:${accountAndRepo}") 
      {
        issueCount
        edges {
          cursor
          node {
            ... on Issue {
              url
              title
              bodyText
            }
          }
        }
    }
  }`;
};

/**
 * Calls Github's GraphQL API and returns a formatted response that can be easily consumed
 * 
 * @param  {object} query GraphQL Query to post to Github
 * @return {object} Formatted response @see formatResponse
 */
async function callGithub(query) {
  const res = await fetch('https://api.github.com/graphql', {
    method: 'POST',
    body: JSON.stringify({
      query
    }),
    headers: {
      'Authorization': `Bearer ${app.config.GITHUB_API_TOKEN}`,
      'User-Agent': 'rajaraodv'
    },
  });
  const json = await res.json();
  return await formatResponse(json);
}

/**
 * Extract useful data for each issue in the list. 
 * 
 * @param {object} issueNodes An array of raw Github issue nodes
 * @return {object} An array with just Github issues 
 */
const getIssues = (issueNodes) => {
  return issueNodes.map(n => {
    return {
      bodyText: n.node.bodyText,
      url: n.node.url,
      title: n.node.title
    }
  });
};

/**
 * Extracts the cursor from the last github issue node
 * 
 * @param {object} issueNodes An array of raw Github issue nodes
 * @return {string} A Github cursor string
 */
const getAfterCursor = (issueNodes) => issueNodes.pop()['cursor'];

/**
 * Formats the Github's response into simpler format so we can consume it easily for sentiment analysis
 * 
 * @param  {object} res Response object from Github's GraphQL server
 * @return {object} Returns an object with an array of issues and the last issue's cursor that can be use for pagination
 */
async function formatResponse(json) {
  const issueNodes = json.data.search.edges;

  return {
    issues: getIssues(issueNodes),
    afterCursor: getAfterCursor(issueNodes)
  }
}

/**
 * The main function that searches Github for issues opened by the user and returns the result
 * 
 * @param  {string} accountAndRepo Github account and repo string in the format "<account>/<repo>"
 * @param  {string} user Github user id who is the author of the issues
 * @return {object} Returns all the issues opened by the user
 */
async function searchGithub(accountAndRepo, user) {
  let issues = [];
  let afterCursor;

  while (true) {
    const query = constructQuery(accountAndRepo, user, afterCursor);
    let result = await callGithub(query);
    issues = issues.concat(result.issues);
    afterCursor = result.afterCursor;
    if (!afterCursor || result.issues.length < FETCH_COUNT) {
      return issues;
    }
  }
};

export default searchGithub;