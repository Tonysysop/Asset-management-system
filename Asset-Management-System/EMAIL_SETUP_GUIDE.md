# Office 365 Email Integration Setup Guide

## Prerequisites

- Office 365 tenant with admin access
- Azure Portal access
- Email account for sending notifications

## Step 1: Create Azure App Registration

1. Go to [Azure Portal](https://portal.azure.com)
2. Navigate to **Azure Active Directory** > **App registrations**
3. Click **New registration**
4. Fill in the details:
   - **Name**: `BUA Asset Management Email Service`
   - **Supported account types**: `Accounts in this organizational directory only`
   - **Redirect URI**: Leave blank
5. Click **Register**

## Step 2: Configure App Registration

### Get Application Details

After creation, note down:

- **Application (client) ID** - Copy this value
- **Directory (tenant) ID** - Copy this value

### Create Client Secret

1. Go to **Certificates & secrets**
2. Click **New client secret**
3. Fill in:
   - **Description**: `Email Service Secret`
   - **Expires**: Choose appropriate duration (recommend 24 months)
4. Click **Add**
5. **Copy the secret value immediately** (you won't see it again)

### Add API Permissions

1. Go to **API permissions**
2. Click **Add a permission**
3. Select **Microsoft Graph**
4. Choose **Application permissions**
5. Search for and select **Mail.Send**
6. Click **Add permissions**
7. Click **Grant admin consent for [Your Organization]**

## Step 3: Configure Environment Variables

Create a `.env.local` file in your project root with:

```env
# Azure App Registration Details
VITE_AZURE_CLIENT_ID=your_client_id_here
VITE_AZURE_CLIENT_SECRET=your_client_secret_here
VITE_AZURE_TENANT_ID=your_tenant_id_here

# Email Settings
VITE_FROM_EMAIL=noreply@buagroup.com
VITE_FROM_NAME=BUA Asset Management
```

Replace the placeholder values with your actual credentials.

## Step 4: Email Account Setup

The email notifications will be sent from the account specified in `VITE_FROM_EMAIL`. Ensure:

1. This email account exists in your Office 365 tenant
2. The account has permission to send emails
3. If using a shared mailbox, ensure proper permissions are configured

## Step 5: Test Configuration

1. Start your application
2. Go to **Settings** > **Email Configuration**
3. Enable email notifications
4. Add admin email addresses
5. Send a test email to verify the setup

## Troubleshooting

### Common Issues

1. **"Insufficient privileges" error**

   - Ensure admin consent was granted for Mail.Send permission
   - Check that the app registration has the correct permissions

2. **"Invalid client" error**

   - Verify the client ID and tenant ID are correct
   - Ensure the client secret hasn't expired

3. **"Mailbox not found" error**

   - Verify the FROM_EMAIL account exists in your tenant
   - Check that the account has a valid mailbox

4. **"Access denied" error**
   - Ensure the app registration has Mail.Send permission
   - Verify admin consent was granted

### Testing Steps

1. Use the test email feature in the Email Configuration page
2. Check the browser console for any error messages
3. Verify the Azure App Registration settings
4. Test with a simple email first before enabling notifications

## Security Considerations

1. **Client Secret**: Store securely and rotate regularly
2. **Permissions**: Only grant necessary permissions
3. **Environment Variables**: Never commit `.env.local` to version control
4. **Access Control**: Limit who can modify email settings

## Email Templates

The system includes pre-built templates for:

- Low stock alerts
- Asset allocation notifications
- Consumable issue notifications

Templates can be customized by modifying the `emailService.ts` file.

## Support

For issues with Office 365 integration:

1. Check Azure Portal for app registration status
2. Verify permissions and consent
3. Test with Microsoft Graph Explorer
4. Contact your Office 365 administrator if needed
