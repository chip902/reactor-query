import { NextResponse } from 'next/server';
import { z } from 'zod';
import { headers } from 'next/headers';
import sgMail from '@sendgrid/mail'
import { decrypt } from '@/lib/encryption';
import { getHtmlEmail, getPlainTextEmail } from '@/lib/emailTemplate';

const ADMIN_API_KEY = process.env.ADMIN_API_KEY
const SENDGRID_API_KEY = process.env.SENDGRID_API_KEY as string

// Initialize SendGrid API key
sgMail.setApiKey(SENDGRID_API_KEY);

interface EmailData {
    recipients: string; // encrypted string to make into an array
    message: string;
    launchCompanyName: string;
    launchCompanyId: string;
    launchPropertyId: string;
    launchPropertyName: string;
    launchEnvironmentName: string;
    launchEnvironmentId: string;
}

const EmailSchema = z.object({
    recipients: z.string().min(1, 'recipient string is required'),
    message: z.string().min(1, 'Message is required'),
    launchCompanyName: z.string().min(1, 'Launch Company Name is required'),
    launchCompanyId: z.string().min(1, 'Launch Company ID is required'),
    launchPropertyId: z.string().min(1, 'Launch Property ID is required'),
    launchPropertyName: z.string().min(1, 'Launch Property Name is required'),
    launchEnvironmentName: z.string().min(1, 'Launch Environment Name is required'),
    launchEnvironmentId: z.string().min(1, 'Launch Environment ID is required'),
})

export async function POST(request: Request) {
    const headersList = headers();
    const apiKey = (await headersList).get('x-api-key');

    if (!apiKey || apiKey !== ADMIN_API_KEY) {
        return NextResponse.json(
            { error: 'Unauthorized' },
            { status: 401 }
        );
    }
    if (request.method !== 'POST') {
        return NextResponse.json({ error: 'Method Not Allowed' }, { status: 405 });
    }

    // the meat
    try {
        // Parse the request body
        // const requestBody = await request.json();
        const body:EmailData = await request.json();
        const validatedData = EmailSchema.parse(body);
        const {
            recipients, 
            message, 
            launchCompanyName, 
            launchCompanyId, 
            launchPropertyId, 
            launchPropertyName, 
            launchEnvironmentName, 
            launchEnvironmentId } = validatedData

        // clientId: settingsData.clientId ? decrypt(settingsData.clientId) : '',
        const decryptedRecipients = decrypt(recipients);
        const recipientsArray = decryptedRecipients.split(',');

        // Define the email details
        const fromEmail = 'assistant@perpetua.digital';
        // from: 'Perpetua Digital Assistant <assistant@perpetua.digital>',

        // Create the email message
        const msg = {
            to: recipientsArray,
            from: {
                name: 'Perpetua Digital Assistant',
                email: fromEmail
            },
            subject: `Launch Property Update: ${launchPropertyName}`,
            text: getPlainTextEmail({
                message,
                launchCompanyName,
                launchCompanyId,
                launchPropertyId,
                launchPropertyName,
                launchEnvironmentName,
                launchEnvironmentId
            }),
            html: getHtmlEmail({
                message,
                launchCompanyName,
                launchCompanyId,
                launchPropertyId,
                launchPropertyName,
                launchEnvironmentName,
                launchEnvironmentId
            })
        };

        // Send the email using SendGrid
        await sgMail.send(msg);
        console.log(`Email sent to ${decryptedRecipients} message: ${message}`);

        // Return a success response
        return NextResponse.json({ message: 'Email sent successfully' }, { status: 200 });
    } catch (error) {
        // Return an error response
        console.error('Error sending email:', JSON.stringify(error));
        return NextResponse.json({ message: 'Error sending email' }, { status: 500 });
    }
}
