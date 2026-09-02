import { PublicLayout } from "@/components/layout/public-layout";
import { Shield } from "lucide-react";

export const metadata = {
  title: "Privacy Policy - VNTV",
  description: "Learn how VNTV collects, uses, and protects your personal information",
};

export default function PrivacyPage() {
  return (
    <PublicLayout>
      <div className="max-w-4xl mx-auto px-6 py-12">
        {/* Header */}
        <div className="mb-12">
          <div className="inline-flex h-16 w-16 items-center justify-center rounded-full bg-vntv-red/10 mb-6">
            <Shield className="h-8 w-8 text-vntv-red" />
          </div>
          <h1 className="text-4xl md:text-5xl font-extrabold text-text-primary mb-4">
            Privacy Policy
          </h1>
          <p className="text-text-secondary">
            Last updated: September 1, 2026
          </p>
        </div>

        {/* Content */}
        <div className="prose prose-lg dark:prose-invert max-w-none">
          <section className="mb-8">
            <h2 className="text-2xl font-bold text-text-primary mb-4">1. Introduction</h2>
            <p className="text-text-secondary leading-relaxed mb-4">
              VNTV ("we," "our," or "us") is committed to protecting your privacy. This Privacy Policy explains 
              how we collect, use, disclose, and safeguard your information when you visit our website and use 
              our services. Please read this privacy policy carefully.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-text-primary mb-4">2. Information We Collect</h2>
            
            <h3 className="text-xl font-semibold text-text-primary mb-3 mt-6">Personal Information</h3>
            <p className="text-text-secondary leading-relaxed mb-4">
              We may collect personal information that you voluntarily provide to us when you:
            </p>
            <ul className="list-disc pl-6 text-text-secondary space-y-2 mb-4">
              <li>Register for an account</li>
              <li>Subscribe to our newsletter</li>
              <li>Contact us via email or contact forms</li>
              <li>Comment on articles or videos</li>
              <li>Participate in surveys or promotions</li>
            </ul>
            <p className="text-text-secondary leading-relaxed mb-4">
              This information may include: name, email address, phone number, and any other information you choose to provide.
            </p>

            <h3 className="text-xl font-semibold text-text-primary mb-3 mt-6">Automatically Collected Information</h3>
            <p className="text-text-secondary leading-relaxed mb-4">
              When you visit our website, we automatically collect certain information about your device, including:
            </p>
            <ul className="list-disc pl-6 text-text-secondary space-y-2 mb-4">
              <li>IP address and browser type</li>
              <li>Operating system and device information</li>
              <li>Pages visited and time spent on pages</li>
              <li>Referring website addresses</li>
              <li>Clickstream data</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-text-primary mb-4">3. How We Use Your Information</h2>
            <p className="text-text-secondary leading-relaxed mb-4">
              We use the information we collect to:
            </p>
            <ul className="list-disc pl-6 text-text-secondary space-y-2 mb-4">
              <li>Provide, operate, and maintain our services</li>
              <li>Improve and personalize your experience</li>
              <li>Process your transactions and manage your account</li>
              <li>Send you newsletters and marketing communications (with your consent)</li>
              <li>Respond to your comments, questions, and customer service requests</li>
              <li>Analyze usage trends and optimize our website</li>
              <li>Detect, prevent, and address technical issues and security threats</li>
              <li>Comply with legal obligations</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-text-primary mb-4">4. Cookies and Tracking Technologies</h2>
            <p className="text-text-secondary leading-relaxed mb-4">
              We use cookies and similar tracking technologies to track activity on our website and store certain 
              information. Cookies are files with small amounts of data that may include an anonymous unique identifier.
            </p>
            <p className="text-text-secondary leading-relaxed mb-4">
              You can instruct your browser to refuse all cookies or to indicate when a cookie is being sent. However, 
              if you do not accept cookies, you may not be able to use some portions of our Service. For more information, 
              see our <a href="/cookies" className="text-vntv-red hover:underline">Cookie Policy</a>.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-text-primary mb-4">5. Sharing Your Information</h2>
            <p className="text-text-secondary leading-relaxed mb-4">
              We may share your information in the following situations:
            </p>
            <ul className="list-disc pl-6 text-text-secondary space-y-2 mb-4">
              <li><strong>Service Providers:</strong> We may share your information with third-party service providers who perform services on our behalf</li>
              <li><strong>Business Transfers:</strong> If we are involved in a merger, acquisition, or sale of assets, your information may be transferred</li>
              <li><strong>Legal Requirements:</strong> We may disclose your information if required to do so by law or in response to valid requests by public authorities</li>
              <li><strong>With Your Consent:</strong> We may disclose your personal information for any other purpose with your consent</li>
            </ul>
            <p className="text-text-secondary leading-relaxed mb-4">
              We do not sell your personal information to third parties.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-text-primary mb-4">6. Data Security</h2>
            <p className="text-text-secondary leading-relaxed mb-4">
              We implement appropriate technical and organizational security measures to protect your personal information. 
              However, please note that no method of transmission over the Internet or electronic storage is 100% secure, 
              and we cannot guarantee absolute security.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-text-primary mb-4">7. Your Privacy Rights</h2>
            <p className="text-text-secondary leading-relaxed mb-4">
              Depending on your location, you may have the following rights regarding your personal information:
            </p>
            <ul className="list-disc pl-6 text-text-secondary space-y-2 mb-4">
              <li><strong>Access:</strong> Request access to the personal information we hold about you</li>
              <li><strong>Correction:</strong> Request correction of inaccurate or incomplete information</li>
              <li><strong>Deletion:</strong> Request deletion of your personal information</li>
              <li><strong>Objection:</strong> Object to the processing of your personal information</li>
              <li><strong>Data Portability:</strong> Request transfer of your information to another service</li>
              <li><strong>Withdraw Consent:</strong> Withdraw your consent at any time where we rely on consent</li>
            </ul>
            <p className="text-text-secondary leading-relaxed mb-4">
              To exercise these rights, please contact us at <a href="mailto:privacy@vntv.com" className="text-vntv-red hover:underline">privacy@vntv.com</a>.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-text-primary mb-4">8. Third-Party Links</h2>
            <p className="text-text-secondary leading-relaxed mb-4">
              Our website may contain links to third-party websites. We are not responsible for the privacy practices 
              or content of these third-party sites. We encourage you to review the privacy policies of any third-party 
              sites you visit.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-text-primary mb-4">9. Children's Privacy</h2>
            <p className="text-text-secondary leading-relaxed mb-4">
              Our Service is not intended for children under 13 years of age. We do not knowingly collect personal 
              information from children under 13. If you are a parent or guardian and believe your child has provided 
              us with personal information, please contact us.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-text-primary mb-4">10. Changes to This Privacy Policy</h2>
            <p className="text-text-secondary leading-relaxed mb-4">
              We may update our Privacy Policy from time to time. We will notify you of any changes by posting the 
              new Privacy Policy on this page and updating the "Last updated" date. You are advised to review this 
              Privacy Policy periodically for any changes.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-text-primary mb-4">11. Contact Us</h2>
            <p className="text-text-secondary leading-relaxed mb-4">
              If you have any questions about this Privacy Policy, please contact us:
            </p>
            <p className="text-text-secondary">
              Email: <a href="mailto:privacy@vntv.com" className="text-vntv-red hover:underline">privacy@vntv.com</a><br />
              Address: 123 Media Street, Accra, Ghana
            </p>
          </section>
        </div>
      </div>
    </PublicLayout>
  );
}
