import { NextRequest, NextResponse } from 'next/server';
import { headers } from 'next/headers';
import { z } from 'zod';

const ADMIN_API_KEY = process.env.ADMIN_API_KEY;

if (!ADMIN_API_KEY) {
  throw new Error('ADMIN_API_KEY is not set in environment variables');
}

interface SlackMessageData {
  slackWebhookUrl: string;
  message: string;
  launchCompanyName: string;
  launchCompanyId: string;
  launchPropertyId: string;
  launchPropertyName: string;
  launchEnvironmentName: string;
  launchEnvironmentId: string;
}

const SlackMessageSchema = z.object({
  slackWebhookUrl: z.string().url().min(1, 'Slack webhook URL is required'),
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
    const body: SlackMessageData = await req.json();
    const validatedData = SlackMessageSchema.parse(body);
    const slackWebhookUrl = validatedData.slackWebhookUrl;

    // Construct Slack message payload
    const message = {
      text: validatedData.message,
      blocks: [
        {
          type: "section",
          text: {
            type: "mrkdwn",
            text: `*${validatedData.message}*`
          }
        },
        {
          type: "divider"
        },
        {
          type: "section",
          text: {
            type: "mrkdwn",
            text: `The following Launch property has been built:`
          }
        },
        {
          type: "section",
          fields: [
            {
              type: "mrkdwn",
              text: `*Company:*\n${validatedData.launchCompanyName}`
            },
            {
              type: "mrkdwn",
              text: `*Property:*\n${validatedData.launchPropertyName}`
            },
            {
              type: "mrkdwn",
              text: `*Environment:*\n${validatedData.launchEnvironmentName}`
            }
          ]
        }
      ]
    };

    // Send message to Slack
    const response = await fetch(slackWebhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(message),
    });

    if (!response.ok) {
      console.error('Failed to send Slack message:', await response.text());
      return NextResponse.json(
        { error: 'Failed to send Slack message' },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { message: 'Slack message sent successfully' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error sending Slack message:', error);
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid request data', details: error.errors },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
