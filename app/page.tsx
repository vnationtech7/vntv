export default function Home() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-8">
      <div className="max-w-4xl w-full space-y-8 text-center">
        {/* VNTV Logo */}
        <div className="space-y-2">
          <h1 className="text-6xl font-extrabold tracking-tight">
            VN<span className="text-vn-red">TV</span>
          </h1>
          <p className="text-xs tracking-[0.2em] text-vn-muted uppercase">
            Africa. Our Stories. Our Way.
          </p>
        </div>

        {/* Status Card */}
        <div className="bg-vn-panel border border-vn-border rounded-vn p-8 space-y-6">
          <div className="space-y-2">
            <h2 className="text-2xl font-bold">
              🚀 Milestone 1: Foundation
            </h2>
            <p className="text-vn-muted">
              Setting up the VNTV platform foundation
            </p>
          </div>

          <div className="grid gap-4 text-left">
            <ChecklistItem completed>
              Next.js 14+ with App Router
            </ChecklistItem>
            <ChecklistItem completed>
              TypeScript with strict mode
            </ChecklistItem>
            <ChecklistItem completed>
              Tailwind CSS with VNTV brand colors
            </ChecklistItem>
            <ChecklistItem completed>
              Supabase client utilities (new publishable/secret keys)
            </ChecklistItem>
            <ChecklistItem completed>
              Project folder structure
            </ChecklistItem>
            <ChecklistItem completed>
              Complete database schema migration
            </ChecklistItem>
            <ChecklistItem completed>
              Row Level Security (RLS) policies
            </ChecklistItem>
            <ChecklistItem>
              Supabase project connection
            </ChecklistItem>
            <ChecklistItem>
              Google OAuth configuration
            </ChecklistItem>
            <ChecklistItem>
              Type generation from database
            </ChecklistItem>
          </div>

          <div className="pt-4 border-t border-vn-border space-y-2">
            <p className="text-sm text-vn-muted-2">
              Next steps:
            </p>
            <ol className="text-sm text-vn-muted space-y-1 text-left list-decimal list-inside">
              <li>Create Supabase project and get API keys</li>
              <li>Set up environment variables in .env.local</li>
              <li>Apply database migrations</li>
              <li>Configure Supabase Auth with Google OAuth</li>
              <li>Create first super admin user</li>
            </ol>
          </div>
        </div>

        {/* Documentation Links */}
        <div className="flex gap-4 justify-center text-sm">
          <a
            href="/Blueprint.md"
            className="text-vn-red hover:text-vn-red-dim transition-colors"
          >
            Technical Blueprint →
          </a>
          <a
            href="/Product_spec.md"
            className="text-vn-red hover:text-vn-red-dim transition-colors"
          >
            Product Spec →
          </a>
          <a
            href="/milestones.md"
            className="text-vn-red hover:text-vn-red-dim transition-colors"
          >
            Milestones →
          </a>
        </div>
      </div>
    </main>
  );
}

function ChecklistItem({
  children,
  completed = false,
}: {
  children: React.ReactNode;
  completed?: boolean;
}) {
  return (
    <div className="flex items-start gap-3">
      <div
        className={`flex-shrink-0 w-5 h-5 rounded border-2 flex items-center justify-center mt-0.5 ${
          completed
            ? "bg-vn-red border-vn-red"
            : "border-vn-border"
        }`}
      >
        {completed && (
          <svg
            className="w-3 h-3 text-white"
            fill="none"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path d="M5 13l4 4L19 7"></path>
          </svg>
        )}
      </div>
      <span className={completed ? "text-vn-text" : "text-vn-muted"}>
        {children}
      </span>
    </div>
  );
}
