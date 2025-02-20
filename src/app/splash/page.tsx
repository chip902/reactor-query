'use client';
import React from 'react';
import FAQ from '@/components/FAQ';
import ArrowRight from '@spectrum-icons/workflow/ArrowRight';
import Question from '@spectrum-icons/workflow/Question';
import Checkmark from '@spectrum-icons/workflow/Checkmark';
import Link from 'next/link';
import Image from 'next/image';

import { PRODUCT_NAME } from '@/lib/constants';

const MarketingSplash = () => {
    return (
        <div className="min-h-screen bg-white">
            {/* Hero Section */}
            <div className="relative">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="lg:grid lg:grid-cols-2 lg:gap-8 lg:items-center py-12">
                        {/* Left column - Text content */}
                        <div className="sm:text-center lg:text-left">
                            <h1 className="text-4xl tracking-tight font-extrabold text-gray-900 sm:text-5xl md:text-6xl flex items-center gap-4">
                                <div className="flex flex-col">
                                    <span className="block">Welcome to</span>
                                    <span className="block text-blue-600">{PRODUCT_NAME}</span>
                                </div>
                            </h1>
                            <p className="mt-3 text-base text-gray-500 sm:mt-5 sm:text-lg sm:max-w-xl sm:mx-auto md:mt-5 md:text-xl lg:mx-0">
                                Connect your Launch properties to {PRODUCT_NAME} to add what Launch is missing.
                            </p>
                            <div className="mt-5 sm:mt-8 sm:flex sm:justify-center lg:justify-start">
                                <div className="flex flex-col items-center sm:items-start">
                                    <Link href="/search">
                                        <button className="w-full flex items-center justify-center px-8 py-3 text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 md:py-4 md:text-lg md:px-10">
                                            Get Started
                                            <ArrowRight UNSAFE_className='ml-2 h-5 w-5' />
                                        </button>
                                    </Link>
                                </div>
                                <div className="mt-3 sm:mt-0 sm:ml-3">
                                    <Link href="#faq">
                                        <button className="w-full flex items-center justify-center px-8 py-3 text-base font-medium rounded-md text-blue-700 bg-blue-100 hover:bg-blue-200 md:py-4 md:text-lg md:px-10">
                                            FAQ
                                            <Question UNSAFE_className="ml-2 h-5 w-5" />
                                        </button>
                                    </Link>
                                </div>
                            </div>
                        </div>

                        {/* Right column - Video placeholder */}
                        <div className="mt-12 lg:mt-0">
                            <h2 className='text-xl font-bold text-blue-500'>Demo</h2>
                            <div className="aspect-w-16 aspect-h-9 rounded-lg overflow-hidden bg-gray-100">

                                {/* This div serves as a placeholder for your YouTube video */}
                                <div className="w-full h-full flex items-center justify-center bg-blue-100 text-blue-500 text-lg font-medium">
                                    <iframe
                                        width="560"
                                        height="315"
                                        src="https://www.youtube.com/embed/F2cjJTOLvSg?si=wPjsapV80x-0I2Mc"
                                        title="YouTube video player"
                                        frameBorder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                                        referrerPolicy="strict-origin-when-cross-origin" allowFullScreen></iframe>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Feature Section */}
            <div className="py-12 bg-white">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="lg:text-center">
                        <p className="mt-2 text-3xl leading-8 font-extrabold tracking-tight text-gray-900 sm:text-4xl">
                            The features you didn&apos;t know you needed:
                        </p>
                    </div>

                    <div className="mt-10">
                        <div className="space-y-10 md:space-y-0 md:grid md:grid-cols-2 md:gap-x-8 md:gap-y-10">
                            {[
                                "Better Search Experience",
                                "Rule & Data Element Relationship Viewer",
                            ].map((feature) => (
                                <div key={feature} className="relative">
                                    <div className="absolute flex items-center justify-center h-12 w-12 rounded-md bg-blue-500 text-white">
                                        <Checkmark UNSAFE_className="h-6 w-6" />
                                    </div>
                                    <p className="ml-16 mt-3 text-lg leading-6 font-medium text-gray-900">{feature}</p>
                                </div>
                            ))}
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