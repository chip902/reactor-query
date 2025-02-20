import { Metadata } from "next";

export const metadata: Metadata = {
    title: 'Settings', // This will become "Settings | Launch Assistant"
    description: 'Manage your account settings',
    openGraph: {
        title: 'Settings', // You might want to update this too
        description: 'Manage your account settings',
    }
}

export default function SettingsLayout({ children }: { children: React.ReactNode }) {
    return (
        <>
            {children}
        </>
    )
}