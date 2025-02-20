'use client';
import React from 'react';
import FAQ from '@/components/FAQ';
import ArrowRight from '@spectrum-icons/workflow/ArrowRight';
import Question from '@spectrum-icons/workflow/Question';
import Checkmark from '@spectrum-icons/workflow/Checkmark';
import Link from 'next/link';
import Image from 'next/image';
import Search from '@spectrum-icons/workflow/Search';
import DataCorrelated from '@spectrum-icons/workflow/DataCorrelated';

import { PRODUCT_NAME } from '@/lib/constants';

const MarketingSplash = () => {
    return (
        <div className="min-h-screen bg-white">
            {/* Hero Section */}
            <div className="relative">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="py-12 flex justify-center items-center">
                        <div>
                            <div className="text-center max-w-4xl mx-auto">
                                <h1 className="text-4xl tracking-tight font-extrabold text-gray-900 sm:text-5xl md:text-6xl">
                                    <span className="block">Welcome to</span>
                                    <span className="block text-blue-600">{PRODUCT_NAME}</span>
                                </h1>
                                <p className="mt-3 text-base text-gray-500 sm:mt-5 sm:text-lg sm:max-w-2xl sm:mx-auto md:mt-5 md:text-xl">
                                    Connect your Launch properties to {PRODUCT_NAME} to add what Launch is missing.
                                </p>
                                {/* CTA Buttons */}
                                <div className="mt-8 flex flex-col sm:flex-row justify-center gap-4 max-w-2xl mx-auto">
                                    <Link href="/search" className="sm:w-1/3">
                                        <button className="w-full flex items-center justify-center px-6 py-3 text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 md:py-4 md:text-lg whitespace-nowrap">
                                            Start Searching
                                            <Search UNSAFE_className='ml-2 h-5 w-5' />
                                        </button>
                                    </Link>
                                    <Link href="/relationships" className="sm:w-1/3">
                                        <button className="w-full flex items-center justify-center px-6 py-3 text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 md:py-4 md:text-lg whitespace-nowrap">
                                            View Relationships
                                            <DataCorrelated UNSAFE_className="ml-2 h-5 w-5" />
                                        </button>
                                    </Link>
                                    <Link href="#faq" className="sm:w-1/3">
                                        <button className="w-full flex items-center justify-center px-6 py-3 text-base font-medium rounded-md text-blue-700 bg-blue-100 hover:bg-blue-200 md:py-4 md:text-lg whitespace-nowrap">
                                            FAQ
                                            <Question UNSAFE_className="ml-2 h-5 w-5" />
                                        </button>
                                    </Link>
                                </div>
                            </div>

                            {/* Features */}
                            <div className="mt-16 w-full">
                                <div className="max-w-[1400px] mx-auto px-4">
                                    <p className="text-lg font-medium text-gray-900 mb-6 text-center">
                                        Features:
                                    </p>
                                    <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 sm:gap-16 justify-items-start">
                                        {[
                                            "Better Search Experience",
                                            "Rule & Data Element Relationships",
                                            "Data Element & Rule Export",
                                            "View Entire Publish History"
                                        ].map((feature) => (
                                            <div key={feature} className="flex items-center gap-3 w-full">
                                                <div className="flex-shrink-0 flex items-center justify-center h-6 w-6 rounded bg-blue-500 text-white">
                                                    <Checkmark UNSAFE_className="h-4 w-4" />
                                                </div>
                                                <p className="text-sm text-gray-600 whitespace-normal sm:whitespace-nowrap">{feature}</p>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Demo Video Section */}
            <div className="py-12 bg-gray-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center">
                        <h2 className="text-3xl font-bold text-gray-900 mb-8">Watch The Demo</h2>
                        <div className="max-w-3xl mx-auto rounded-lg overflow-hidden shadow-lg">
                            <div className="relative" style={{ paddingBottom: '56.25%' }}>
                                <iframe
                                    className="absolute top-0 left-0 w-full h-full"
                                    src="https://www.youtube.com/embed/F2cjJTOLvSg?si=wPjsapV80x-0I2Mc"
                                    title="YouTube video player"
                                    frameBorder="0"
                                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                                    referrerPolicy="strict-origin-when-cross-origin"
                                    allowFullScreen
                                ></iframe>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* CTA Section */}
            <div className="bg-blue-700">
                <div className="max-w-2xl mx-auto text-center py-16 px-4 sm:py-20 sm:px-6 lg:px-8">
                    <Image
                        src="/images/squarelogo.png"
                        alt="Logo"
                        width={80}
                        height={80}
                        className="hidden lg:block justify-self-center pb-4"
                    />
                    <div className="flex items-center justify-center gap-4 mb-8">
                        <h2 className="text-3xl font-extrabold text-white sm:text-4xl">
                            <span className="block">Enhance your Launch experience</span>
                            <span className="block">with {PRODUCT_NAME}</span>
                        </h2>
                    </div>
                    <p className="mt-4 text-lg leading-6 text-blue-200">
                        Discover how {PRODUCT_NAME} can improve your Adobe Launch workflow!
                    </p>
                    <Link href="/search">
                        <button className="mt-8 w-full inline-flex items-center justify-center px-5 py-3 text-base font-medium rounded-md text-blue-700 bg-white hover:bg-blue-50 sm:w-auto">
                            Get Started
                            <ArrowRight UNSAFE_className='ml-2 h-5 w-5' />
                        </button>
                    </Link>
                </div>
            </div>

            {/* FAQ Section */}
            <div id="faq">
                <FAQ />
            </div>
        </div>
    );
};

export default MarketingSplash;