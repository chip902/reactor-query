// app/signals/layout.tsx
import { Metadata } from 'next'

export const metadata: Metadata = {
    title: 'Relationships',
    description: 'Perpetua Digital Assistant Relationships',
    openGraph: {
        title: 'Relationships for Perpetua Digital Launch Assistant',
        description: 'Reset your password for Perpetua Digital Launch Assistant',
    }
}

export default function RelationshipsLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return <>{children}</>
}