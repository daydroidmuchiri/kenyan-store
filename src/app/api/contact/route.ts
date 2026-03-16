import { NextRequest, NextResponse } from "next/server";
import nodemailer from "nodemailer";
import { z } from "zod";

const contactSchema = z.object({
  name: z.string().min(2, "Name is required"),
  email: z.string().email("Valid email is required"),
  phone: z.string().optional(),
  subject: z.string().min(1, "Subject is required"),
  message: z.string().min(10, "Message is too short"),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const result = contactSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { error: "Invalid form data", details: result.error.flatten() },
        { status: 400 }
      );
    }

    const { name, email, phone, subject, message } = result.data;

    const SMTP_HOST = process.env.SMTP_HOST;
    const SMTP_PORT = process.env.SMTP_PORT || "587";
    const SMTP_USER = process.env.SMTP_USER;
    const SMTP_PASS = process.env.SMTP_PASS;
    const ADMIN_EMAIL = process.env.ADMIN_EMAIL || "hello@bnsfashionwear.co.ke";

    // If SMTP isn't configured, fallback to console logging (helpful for dev/setup)
    if (!SMTP_HOST || !SMTP_USER || !SMTP_PASS) {
      console.warn("⚠️ SMTP credentials missing. Logging contact message instead:");
      console.log(`\n--- NEW CONTACT MESSAGE ---
From: ${name} <${email}>
Phone: ${phone || "Not provided"}
Subject: ${subject}
Message: 
${message}
---------------------------\n`);
      return NextResponse.json({ success: true, warning: "smtp_missing" }, { status: 200 });
    }

    const transporter = nodemailer.createTransport({
      host: SMTP_HOST,
      port: parseInt(SMTP_PORT, 10),
      secure: parseInt(SMTP_PORT, 10) === 465, // true for 465, false for other ports
      auth: {
        user: SMTP_USER,
        pass: SMTP_PASS,
      },
    });

    const htmlBody = `
      <h2>New Contact Form Submission</h2>
      <p><strong>Name:</strong> ${name}</p>
      <p><strong>Email:</strong> ${email}</p>
      <p><strong>Phone:</strong> ${phone || "Not provided"}</p>
      <p><strong>Subject:</strong> ${subject}</p>
      <hr />
      <h3>Message:</h3>
      <p style="white-space: pre-wrap;">${message}</p>
    `;

    await transporter.sendMail({
      from: `"BNs Fashion Wear Website" <${SMTP_USER}>`, // Ensure from is the authenticated user to avoid spam filters
      replyTo: email,
      to: ADMIN_EMAIL,
      subject: `New Inquiry: ${subject}`,
      html: htmlBody,
    });

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error("Contact API Error:", error);
    return NextResponse.json(
      { error: "Failed to process request" },
      { status: 500 }
    );
  }
}
