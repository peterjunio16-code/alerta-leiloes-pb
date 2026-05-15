const WHATSAPP_API_URL = "https://graph.facebook.com/v20.0";

/**
 * Normaliza número para E.164 sem o +: 5583999999999
 * Aceita: "(83) 9 9999-9999", "83999999999", "5583999999999", "+5583999999999"
 */
export function normalizePhone(raw: string): string {
  const digits = raw.replace(/\D/g, "");
  if (digits.length === 13 && digits.startsWith("55")) return digits;
  if (digits.length === 12 && digits.startsWith("55")) return digits;
  if (digits.length === 11) return `55${digits}`;
  if (digits.length === 10) return `55${digits}`;
  return digits; // retorna o que tiver se não reconhecer o padrão
}

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

  const normalized = normalizePhone(to);
  await post(phoneNumberId, token, { to: normalized, type: "text", text: { body } });
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

  const normalized = normalizePhone(to);
  await post(phoneNumberId, token, {
    to: normalized,
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

  const normalizedImg = normalizePhone(to);
  await post(phoneNumberId, token, {
    to: normalizedImg,
    type: "image",
    image: { link: imageUrl, caption },
  });
}
