export default function EcommerceDashboardPage() {
  return (
    <div className="space-y-6">
      <div className="rounded-lg border p-4">
        <h2 className="text-lg font-semibold">E-commerce Dashboard Example</h2>
        <p className="text-muted-foreground">
          This page demonstrates using a custom sidebar configuration for an
          e-commerce admin dashboard.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-lg border p-4">
          <h3 className="font-medium">Total Sales</h3>
          <p className="text-2xl font-bold">$12,345</p>
        </div>
        <div className="rounded-lg border p-4">
          <h3 className="font-medium">Orders</h3>
          <p className="text-2xl font-bold">156</p>
        </div>
        <div className="rounded-lg border p-4">
          <h3 className="font-medium">Customers</h3>
          <p className="text-2xl font-bold">1,245</p>
        </div>
        <div className="rounded-lg border p-4">
          <h3 className="font-medium">Products</h3>
          <p className="text-2xl font-bold">86</p>
        </div>
      </div>

      <div className="rounded-lg border p-4">
        <h3 className="mb-4 font-medium">How to Use Custom Sidebar</h3>
        <p className="mb-2">
          This example uses the <code>ecommerceAdminSidebar</code> configuration
          from <code>src/config/examples/custom-sidebar.tsx</code>.
        </p>
        <p>
          Check the layout file at{" "}
          <code>src/app/examples/ecommerce/layout.tsx</code> to see how it's
          implemented.
        </p>
      </div>
    </div>
  );
}
