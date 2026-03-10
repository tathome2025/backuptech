const TO_EMAIL = "tathome2025@gmail.com";

function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { "Content-Type": "application/json; charset=UTF-8" },
  });
}

function sanitize(value) {
  return String(value || "").trim();
}

function escapeHtml(value) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

export default async function onRequest(context) {
  const { request, env } = context;

  if (request.method !== "POST") {
    return json({ error: "Method Not Allowed" }, 405);
  }

  const resendKey = env.RESEND_API_KEY;
  const fromEmail = env.INQUIRY_FROM_EMAIL;

  if (!resendKey) {
    return json({ error: "Missing RESEND_API_KEY on server." }, 500);
  }

  if (!fromEmail) {
    return json({ error: "Missing INQUIRY_FROM_EMAIL on server." }, 500);
  }

  try {
    const body = await request.json().catch(() => null);
    if (!body || typeof body !== "object") {
      return json({ error: "Invalid JSON body." }, 400);
    }

    const lang = sanitize(body.lang) === "en" ? "en" : "zh";
    const source = sanitize(body.source) || "contact_form";
    if (source !== "contact_form") {
      return json({ error: "Only contact_form submission can send email." }, 400);
    }

    const name = sanitize(body.name);
    const email = sanitize(body.email);
    const company = sanitize(body.company);
    const phone = sanitize(body.phone);
    const message = sanitize(body.message);

    if (!message) {
      return json({ error: "Message is required." }, 400);
    }

    const now = new Date().toISOString();
    const subject =
      lang === "en"
        ? `[Backup Tech] New Inquiry (${source})`
        : `【备影科技】新咨询 (${source})`;

    const text = [
      `Time: ${now}`,
      `Source: ${source}`,
      `Language: ${lang}`,
      `Name: ${name || "(not provided)"}`,
      `Email: ${email || "(not provided)"}`,
      `Company: ${company || "(not provided)"}`,
      `Phone: ${phone || "(not provided)"}`,
      "",
      "Message:",
      message,
    ].join("\n");

    const html = `
      <h2>${lang === "en" ? "New Inquiry" : "新咨询"}</h2>
      <p><strong>Time:</strong> ${now}</p>
      <p><strong>Source:</strong> ${source}</p>
      <p><strong>Language:</strong> ${lang}</p>
      <p><strong>Name:</strong> ${name || "(not provided)"}</p>
      <p><strong>Email:</strong> ${email || "(not provided)"}</p>
      <p><strong>Company:</strong> ${company || "(not provided)"}</p>
      <p><strong>Phone:</strong> ${phone || "(not provided)"}</p>
      <hr />
      <p><strong>Message</strong></p>
      <pre style="white-space: pre-wrap; font-family: Arial, sans-serif;">${escapeHtml(message)}</pre>
    `;

    const resendResponse = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${resendKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: fromEmail,
        to: [TO_EMAIL],
        subject,
        text,
        html,
        reply_to: email || undefined,
      }),
    });

    const resendData = await resendResponse.json().catch(() => null);
    if (!resendResponse.ok) {
      return json(
        {
          error:
            resendData?.message ||
            resendData?.error ||
            "Resend request failed.",
        },
        resendResponse.status
      );
    }

    return json({ ok: true, id: resendData?.id || null });
  } catch (error) {
    return json({ error: error.message || "Server error." }, 500);
  }
}
