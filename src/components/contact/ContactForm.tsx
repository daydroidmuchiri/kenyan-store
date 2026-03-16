"use client";

import { useState } from "react";
import toast from "react-hot-toast";

export function ContactForm() {
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setIsSubmitting(true);

    const formData = new FormData(e.currentTarget);
    const data = {
      name: formData.get("name"),
      email: formData.get("email"),
      phone: formData.get("phone"),
      subject: formData.get("subject"),
      message: formData.get("message"),
    };

    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!res.ok) {
        throw new Error("Failed to send message");
      }

      toast.success("Message sent! We'll get back to you soon.");
      (e.target as HTMLFormElement).reset();
    } catch (error) {
      toast.error("Could not send your message. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="name" className="label">Full Name</label>
        <input id="name" name="name" type="text" className="input-field" placeholder="Jane Mwangi" required disabled={isSubmitting} />
      </div>
      <div>
        <label htmlFor="email" className="label">Email Address</label>
        <input id="email" name="email" type="email" className="input-field" placeholder="jane@example.com" required disabled={isSubmitting} />
      </div>
      <div>
        <label htmlFor="phone" className="label">Phone (optional)</label>
        <input id="phone" name="phone" type="tel" className="input-field" placeholder="0712345678" disabled={isSubmitting} />
      </div>
      <div>
        <label htmlFor="subject" className="label">Subject</label>
        <select id="subject" name="subject" className="input-field" disabled={isSubmitting}>
          <option>Order enquiry</option>
          <option>Returns & exchanges</option>
          <option>Product question</option>
          <option>Wholesale / partnership</option>
          <option>Other</option>
        </select>
      </div>
      <div>
        <label htmlFor="message" className="label">Message</label>
        <textarea
          id="message"
          name="message"
          className="input-field resize-none"
          rows={5}
          placeholder="How can we help you?"
          required
          disabled={isSubmitting}
        />
      </div>
      <button type="submit" className="btn-primary w-full py-3.5" disabled={isSubmitting}>
        {isSubmitting ? "Sending..." : "Send Message"}
      </button>
    </form>
  );
}
