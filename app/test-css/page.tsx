export default function TestCssPage() {
  return (
    <div className="min-h-screen bg-background p-8">
      <div className="mx-auto max-w-4xl space-y-8">
        {/* Test basic colors */}
        <div className="rounded-lg border border-border bg-background-panel p-6">
          <h1 className="text-3xl font-bold text-text-primary">
            CSS Test Page
          </h1>
          <p className="mt-2 text-text-secondary">
            If you see styled boxes below, Tailwind is working!
          </p>
        </div>

        {/* Test VNTV red */}
        <div className="rounded-lg bg-vntv-red p-6 text-white">
          <h2 className="text-2xl font-bold">VNTV Red Background</h2>
          <p>This should be red (#e0142c)</p>
        </div>

        {/* Test background colors */}
        <div className="grid grid-cols-3 gap-4">
          <div className="rounded-lg bg-background-panel p-4">
            <p className="text-text-primary font-semibold">Panel</p>
            <p className="text-text-secondary text-sm">background-panel</p>
          </div>
          <div className="rounded-lg bg-background-panel-2 p-4">
            <p className="text-text-primary font-semibold">Panel 2</p>
            <p className="text-text-secondary text-sm">background-panel-2</p>
          </div>
          <div className="rounded-lg border border-border bg-background p-4">
            <p className="text-text-primary font-semibold">With Border</p>
            <p className="text-text-secondary text-sm">border-border</p>
          </div>
        </div>

        {/* Test semantic colors */}
        <div className="grid grid-cols-4 gap-4">
          <div className="rounded-lg bg-success p-4 text-white">
            <p className="font-semibold">Success</p>
          </div>
          <div className="rounded-lg bg-error p-4 text-white">
            <p className="font-semibold">Error</p>
          </div>
          <div className="rounded-lg bg-warning p-4 text-white">
            <p className="font-semibold">Warning</p>
          </div>
          <div className="rounded-lg bg-info p-4 text-white">
            <p className="font-semibold">Info</p>
          </div>
        </div>

        {/* Test spacing */}
        <div className="space-y-4 rounded-lg border border-border bg-background-panel p-6">
          <h3 className="text-xl font-bold text-text-primary">Spacing Test</h3>
          <div className="h-4 bg-vntv-red"></div>
          <div className="h-4 bg-vntv-red"></div>
          <div className="h-4 bg-vntv-red"></div>
        </div>

        {/* Test shadows */}
        <div className="grid grid-cols-4 gap-4">
          <div className="rounded-lg bg-background-panel p-4 shadow-sm">
            <p className="text-sm">shadow-sm</p>
          </div>
          <div className="rounded-lg bg-background-panel p-4 shadow-md">
            <p className="text-sm">shadow-md</p>
          </div>
          <div className="rounded-lg bg-background-panel p-4 shadow-lg">
            <p className="text-sm">shadow-lg</p>
          </div>
          <div className="rounded-lg bg-background-panel p-4 shadow-xl">
            <p className="text-sm">shadow-xl</p>
          </div>
        </div>

        {/* Raw CSS variables test */}
        <div className="rounded-lg border border-border bg-background-panel p-6">
          <h3 className="text-xl font-bold text-text-primary mb-4">
            Raw CSS Variables Test
          </h3>
          <div style={{ backgroundColor: 'var(--color-vntv-red)', color: 'white', padding: '16px', borderRadius: '8px' }}>
            If this is red, CSS variables are loading
          </div>
          <div style={{ backgroundColor: 'var(--color-background-panel-2)', padding: '16px', borderRadius: '8px', marginTop: '8px' }}>
            This should have a panel background
          </div>
        </div>
      </div>
    </div>
  );
}
