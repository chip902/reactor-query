// app/signals/layout.tsx
import { Metadata } from 'next'

export const metadata: Metadata = {
    title: 'Support',
    description: 'Perpetua Digital Assistant Support',
    openGraph: {
        title: 'Support',
        description: 'Support for Perpetua Digital Assistant',
    }
}

export default function SupportLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return <>{children}</>
}