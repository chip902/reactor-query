'use client';

import Link from 'next/link';
import { useAnalytics } from '@/app/hooks/useAnalytics';

const Footer = () => {
    const { event } = useAnalytics();

    return (
        <footer className="mt-auto w-full bg-blue-500 py-4">
            <div className="container mx-auto text-center text-white">
                <p>Help: support@perpetua.digital | {" "}
                    <Link
                        className="underline"
                        onClick={() => event({
                            category: 'Other',
                            label: 'Donate',
                            action: 'click'
                        })}
                        target="_blank"
                        href="https://buymeacoffee.com/perpetuadigital">
                        Donate
                    </Link> |{" "}
                    <Link className="underline" target='_blank' href="/privacy">Privacy Policy</Link> |{" "}
                    <Link className="underline" target='_blank' href="https://www.perpetua.digital">Blog</Link>
                </p>
            </div>
        </footer >
    );
};

export default Footer;