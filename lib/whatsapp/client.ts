const WHATSAPP_API_URL = "https://graph.facebook.com/v20.0";

async function post(phoneNumberId: string, token: string, payload: object): Promise<void> {
  const response = await fetch(
    `${WHATSAPP_API_URL}/${phoneNumberId}/messages`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ messaging_product: "whatsapp", ...payload }),
    }
  );

  if (!response.ok) {
    const err = await response.text();
    throw new Error(`WhatsApp API error: ${err}`);
  }
}

export async function sendWhatsAppMessage(to: string, body: string): Promise<void> {
  const phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID;
  const token = process.env.WHATSAPP_ACCESS_TOKEN;

  if (!phoneNumberId || !token) {
    console.warn("WhatsApp credentials not configured");
    return;
  }

  await post(phoneNumberId, token, { to, type: "text", text: { body } });
}

export async function sendWhatsAppTemplate(
  to: string,
  templateName: string,
  languageCode: string,
  bodyParams: string[]
): Promise<void> {
  const phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID;
  const token = process.env.WHATSAPP_ACCESS_TOKEN;

  if (!phoneNumberId || !token) {
    console.warn("WhatsApp credentials not configured");
    return;
  }

  await post(phoneNumberId, token, {
    to,
    type: "template",
    template: {
      name: templateName,
      language: { code: languageCode },
      components: bodyParams.length > 0 ? [
        {
          type: "body",
          parameters: bodyParams.map((text) => ({ type: "text", text })),
        },
      ] : [],
    },
  });
}

export async function sendWhatsAppImageMessage(
  to: string,
  imageUrl: string,
  caption: string
): Promise<void> {
  const phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID;
  const token = process.env.WHATSAPP_ACCESS_TOKEN;

  if (!phoneNumberId || !token) {
    console.warn("WhatsApp credentials not configured");
    return;
  }

  await post(phoneNumberId, token, {
    to,
    type: "image",
    image: { link: imageUrl, caption },
  });
}
