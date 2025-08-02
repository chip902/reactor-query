'use client'
import React, { useState } from 'react'

import Link from 'next/link';
import Image from 'next/image';

import ShowMenu from '@spectrum-icons/workflow/ShowMenu';
import Search from '@spectrum-icons/workflow/Search';
import Settings from '@spectrum-icons/workflow/Settings';
import HelpOutline from '@spectrum-icons/workflow/HelpOutline';
import Edit from '@spectrum-icons/workflow/Edit';
import { ThemeSwitcher } from '@/components/theme/ThemeSwitcher';

import { PRODUCT_NAME } from '@/lib/constants';

// Types


type MenuItemProps = {
    icon: React.ReactNode;
    text: string;
    href?: string;
    onClick?: () => void;
    className?: string;
}

// Constants
const menuLinkClass = 'text-[var(--color-text-secondary)] hover:text-[var(--color-link)] font-medium px-3 py-2 rounded-md text-sm transition-colors duration-150 ease-in-out'

const MENU_ITEMS = {
    main: [
        { icon: <Search size='S' />, text: 'Home', href: '/' },
        { icon: <Edit size='S' />, text: 'Bulk Edit', href: '/bulk-edit' },
        { icon: <Settings size='S' />, text: 'Settings', href: '/settings' },
        { icon: <HelpOutline size='S' />, text: 'Support', href: '/support' }
    ]
}

// Reusable Components
const MenuItem = ({ icon, text, href, onClick, className = 'pb-2' }: MenuItemProps) => {
    const content = (
        <p className={menuLinkClass}>
            {icon}{" "}
            {text}
        </p>
    );

    return (
        <li className={className}>
            {href ? <Link href={href}>{content}</Link> : <div onClick={onClick}>{content}</div>}
        </li>
    );
};

const MobileMenuLayout = ({ children, onClose }: { children: React.ReactNode, onClose: () => void }) => (
    <div className="fixed inset-0 z-50">
        <div className="fixed inset-0 bg-black bg-opacity-50" onClick={onClose} />
        <div className="fixed inset-y-0 right-0 w-4/5 bg-white shadow-xl">
            <div className="flex flex-col h-full">
                <div className="p-4 flex">
                    <p onClick={onClose}>✕</p>
                </div>
                <div className="px-4 py-2">
                    {children}
                </div>
            </div>
        </div>
    </div>
);



const MainMenu = () => {
    return (
        <ul className="flex space-x-4">
            {MENU_ITEMS.main.map((item, index) => (
                <MenuItem key={index} icon={item.icon} text={item.text} href={item.href} />
            ))}
        </ul>
    )
}



export default function NavigationBar() {
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    return (
        <nav>
            <div className="max-w-7xl mx-auto px-2 sm:px-6 lg:px-8">
                <div className="relative flex items-center justify-between h-16">
                    {/* Left side - Logo and Product Name */}
                    <div className="flex items-center">
                        <Image
                            src="/images/squarelogo.png"
                            alt="Logo"
                            width={32}
                            height={32}
                        />
                        <Link href="/" className="text-[var(--color-link)] font-bold ml-2 text-xl">
                            {PRODUCT_NAME}
                        </Link>
                    </div>

                    {/* Desktop menu */}
                    <div className="hidden md:flex items-center space-x-4">
                        <MainMenu />
                        <ThemeSwitcher />
                    </div>

                    {/* Mobile menu button */}
                    <div className="md:hidden">
                        <div
                            style={{ color: 'var(--color-text-secondary)' }}
                            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                        >
                            <ShowMenu UNSAFE_className='m-4 color-inherit h-6 w-6' />
                        </div>
                    </div>
                </div>
            </div>

            {/* Mobile menu */}
            {isMobileMenuOpen && (
                <MobileMenuLayout onClose={() => setIsMobileMenuOpen(false)}>
                    <ul>
                        {MENU_ITEMS.main.map((item, index) => (
                            <MenuItem key={index} icon={item.icon} text={item.text} href={item.href} />
                        ))}
                        <li className="pt-4">
                            <ThemeSwitcher />
                        </li>
                    </ul>
                </MobileMenuLayout>
            )}
        </nav>
    )
}