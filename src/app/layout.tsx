import { ReactNode } from 'react';
import './globals.css';
import { ClientProviders } from '@/contexts/providers';
import NavigationBar from '@/components/nav/NavigationBar';
import { Metadata } from 'next'
import Footer from '@/components/footer/Footer';
import GoogleAnalytics from '@/components/GoogleAnalytics'

export const metadata: Metadata = {
    title: {
        template: '%s | Launch Assistant',
        default: 'Perpetua Digital Assistant',
    },
    description: 'Perpetua Digital Assistant for Adobe Launch',
    icons: {
        icon: '/favicon.ico',
        shortcut: '/favicon.ico',
        apple: '/favicon.ico',
    },
}

const PageContainer = ({ children }: { children: ReactNode }) => {
    return (
        <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            {children}
        </main>
    );
};

export default function RootLayout({ children }: { children: ReactNode }) {
    return (
        <html lang="en" className="h-full">
            <body className="min-h-screen flex flex-col">
                <GoogleAnalytics />
                <ClientProviders>
                    <div className="flex flex-col min-h-screen">
                        <NavigationBar />
                        <PageContainer>
                            {children}
                        </PageContainer>
                        <Footer />
                    </div>
                </ClientProviders>
            </body>
        </html>
    );
}