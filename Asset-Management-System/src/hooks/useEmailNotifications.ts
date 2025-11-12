import { useState, useCallback } from "react";
import { emailService } from "../services/emailService";
import type { EmailData } from "../services/emailService";
import type { Consumable } from "../types/inventory";

interface EmailNotificationHook {
  sendLowStockAlert: (
    items: Consumable[],
    recipients: string[]
  ) => Promise<boolean>;
  sendAssetAllocationNotification: (
    assetData: {
      assetTag: string;
      itemName: string;
      serialNumber: string;
      assignedUser: string;
      department: string;
      allocatedBy: string;
    },
    recipientEmail: string
  ) => Promise<boolean>;
  sendConsumableIssueNotification: (
    issueData: {
      itemName: string;
      quantity: number;
      issuedTo: string;
      department: string;
      issuedBy: string;
      reason?: string;
    },
    recipientEmail: string
  ) => Promise<boolean>;
  sendCustomEmail: (emailData: EmailData) => Promise<boolean>;
  isSending: boolean;
  error: string | null;
}

export const useEmailNotifications = (): EmailNotificationHook => {
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const sendLowStockAlert = useCallback(
    async (items: Consumable[], recipients: string[]): Promise<boolean> => {
      if (items.length === 0 || recipients.length === 0) {
        setError("No items or recipients provided");
        return false;
      }

      setIsSending(true);
      setError(null);

      try {
        const lowStockItems = items.filter(
          (item) => item.currentQuantity <= item.reorderPoint
        );

        if (lowStockItems.length === 0) {
          setError("No low stock items found");
          return false;
        }

        const template = emailService.getLowStockAlertTemplate(
          lowStockItems.map((item) => ({
            itemName: item.itemName,
            currentQuantity: item.currentQuantity,
            reorderPoint: item.reorderPoint,
            category: item.category,
          }))
        );

        const emailData: EmailData = {
          to: recipients,
          subject: template.subject,
          htmlBody: template.htmlBody,
          textBody: template.textBody,
        };

        const success = await emailService.sendEmail(emailData);

        if (!success) {
          setError("Failed to send low stock alert email");
          return false;
        }

        return true;
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "Unknown error occurred";
        setError(`Failed to send low stock alert: ${errorMessage}`);
        return false;
      } finally {
        setIsSending(false);
      }
    },
    []
  );

  const sendAssetAllocationNotification = useCallback(
    async (
      assetData: {
        assetTag: string;
        itemName: string;
        serialNumber: string;
        assignedUser: string;
        department: string;
        allocatedBy: string;
      },
      recipientEmail: string
    ): Promise<boolean> => {
      if (!recipientEmail) {
        setError("Recipient email is required");
        return false;
      }

      setIsSending(true);
      setError(null);

      try {
        const template = emailService.getAssetAllocationTemplate(assetData);

        const emailData: EmailData = {
          to: [recipientEmail],
          subject: template.subject,
          htmlBody: template.htmlBody,
          textBody: template.textBody,
        };

        const success = await emailService.sendEmail(emailData);

        if (!success) {
          setError("Failed to send asset allocation notification");
          return false;
        }

        return true;
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "Unknown error occurred";
        setError(
          `Failed to send asset allocation notification: ${errorMessage}`
        );
        return false;
      } finally {
        setIsSending(false);
      }
    },
    []
  );

  const sendConsumableIssueNotification = useCallback(
    async (
      issueData: {
        itemName: string;
        quantity: number;
        issuedTo: string;
        department: string;
        issuedBy: string;
        reason?: string;
      },
      recipientEmail: string
    ): Promise<boolean> => {
      if (!recipientEmail) {
        setError("Recipient email is required");
        return false;
      }

      setIsSending(true);
      setError(null);

      try {
        const template = emailService.getConsumableIssueTemplate(issueData);

        const emailData: EmailData = {
          to: [recipientEmail],
          subject: template.subject,
          htmlBody: template.htmlBody,
          textBody: template.textBody,
        };

        const success = await emailService.sendEmail(emailData);

        if (!success) {
          setError("Failed to send consumable issue notification");
          return false;
        }

        return true;
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "Unknown error occurred";
        setError(
          `Failed to send consumable issue notification: ${errorMessage}`
        );
        return false;
      } finally {
        setIsSending(false);
      }
    },
    []
  );

  const sendCustomEmail = useCallback(
    async (emailData: EmailData): Promise<boolean> => {
      setIsSending(true);
      setError(null);

      try {
        const success = await emailService.sendEmail(emailData);

        if (!success) {
          setError("Failed to send custom email");
          return false;
        }

        return true;
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "Unknown error occurred";
        setError(`Failed to send custom email: ${errorMessage}`);
        return false;
      } finally {
        setIsSending(false);
      }
    },
    []
  );

  return {
    sendLowStockAlert,
    sendAssetAllocationNotification,
    sendConsumableIssueNotification,
    sendCustomEmail,
    isSending,
    error,
  };
};
