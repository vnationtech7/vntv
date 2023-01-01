import { Container } from "@/components/layout/container";
import { UserList } from "@/components/admin/user-list";
import { requireSuperAdmin } from "@/lib/auth/server-authorization";

export const metadata = {
  title: "User Management - VNTV Admin",
  description: "Manage users and their role assignments",
};

export default async function UsersPage() {
  // Require super admin role
  await requireSuperAdmin();

  return (
    <Container className="py-8">
      <div className="mx-auto max-w-6xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-text-primary mb-2">
            User Management
          </h1>
          <p className="text-text-secondary">
            Manage user accounts and assign roles
          </p>
        </div>

        <UserList />
      </div>
    </Container>
  );
}
