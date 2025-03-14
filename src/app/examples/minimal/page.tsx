export default function MinimalDashboardPage() {
  return (
    <div className="space-y-6">
      <div className="rounded-lg border p-4">
        <h2 className="text-lg font-semibold">Minimal Dashboard Example</h2>
        <p className="text-muted-foreground">
          This page demonstrates using a minimal sidebar configuration with only
          essential navigation items.
        </p>
      </div>

      <div className="rounded-lg border p-4">
        <h3 className="mb-4 font-medium">How to Use Minimal Sidebar</h3>
        <p className="mb-2">
          This example uses the <code>minimalSidebar</code> configuration from{" "}
          <code>src/config/examples/custom-sidebar.tsx</code>.
        </p>
        <p>
          Check the layout file at{" "}
          <code>src/app/examples/minimal/layout.tsx</code> to see how it's
          implemented.
        </p>
      </div>

      <div className="rounded-lg border p-4">
        <h3 className="mb-4 font-medium">Benefits of a Minimal Sidebar</h3>
        <ul className="list-disc space-y-2 pl-5">
          <li>Reduced cognitive load for users</li>
          <li>More screen space for content</li>
          <li>Faster navigation to essential features</li>
          <li>Cleaner, more focused user interface</li>
        </ul>
      </div>
    </div>
  );
}
