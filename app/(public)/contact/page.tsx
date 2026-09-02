"use client";

import { useState, useTransition } from "react";
import { PublicLayout } from "@/components/layout/public-layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Mail, MapPin, Phone, Send } from "lucide-react";

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });
  const [status, setStatus] = useState<{ type: "success" | "error"; message: string } | null>(null);
  const [isPending, startTransition] = useTransition();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    startTransition(async () => {
      // TODO: Implement actual contact form submission
      // For now, just simulate success
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setStatus({
        type: "success",
        message: "Thank you for your message! We'll get back to you soon.",
      });
      
      setFormData({
        name: "",
        email: "",
        subject: "",
        message: "",
      });
      
      // Clear status after 5 seconds
      setTimeout(() => {
        setStatus(null);
      }, 5000);
    });
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  return (
    <PublicLayout>
      <div className="max-w-6xl mx-auto px-6 py-12">
        {/* Header */}
        <div className="mb-12 text-center">
          <h1 className="text-4xl md:text-5xl font-extrabold text-text-primary mb-4">
            Contact Us
          </h1>
          <p className="text-xl text-text-secondary">
            We'd love to hear from you. Get in touch with our team.
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Contact Information */}
          <div className="lg:col-span-1 space-y-6">
            <div className="border border-border rounded-lg p-6 bg-background-panel">
              <div className="flex items-center gap-3 mb-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-vntv-red/10">
                  <Mail className="h-5 w-5 text-vntv-red" />
                </div>
                <h3 className="text-lg font-bold text-text-primary">Email</h3>
              </div>
              <p className="text-sm text-text-secondary mb-2">
                Send us an email anytime
              </p>
              <a
                href="mailto:info@vntv.com"
                className="text-sm font-semibold text-vntv-red hover:underline"
              >
                info@vntv.com
              </a>
            </div>

            <div className="border border-border rounded-lg p-6 bg-background-panel">
              <div className="flex items-center gap-3 mb-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-vntv-red/10">
                  <Phone className="h-5 w-5 text-vntv-red" />
                </div>
                <h3 className="text-lg font-bold text-text-primary">Phone</h3>
              </div>
              <p className="text-sm text-text-secondary mb-2">
                Call us during business hours
              </p>
              <a
                href="tel:+1234567890"
                className="text-sm font-semibold text-vntv-red hover:underline"
              >
                +1 (234) 567-890
              </a>
            </div>

            <div className="border border-border rounded-lg p-6 bg-background-panel">
              <div className="flex items-center gap-3 mb-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-vntv-red/10">
                  <MapPin className="h-5 w-5 text-vntv-red" />
                </div>
                <h3 className="text-lg font-bold text-text-primary">Office</h3>
              </div>
              <p className="text-sm text-text-secondary">
                123 Media Street<br />
                Accra, Ghana<br />
                West Africa
              </p>
            </div>
          </div>

          {/* Contact Form */}
          <div className="lg:col-span-2">
            <div className="border border-border rounded-lg p-8 bg-background-panel">
              <h2 className="text-2xl font-bold text-text-primary mb-6">
                Send us a Message
              </h2>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="name" className="block text-sm font-medium text-text-primary mb-2">
                      Your Name *
                    </label>
                    <Input
                      id="name"
                      name="name"
                      type="text"
                      value={formData.name}
                      onChange={handleChange}
                      required
                      disabled={isPending}
                      placeholder="John Doe"
                    />
                  </div>

                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-text-primary mb-2">
                      Your Email *
                    </label>
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      value={formData.email}
                      onChange={handleChange}
                      required
                      disabled={isPending}
                      placeholder="john@example.com"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="subject" className="block text-sm font-medium text-text-primary mb-2">
                    Subject *
                  </label>
                  <Input
                    id="subject"
                    name="subject"
                    type="text"
                    value={formData.subject}
                    onChange={handleChange}
                    required
                    disabled={isPending}
                    placeholder="How can we help?"
                  />
                </div>

                <div>
                  <label htmlFor="message" className="block text-sm font-medium text-text-primary mb-2">
                    Message *
                  </label>
                  <Textarea
                    id="message"
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                    required
                    disabled={isPending}
                    rows={6}
                    placeholder="Tell us what you'd like to discuss..."
                  />
                </div>

                {status && (
                  <div
                    className={`rounded-lg p-4 ${
                      status.type === "success"
                        ? "bg-green-50 dark:bg-green-900/20 text-green-800 dark:text-green-300"
                        : "bg-red-50 dark:bg-red-900/20 text-red-800 dark:text-red-300"
                    }`}
                  >
                    {status.message}
                  </div>
                )}

                <Button type="submit" disabled={isPending} size="lg" className="w-full md:w-auto gap-2">
                  <Send className="h-4 w-4" />
                  {isPending ? "Sending..." : "Send Message"}
                </Button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </PublicLayout>
  );
}
