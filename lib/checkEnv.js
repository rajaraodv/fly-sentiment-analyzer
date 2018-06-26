/**
 * This file simply checks if all the env stuff are set
 */
import messages from './messages.js';


app.config.AZURE_SENTIMENT_API_TOKEN || console.error(messages.missingAzureAPIKey);
app.config.GITHUB_API_TOKEN || console.error(messages.missingGithubAPIKey);
app.config.AZURE_API_URL || console.error (messages.missingAzureAPIURL);