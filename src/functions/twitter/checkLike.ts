import { APIGatewayProxyEventV2, APIGatewayProxyResultV2 } from 'aws-lambda';
import axios from 'axios';

export const handler = async (
  event: APIGatewayProxyEventV2
): Promise<APIGatewayProxyResultV2> => {
  try {
    const { userId, tweetId } = event.queryStringParameters || {};

    if (!userId || !tweetId) {
      return {
        statusCode: 400,
        body: JSON.stringify({
          message: 'Missing required parameters: userId and tweetId',
        }),
      };
    }

    const url = `https://api.twitter.com/2/users/${userId}/liked_tweets`;
    
    const response = await axios.get(url, {
      headers: {
        'Authorization': `Bearer ${process.env.TWITTER_BEARER_TOKEN}`,
      },
      params: {
        'tweet.fields': 'id',
        'max_results': 100,
      },
    });

    const likedTweets = response.data.data || [];
    const hasLiked = likedTweets.some(tweet => tweet.id === tweetId);

    return {
      statusCode: 200,
      body: JSON.stringify({
        userId,
        tweetId,
        hasLiked,
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