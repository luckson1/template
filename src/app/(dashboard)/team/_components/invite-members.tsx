"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { OrganizationRole } from "@prisma/client";
import { api } from "@/trpc/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { X, LinkIcon, Send } from "lucide-react";
import {
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { z } from "zod";

const inviteFormSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  role: z.enum(["MEMBER", "ADMIN"]).default("MEMBER"),
  message: z.string().optional(),
});

type InviteFormData = z.infer<typeof inviteFormSchema>;

interface InviteMembersProps {
  organizationId: string;
  onInviteSent?: () => void;
}

export default function InviteMembers({
  organizationId,
  onInviteSent,
}: InviteMembersProps) {
  const router = useRouter();
  const [invitees, setInvitees] = useState<
    { email: string; role: OrganizationRole }[]
  >([]);
  const [currentEmail, setCurrentEmail] = useState("");
  const [currentRole, setCurrentRole] = useState<OrganizationRole>("MEMBER");
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const invite = api.organization.invite.useMutation({
    onSuccess: () => {
      toast.success("Invitation sent successfully");
      router.refresh();
      if (onInviteSent) {
        onInviteSent();
      }
    },
    onError: (error) => {
      toast.error(error.message || "Failed to send invitation");
      setIsSubmitting(false);
    },
  });

  const handleAddInvitee = () => {
    if (!currentEmail) return;

    // Validate email
    if (!z.string().email().safeParse(currentEmail).success) {
      toast.error("Please enter a valid email address");
      return;
    }

    if (invitees.some((i) => i.email === currentEmail)) {
      toast.error("This email has already been added to the invitation list");
      return;
    }

    setInvitees([...invitees, { email: currentEmail, role: currentRole }]);
    setCurrentEmail("");
  };

  const handleRemoveInvitee = (email: string) => {
    setInvitees(invitees.filter((i) => i.email !== email));
  };

  const handleSendInvites = async () => {
    if (invitees.length === 0) {
      toast.error("Please add at least one email address");
      return;
    }

    setIsSubmitting(true);

    try {
      // Send invitations sequentially
      for (const invitee of invitees) {
        await invite.mutateAsync({
          email: invitee.email,
          role: invitee.role,
        });
      }

      // Clear the form
      setInvitees([]);
      setMessage("");
    } catch (error) {
      console.error("Error sending invitations:", error);
    }
  };

  const getRoleLabel = (role: OrganizationRole) => {
    switch (role) {
      case "ADMIN":
        return "Admin";
      case "MEMBER":
        return "Member";
      case "OWNER":
        return "Owner";
      default:
        return "Member";
    }
  };

  return (
    <div className="space-y-4">
      <DialogHeader>
        <DialogTitle className="text-xl font-bold">Invite people</DialogTitle>
        <DialogDescription>
          Invite team members to collaborate on your project
        </DialogDescription>
      </DialogHeader>

      <div className="space-y-4 pt-4">
        <div className="flex gap-2">
          <div className="flex-1">
            <Label htmlFor="email" className="sr-only">
              Email
            </Label>
            <Input
              id="email"
              placeholder="Enter email address"
              type="email"
              value={currentEmail}
              onChange={(e) => setCurrentEmail(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  handleAddInvitee();
                }
              }}
            />
          </div>
          <Select
            value={currentRole}
            onValueChange={(value) => setCurrentRole(value as OrganizationRole)}
          >
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder="Select role" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="MEMBER">Member</SelectItem>
              <SelectItem value="ADMIN">Admin</SelectItem>
            </SelectContent>
          </Select>
          <Button onClick={handleAddInvitee}>Add</Button>
        </div>

        {invitees.length > 0 && (
          <div className="space-y-2">
            <Label>People to invite</Label>
            <div className="flex flex-wrap gap-2">
              {invitees.map((invitee) => (
                <div
                  key={invitee.email}
                  className="flex items-center gap-2 rounded-full bg-secondary py-1 pl-1 pr-2"
                >
                  <Avatar className="h-6 w-6">
                    <AvatarFallback className="text-xs">
                      {invitee.email.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex flex-col">
                    <span className="text-sm">{invitee.email}</span>
                    <span className="text-xs text-muted-foreground">
                      {getRoleLabel(invitee.role)}
                    </span>
                  </div>
                  <button
                    onClick={() => handleRemoveInvitee(invitee.email)}
                    className="text-muted-foreground hover:text-foreground"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="space-y-2">
          <Label htmlFor="message">Message (optional)</Label>
          <Textarea
            id="message"
            placeholder="Do you want to include any note to them?"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            className="min-h-[100px]"
          />
        </div>
      </div>

      <div className="flex items-center justify-between pt-4">
        <Button
          variant="outline"
          className="gap-2"
          onClick={() => {
            const inviteLink = `${window.location.origin}/organization/${organizationId}/join`;
            navigator.clipboard
              .writeText(inviteLink)
              .then(() => {
                toast.success(
                  "Organization join link copied to clipboard. Share it with potential members.",
                );
              })
              .catch(() => {
                toast.error("Failed to copy link. Please try again.");
              });
          }}
        >
          <LinkIcon className="h-4 w-4" />
          Copy link
        </Button>
        <Button
          onClick={handleSendInvites}
          disabled={invitees.length === 0 || isSubmitting}
          className="gap-2 bg-[#6C5DD3] hover:bg-[#5A4CBF]"
        >
          <Send className="h-4 w-4" />
          {isSubmitting ? "Sending..." : "Send invitations"}
        </Button>
      </div>
    </div>
  );
}
