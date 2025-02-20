// app/provider.tsx
'use client';
import { useRouter } from 'next/navigation';
import { defaultTheme, Provider } from '@adobe/react-spectrum';
import { ToastContainer } from '@react-spectrum/toast'


declare module '@adobe/react-spectrum' {
    interface RouterConfig {
        routerOptions: NonNullable<
            Parameters<ReturnType<typeof useRouter>['push']>[1]
        >;
    }
}

export function ClientProviders({ children }: { children: React.ReactNode }) {
    const router = useRouter();

    return (
        <Provider theme={defaultTheme} router={{ navigate: router.push }} locale='en-US'>
            <ToastContainer />
            {children}
        </Provider>
    );
}