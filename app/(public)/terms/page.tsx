import { PublicLayout } from "@/components/layout/public-layout";
import { FileText } from "lucide-react";

export const metadata = {
  title: "Terms of Service - VNTV",
  description: "Terms and conditions for using VNTV",
};

export default function TermsPage() {
  return (
    <PublicLayout>
      <div className="max-w-4xl mx-auto px-6 py-12">
        {/* Header */}
        <div className="mb-12">
          <div className="inline-flex h-16 w-16 items-center justify-center rounded-full bg-vntv-red/10 mb-6">
            <FileText className="h-8 w-8 text-vntv-red" />
          </div>
          <h1 className="text-4xl md:text-5xl font-extrabold text-text-primary mb-4">
            Terms of Service
          </h1>
          <p className="text-text-secondary">
            Last updated: September 1, 2026
          </p>
        </div>

        {/* Content */}
        <div className="prose prose-lg dark:prose-invert max-w-none">
          <section className="mb-8">
            <h2 className="text-2xl font-bold text-text-primary mb-4">1. Acceptance of Terms</h2>
            <p className="text-text-secondary leading-relaxed mb-4">
              By accessing and using VNTV ("the Service"), you accept and agree to be bound by the terms 
              and provision of this agreement. If you do not agree to these terms, please do not use the Service.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-text-primary mb-4">2. Use License</h2>
            <p className="text-text-secondary leading-relaxed mb-4">
              Permission is granted to temporarily access the materials (information or software) on VNTV 
              for personal, non-commercial transitory viewing only. This is the grant of a license, not a 
              transfer of title, and under this license you may not:
            </p>
            <ul className="list-disc pl-6 text-text-secondary space-y-2 mb-4">
              <li>Modify or copy the materials</li>
              <li>Use the materials for any commercial purpose or for any public display</li>
              <li>Attempt to decompile or reverse engineer any software contained on VNTV</li>
              <li>Remove any copyright or other proprietary notations from the materials</li>
              <li>Transfer the materials to another person or "mirror" the materials on any other server</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-text-primary mb-4">3. User Accounts</h2>
            <p className="text-text-secondary leading-relaxed mb-4">
              When you create an account with us, you must provide accurate, complete, and current information. 
              Failure to do so constitutes a breach of the Terms, which may result in immediate termination of 
              your account. You are responsible for safeguarding your password and for all activities that occur 
              under your account.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-text-primary mb-4">4. Content</h2>
            <p className="text-text-secondary leading-relaxed mb-4">
              Our Service allows you to post, link, store, share and otherwise make available certain information, 
              text, graphics, or other material ("Content"). You are responsible for the Content that you post on 
              or through the Service, including its legality, reliability, and appropriateness.
            </p>
            <p className="text-text-secondary leading-relaxed mb-4">
              By posting Content on or through the Service, you represent and warrant that: (i) the Content is 
              yours and you have the right to use it, or you have the necessary licenses, rights, consents, and 
              permissions to use it; and (ii) the posting of your Content does not violate the privacy rights, 
              publicity rights, copyrights, contract rights or any other rights of any person or entity.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-text-primary mb-4">5. Prohibited Uses</h2>
            <p className="text-text-secondary leading-relaxed mb-4">
              You may use the Service only for lawful purposes and in accordance with these Terms. You agree not to:
            </p>
            <ul className="list-disc pl-6 text-text-secondary space-y-2 mb-4">
              <li>Use the Service in any way that violates any applicable law or regulation</li>
              <li>Engage in any conduct that restricts or inhibits anyone's use or enjoyment of the Service</li>
              <li>Impersonate or attempt to impersonate VNTV, a VNTV employee, another user, or any other person or entity</li>
              <li>Engage in any automated use of the system, such as using scripts to send comments or messages</li>
              <li>Interfere with, disrupt, or create an undue burden on the Service or the networks connected to the Service</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-text-primary mb-4">6. Intellectual Property</h2>
            <p className="text-text-secondary leading-relaxed mb-4">
              The Service and its original content (excluding Content provided by users), features, and functionality 
              are and will remain the exclusive property of VNTV and its licensors. The Service is protected by 
              copyright, trademark, and other laws. Our trademarks may not be used in connection with any product 
              or service without our prior written consent.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-text-primary mb-4">7. Termination</h2>
            <p className="text-text-secondary leading-relaxed mb-4">
              We may terminate or suspend your account and bar access to the Service immediately, without prior 
              notice or liability, under our sole discretion, for any reason whatsoever, including without limitation 
              if you breach the Terms. Upon termination, your right to use the Service will immediately cease.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-text-primary mb-4">8. Limitation of Liability</h2>
            <p className="text-text-secondary leading-relaxed mb-4">
              In no event shall VNTV, nor its directors, employees, partners, agents, suppliers, or affiliates, be 
              liable for any indirect, incidental, special, consequential or punitive damages, including without 
              limitation, loss of profits, data, use, goodwill, or other intangible losses, resulting from your 
              access to or use of or inability to access or use the Service.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-text-primary mb-4">9. Changes to Terms</h2>
            <p className="text-text-secondary leading-relaxed mb-4">
              We reserve the right to modify or replace these Terms at any time. We will provide notice of any 
              material changes by posting the new Terms on this page with an updated effective date. Your continued 
              use of the Service after any such changes constitutes your acceptance of the new Terms.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-text-primary mb-4">10. Contact Us</h2>
            <p className="text-text-secondary leading-relaxed mb-4">
              If you have any questions about these Terms, please contact us at:
            </p>
            <p className="text-text-secondary">
              Email: <a href="mailto:legal@vntv.com" className="text-vntv-red hover:underline">legal@vntv.com</a>
            </p>
          </section>
        </div>
      </div>
    </PublicLayout>
  );
}
