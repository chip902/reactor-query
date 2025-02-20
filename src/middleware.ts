import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function middleware(request: NextRequest) {
    const response = NextResponse.next()

    // Add a custom header to indicate logging should be redacted
    // This will be used by our logging utilities
    response.headers.set('x-redact-logs', 'true')

    return response
}

// Configure which paths should use the middleware
export const config = {
    matcher: '/api/reactor/:path*'
}
