import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function sendBookingEmail(to: string, subject: string, body: string, replyTo?: string) {
  try {
    const { data, error } = await resend.emails.send({
      from: 'Vynl Pilot <pilot@rockettreelabs.com>',
      to: [to],
      subject: subject,
      html: body,
      reply_to: replyTo || 'booking@rockettreelabs.com',
    });

    if (error) {
      console.error("Resend Error:", error);
      return { success: false, error };
    }

    return { success: true, data };
  } catch (error) {
    console.error("Mailer Failure:", error);
    return { success: false, error };
  }
}
export async function getReceivedEmail(id: string) {
  try {
    const { data, error } = await resend.emails.get(id);
    if (error) throw error;
    return data;
  } catch (error) {
    console.error("Fetch Inbound Failure:", error);
    return null;
  }
}
