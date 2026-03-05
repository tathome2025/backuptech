const TO_EMAIL = 'tathome2025@gmail.com';

function sanitize(value) {
  return String(value || '').trim();
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const resendKey = process.env.RESEND_API_KEY;
  const fromEmail = process.env.INQUIRY_FROM_EMAIL;

  if (!resendKey) {
    return res.status(500).json({ error: 'Missing RESEND_API_KEY on server.' });
  }
  if (!fromEmail) {
    return res.status(500).json({ error: 'Missing INQUIRY_FROM_EMAIL on server.' });
  }

  try {
    const body = req.body || {};
    const lang = sanitize(body.lang) === 'en' ? 'en' : 'zh';
    const source = sanitize(body.source) || 'contact_form';
    if (source !== 'contact_form') {
      return res.status(400).json({ error: 'Only contact_form submission can send email.' });
    }
    const name = sanitize(body.name);
    const email = sanitize(body.email);
    const company = sanitize(body.company);
    const phone = sanitize(body.phone);
    const message = sanitize(body.message);

    if (!message) {
      return res.status(400).json({ error: 'Message is required.' });
    }

    const now = new Date().toISOString();
    const subject =
      lang === 'en'
        ? `[Backup Tech] New Inquiry (${source})`
        : `【备影科技】新咨询 (${source})`;

    const text = [
      `Time: ${now}`,
      `Source: ${source}`,
      `Language: ${lang}`,
      `Name: ${name || '(not provided)'}`,
      `Email: ${email || '(not provided)'}`,
      `Company: ${company || '(not provided)'}`,
      `Phone: ${phone || '(not provided)'}`,
      '',
      'Message:',
      message
    ].join('\n');

    const html = `
      <h2>${lang === 'en' ? 'New Inquiry' : '新咨询'}</h2>
      <p><strong>Time:</strong> ${now}</p>
      <p><strong>Source:</strong> ${source}</p>
      <p><strong>Language:</strong> ${lang}</p>
      <p><strong>Name:</strong> ${name || '(not provided)'}</p>
      <p><strong>Email:</strong> ${email || '(not provided)'}</p>
      <p><strong>Company:</strong> ${company || '(not provided)'}</p>
      <p><strong>Phone:</strong> ${phone || '(not provided)'}</p>
      <hr />
      <p><strong>Message</strong></p>
      <pre style="white-space: pre-wrap; font-family: Arial, sans-serif;">${message
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')}</pre>
    `;

    const resendResponse = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${resendKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        from: fromEmail,
        to: [TO_EMAIL],
        subject,
        text,
        html,
        reply_to: email || undefined
      })
    });

    const resendData = await resendResponse.json();
    if (!resendResponse.ok) {
      return res.status(resendResponse.status).json({
        error: resendData?.message || resendData?.error || 'Resend request failed.'
      });
    }

    return res.status(200).json({ ok: true, id: resendData?.id || null });
  } catch (err) {
    return res.status(500).json({ error: err.message || 'Server error.' });
  }
}
