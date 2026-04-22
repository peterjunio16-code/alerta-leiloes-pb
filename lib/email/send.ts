import { Resend } from "resend";

export async function sendEmail({
  to,
  subject,
  text,
  html,
}: {
  to: string | string[];
  subject: string;
  text: string;
  html?: string;
}) {
  const apiKey = process.env.RESEND_API_KEY;

  if (!apiKey) {
    console.warn("[email] RESEND_API_KEY not set — skipping email");
    return;
  }

  const resend = new Resend(apiKey);

  const { error } = await resend.emails.send({
    from: "Alerta Leilões PB <onboarding@resend.dev>",
    to: Array.isArray(to) ? to : [to],
    subject,
    text,
    html: html ?? text.replace(/\n/g, "<br>"),
  });

  if (error) throw new Error(JSON.stringify(error));
}
