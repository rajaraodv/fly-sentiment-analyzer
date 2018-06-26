/**
 * This file is responsible for adding or analyzing sentiment to each github issues using Azure API
 * @see https://westus.dev.cognitive.microsoft.com/docs/services/TextAnalytics.V2.0/operations/56f30ceeeda5650db055a3c9
 */


/**
 * Create and return Azure Sentiment's request body.
 * 
 * @param {object} issue      The issue object with `issue.bodyText and issue.url
 * @param {string} id         Some unique id. Currently the issue URL is being used
 * 
 * @return {string} A properly formatted Azure body JSON
 */
const _getBody = (issue, id) => {
  return {
    "documents": [{
      "language": "en",
      "id": id,
      "text": issue
    }]
  }
}

/**
 * Returns proper header for Azure request
 */
const _getHeaders = () => {
  return {
    'Ocp-Apim-Subscription-Key': app.config.AZURE_SENTIMENT_API_TOKEN,
    'Content-Type': 'application/json'
  }
}
/**
 * Calls Azure to get sentiment for each issue
 * 
 * @param {object} issue   The issue object with `issue.bodyText and issue.url
 * 
 * @return {object}        Azure's response in JSON format 
 */
const callAzure = async (issue) => {
  const res = await fetch(app.config.AZURE_API_URL, {
    method: 'POST',
    body: JSON.stringify(_getBody(issue.bodyText, issue.url)),
    headers: _getHeaders(),
  });
  return await res.json();
}

/**
 * Gets the average score of all the sentiments
 * 
 * @param {object} issuesWithSentiments 
 */
const getAverageScore = (issuesWithSentiments) => {
  var sum = issuesWithSentiments.reduce(function (total, obj) {
    return total + obj.sentiment.score
  }, 0);
  return sum / issuesWithSentiments.length;
};

/**
 * A helper function to extract sentiment score from Azure response's documents[0]['score']
 * 
 * @param {object} json   A JSON object from Azure that contains sentiment score.
 * @return {number}  Returns a score or 0
 */
const _extractScore = (json) => json.documents && json.documents[0] && json.documents[0]['score'] || 0;

const analyze = async (issues) => {
  const issuesWithSentiments = [];
  for (let issue of issues) {
    const result = await callAzure(issue);
    issuesWithSentiments.push({
      issue,
      sentiment: {
        score: _extractScore(result)
      }
    })
  }

  return issuesWithSentiments;
}

export {
  analyze,
  getAverageScore
}