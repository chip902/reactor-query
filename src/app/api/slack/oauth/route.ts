
export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const code = searchParams.get('code');

    if (!code) {
        return new Response(`
            <script>
                window.opener.postMessage({ type: 'slack_error', error: 'Authorization failed' }, '*');
                window.close();
            </script>
        `, {
            headers: { 'Content-Type': 'text/html' },
        });
    }

    try {
        const result = await fetch('https://slack.com/api/oauth.v2.access', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: new URLSearchParams({
                client_id: process.env.SLACK_CLIENT_ID!,
                client_secret: process.env.SLACK_CLIENT_SECRET!,
                code: code,
                redirect_uri: `${process.env.NEXT_PUBLIC_APP_URL}/api/slack/oauth`,
            }),
        });

        const data = await result.json();

        if (!data.ok) {
            console.error('Slack OAuth error:', data);
            return new Response(`
                <script>
                    window.opener.postMessage({ type: 'slack_error', error: 'Slack authorization failed' }, '*');
                    window.close();
                </script>
            `, {
                headers: { 'Content-Type': 'text/html' },
            });
        }

        // Get the webhook URL from the response
        const webhookUrl = data.incoming_webhook.url;
        const channelName = data.incoming_webhook.channel;

        // Send the data back to the opener window and close this one
        return new Response(`
            <script>
                window.opener.postMessage({
                    type: 'slack_success',
                    webhookUrl: '${webhookUrl}',
                    channelName: '${channelName}'
                }, '*');
                window.close();
            </script>
        `, {
            headers: { 'Content-Type': 'text/html' },
        });

    } catch (error) {
        console.error('Error during Slack OAuth:', error);
        return new Response(`
            <script>
                window.opener.postMessage({ type: 'slack_error', error: 'Authorization failed' }, '*');
                window.close();
            </script>
        `, {
            headers: { 'Content-Type': 'text/html' },
        });
    }
}
