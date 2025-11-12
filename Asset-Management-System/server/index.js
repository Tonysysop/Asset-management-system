import path from "node:path";
import dotenv from "dotenv";
dotenv.config({ path: path.resolve(process.cwd(), ".env.local") });
import express from "express";
import cors from "cors";

const app = express();
app.use(cors());
app.use(express.json());

// Basic validator for Microsoft Graph sendMail payload
const isGraphSendMailBody = (body) => {
  try {
    return (
      typeof body?.message?.subject === "string" &&
      typeof body?.message?.body?.content === "string" &&
      Array.isArray(body?.message?.toRecipients)
    );
  } catch {
    return false;
  }
};

app.post("/api/send-email", async (req, res) => {
  try {
    const { message } = req.body ?? {};

    const tenantId = process.env.VITE_AZURE_TENANT_ID;
    const clientId = process.env.VITE_AZURE_CLIENT_ID;
    const clientSecret = process.env.VITE_AZURE_CLIENT_SECRET;
    const fromEmail = process.env.VITE_FROM_EMAIL;

    if (
      !tenantId ||
      !clientId ||
      !clientSecret ||
      !fromEmail ||
      !isGraphSendMailBody(message)
    ) {
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

    const { access_token: token } = await tokenResp.json();

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
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Unknown error";
    return res.status(500).json({ error: msg });
  }
});

const port = process.env.PORT || 5175;
app.listen(port, () => {
  console.log(`Email proxy server listening on http://localhost:${port}`);
});
