// Email configuration interface
export interface EmailConfig {
  clientId: string;
  clientSecret: string;
  tenantId: string;
  fromEmail: string;
  fromName: string;
}

// Email template interface
export interface EmailTemplate {
  subject: string;
  htmlBody: string;
  textBody: string;
}

// Email data interface
export interface EmailData {
  to: string[];
  cc?: string[];
  bcc?: string[];
  subject: string;
  htmlBody: string;
  textBody: string;
  attachments?: Array<{
    name: string;
    content: string; // base64 encoded
    contentType: string;
  }>;
}

class EmailService {
  private config: EmailConfig | null = null;

  constructor() {
    this.loadConfig();
  }

  private loadConfig() {
    // Load configuration from environment variables or config file
    this.config = {
      clientId: import.meta.env.VITE_AZURE_CLIENT_ID || "",
      clientSecret: import.meta.env.VITE_AZURE_CLIENT_SECRET || "",
      tenantId: import.meta.env.VITE_AZURE_TENANT_ID || "",
      fromEmail: import.meta.env.VITE_FROM_EMAIL || "noreply@buagroup.com",
      fromName: import.meta.env.VITE_FROM_NAME || "BUA Asset Management",
    };
  }

  async sendEmail(emailData: EmailData): Promise<boolean> {
    try {
      if (!this.config) {
        throw new Error("Email configuration not loaded");
      }

      const message = {
        message: {
          subject: emailData.subject,
          body: {
            contentType: "HTML" as const,
            content: emailData.htmlBody,
          },
          toRecipients: emailData.to.map((email) => ({
            emailAddress: {
              address: email,
            },
          })),
          ccRecipients: emailData.cc?.map((email) => ({
            emailAddress: {
              address: email,
            },
          })),
          bccRecipients: emailData.bcc?.map((email) => ({
            emailAddress: {
              address: email,
            },
          })),
          attachments: emailData.attachments?.map((attachment) => ({
            "@odata.type": "#microsoft.graph.fileAttachment",
            name: attachment.name,
            contentType: attachment.contentType,
            contentBytes: attachment.content,
          })),
        },
        saveToSentItems: true,
      };

      // Route through backend proxy to avoid CORS and keep secrets server-side
      const resp = await fetch("/api/send-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message }),
      });

      if (!resp.ok) {
        const text = await resp.text();
        throw new Error(`Proxy send failed: ${text}`);
      }

      console.log("Email sent successfully");
      return true;
    } catch (error) {
      console.error("Error sending email:", error);
      return false;
    }
  }

  // Email templates
  getLowStockAlertTemplate(
    items: Array<{
      itemName: string;
      currentQuantity: number;
      reorderPoint: number;
      category: string;
    }>
  ): EmailTemplate {
    const itemsList = items
      .map(
        (item) =>
          `<tr>
        <td style="padding: 12px; border-bottom: 1px solid #e5e7eb; color: #374151;">${item.itemName}</td>
        <td style="padding: 12px; border-bottom: 1px solid #e5e7eb; color: #374151;">${item.category}</td>
        <td style="padding: 12px; border-bottom: 1px solid #e5e7eb; color: #dc2626; font-weight: 600;">${item.currentQuantity}</td>
        <td style="padding: 12px; border-bottom: 1px solid #e5e7eb; color: #374151;">${item.reorderPoint}</td>
      </tr>`
      )
      .join("");

    const htmlBody = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <style>
          body { 
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; 
            margin: 0; 
            padding: 0; 
            background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
            line-height: 1.6;
          }
          .email-container { 
            max-width: 600px; 
            margin: 20px auto; 
            background-color: #ffffff; 
            border-radius: 12px; 
            overflow: hidden;
            box-shadow: 0 8px 32px rgba(0,0,0,0.1);
          }
          .header { 
            background-color: #dc2626;
            color: #ffffff; 
            padding: 20px; 
            text-align: center;
          }
          .header-content { 
            text-align: center;
          }
          .bua-group {
            color: #ffffff;
            font-size: 22px;
            font-weight: 900;
            margin: 0 0 10px 0;
            text-align: center;
            text-transform: uppercase;
            letter-spacing: 4px;
            font-family: Arial, sans-serif;
            text-shadow: 0 2px 4px rgba(0,0,0,0.3);
          }
          .header h1 {
            color: #fbbf24;
            font-size: 16px;
            font-weight: 700;
            margin: 0 0 8px 0;
            text-align: center;
          }
          .header .subtitle {
            color: rgba(255,255,255,0.9);
            font-size: 12px;
            font-weight: 600;
            margin: 8px 0 0 0;
            text-transform: uppercase;
            letter-spacing: 0.5px;
            text-align: center;
          }
          .alert-icon {
            font-size: 20px;
            margin-right: 8px;
            filter: drop-shadow(0 2px 4px rgba(0,0,0,0.2));
          }
          .content { 
            padding: 35px 25px; 
            background-color: #ffffff;
          }
          .greeting { 
            font-size: 18px; 
            color: #1f2937; 
            margin-bottom: 25px; 
            font-weight: 500;
          }
          .alert-card { 
            background: linear-gradient(135deg, #fef2f2 0%, #fee2e2 100%);
            border: 2px solid #fecaca;
            border-radius: 12px; 
            padding: 25px; 
            margin: 25px 0;
            position: relative;
            overflow: hidden;
          }
          .alert-card::before {
            content: '';
            position: absolute;
            top: 0;
            left: 0;
            width: 4px;
            height: 100%;
            background: linear-gradient(180deg, #dc2626 0%, #b91c1c 100%);
          }
          .alert-title {
            font-size: 20px;
            font-weight: 600;
            color: #dc2626;
            margin: 0 0 20px 0;
            display: flex;
            align-items: center;
          }
          .alert-title::before {
            content: '⚠️';
            margin-right: 10px;
            font-size: 24px;
          }
          table { 
            width: 100%; 
            border-collapse: collapse; 
            margin: 20px 0;
            background-color: #ffffff;
            border-radius: 8px;
            overflow: hidden;
            box-shadow: 0 2px 8px rgba(0,0,0,0.1);
          }
          th { 
            background-color: #dc2626;
            color: #ffffff;
            padding: 15px 12px; 
            text-align: left;
            font-weight: 600;
            font-size: 14px;
            text-transform: uppercase;
            letter-spacing: 0.5px;
          }
          td { 
            padding: 12px; 
            border-bottom: 1px solid #e5e7eb;
            color: #374151;
          }
          tr:nth-child(even) {
            background-color: #f9fafb;
          }
          tr:hover {
            background-color: #f3f4f6;
          }
          .low-stock {
            color: #dc2626;
            font-weight: 600;
          }
          .action-section {
            background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%);
            border: 1px solid #f59e0b;
            border-radius: 10px;
            padding: 20px;
            margin: 25px 0;
            text-align: center;
          }
          .action-text {
            color: #92400e;
            font-size: 16px;
            font-weight: 500;
            margin: 0;
          }
          .footer { 
            background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
            padding: 25px; 
            border-top: 1px solid #e2e8f0; 
            color: #64748b; 
            font-size: 14px;
            text-align: center;
          }
          .footer-brand {
            color: #dc2626;
            font-weight: 600;
            font-size: 16px;
            margin-bottom: 8px;
          }
          .footer-details {
            font-size: 13px;
            opacity: 0.8;
          }
          .bua-logo {
            display: inline-block;
            width: 24px;
            height: 24px;
            background: linear-gradient(135deg, #dc2626 0%, #b91c1c 100%);
            border-radius: 4px;
            margin-right: 8px;
            vertical-align: middle;
          }
          .bua-group {
            color: #dc2626 !important;
            background-color: #ffffff !important;
            font-size: 18px;
            font-weight: 700;
            margin: 0 0 15px 0;
            text-align: center;
            text-transform: uppercase;
            letter-spacing: 2px;
            text-shadow: 0 2px 4px rgba(255,255,255,0.6);
            -webkit-text-stroke: 0.5px #dc2626; /* improves visibility */
          }

          @media (max-width: 600px) {
            .email-container { margin: 10px; }
            .header h1 {
            color: #dc2626;
            font-size: 20px;
            font-weight: 700;
            margin: 0 0 10px 0;
            text-align: center;
          }
            .content { padding: 25px 20px; }
            table { font-size: 14px; }
            th, td { padding: 10px 8px; }
          }
          /* Dark mode styles */
          @media (prefers-color-scheme: dark) {
            body { 
              background-color: #1f2937;
              color: #f9fafb;
            }
            
            .email-container { 
              background-color: #374151;
              border: 1px solid #4b5563;
            }
            
            .header { 
              background-color: #dc2626;
            }
            
            .bua-group {
              color:rgb(255, 255, 255);
            }
            
            .header h1 {
              color: #fca5a5;
            }
            
            .header p {
              color:rgb(255, 255, 255);
            }
            
            .content { 
              background-color: #374151;
            }
            
            .greeting { 
              color: #f9fafb;
            }
            
            .alert-card { 
              background-color: #4c1d1d;
              border: 1px solid #7f1d1d;
            }
            
            .alert-title {
              color: #fca5a5;
            }
            
            .alert-message {
              color: #f9fafb;
            }
            
            .footer { 
              background-color: #1f2937;
              border-top: 1px solid #4b5563;
              color: #9ca3af;
            }
            
            .footer-brand {
              color: #fca5a5;
            }
            
            .bua-logo {
              background-color: #fca5a5;
            }
            
            /* Table dark mode */
            table {
              background-color: #4b5563;
            }
            
            th {
              background-color: #374151;
              color: #f9fafb;
            }
            
            td {
              background-color: #4b5563;
              color: #f9fafb;
              border-bottom-color: #6b7280;
            }
          }
        </style>
      </head>
        <meta name="color-scheme" content="light dark">
        <meta name="supported-color-schemes" content="light dark">
      <body>
        <div class="email-container">
          <div class="header">
            <div class="header-content">
              <p class="bua-group" style="color:#dc2626; background-color:#ffffff;">BUA GROUP</p>
              <h1>
                <span class="alert-icon">⚠️</span>
                Low Stock Alert
              </h1>
              <p class="subtitle">Asset Management System Notification</p>
            </div>
          </div>
          
          <div class="content">
            <p class="greeting">Dear Store Manager,</p>
            
            <p style="color: #374151; font-size: 16px; margin-bottom: 25px;">
              The following consumable items are running low on stock and require immediate attention:
            </p>
            
            <div class="alert-card">
              <h3 class="alert-title">Items Requiring Reorder</h3>
              
              <table>
                <thead>
                  <tr>
                    <th>Item Name</th>
                    <th>Category</th>
                    <th>Current Stock</th>
                    <th>Reorder Point</th>
                  </tr>
                </thead>
                <tbody>
                  ${itemsList}
                </tbody>
              </table>
            </div>
            
            <div class="action-section">
              <p class="action-text">
                <strong>Action Required:</strong> Please reorder these items as soon as possible to avoid stockouts.
              </p>
            </div>
            
            <p style="color: #374151; font-size: 16px; margin-top: 25px;">
              You can view the full inventory and place orders through the BUA Asset Management System.
            </p>
          </div>
          
          <div class="footer">
            <div class="footer-brand">
              <span class="bua-logo"></span>
              BUA Asset Management System
            </div>
            <div class="footer-details">
              <p>This is an automated alert from the BUA Asset Management System</p>
              <p>Generated on: ${new Date().toLocaleString("en-US", {
                weekday: "long",
                year: "numeric",
                month: "long",
                day: "numeric",
                hour: "2-digit",
                minute: "2-digit",
              })}</p>
            </div>
          </div>
        </div>
      </body>
      </html>
    `;

    const textBody = `
LOW STOCK ALERT - BUA Asset Management System
============================================

Dear Store Manager,

The following consumable items are running low on stock and require immediate attention:

ITEMS REQUIRING REORDER:
------------------------
${items
  .map(
    (item) =>
      `• ${item.itemName} (${item.category})
  Current Stock: ${item.currentQuantity}
  Reorder Point: ${item.reorderPoint}`
  )
  .join("\n\n")}

ACTION REQUIRED:
----------------
Please reorder these items as soon as possible to avoid stockouts.

You can view the full inventory and place orders through the BUA Asset Management System.

---
This is an automated alert from the BUA Asset Management System.
Generated on: ${new Date().toLocaleString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })}
    `;

    return {
      subject: `Low Stock Alert - ${items.length} items need reordering`,
      htmlBody,
      textBody,
    };
  }

  getAssetAllocationTemplate(assetData: {
    assetTag: string;
    itemName: string;
    serialNumber: string;
    assignedUser: string;
    department: string;
    allocatedBy: string;
  }): EmailTemplate {
    // Extract name from email or use email if no name found
    const getUserDisplayName = (email: string) => {
      if (!email) return "User";
      // Try to extract name from email (e.g., "john.doe@company.com" -> "John Doe")
      const emailPart = email.split("@")[0];
      const nameParts = emailPart.split(/[._-]/);
      if (nameParts.length >= 2) {
        return nameParts
          .map(
            (part) => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase()
          )
          .join(" ");
      }
      // If no clear name pattern, capitalize first part
      return (
        emailPart.charAt(0).toUpperCase() + emailPart.slice(1).toLowerCase()
      );
    };

    const userDisplayName = getUserDisplayName(assetData.assignedUser);
    const htmlBody = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <style>
          /* Outlook-specific styles */
          .ExternalClass { width: 100%; }
          .ExternalClass, .ExternalClass p, .ExternalClass span, .ExternalClass font, .ExternalClass td, .ExternalClass div { line-height: 100%; }
          
          /* Light mode styles (default) */
          
          body { 
            margin: 0; 
            padding: 0; 
            background-color: #f8fafc;
            font-family: Arial, sans-serif; 
            color: #111827;
            line-height: 1.5;
          }
          
          .email-container { 
            max-width: 500px; 
            margin: 15px auto; 
            background-color: #ffffff; 
            border-radius: 12px; 
            overflow: hidden;
            border: 1px solid #e5e7eb;
          }
          
          .header { 
            background-color: #dc2626;
            color: #ffffff; 
            padding: 20px; 
            text-align: center;
          }
          
          .header::before {
            content: '';
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><defs><pattern id="grain" width="100" height="100" patternUnits="userSpaceOnUse"><circle cx="25" cy="25" r="1" fill="rgba(255,255,255,0.1)"/><circle cx="75" cy="75" r="1" fill="rgba(255,255,255,0.1)"/><circle cx="50" cy="10" r="0.5" fill="rgba(255,255,255,0.1)"/></pattern></defs><rect width="100" height="100" fill="url(%23grain)"/></svg>');
            opacity: 0.3;
          }
          
          .header-content { 
            position: relative; 
            z-index: 1; 
          }
          
          .bua-group {
            color: #dc2626;
            font-size: 18px;
            font-weight: bold;
            margin: 0 0 8px 0;
            text-align: center;
            text-transform: uppercase;
            letter-spacing: 2px;
            font-family: Arial, sans-serif;
          }
          
          .header-title {
            color: #dc2626;
            font-size: 16px;
            font-weight: bold;
            margin: 0 0 6px 0;
            text-align: center;
          }
          
          .header-subtitle {
            color: #dc2626;
            font-size: 12px;
            font-weight: bold;
            margin: 0;
            text-align: center;
            text-transform: uppercase;
            letter-spacing: 0.5px;
          }
          
          .content { 
            padding: 20px; 
            background-color: #ffffff;
          }
          
          .greeting { 
            font-size: 16px; 
            color: #111827; 
            margin-bottom: 15px; 
            font-weight: bold;
          }
          
          .allocation-card { 
            background-color: #fef2f2;
            border: 1px solid #fecaca;
            border-radius: 10px; 
            padding: 15px; 
            margin: 15px 0;
            border-left: 3px solid #dc2626;
          }
          
          .allocation-card::before {
            content: '';
            position: absolute;
            top: 0;
            left: 0;
            width: 4px;
            height: 100%;
            background: linear-gradient(180deg, var(--bua-red) 0%, var(--bua-red-dark) 100%);
          }
          
          .allocation-title {
            font-size: 16px;
            font-weight: bold;
            color: #dc2626;
            margin: 0 0 12px 0;
          }
          
          .allocation-title::before {
            content: '📦';
            font-size: 24px;
          }
          
          .info-grid {
            margin: 12px 0;
          }
          
          .info-item {
            background-color: #ffffff;
            border: 1px solid #e5e7eb;
            border-radius: 8px;
            padding: 10px;
            margin: 5px 0;
          }
          
          .info-label {
            font-size: 10px;
            color: #6b7280;
            text-transform: uppercase;
            letter-spacing: 0.3px;
            font-weight: bold;
            margin-bottom: 3px;
            display: block;
          }
          
          .info-value {
            font-size: 13px;
            font-weight: bold;
            color: #111827;
            display: block;
          }
          
          .asset-tag {
            background-color: #dc2626;
            color: white;
            padding: 6px 12px;
            border-radius: 15px;
            font-weight: bold;
            font-size: 12px;
            display: inline-block;
            margin: 8px 0;
            text-transform: uppercase;
            letter-spacing: 0.5px;
          }
          
          .action-section {
            background-color: #fef3c7;
            border: 1px solid #fbbf24;
            border-radius: 8px;
            padding: 12px;
            margin: 15px 0;
            text-align: center;
          }
          
          .action-text {
            color: #92400e;
            font-size: 13px;
            font-weight: bold;
            margin: 0;
          }
          
          .footer { 
            background-color: #f8fafc;
            padding: 15px; 
            border-top: 1px solid #e5e7eb; 
            color: #6b7280; 
            font-size: 12px;
            text-align: center;
          }
          
          .footer-brand {
            color: #dc2626;
            font-weight: bold;
            font-size: 14px;
            margin-bottom: 8px;
          }
          
          .bua-logo {
            display: inline-block;
            width: 20px;
            height: 20px;
            background-color: #dc2626;
            border-radius: 3px;
            vertical-align: middle;
          }
          
          .footer-details {
            font-size: 11px;
            margin-top: 8px;
          }
          
          /* Dark mode styles */
          @media (prefers-color-scheme: dark) {
            body { 
              background-color: #1f2937;
              color: #f9fafb;
            }
            
            .email-container { 
              background-color: #374151;
              border: 1px solid #4b5563;
            }
            
            .bua-group {
              color: #fca5a5;
            }
            
            .header-title {
              color: #fca5a5;
            }
            
            .header-subtitle {
              color: #fca5a5;
            }
            
            .content { 
              background-color: #374151;
            }
            
            .greeting { 
              color: #f9fafb;
            }
            
            .allocation-card { 
              background-color: #4c1d1d;
              border: 1px solid #7f1d1d;
              border-left: 3px solid #dc2626;
            }
            
            .allocation-title {
              color: #fca5a5;
            }
            
            .info-item {
              background-color: #4b5563;
              border: 1px solid #6b7280;
            }
            
            .info-label {
              color: #9ca3af;
            }
            
            .info-value {
              color: #f9fafb;
            }
            
            .action-section {
              background-color: #451a03;
              border: 1px solid #d97706;
            }
            
            .action-text {
              color: #fbbf24;
            }
            
            .footer { 
              background-color: #1f2937;
              border-top: 1px solid #4b5563;
              color: #9ca3af;
            }
            
            .footer-brand {
              color: #fca5a5;
            }
            
            .bua-logo {
              background-color: #fca5a5;
            }
          }
        </style>
      </head>
      <body>
        <div class="email-container">
          <div class="header">
            <div class="header-content">
              <div class="bua-group">BUA GROUP</div>
              <div class="header-title">
                <span>📦</span>
                Asset Allocated
              </div>
              <div class="header-subtitle">Asset Management System Notification</div>
            </div>
          </div>
          
          <div class="content">
            <p class="greeting">Dear ${userDisplayName},</p>
            
            <p style="color: var(--text-primary); font-size: 16px; margin-bottom: 25px;">
              Great news! A new asset has been allocated to you from our IT inventory.
            </p>
            
            <div class="allocation-card">
              <h3 class="allocation-title">Asset Allocation Details</h3>
              
              <div class="asset-tag">${assetData.assetTag}</div>
              
              <div class="info-grid">
                <div class="info-item">
                  <span class="info-label">Asset Name</span>
                  <span class="info-value">${assetData.itemName}</span>
                </div>
                <div class="info-item">
                  <span class="info-label">Serial Number</span>
                  <span class="info-value">${assetData.serialNumber}</span>
                </div>
                <div class="info-item">
                  <span class="info-label">Department</span>
                  <span class="info-value">${assetData.department}</span>
                </div>
                <div class="info-item">
                  <span class="info-label">Allocated By</span>
                  <span class="info-value">${assetData.allocatedBy}</span>
                </div>
                <div class="info-item">
                  <span class="info-label">Allocation Date</span>
                  <span class="info-value">${new Date().toLocaleDateString(
                    "en-US",
                    {
                      weekday: "long",
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    }
                  )}</span>
                </div>
                <div class="info-item">
                  <span class="info-label">Time</span>
                  <span class="info-value">${new Date().toLocaleTimeString(
                    "en-US",
                    {
                      hour: "2-digit",
                      minute: "2-digit",
                    }
                  )}</span>
                </div>
              </div>
            </div>
            
            <div class="action-section">
              <p class="action-text">
                <strong>Important:</strong> Please use this asset responsibly and report any issues immediately to the IT department.
              </p>
            </div>
            
            <p style="color: var(--text-primary); font-size: 16px; margin-top: 25px;">
              You can view your allocated assets and submit support requests through the BUA Asset Management System.
            </p>
          </div>
          
          <div class="footer">
            <div class="footer-brand">
              <span class="bua-logo"></span>
              BUA Asset Management System
            </div>
            <div class="footer-details">
              <p>This notification was automatically generated</p>
              <p>Generated on: ${new Date().toLocaleString("en-US", {
                weekday: "long",
                year: "numeric",
                month: "long",
                day: "numeric",
                hour: "2-digit",
                minute: "2-digit",
              })}</p>
            </div>
          </div>
        </div>
      </body>
      </html>
    `;

    const textBody = `
ASSET ALLOCATED - BUA Asset Management System
=============================================

Dear ${userDisplayName},

Great news! A new asset has been allocated to you from our IT inventory.

ALLOCATION DETAILS:
-------------------
Asset Tag: ${assetData.assetTag}
Asset Name: ${assetData.itemName}
Serial Number: ${assetData.serialNumber}
Department: ${assetData.department}
Allocated By: ${assetData.allocatedBy}
Allocation Date: ${new Date().toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    })}
Time: ${new Date().toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
    })}

IMPORTANT:
----------
Please use this asset responsibly and report any issues immediately to the IT department.

You can view your allocated assets and submit support requests through the BUA Asset Management System.

---
This notification was automatically generated by the BUA Asset Management System.
Generated on: ${new Date().toLocaleString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })}
    `;

    return {
      subject: `Asset Allocated - ${assetData.itemName} (${assetData.assetTag})`,
      htmlBody,
      textBody,
    };
  }

  getConsumableIssueTemplate(issueData: {
    itemName: string;
    quantity: number;
    issuedTo: string;
    department: string;
    issuedBy: string;
    reason?: string;
  }): EmailTemplate {
    // Extract name from email or use email if no name found
    const getUserDisplayName = (email: string) => {
      if (!email) return "User";
      // Try to extract name from email (e.g., "john.doe@company.com" -> "John Doe")
      const emailPart = email.split("@")[0];
      const nameParts = emailPart.split(/[._-]/);
      if (nameParts.length >= 2) {
        return nameParts
          .map(
            (part) => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase()
          )
          .join(" ");
      }
      // If no clear name pattern, capitalize first part
      return (
        emailPart.charAt(0).toUpperCase() + emailPart.slice(1).toLowerCase()
      );
    };

    const userDisplayName = getUserDisplayName(issueData.issuedTo);
    const htmlBody = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <!--[if mso]>
        <noscript>
          <xml>
            <o:OfficeDocumentSettings>
              <o:AllowPNG/>
              <o:PixelsPerInch>96</o:PixelsPerInch>
            </o:OfficeDocumentSettings>
          </xml>
        </noscript>
        <![endif]-->
        <style>
          /* Outlook-specific styles */
          .ExternalClass { width: 100%; }
          .ExternalClass, .ExternalClass p, .ExternalClass span, .ExternalClass font, .ExternalClass td, .ExternalClass div { line-height: 100%; }
          
          /* Light mode styles (default) */
          body { 
            margin: 0; 
            padding: 0; 
            background-color: #f8fafc;
            font-family: Arial, sans-serif; 
            color: #111827;
            line-height: 1.5;
          }
          
          table { border-collapse: collapse; }
          
          .email-container { 
            max-width: 500px; 
            margin: 15px auto; 
            background-color: #ffffff; 
            border-radius: 12px; 
            overflow: hidden;
            border: 1px solid #e5e7eb;
          }
          
          .header { 
            background-color: #dc2626;
            color: #ffffff; 
            padding: 20px; 
            text-align: center;
          }
          
          .bua-group {
            color: #ffffff;
            font-size: 18px;
            font-weight: bold;
            margin: 0 0 8px 0;
            text-align: center;
            text-transform: uppercase;
            letter-spacing: 2px;
            font-family: Arial, sans-serif;
          }
          
          .header-title {
            color: #fbbf24;
            font-size: 16px;
            font-weight: bold;
            margin: 0 0 6px 0;
            text-align: center;
          }
          
          .header-subtitle {
            color: rgba(255,255,255,0.9);
            font-size: 12px;
            font-weight: bold;
            margin: 0;
            text-align: center;
            text-transform: uppercase;
            letter-spacing: 0.5px;
          }
          
          .content { 
            padding: 20px; 
            background-color: #ffffff;
          }
          
          .greeting { 
            font-size: 16px; 
            color: #111827; 
            margin-bottom: 15px; 
            font-weight: bold;
          }
          
          .issue-card { 
            background-color: #fef2f2;
            border: 1px solid #fecaca;
            border-radius: 10px; 
            padding: 15px; 
            margin: 15px 0;
            border-left: 3px solid #dc2626;
          }
          
          .issue-title {
            font-size: 16px;
            font-weight: bold;
            color: #dc2626;
            margin: 0 0 12px 0;
          }
          
          .info-grid {
            margin: 12px 0;
          }
          
          .info-item {
            background-color: #ffffff;
            border: 1px solid #e5e7eb;
            border-radius: 8px;
            padding: 10px;
            margin: 5px 0;
          }
          
          .info-label {
            font-size: 10px;
            color: #6b7280;
            text-transform: uppercase;
            letter-spacing: 0.3px;
            font-weight: bold;
            margin-bottom: 3px;
            display: block;
          }
          
          .info-value {
            font-size: 13px;
            font-weight: bold;
            color: #111827;
            display: block;
          }
          
          .quantity-badge {
            background-color: #dc2626;
            color: white;
            padding: 6px 12px;
            border-radius: 15px;
            font-weight: bold;
            font-size: 12px;
            display: inline-block;
            margin: 8px 0;
            text-transform: uppercase;
            letter-spacing: 0.5px;
          }
          
          .action-section {
            background-color: #fef3c7;
            border: 1px solid #fbbf24;
            border-radius: 8px;
            padding: 12px;
            margin: 15px 0;
            text-align: center;
          }
          
          .action-text {
            color: #92400e;
            font-size: 13px;
            font-weight: bold;
            margin: 0;
          }
          
          .footer { 
            background-color: #f8fafc;
            padding: 15px; 
            border-top: 1px solid #e5e7eb; 
            color: #6b7280; 
            font-size: 12px;
            text-align: center;
          }
          
          .footer-brand {
            color: #dc2626;
            font-weight: bold;
            font-size: 14px;
            margin-bottom: 8px;
          }
          
          .bua-logo {
            display: inline-block;
            width: 20px;
            height: 20px;
            background-color: #dc2626;
            border-radius: 3px;
            vertical-align: middle;
          }
          
          .footer-details {
            font-size: 11px;
            margin-top: 8px;
          }
          
          /* Dark mode styles */
          @media (prefers-color-scheme: dark) {
            body { 
              background-color: #1f2937;
              color: #f9fafb;
            }
            
            .email-container { 
              background-color: #374151;
              border: 1px solid #4b5563;
            }
            
            .bua-group {
              color: #fca5a5;
            }
            
            .header-title {
              color: #fca5a5;
            }
            
            .header-subtitle {
              color: #fca5a5;
            }
            
            .content { 
              background-color: #374151;
            }
            
            .greeting { 
              color: #f9fafb;
            }
            
            .issue-card { 
              background-color: #4c1d1d;
              border: 1px solid #7f1d1d;
              border-left: 3px solid #dc2626;
            }
            
            .issue-title {
              color: #fca5a5;
            }
            
            .info-item {
              background-color: #4b5563;
              border: 1px solid #6b7280;
            }
            
            .info-label {
              color: #9ca3af;
            }
            
            .info-value {
              color: #f9fafb;
            }
            
            .action-section {
              background-color: #451a03;
              border: 1px solid #d97706;
            }
            
            .action-text {
              color: #fbbf24;
            }
            
            .footer { 
              background-color: #1f2937;
              border-top: 1px solid #4b5563;
              color: #9ca3af;
            }
            
            .footer-brand {
              color: #fca5a5;
            }
            
            .bua-logo {
              background-color: #fca5a5;
            }
          }
        </style>
      </head>
      <body>
        <div class="email-container">
          <div class="header">
            <div class="bua-group">BUA GROUP</div>
            <div class="header-title">
              📋 Consumable Issued
            </div>
            <div class="header-subtitle">Asset Management System Notification</div>
          </div>
          
          <div class="content">
            <p class="greeting">Dear ${userDisplayName},</p>
            
            <p style="color: #111827; font-size: 14px; margin-bottom: 15px;">
              The following consumable item has been issued to you from our inventory:
            </p>
            
            <div class="issue-card">
              <h3 class="issue-title">📋 Issue Details</h3>
              
              <div class="quantity-badge">Qty: ${issueData.quantity}</div>
              
              <div class="info-grid">
                <div class="info-item">
                  <span class="info-label">Item Name</span>
                  <span class="info-value">${issueData.itemName}</span>
                </div>
                <div class="info-item">
                  <span class="info-label">Quantity</span>
                  <span class="info-value">${issueData.quantity}</span>
                </div>
                <div class="info-item">
                  <span class="info-label">Department</span>
                  <span class="info-value">${issueData.department}</span>
                </div>
                <div class="info-item">
                  <span class="info-label">Issued By</span>
                  <span class="info-value">${issueData.issuedBy}</span>
                </div>
                <div class="info-item">
                  <span class="info-label">Issue Date</span>
                  <span class="info-value">${new Date().toLocaleDateString(
                    "en-US",
                    {
                      weekday: "short",
                      year: "numeric",
                      month: "short",
                      day: "numeric",
                    }
                  )}</span>
                </div>
                <div class="info-item">
                  <span class="info-label">Time</span>
                  <span class="info-value">${new Date().toLocaleTimeString(
                    "en-US",
                    {
                      hour: "2-digit",
                      minute: "2-digit",
                    }
                  )}</span>
                </div>
                ${
                  issueData.reason
                    ? `
                <div class="info-item" style="margin-top: 10px;">
                  <span class="info-label">Reason</span>
                  <span class="info-value">${issueData.reason}</span>
                </div>
                `
                    : ""
                }
              </div>
            </div>
            
            <div class="action-section">
              <p class="action-text">
                <strong>Important:</strong> Please use this consumable responsibly and report any issues immediately to the IT department.
              </p>
            </div>
          </div>
          
          <div class="footer">
            <div class="footer-brand">
              <!-- <span class="bua-logo"></span> -->
              BUA Asset Management System
            </div>
            <div class="footer-details">
              <p>This notification was automatically generated</p>
              <p>Generated on: ${new Date().toLocaleString("en-US", {
                weekday: "short",
                year: "numeric",
                month: "short",
                day: "numeric",
                hour: "2-digit",
                minute: "2-digit",
              })}</p>
            </div>
          </div>
        </div>
      </body>
      </html>
    `;

    const textBody = `
CONSUMABLE ISSUED - BUA Asset Management System
===============================================

Dear ${userDisplayName},

The following consumable item has been issued to you from our inventory:

ISSUE DETAILS:
--------------
Item Name: ${issueData.itemName}
Quantity: ${issueData.quantity}
Department: ${issueData.department}
Issued By: ${issueData.issuedBy}
Issue Date: ${new Date().toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    })}
Time: ${new Date().toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
    })}
${issueData.reason ? `Reason: ${issueData.reason}` : ""}

IMPORTANT:
----------
Please use this consumable responsibly and report any issues immediately to the IT department.

You can view your issued consumables and submit support requests through the BUA Asset Management System.

---
This notification was automatically generated by the BUA Asset Management System.
Generated on: ${new Date().toLocaleString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })}
    `;

    return {
      subject: `Consumable Issued - ${issueData.itemName} (Qty: ${issueData.quantity})`,
      htmlBody,
      textBody,
    };
  }
}

// Export singleton instance
export const emailService = new EmailService();
