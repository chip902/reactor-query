import { NextRequest, NextResponse } from 'next/server';
import { headers } from 'next/headers';
import { z } from 'zod';

const ADMIN_API_KEY = process.env.ADMIN_API_KEY;

if (!ADMIN_API_KEY) {
  throw new Error('ADMIN_API_KEY is not set in environment variables');
}
interface TeamsMessageData {
  teamsWebhookUrl: string;
  message: string;
  launchCompanyName: string;
  launchCompanyId: string;
  launchPropertyId: string;
  launchPropertyName: string;
  launchEnvironmentName: string;
  launchEnvironmentId: string;
}

const TeamsMessageSchema = z.object({
  teamsWebhookUrl: z.string().url().min(1, 'Teams webhook URL is required'),
  message: z.string().min(1, 'Message is required'),
  launchCompanyName: z.string().min(1, 'Launch company name is required'),
  launchCompanyId: z.string().min(1, 'Launch company ID is required'),
  launchPropertyId: z.string().min(1, 'Launch property ID is required'),
  launchPropertyName: z.string().min(1, 'Launch property name is required'),
  launchEnvironmentName: z.string().min(1, 'Launch environment name is required'),
  launchEnvironmentId: z.string().min(1, 'Launch environment ID is required'),
});
export async function POST(req: NextRequest) {
  // Validate API key
  const headersList = headers();
  const apiKey = (await headersList).get('x-api-key');

  if (!apiKey || apiKey !== ADMIN_API_KEY) {
    return NextResponse.json(
      { error: 'Unauthorized' },
      { status: 401 }
    );
  }
  if (req.method !== 'POST') {
    return NextResponse.json({ error: 'Method Not Allowed' }, { status: 405 });
  }

  try {
    const body: TeamsMessageData = await req.json();
    const validatedData = TeamsMessageSchema.parse(body);
    const teamsWebhookUrl = validatedData.teamsWebhookUrl;

    const message = {
      "type": "message",
      "attachments": [
        {
          "contentType": "application/vnd.microsoft.card.adaptive",
          "content": {
            "type": "AdaptiveCard",
            "body": [
              {
                "type": "TextBlock",
                "size": "Medium",
                "weight": "Bolder",
                "text": "Perpetua Digital Launch Assistant",
              },
              {
                "type": "TextBlock",
                "text": `The ${validatedData.launchEnvironmentName} environment in the ${validatedData.launchPropertyName} property has been built!`,
                "wrap": true
              },
              {
                "type": "TextBlock",
                "text": `${validatedData.message}`,
                "wrap": true
              }
            ],
            "$schema": "http://adaptivecards.io/schemas/adaptive-card.json",
            "version": "1.0"
          }
        }
      ]
    }

    // Make the POST request to Teams webhook
    const response = await fetch(teamsWebhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(message),
    });

    if (!response.ok) {
      throw new Error(`Teams webhook request failed: ${response.statusText}`);
    }

    return NextResponse.json(
      { message: 'Teams message sent successfully' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error sending Teams notification:', error);
    return NextResponse.json(
      { error: 'Failed to send teams notification' },
      { status: 500 }
    );
  }
}
