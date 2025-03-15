import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Download } from "lucide-react";

// Sample invoice data
const invoices = [
  {
    id: "INV-001",
    date: "Jan 01, 2023",
    amount: "$99.00",
    status: "Paid",
  },
  {
    id: "INV-002",
    date: "Feb 01, 2023",
    amount: "$99.00",
    status: "Paid",
  },
  {
    id: "INV-003",
    date: "Mar 01, 2023",
    amount: "$99.00",
    status: "Paid",
  },
  {
    id: "INV-004",
    date: "Apr 01, 2023",
    amount: "$99.00",
    status: "Paid",
  },
  {
    id: "INV-005",
    date: "May 01, 2023",
    amount: "$99.00",
    status: "Paid",
  },
];

export default function BillingPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Billing</h2>
          <p className="text-muted-foreground">
            Manage your subscription and billing history.
          </p>
        </div>
        <Button>
          <Download className="mr-2 h-4 w-4" />
          Download All Invoices
        </Button>
      </div>

      {/* Current Plan */}
      <Card>
        <CardHeader>
          <CardTitle>Current Plan</CardTitle>
          <CardDescription>
            You are currently on the Business plan.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-baseline justify-between">
            <div>
              <span className="text-3xl font-bold">$99</span>
              <span className="text-muted-foreground">/month</span>
            </div>
            <Badge>Active</Badge>
          </div>
          <div className="mt-4 space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span>Billing period</span>
              <span className="font-medium">Monthly</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span>Next payment</span>
              <span className="font-medium">June 1, 2023</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span>Team members</span>
              <span className="font-medium">12 / 20</span>
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex justify-between">
          <Button variant="outline">Change Plan</Button>
          <Button variant="destructive">Cancel Subscription</Button>
        </CardFooter>
      </Card>

      {/* Billing History */}
      <Card>
        <CardHeader>
          <CardTitle>Billing History</CardTitle>
          <CardDescription>
            View and download your past invoices.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Invoice</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {invoices.map((invoice) => (
                <TableRow key={invoice.id}>
                  <TableCell className="font-medium">{invoice.id}</TableCell>
                  <TableCell>{invoice.date}</TableCell>
                  <TableCell>{invoice.amount}</TableCell>
                  <TableCell>
                    <Badge
                      variant="outline"
                      className="bg-emerald-50 text-emerald-700 hover:bg-emerald-50 hover:text-emerald-700"
                    >
                      {invoice.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="sm">
                      <Download className="mr-2 h-4 w-4" />
                      Download
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
