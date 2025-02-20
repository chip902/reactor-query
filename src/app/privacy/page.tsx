import React from 'react';

export default function PrivacyPolicy() {
  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <h1 className="text-3xl font-bold mb-8">Privacy Policy</h1>

      <section className="mb-8">
        <p className="mb-4">
          This privacy policy explains how data is collected, used, and protected when using this application.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">Data Collection and Usage</h2>
        <p className="mb-4">
          Usage analytics are collected via Google Analytics to improve service quality and user experience. This includes:
        </p>
        <ul className="list-disc pl-8 mb-4">
          <li>Basic event statistics: Page views, Searches, etc.</li>
          <li>Application performance metrics</li>
          <li>API monitoring and error logging to help identify and fix issues</li>
        </ul>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">Data Security</h2>
        <p className="mb-4">
          Your data security is taken seriously through the following measures:
        </p>
        <ul className="list-disc pl-8 mb-4">
          <li>API keys are stored encrypted in your browser&apos;s session storage. They are not stored anywhere else. When you close the browser, the keys are cleared.</li>
          <li>API keys sent in headers are redacted in API monitoring</li>
          <li>No data is stored on the server or in a database</li>
          <li>No PII is collected such as email address, organization name, etc.</li>
        </ul>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">Marketing & Data Selling</h2>
        <p className="mb-4">
          No marketing pixels, tracking cookies, or other marketing tracking technologies are used.
        </p>
        <p>
          No data is sold to any third parties and never will be.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">Cost</h2>
        <p className="mb-4">
          This application is 100% free to use. Any money received from donations is used for hosting and development costs.
        </p>
      </section>
      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">Contact Us</h2>
        <p className="mb-4">
          If you have any questions about this privacy policy or how your data is handled, please email support@perpetua.digital
        </p>
      </section>
    </div>
  );
}
