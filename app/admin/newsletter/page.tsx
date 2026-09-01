import { Container } from "@/components/layout/container";
import { NewsletterSubscribersList } from "@/components/admin/newsletter-subscribers-list";
import { requireRole } from "@/lib/auth/server-authorization";

export const metadata = {
  title: "Newsletter Subscribers - VNTV Admin",
  description: "Manage newsletter subscribers",
};

export default async function NewsletterPage() {
  // Require super admin or editor role
  await requireRole(["super_admin", "editor"]);

  return (
    <Container className="py-8">
      <div className="mx-auto max-w-6xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-text-primary mb-2">
            Newsletter Subscribers
          </h1>
          <p className="text-text-secondary">
            View and manage newsletter subscribers
          </p>
        </div>

        <NewsletterSubscribersList />
      </div>
    </Container>
  );
}
