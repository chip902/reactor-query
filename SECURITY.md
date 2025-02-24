# Security Policy

## Reporting a Vulnerability

We take the security of The Perpetua Digital Launch Assistant seriously. If you believe you have found a security vulnerability, please report it to us responsibly.

**Please do not report security vulnerabilities through public GitHub issues.**

Instead, please report them via email [CONTACT_EMAIL]. You should receive a response within 48 hours. If for some reason you do not, please follow up via email to ensure we received your original message.

Please include the following information in your report:

- Type of issue (e.g., buffer overflow, SQL injection, cross-site scripting, etc.)
- Full paths of source file(s) related to the manifestation of the issue
- The location of the affected source code (tag/branch/commit or direct URL)
- Any special configuration required to reproduce the issue
- Step-by-step instructions to reproduce the issue
- Proof-of-concept or exploit code (if possible)
- Impact of the issue, including how an attacker might exploit it

## API Credentials Security

This application handles Adobe Launch API credentials. We have implemented several security measures:

1. Credentials are never stored on servers
2. All data transmission is over HTTPS
3. API keys are transmitted via headers and Base64 encoded
4. API key logging is explicitly redacted
5. No data persists between sessions

## Best Practices for Users

1. Use read-only API credentials when possible
2. Regularly rotate your API keys
3. Never share your API credentials
4. Monitor your API usage regularly
5. Report any suspicious activity immediately

## Updates and Security Patches

- We will acknowledge receipt of your report within 48 hours
- We will provide an estimated timeline for a fix within 1 week
- We will keep you informed about the progress of the fix
- Once the issue is resolved, we will publish a security advisory

## Supported Versions

We release patches for security vulnerabilities for the following versions:

| Version | Supported          |
| ------- | ------------------ |
| latest  | :white_check_mark: |
