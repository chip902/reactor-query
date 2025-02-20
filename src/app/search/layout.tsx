import { Metadata } from "next";

export const metadata: Metadata = {
    title: 'Search', // This will become "Settings | Launch Assistant"
    description: 'Search your entire Launch property',
    openGraph: {
        title: 'Search', // You might want to update this too
        description: 'Search your entire Launch property',
    }
}

export default function SearchLayout({ children }: { children: React.ReactNode }) {
    return (
        <>
            {children}
        </>
    )
}