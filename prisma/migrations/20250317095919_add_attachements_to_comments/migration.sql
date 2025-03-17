-- AlterTable
ALTER TABLE "TicketAttachment" ADD COLUMN     "ticketCommentId" TEXT;

-- AddForeignKey
ALTER TABLE "TicketAttachment" ADD CONSTRAINT "TicketAttachment_ticketCommentId_fkey" FOREIGN KEY ("ticketCommentId") REFERENCES "TicketComment"("id") ON DELETE CASCADE ON UPDATE CASCADE;
