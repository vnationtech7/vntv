import { PublicLayout } from "@/components/layout/public-layout";
import { HelpCircle, Search, Mail, Book } from "lucide-react";
import Link from "next/link";

export const metadata = {
  title: "Help Center - VNTV",
  description: "Get help and answers to frequently asked questions",
};

const faqs = [
  {
    category: "Account & Access",
    questions: [
      {
        q: "How do I create an account?",
        a: "Click 'Sign In' in the top right corner, then select 'Create Account'. Follow the prompts to set up your account with your email and password, or use Google Sign-In for faster access.",
      },
      {
        q: "What content requires an account?",
        a: "Most articles and videos are free to view. However, some premium content and features require you to be signed in. Creating an account also allows you to save articles, comment, and personalize your experience.",
      },
      {
        q: "How do I reset my password?",
        a: "On the sign-in page, click 'Forgot Password?' and enter your email address. We'll send you a link to reset your password.",
      },
    ],
  },
  {
    category: "Content & Features",
    questions: [
      {
        q: "How do I find specific topics?",
        a: "Use the search bar in the header, browse by category from the navigation menu, or explore our categorized sections like Ghana, Nigeria, Politics, Business, etc.",
      },
      {
        q: "Can I share articles on social media?",
        a: "Yes! Every article has social sharing buttons for Facebook, Twitter, WhatsApp, LinkedIn, and more. Click any social icon to share.",
      },
      {
        q: "How do I watch videos?",
        a: "Visit the 'Video' section from the main navigation, or click on any video card. Videos are organized by type: news, shorts, documentaries, and originals.",
      },
    ],
  },
  {
    category: "Newsletter & Notifications",
    questions: [
      {
        q: "How do I subscribe to the newsletter?",
        a: "Enter your email in the newsletter subscription box in the footer or on any page. You'll receive a confirmation email to complete your subscription.",
      },
      {
        q: "How often will I receive emails?",
        a: "Our newsletter is sent weekly with the top stories and highlights. You can adjust your preferences in your account settings.",
      },
      {
        q: "How do I unsubscribe?",
        a: "Click 'Unsubscribe' at the bottom of any newsletter email, or manage your subscription in your account settings.",
      },
    ],
  },
  {
    category: "Technical Issues",
    questions: [
      {
        q: "Videos won't play. What should I do?",
        a: "Try refreshing the page, clearing your browser cache, or using a different browser. Make sure JavaScript is enabled and your browser is up to date.",
      },
      {
        q: "The site is loading slowly.",
        a: "This could be due to your internet connection or high traffic. Try refreshing the page or visiting during off-peak hours. If the issue persists, contact us.",
      },
      {
        q: "Images aren't displaying.",
        a: "Check your internet connection and try refreshing the page. If you're using an ad blocker, try disabling it as it may interfere with content display.",
      },
    ],
  },
];

export default function HelpCenterPage() {
  return (
    <PublicLayout>
      <div className="max-w-5xl mx-auto px-6 py-12">
        {/* Header */}
        <div className="mb-12 text-center">
          <div className="inline-flex h-16 w-16 items-center justify-center rounded-full bg-vntv-red/10 mb-6">
            <HelpCircle className="h-8 w-8 text-vntv-red" />
          </div>
          <h1 className="text-4xl md:text-5xl font-extrabold text-text-primary mb-4">
            Help Center
          </h1>
          <p className="text-xl text-text-secondary">
            Find answers to common questions and get support
          </p>
        </div>

        {/* Quick Actions */}
        <div className="grid md:grid-cols-3 gap-6 mb-12">
          <div className="border border-border rounded-lg p-6 bg-background-panel text-center">
            <div className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-vntv-red/10 mb-4">
              <Search className="h-6 w-6 text-vntv-red" />
            </div>
            <h3 className="text-lg font-bold text-text-primary mb-2">
              Browse FAQs
            </h3>
            <p className="text-sm text-text-secondary">
              Find quick answers below
            </p>
          </div>

          <Link href="/contact">
            <div className="border border-border rounded-lg p-6 bg-background-panel text-center hover:border-vntv-red transition-colors cursor-pointer">
              <div className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-vntv-red/10 mb-4">
                <Mail className="h-6 w-6 text-vntv-red" />
              </div>
              <h3 className="text-lg font-bold text-text-primary mb-2">
                Contact Support
              </h3>
              <p className="text-sm text-text-secondary">
                Get help from our team
              </p>
            </div>
          </Link>

          <Link href="/about">
            <div className="border border-border rounded-lg p-6 bg-background-panel text-center hover:border-vntv-red transition-colors cursor-pointer">
              <div className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-vntv-red/10 mb-4">
                <Book className="h-6 w-6 text-vntv-red" />
              </div>
              <h3 className="text-lg font-bold text-text-primary mb-2">
                About VNTV
              </h3>
              <p className="text-sm text-text-secondary">
                Learn more about us
              </p>
            </div>
          </Link>
        </div>

        {/* FAQs */}
        <div className="space-y-8">
          <h2 className="text-2xl font-bold text-text-primary">
            Frequently Asked Questions
          </h2>

          {faqs.map((category) => (
            <div key={category.category} className="border border-border rounded-lg p-6 bg-background-panel">
              <h3 className="text-xl font-bold text-text-primary mb-6">
                {category.category}
              </h3>
              <div className="space-y-6">
                {category.questions.map((item, idx) => (
                  <div key={idx}>
                    <h4 className="text-base font-semibold text-text-primary mb-2">
                      {item.q}
                    </h4>
                    <p className="text-sm text-text-secondary leading-relaxed">
                      {item.a}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Contact CTA */}
        <div className="mt-12 text-center border-t border-border pt-12">
          <h2 className="text-2xl font-bold text-text-primary mb-4">
            Still Need Help?
          </h2>
          <p className="text-text-secondary mb-6">
            Can't find what you're looking for? Our support team is here to help.
          </p>
          <Link href="/contact">
            <button className="inline-flex items-center justify-center rounded-md bg-vntv-red px-8 py-3 text-sm font-semibold text-white shadow transition-colors hover:bg-vntv-red/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-vntv-red focus-visible:ring-offset-2">
              Contact Support
            </button>
          </Link>
        </div>
      </div>
    </PublicLayout>
  );
}
