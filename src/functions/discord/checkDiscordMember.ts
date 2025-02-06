import { APIGatewayProxyEventV2, APIGatewayProxyResultV2 } from 'aws-lambda';
import axios from 'axios';

export const handler = async (
  event: APIGatewayProxyEventV2
): Promise<APIGatewayProxyResultV2> => {
  try {
    const { userId, guildId } = event.queryStringParameters || {};

    if (!userId || !guildId) {
      return {
        statusCode: 400,
        body: JSON.stringify({
          message: 'Missing required parameters: userId and guildId',
        }),
      };
    }

    const url = `https://discord.com/api/guilds/${guildId}/members/${userId}`;
    
    try {
      const response = await axios.get(url, {
        headers: {
          'Authorization': process.env.DISCORD_BOT_TOKEN, 
          'Content-Type': 'application/json',
        },
      });

      return {
        statusCode: 200,
        body: JSON.stringify({
          userId,
          guildId,
          isMember: true,
          joinedAt: response.data.joined_at,
        }),
      };

    } catch (discordError) {
      if (axios.isAxiosError(discordError)) {
        if (discordError.response?.status === 404) {
          return {
            statusCode: 200,
            body: JSON.stringify({
              userId,
              guildId,
              isMember: false,
            }),
          };
        }

        return {
          statusCode: discordError.response?.status || 500,
          body: JSON.stringify({
            message: 'Discord API error',
            error: discordError.response?.data || discordError.message
          }),
        };
      }
      throw discordError;
    }

  } catch (error) {
    console.error('Error:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({
        message: 'Internal server error',
        error: error instanceof Error ? error.message : 'Unknown error'
      }),
    };
  }
};