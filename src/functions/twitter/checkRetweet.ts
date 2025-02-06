import { APIGatewayProxyEventV2, APIGatewayProxyResultV2 } from 'aws-lambda';
import axios from 'axios';

export const handler = async (
  event: APIGatewayProxyEventV2
): Promise<APIGatewayProxyResultV2> => {
  try {
    const { tweetId } = event.queryStringParameters || {};

    if (!tweetId) {
      return {
        statusCode: 400,
        body: JSON.stringify({
          message: 'Missing required parameters: TweetId',
        }),
      };
    }

    const url = `https://api.twitter.com/2/tweets/${tweetId}/retweeted_by`;
    
    const response = await axios.get(url, {
      headers: {
        'Authorization': `Bearer ${process.env.TWITTER_BEARER_TOKEN}`,
      },
      params: {
        'max_results': 20,
      },
    });

    const tweets = response.data.data || [];
    const hasRetweeted = tweets.some(tweet => tweet.id === tweetId);

    return {
      statusCode: 200,
      body: JSON.stringify({
        tweetId,
        hasRetweeted,
      }),
    };

  } catch (error) {
    console.error('Error:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({
        message: 'Internal server error',
        error: error instanceof Error ? error.message : 'Unknown error',
      }),
    };
  }
};