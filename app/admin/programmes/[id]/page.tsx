import { notFound } from "next/navigation";
import { AdminLayout } from "@/components/cms/admin-layout";
import { PageHeader } from "@/components/cms/page-header";
import { ProgrammeForm } from "@/components/cms/programme-form";
import { getProgramme } from "@/app/actions/programme";

interface EditProgrammePageProps {
  params: Promise<{ id: string }>;
}

export default async function EditProgrammePage({ params }: EditProgrammePageProps) {
  const { id } = await params;
  const { data: programme, error } = await getProgramme(id);

  if (error || !programme) {
    notFound();
  }

  return (
    <AdminLayout>
      <PageHeader
        title={`Edit: ${programme.name}`}
        description="Update programme details"
      />

      <div className="p-6 max-w-3xl">
        <ProgrammeForm mode="edit" programme={programme} />
      </div>
    </AdminLayout>
  );
}
