import { Resend } from "resend";

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default async function handler(request, response) {
  response.setHeader("Cache-Control", "no-store");

  if (request.method !== "POST") {
    response.setHeader("Allow", "POST");
    return response.status(405).json({ message: "Only POST requests are supported." });
  }

  if (!request.body || typeof request.body !== "object" || Array.isArray(request.body)) {
    return response.status(400).json({ message: "Please submit a valid message." });
  }

  const { name, email, message, website } = request.body;

  if (typeof website === "string" && website.trim()) {
    return response.status(400).json({ message: "Please submit a valid message." });
  }

  if (
    typeof name !== "string" ||
    typeof email !== "string" ||
    typeof message !== "string"
  ) {
    return response.status(400).json({ message: "Please complete all fields." });
  }

  const cleanName = name.trim();
  const cleanEmail = email.trim();
  const cleanMessage = message.trim();

  if (
    !cleanName ||
    cleanName.length > 120 ||
    !emailPattern.test(cleanEmail) ||
    cleanEmail.length > 254 ||
    !cleanMessage ||
    cleanMessage.length > 5000
  ) {
    return response.status(400).json({ message: "Check your details and try again." });
  }

  const { RESEND_API_KEY, CONTACT_FROM_EMAIL, CONTACT_TO_EMAIL } = process.env;

  if (!RESEND_API_KEY || !CONTACT_FROM_EMAIL || !CONTACT_TO_EMAIL) {
    console.error("Contact form is missing email service configuration.");
    return response.status(503).json({ message: "The contact form is not configured yet." });
  }

  const resend = new Resend(RESEND_API_KEY);

  try {
    const { error } = await resend.emails.send({
      from: CONTACT_FROM_EMAIL,
      to: CONTACT_TO_EMAIL,
      replyTo: cleanEmail,
      subject: `Website inquiry from ${cleanName}`,
      text: `Name: ${cleanName}\nEmail: ${cleanEmail}\n\n${cleanMessage}`,
    });

    if (error) {
      console.error("Contact email delivery failed:", error.message);
      return response.status(502).json({ message: "Your message could not be sent. Please try again later." });
    }

    return response.status(200).json({ message: "Thanks! Your message has been sent." });
  } catch (error) {
    console.error(
      "Contact email delivery failed:",
      error instanceof Error ? error.message : "Unknown email service error",
    );
    return response.status(502).json({ message: "Your message could not be sent. Please try again later." });
  }
}
