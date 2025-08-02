import React from 'react';

export default function PrivacyPolicy() {
  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <h1 className="text-3xl font-bold mb-8 text-[var(--color-text-primary)]">Privacy Policy</h1>

      <section className="mb-8">
        <p className="mb-4 text-[var(--color-text-secondary)]">
          This privacy policy explains how data is collected, used, and protected when using this application.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-4 text-[var(--color-text-primary)]">Data Collection and Usage</h2>
        <p className="mb-4 text-[var(--color-text-secondary)]">
          Usage analytics are collected via Google Analytics to improve service quality and user experience. This includes:
        </p>
        <ul className="list-disc pl-8 mb-4">
          <li className="text-[var(--color-text-secondary)]">Basic event statistics: Page views, Searches, etc.</li>
          <li className="text-[var(--color-text-secondary)]">Application performance metrics</li>
          <li className="text-[var(--color-text-secondary)]">API monitoring and error logging to help identify and fix issues</li>
        </ul>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-4 text-[var(--color-text-primary)]">Data Security</h2>
        <p className="mb-4 text-[var(--color-text-secondary)]">
          Your data security is taken seriously through the following measures:
        </p>
        <ul className="list-disc pl-8 mb-4">
          <li className="text-[var(--color-text-secondary)]">API keys are encrypted and stored securely</li>
          <li className="text-[var(--color-text-secondary)]">All data transmission uses HTTPS encryption</li>
          <li className="text-[var(--color-text-secondary)]">Regular security audits and updates</li>
          <li className="text-[var(--color-text-secondary)]">No PII is collected such as email address, organization name, etc.</li>
        </ul>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-4 text-[var(--color-text-primary)]">Marketing & Data Selling</h2>
        <p className="mb-4 text-[var(--color-text-secondary)]">
          No marketing pixels, tracking cookies, or other marketing tracking technologies are used.
        </p>
        <p className="mb-4 text-[var(--color-text-secondary)]">
          No data is sold to any third parties and never will be.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-4 text-[var(--color-text-primary)]">Cost</h2>
        <p className="mb-4 text-[var(--color-text-secondary)]">
          This application is 100% free to use. Any money received from donations is used for hosting and development costs.
        </p>
      </section>
      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-4 text-[var(--color-text-primary)]">Contact Us</h2>
        <p className="mb-4 text-[var(--color-text-secondary)]">
          If you have any questions about this privacy policy or how your data is handled, please email support@perpetua.digital
        </p>
      </section>
      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-4 text-[var(--color-text-primary)]">Data Retention</h2>
        <p className="mb-4 text-[var(--color-text-secondary)]">
          We retain usage analytics data for 1 year to improve service quality.
        </p>
      </section>
    </div>
  );
}
