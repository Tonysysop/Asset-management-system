import express from "express";
import fetch from "node-fetch";
import cors from "cors";
import dotenv from "dotenv";

dotenv.config();
const app = express();
app.use(cors());
app.use(express.json());

interface GraphRecipient {
  emailAddress: { address: string };
}

type GraphAttachment = {
  "@odata.type": "#microsoft.graph.fileAttachment";
  name: string;
  contentType: string;
  contentBytes: string;
};

interface GraphSendMailBody {
  message: {
    subject: string;
    body: { contentType: "HTML" | "Text"; content: string };
    toRecipients: GraphRecipient[];
    ccRecipients?: GraphRecipient[];
    bccRecipients?: GraphRecipient[];
    attachments?: GraphAttachment[];
  };
  saveToSentItems: boolean;
}

app.post("/api/send-email", async (req, res) => {
  try {
    const { message } = req.body as { message: GraphSendMailBody };

    const tenantId = process.env.VITE_AZURE_TENANT_ID;
    const clientId = process.env.VITE_AZURE_CLIENT_ID;
    const clientSecret = process.env.VITE_AZURE_CLIENT_SECRET;
    const fromEmail = process.env.VITE_FROM_EMAIL;

    if (!tenantId || !clientId || !clientSecret || !fromEmail || !message) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    const tokenResp = await fetch(
      `https://login.microsoftonline.com/${tenantId}/oauth2/v2.0/token`,
      {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams({
          client_id: clientId,
          client_secret: clientSecret,
          scope: "https://graph.microsoft.com/.default",
          grant_type: "client_credentials",
        }),
      }
    );

    if (!tokenResp.ok) {
      const text = await tokenResp.text();
      return res
        .status(500)
        .json({ error: "Token request failed", details: text });
    }

    const tokenData = (await tokenResp.json()) as { access_token: string };
    const token = tokenData.access_token;

    const graphResp = await fetch(
      `https://graph.microsoft.com/v1.0/users/${encodeURIComponent(
        fromEmail
      )}/sendMail`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(message),
      }
    );

    if (!graphResp.ok) {
      const text = await graphResp.text();
      return res
        .status(graphResp.status)
        .json({ error: "Graph sendMail failed", details: text });
    }

    return res.json({ ok: true });
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : "Unknown error";
    return res.status(500).json({ error: message });
  }
});

const port = process.env.PORT || 5175;
app.listen(port, () => {
  console.log(`Email proxy server listening on http://localhost:${port}`);
});
