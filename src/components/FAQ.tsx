'use client';
import React from 'react';
import { useState } from 'react';
import ChevronIcon from '@/components/icons/ChevronIcon';
import { PRODUCT_NAME } from '@/lib/constants';

const FAQ = () => {
    const faqs = [
        {
            question: `What does the ${PRODUCT_NAME} do?`,
            answer: `The ${PRODUCT_NAME} provides a more user friendly way to search in Launch. You can also view the relationships between rules and data elements. For example, see which rules a specific data element is used in. Check out the demo video above!`
        },
        {
            question: `Is the ${PRODUCT_NAME} free to use?`,
            answer: `Yes, the ${PRODUCT_NAME} is 100% free to use, unless for some reason it explodes in popularity :)`
        },
        {
            question: `Is the ${PRODUCT_NAME} secure? How are my API keys used?`,

            answer: `Yes, the ${PRODUCT_NAME} is 100% secure. Your API keys are encrypted and stored in your browser's session storage and are not stored anywhere else. When you enter your API keys, they are encrypted and saved to your browser's session storage. When your keys are needed, the ${PRODUCT_NAME} uses your API keys from storage to call the Launch API and fetch data. Additionally, on the server-side, the ${PRODUCT_NAME} makes sure that the headers from the API request are redacted.`
        },
        {
            question: `Does the ${PRODUCT_NAME} store any data about my Launch properties?`,
            answer: `No, the ${PRODUCT_NAME} does not store any data about your Launch properties. It uses the Launch API to fetch data and display it in a user-friendly way.`
        },
        {
            question: "What should I do if I need help or want to report a bug?",
            answer: "Please email support@perpetua.digital"
        }
    ];

    const [openIndex, setOpenIndex] = useState(0);

    return (
        <div className="bg-[var(--color-card)] py-16 sm:py-24 w-full">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="mx-auto divide-y-2 divide-[var(--color-border)]">
                    <h2 className="text-center text-3xl font-extrabold text-[var(--color-text-primary)] sm:text-4xl">
                        Frequently asked questions
                    </h2>
                    <dl className="mt-8 space-y-6 divide-y divide-[var(--color-border)]">
                        {faqs.map((faq, index) => (
                            <div key={index} className="pt-6">
                                <dt className="text-lg">
                                    <button
                                        className="text-left w-full flex justify-between items-start text-[var(--color-text-muted)]"
                                        onClick={() => setOpenIndex(openIndex === index ? -1 : index)}
                                    >
                                        <span className="font-medium text-[var(--color-text-primary)]">
                                            {faq.question}
                                        </span>
                                        <span className="ml-6 h-7 flex items-center">
                                            <ChevronIcon isOpen={openIndex === index} />
                                        </span>
                                    </button>
                                </dt>
                                {openIndex === index && (
                                    <dd className="mt-2 pr-12">
                                        <p className="text-base text-[var(--color-text-secondary)]">
                                            {faq.answer}
                                        </p>
                                    </dd>
                                )}
                            </div>
                        ))}
                    </dl>
                </div>
            </div>
        </div>
    );
};

export default FAQ;