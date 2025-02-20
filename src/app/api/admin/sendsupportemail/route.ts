import { NextResponse } from 'next/server';
import { z } from 'zod';
import sgMail from '@sendgrid/mail';

const SENDGRID_API_KEY = process.env.SENDGRID_API_KEY as string;
const SUPPORT_EMAIL = 'support@perpetua.digital';

// Initialize SendGrid API key
sgMail.setApiKey(SENDGRID_API_KEY);

const SupportEmailSchema = z.object({
    subject: z.string().min(1, 'Subject is required'),
    message: z.string().min(1, 'Message is required'),
    userEmail: z.string().email('Valid email is required'),
    userId: z.string().min(1, 'User ID is required'),
});

export async function POST(request: Request) {
    if (request.method !== 'POST') {
        return NextResponse.json({ error: 'Method Not Allowed' }, { status: 405 });
    }

    try {
        const body = await request.json();
        const validatedData = SupportEmailSchema.parse(body);

        const emailData = {
            to: SUPPORT_EMAIL,
            from: SUPPORT_EMAIL, // Send from support email to maintain deliverability
            subject: `Support Request: ${validatedData.subject}`,
            text: `
Support Request Details:
----------------------
From User: ${validatedData.userEmail} (ID: ${validatedData.userId})
Subject: ${validatedData.subject}

Message:
${validatedData.message}
            `,
            html: `
<h2>Support Request Details</h2>
<hr>
<p><strong>From User:</strong> ${validatedData.userEmail} (ID: ${validatedData.userId})</p>
<p><strong>Subject:</strong> ${validatedData.subject}</p>

<h3>Message:</h3>
<p>${validatedData.message.replace(/\n/g, '<br>')}</p>
            `
        };
        await sgMail.send(emailData);

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Support email error:', error);
        return NextResponse.json(
            { error: 'Failed to send support email' },
            { status: 500 }
        );
    }
}
