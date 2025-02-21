import { Metadata } from 'next'

export const metadata: Metadata = {
    title: 'Features',
    description: 'Perpetua Digital Assistant Features',
    openGraph: {
        title: 'Features for Perpetua Digital Launch Assistant',
        description: 'Features for Perpetua Digital Launch Assistant',
    }
}

export default function RelationshipsLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return <>{children}</>
}