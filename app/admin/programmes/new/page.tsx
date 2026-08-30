import { AdminLayout } from "@/components/cms/admin-layout";
import { PageHeader } from "@/components/cms/page-header";
import { ProgrammeForm } from "@/components/cms/programme-form";

export default function NewProgrammePage() {
  return (
    <AdminLayout>
      <PageHeader
        title="Create Programme"
        description="Add a new VNTV Originals programme"
      />

      <div className="p-6 max-w-3xl">
        <ProgrammeForm mode="create" />
      </div>
    </AdminLayout>
  );
}
