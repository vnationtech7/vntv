import { redirect } from "next/navigation";
import { Container } from "@/components/layout/container";
import { RoleList } from "@/components/admin/role-list";
import { isAdmin } from "./actions";

export const metadata = {
  title: "Role Management - VNTV Admin",
  description: "Manage user roles and permissions",
};

export default async function RolesPage() {
  // Check if user is admin
  const userIsAdmin = await isAdmin();

  if (!userIsAdmin) {
    redirect("/");
  }

  return (
    <Container className="py-8">
      <div className="mx-auto max-w-4xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-text-primary mb-2">
            Role Management
          </h1>
          <p className="text-text-secondary">
            Create and manage user roles for access control
          </p>
        </div>

        <RoleList />
      </div>
    </Container>
  );
}
