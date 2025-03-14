import Link from "next/link";

export default function ExamplesPage() {
  return (
    <div className="container mx-auto space-y-8 py-10">
      <div>
        <h1 className="mb-4 text-3xl font-bold">Dashboard Examples</h1>
        <p className="text-lg text-muted-foreground">
          Explore different sidebar configuration examples for the dashboard
          template.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Link href="/examples/ecommerce" className="group block">
          <div className="rounded-lg border p-6 transition-all hover:border-primary hover:shadow-md">
            <h2 className="mb-2 text-xl font-semibold group-hover:text-primary">
              E-commerce Dashboard
            </h2>
            <p className="mb-4 text-muted-foreground">
              A comprehensive sidebar configuration for an e-commerce admin
              dashboard.
            </p>
            <span className="text-sm font-medium text-primary">
              View Example →
            </span>
          </div>
        </Link>

        <Link href="/examples/minimal" className="group block">
          <div className="rounded-lg border p-6 transition-all hover:border-primary hover:shadow-md">
            <h2 className="mb-2 text-xl font-semibold group-hover:text-primary">
              Minimal Dashboard
            </h2>
            <p className="mb-4 text-muted-foreground">
              A minimal sidebar configuration with only essential navigation
              items.
            </p>
            <span className="text-sm font-medium text-primary">
              View Example →
            </span>
          </div>
        </Link>
      </div>

      <div className="rounded-lg border bg-muted/50 p-6">
        <h2 className="mb-4 text-xl font-semibold">
          How to Create Your Own Configuration
        </h2>
        <p className="mb-4">
          You can create your own sidebar configuration by following these
          steps:
        </p>
        <ol className="mb-4 list-decimal space-y-2 pl-5">
          <li>
            Create a new configuration file based on the examples in{" "}
            <code>src/config/examples/</code>
          </li>
          <li>Define your navigation groups and items</li>
          <li>Import your configuration in your layout file</li>
          <li>
            Pass it to the <code>DashboardLayout</code> component
          </li>
        </ol>
        <p>
          For more details, check the documentation in{" "}
          <code>src/config/README.md</code>.
        </p>
      </div>
    </div>
  );
}
