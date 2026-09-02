import { PublicLayout } from "@/components/layout/public-layout";
import { Cookie } from "lucide-react";

export const metadata = {
  title: "Cookie Policy - VNTV",
  description: "Learn about how VNTV uses cookies and tracking technologies",
};

export default function CookiePolicyPage() {
  return (
    <PublicLayout>
      <div className="max-w-4xl mx-auto px-6 py-12">
        {/* Header */}
        <div className="mb-12">
          <div className="inline-flex h-16 w-16 items-center justify-center rounded-full bg-vntv-red/10 mb-6">
            <Cookie className="h-8 w-8 text-vntv-red" />
          </div>
          <h1 className="text-4xl md:text-5xl font-extrabold text-text-primary mb-4">
            Cookie Policy
          </h1>
          <p className="text-text-secondary">
            Last updated: September 1, 2026
          </p>
        </div>

        {/* Content */}
        <div className="prose prose-lg dark:prose-invert max-w-none">
          <section className="mb-8">
            <h2 className="text-2xl font-bold text-text-primary mb-4">1. What Are Cookies?</h2>
            <p className="text-text-secondary leading-relaxed mb-4">
              Cookies are small text files that are placed on your computer or mobile device when you visit a website. 
              They are widely used to make websites work more efficiently and provide information to website owners.
            </p>
            <p className="text-text-secondary leading-relaxed mb-4">
              Cookies allow us to recognize you and remember your preferences, helping us provide you with a better 
              and more personalized experience.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-text-primary mb-4">2. How We Use Cookies</h2>
            <p className="text-text-secondary leading-relaxed mb-4">
              VNTV uses cookies for the following purposes:
            </p>
            
            <h3 className="text-xl font-semibold text-text-primary mb-3 mt-6">Essential Cookies</h3>
            <p className="text-text-secondary leading-relaxed mb-4">
              These cookies are necessary for the website to function properly. They enable basic functions like page 
              navigation, secure access to your account, and remembering your preferences (such as dark/light mode).
            </p>

            <h3 className="text-xl font-semibold text-text-primary mb-3 mt-6">Analytics Cookies</h3>
            <p className="text-text-secondary leading-relaxed mb-4">
              We use analytics cookies to understand how visitors interact with our website. This helps us improve our 
              content and user experience. These cookies collect information such as:
            </p>
            <ul className="list-disc pl-6 text-text-secondary space-y-2 mb-4">
              <li>Number of visitors to our site</li>
              <li>Pages visited and time spent on each page</li>
              <li>How visitors found our site</li>
              <li>Which links are clicked</li>
            </ul>

            <h3 className="text-xl font-semibold text-text-primary mb-3 mt-6">Functional Cookies</h3>
            <p className="text-text-secondary leading-relaxed mb-4">
              These cookies enable enhanced functionality and personalization. For example:
            </p>
            <ul className="list-disc pl-6 text-text-secondary space-y-2 mb-4">
              <li>Remembering your login information</li>
              <li>Saving your reading preferences</li>
              <li>Storing your theme choice (light/dark mode)</li>
              <li>Remembering your language preference</li>
            </ul>

            <h3 className="text-xl font-semibold text-text-primary mb-3 mt-6">Advertising Cookies</h3>
            <p className="text-text-secondary leading-relaxed mb-4">
              We may use cookies to deliver relevant advertisements and measure the effectiveness of advertising campaigns. 
              These cookies may track your browsing activity across different websites.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-text-primary mb-4">3. Third-Party Cookies</h2>
            <p className="text-text-secondary leading-relaxed mb-4">
              In addition to our own cookies, we may use third-party cookies from the following services:
            </p>
            <ul className="list-disc pl-6 text-text-secondary space-y-2 mb-4">
              <li><strong>Google Analytics:</strong> To analyze website traffic and usage patterns</li>
              <li><strong>Google AdSense:</strong> To display relevant advertisements</li>
              <li><strong>Social Media Platforms:</strong> For social sharing features (Facebook, Twitter, etc.)</li>
              <li><strong>YouTube:</strong> For embedded video content</li>
            </ul>
            <p className="text-text-secondary leading-relaxed mb-4">
              These third parties may use cookies to collect information about your online activities over time and 
              across different websites.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-text-primary mb-4">4. Managing Cookies</h2>
            <p className="text-text-secondary leading-relaxed mb-4">
              You have the right to decide whether to accept or reject cookies. You can control cookies through:
            </p>

            <h3 className="text-xl font-semibold text-text-primary mb-3 mt-6">Browser Settings</h3>
            <p className="text-text-secondary leading-relaxed mb-4">
              Most web browsers allow you to control cookies through their settings. You can:
            </p>
            <ul className="list-disc pl-6 text-text-secondary space-y-2 mb-4">
              <li>View which cookies are stored on your device</li>
              <li>Delete all or specific cookies</li>
              <li>Block third-party cookies</li>
              <li>Block all cookies</li>
              <li>Set your browser to notify you when a cookie is sent</li>
            </ul>
            <p className="text-text-secondary leading-relaxed mb-4">
              Please note that if you choose to block all cookies, some parts of our website may not function properly.
            </p>

            <h3 className="text-xl font-semibold text-text-primary mb-3 mt-6">Browser-Specific Instructions</h3>
            <ul className="list-disc pl-6 text-text-secondary space-y-2 mb-4">
              <li><strong>Chrome:</strong> Settings → Privacy and security → Cookies and other site data</li>
              <li><strong>Firefox:</strong> Options → Privacy & Security → Cookies and Site Data</li>
              <li><strong>Safari:</strong> Preferences → Privacy → Cookies and website data</li>
              <li><strong>Edge:</strong> Settings → Cookies and site permissions → Cookies and site data</li>
            </ul>

            <h3 className="text-xl font-semibold text-text-primary mb-3 mt-6">Opt-Out Tools</h3>
            <p className="text-text-secondary leading-relaxed mb-4">
              You can also opt out of specific types of cookies using these resources:
            </p>
            <ul className="list-disc pl-6 text-text-secondary space-y-2 mb-4">
              <li><strong>Google Analytics:</strong> <a href="https://tools.google.com/dlpage/gaoptout" className="text-vntv-red hover:underline" target="_blank" rel="noopener noreferrer">Google Analytics Opt-out Browser Add-on</a></li>
              <li><strong>Google Ads:</strong> <a href="https://adssettings.google.com" className="text-vntv-red hover:underline" target="_blank" rel="noopener noreferrer">Google Ads Settings</a></li>
              <li><strong>Network Advertising:</strong> <a href="http://optout.networkadvertising.org" className="text-vntv-red hover:underline" target="_blank" rel="noopener noreferrer">NAI Opt-Out Tool</a></li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-text-primary mb-4">5. Cookie Duration</h2>
            <p className="text-text-secondary leading-relaxed mb-4">
              Cookies can be classified based on how long they remain on your device:
            </p>
            <ul className="list-disc pl-6 text-text-secondary space-y-2 mb-4">
              <li><strong>Session Cookies:</strong> Temporary cookies that are deleted when you close your browser</li>
              <li><strong>Persistent Cookies:</strong> Remain on your device for a set period (or until you delete them)</li>
            </ul>
            <p className="text-text-secondary leading-relaxed mb-4">
              We use both session and persistent cookies on our website.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-text-primary mb-4">6. Updates to This Cookie Policy</h2>
            <p className="text-text-secondary leading-relaxed mb-4">
              We may update this Cookie Policy from time to time to reflect changes in our practices or for other 
              operational, legal, or regulatory reasons. Please revisit this page periodically to stay informed about 
              our use of cookies.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-text-primary mb-4">7. More Information</h2>
            <p className="text-text-secondary leading-relaxed mb-4">
              For more information about how we handle your personal data, please see our{" "}
              <a href="/privacy" className="text-vntv-red hover:underline">Privacy Policy</a>.
            </p>
            <p className="text-text-secondary leading-relaxed mb-4">
              If you have any questions about our use of cookies, please contact us:
            </p>
            <p className="text-text-secondary">
              Email: <a href="mailto:privacy@vntv.com" className="text-vntv-red hover:underline">privacy@vntv.com</a>
            </p>
          </section>
        </div>
      </div>
    </PublicLayout>
  );
}
