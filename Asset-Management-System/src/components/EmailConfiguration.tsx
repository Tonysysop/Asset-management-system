import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Switch } from "./ui/switch";
import { Separator } from "./ui/separator";
import { Mail, Settings, TestTube, CheckCircle, XCircle } from "lucide-react";
import { useEmailNotifications } from "../hooks/useEmailNotifications";

interface EmailConfig {
  enabled: boolean;
  lowStockAlerts: boolean;
  assetAllocations: boolean;
  consumableIssues: boolean;
  adminEmails: string[];
  testEmail: string;
}

const EmailConfiguration: React.FC = () => {
  const [config, setConfig] = useState<EmailConfig>({
    enabled: false,
    lowStockAlerts: true,
    assetAllocations: true,
    consumableIssues: true,
    adminEmails: ["admin@buagroup.com"],
    testEmail: "",
  });

  const [newEmail, setNewEmail] = useState("");
  const [loaded, setLoaded] = useState(false);
  const [testResult, setTestResult] = useState<"idle" | "success" | "error">(
    "idle"
  );
  const [testMessage, setTestMessage] = useState("");

  const { sendCustomEmail, isSending, error } = useEmailNotifications();

  useEffect(() => {
    // Load configuration from localStorage
    const savedConfig = localStorage.getItem("emailConfig");
    if (savedConfig) {
      try {
        const parsed = JSON.parse(savedConfig) as Partial<EmailConfig>;
        // Merge into defaults to avoid missing keys
        setConfig((prev) => ({ ...prev, ...parsed }));
      } catch (error) {
        console.error("Error loading email configuration:", error);
      }
    }
    setLoaded(true);
  }, []);

  useEffect(() => {
    if (!loaded) return; // Avoid overwriting saved config on first mount
    // Save configuration to localStorage
    localStorage.setItem("emailConfig", JSON.stringify(config));
  }, [config, loaded]);

  const handleConfigChange = <K extends keyof EmailConfig>(
    key: K,
    value: EmailConfig[K]
  ) => {
    setConfig((prev) => ({ ...prev, [key]: value }));
  };

  const addAdminEmail = () => {
    if (newEmail.trim() && !config.adminEmails.includes(newEmail.trim())) {
      handleConfigChange("adminEmails", [
        ...config.adminEmails,
        newEmail.trim(),
      ]);
      setNewEmail("");
    }
  };

  const removeAdminEmail = (email: string) => {
    handleConfigChange(
      "adminEmails",
      config.adminEmails.filter((e) => e !== email)
    );
  };

  const sendTestEmail = async () => {
    if (!config.testEmail.trim()) {
      setTestMessage("Please enter a test email address");
      setTestResult("error");
      return;
    }

    setTestResult("idle");
    setTestMessage("Sending test email...");

    const testEmailData = {
      to: [config.testEmail.trim()],
      subject: "BUA Asset Management - Email Test",
      htmlBody: `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; margin: 0; padding: 20px; background-color: #f5f5f5; }
            .container { max-width: 600px; margin: 0 auto; background-color: white; padding: 20px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
            .header { background-color: #059669; color: white; padding: 20px; border-radius: 8px 8px 0 0; margin: -20px -20px 20px -20px; }
            .success { color: #059669; font-weight: bold; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>Email Configuration Test</h1>
            </div>
            <p>This is a test email from the BUA Asset Management System.</p>
            <p class="success">✅ Email configuration is working correctly!</p>
            <p>If you received this email, your Office 365 integration is properly configured.</p>
            <p><strong>Test Details:</strong></p>
            <ul>
              <li>Sent at: ${new Date().toLocaleString()}</li>
              <li>From: BUA Asset Management System</li>
              <li>Recipient: ${config.testEmail}</li>
            </ul>
          </div>
        </body>
        </html>
      `,
      textBody: `
Email Configuration Test

This is a test email from the BUA Asset Management System.

✅ Email configuration is working correctly!

If you received this email, your Office 365 integration is properly configured.

Test Details:
- Sent at: ${new Date().toLocaleString()}
- From: BUA Asset Management System
- Recipient: ${config.testEmail}
      `,
    };

    try {
      const success = await sendCustomEmail(testEmailData);

      if (success) {
        setTestResult("success");
        setTestMessage("Test email sent successfully!");
      } else {
        setTestResult("error");
        setTestMessage(error || "Failed to send test email");
      }
    } catch (err) {
      setTestResult("error");
      setTestMessage(
        err instanceof Error ? err.message : "Unknown error occurred"
      );
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <Mail className="w-6 h-6 text-bua-red" />
        <h2 className="text-2xl font-bold">Email Configuration</h2>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="w-5 h-5" />
            Email Settings
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Master Enable/Disable */}
          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="emailEnabled" className="text-base font-medium">
                Enable Email Notifications
              </Label>
              <p className="text-sm text-gray-600">
                Master switch for all email notifications
              </p>
            </div>
            <Switch
              id="emailEnabled"
              checked={config.enabled}
              onCheckedChange={(checked) =>
                handleConfigChange("enabled", checked)
              }
            />
          </div>

          <Separator />

          {/* Notification Types */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Notification Types</h3>

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="lowStockAlerts">Low Stock Alerts</Label>
                  <p className="text-sm text-gray-600">
                    Send alerts when consumables reach reorder point
                  </p>
                </div>
                <Switch
                  id="lowStockAlerts"
                  checked={config.lowStockAlerts}
                  onCheckedChange={(checked) =>
                    handleConfigChange("lowStockAlerts", checked)
                  }
                  disabled={!config.enabled}
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="assetAllocations">Asset Allocations</Label>
                  <p className="text-sm text-gray-600">
                    Notify users when assets are allocated to them
                  </p>
                </div>
                <Switch
                  id="assetAllocations"
                  checked={config.assetAllocations}
                  onCheckedChange={(checked) =>
                    handleConfigChange("assetAllocations", checked)
                  }
                  disabled={!config.enabled}
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="consumableIssues">Consumable Issues</Label>
                  <p className="text-sm text-gray-600">
                    Notify users when consumables are issued to them
                  </p>
                </div>
                <Switch
                  id="consumableIssues"
                  checked={config.consumableIssues}
                  onCheckedChange={(checked) =>
                    handleConfigChange("consumableIssues", checked)
                  }
                  disabled={!config.enabled}
                />
              </div>
            </div>
          </div>

          <Separator />

          {/* Admin Emails */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Admin Email Recipients</h3>
            <p className="text-sm text-gray-600">
              These emails will receive low stock alerts and other
              administrative notifications
            </p>

            <div className="space-y-2">
              {config.adminEmails.map((email, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-2 bg-gray-50 rounded-md"
                >
                  <span className="text-sm">{email}</span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removeAdminEmail(email)}
                    className="text-red-600 hover:text-red-700"
                  >
                    Remove
                  </Button>
                </div>
              ))}
            </div>

            <div className="flex gap-2">
              <Input
                type="email"
                placeholder="Enter admin email address"
                value={newEmail}
                onChange={(e) => setNewEmail(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && addAdminEmail()}
              />
              <Button onClick={addAdminEmail} disabled={!newEmail.trim()}>
                Add
              </Button>
            </div>
          </div>

          <Separator />

          {/* Test Email */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Test Email Configuration</h3>
            <p className="text-sm text-gray-600">
              Send a test email to verify your Office 365 integration is working
            </p>

            <div className="flex gap-2">
              <Input
                type="email"
                placeholder="Enter test email address"
                value={config.testEmail}
                onChange={(e) =>
                  handleConfigChange("testEmail", e.target.value)
                }
              />
              <Button
                onClick={sendTestEmail}
                disabled={!config.testEmail.trim() || isSending}
                className="flex items-center gap-2"
              >
                <TestTube className="w-4 h-4" />
                {isSending ? "Sending..." : "Send Test"}
              </Button>
            </div>

            {testResult !== "idle" && (
              <div
                className={`flex items-center gap-2 p-3 rounded-md ${
                  testResult === "success"
                    ? "bg-green-50 text-green-800"
                    : "bg-red-50 text-red-800"
                }`}
              >
                {testResult === "success" ? (
                  <CheckCircle className="w-4 h-4" />
                ) : (
                  <XCircle className="w-4 h-4" />
                )}
                <span className="text-sm">{testMessage}</span>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Configuration Status */}
      <Card>
        <CardHeader>
          <CardTitle>Configuration Status</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm">Email Notifications:</span>
              <span
                className={`text-sm font-medium ${
                  config.enabled ? "text-green-600" : "text-gray-500"
                }`}
              >
                {config.enabled ? "Enabled" : "Disabled"}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm">Low Stock Alerts:</span>
              <span
                className={`text-sm font-medium ${
                  config.lowStockAlerts ? "text-green-600" : "text-gray-500"
                }`}
              >
                {config.lowStockAlerts ? "Enabled" : "Disabled"}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm">Asset Allocations:</span>
              <span
                className={`text-sm font-medium ${
                  config.assetAllocations ? "text-green-600" : "text-gray-500"
                }`}
              >
                {config.assetAllocations ? "Enabled" : "Disabled"}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm">Consumable Issues:</span>
              <span
                className={`text-sm font-medium ${
                  config.consumableIssues ? "text-green-600" : "text-gray-500"
                }`}
              >
                {config.consumableIssues ? "Enabled" : "Disabled"}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm">Admin Recipients:</span>
              <span className="text-sm font-medium">
                {config.adminEmails.length}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default EmailConfiguration;
