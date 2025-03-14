import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Plus, Search, MoreHorizontal, Download } from "lucide-react";

// Sample customer data
const customers = [
  {
    id: "CUST-001",
    name: "Acme Corporation",
    email: "contact@acmecorp.com",
    status: "Active",
    plan: "Enterprise",
    joined: "Jan 12, 2023",
    value: "$12,500.00",
  },
  {
    id: "CUST-002",
    name: "Globex Industries",
    email: "info@globex.com",
    status: "Active",
    plan: "Business",
    joined: "Feb 23, 2023",
    value: "$8,750.00",
  },
  {
    id: "CUST-003",
    name: "Initech LLC",
    email: "support@initech.com",
    status: "Inactive",
    plan: "Starter",
    joined: "Mar 15, 2023",
    value: "$2,100.00",
  },
  {
    id: "CUST-004",
    name: "Umbrella Corp",
    email: "sales@umbrella.com",
    status: "Active",
    plan: "Enterprise",
    joined: "Apr 5, 2023",
    value: "$15,200.00",
  },
  {
    id: "CUST-005",
    name: "Massive Dynamic",
    email: "info@massivedynamic.com",
    status: "Active",
    plan: "Business",
    joined: "May 18, 2023",
    value: "$7,800.00",
  },
  {
    id: "CUST-006",
    name: "Stark Industries",
    email: "contact@stark.com",
    status: "Active",
    plan: "Enterprise",
    joined: "Jun 30, 2023",
    value: "$18,500.00",
  },
  {
    id: "CUST-007",
    name: "Wayne Enterprises",
    email: "info@wayne.com",
    status: "Inactive",
    plan: "Business",
    joined: "Jul 22, 2023",
    value: "$9,200.00",
  },
];

export default function CustomersPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Customers</h2>
          <p className="text-muted-foreground">
            Manage your customer accounts and relationships.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm">
            <Download className="mr-2 h-4 w-4" />
            Export
          </Button>
          <Button size="sm">
            <Plus className="mr-2 h-4 w-4" />
            Add Customer
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle>Customer Management</CardTitle>
          <CardDescription>
            View and manage all your customer accounts in one place.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-2 pb-4">
            <div className="relative flex-1">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search customers..."
                className="pl-8"
              />
            </div>
            <Button variant="outline">Filters</Button>
          </div>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Customer</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Plan</TableHead>
                  <TableHead>Joined</TableHead>
                  <TableHead className="text-right">Value</TableHead>
                  <TableHead className="w-[50px]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {customers.map((customer) => (
                  <TableRow key={customer.id}>
                    <TableCell>
                      <div className="font-medium">{customer.name}</div>
                      <div className="text-sm text-muted-foreground">
                        {customer.email}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div
                        className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                          customer.status === "Active"
                            ? "bg-emerald-100 text-emerald-800"
                            : "bg-amber-100 text-amber-800"
                        }`}
                      >
                        {customer.status}
                      </div>
                    </TableCell>
                    <TableCell>{customer.plan}</TableCell>
                    <TableCell>{customer.joined}</TableCell>
                    <TableCell className="text-right font-medium">
                      {customer.value}
                    </TableCell>
                    <TableCell>
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <MoreHorizontal className="h-4 w-4" />
                        <span className="sr-only">Actions</span>
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
          <div className="flex items-center justify-end space-x-2 py-4">
            <div className="text-sm text-muted-foreground">
              Showing <strong>1-7</strong> of <strong>100</strong> customers
            </div>
            <Button variant="outline" size="sm" disabled>
              Previous
            </Button>
            <Button variant="outline" size="sm">
              Next
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
