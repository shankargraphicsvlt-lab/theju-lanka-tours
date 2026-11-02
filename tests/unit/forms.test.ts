import { describe, expect, it, vi } from "vitest";
import { submitContact, type ContactStore } from "@/lib/contact/submit-contact";
import { subscribeToNewsletter, type NewsletterStore } from "@/lib/newsletter/subscribe";

const ctx = { ip: "203.0.113.7", hashSalt: "test-salt" };

function contactForm(overrides: Record<string, string> = {}) {
  const fd = new FormData();
  const values: Record<string, string> = {
    fullName: "Ana Perera",
    email: "ana@example.com",
    subject: "Family trip in March",
    message: "We are four people and would like ten days in the hill country.",
    consent: "on",
    website: "",
    ...overrides,
  };
  for (const [k, v] of Object.entries(values)) fd.set(k, v);
  return fd;
}

function fakeContactStore(overrides: Partial<ContactStore> = {}): ContactStore {
  return {
    consumeRateLimit: vi.fn(async () => true),
    createContactEnquiry: vi.fn(async () => ({ ok: true })),
    ...overrides,
  };
}

describe("contact form submission", () => {
  it("emails the business (reply-to the visitor) and keeps a copy", async () => {
    const store = fakeContactStore();
    const sendEmail = vi.fn(async () => true);
    expect(await submitContact(contactForm(), { store, sendEmail }, ctx)).toEqual({ status: "sent" });
    expect(sendEmail).toHaveBeenCalledWith(
      expect.objectContaining({ replyTo: "ana@example.com", subject: "Website message: Family trip in March" }),
    );
    expect(store.createContactEnquiry).toHaveBeenCalledWith(
      expect.objectContaining({ email: "ana@example.com", consent: true }),
      expect.stringMatching(/^[0-9a-f]{64}$/),
    );
  });

  it("counts as sent when only one of email or storage works", async () => {
    expect(await submitContact(contactForm(), { store: null, sendEmail: async () => true }, ctx)).toEqual({ status: "sent" });
    expect(await submitContact(contactForm(), { store: fakeContactStore(), sendEmail: async () => false }, ctx)).toEqual({
      status: "sent",
    });
  });

  it("fails when neither works, or when nothing is configured", async () => {
    const broken = fakeContactStore({ createContactEnquiry: async () => Promise.reject(new Error("down")) });
    expect(await submitContact(contactForm(), { store: broken, sendEmail: async () => false }, ctx)).toEqual({
      status: "error",
      reason: "failed",
    });
    expect(await submitContact(contactForm(), { store: null, sendEmail: null }, ctx)).toEqual({
      status: "error",
      reason: "unavailable",
    });
  });

  it("silently drops honeypot submissions without sending anything", async () => {
    const sendEmail = vi.fn(async () => true);
    const store = fakeContactStore();
    expect(await submitContact(contactForm({ website: "http://spam" }), { store, sendEmail }, ctx)).toEqual({ status: "sent" });
    expect(sendEmail).not.toHaveBeenCalled();
    expect(store.createContactEnquiry).not.toHaveBeenCalled();
  });

  it("returns field errors for invalid input", async () => {
    const r = await submitContact(contactForm({ email: "nope", consent: "" }), { store: null, sendEmail: async () => true }, ctx);
    expect(r.status).toBe("invalid");
    if (r.status === "invalid") expect(Object.keys(r.fieldErrors).sort()).toEqual(["consent", "email"]);
  });

  it("stops at the rate limit", async () => {
    const store = fakeContactStore({ consumeRateLimit: async () => false });
    expect(await submitContact(contactForm(), { store, sendEmail: async () => true }, ctx)).toEqual({
      status: "error",
      reason: "rate_limited",
    });
  });
});

function newsletterForm(email: string, website = "") {
  const fd = new FormData();
  fd.set("email", email);
  fd.set("website", website);
  return fd;
}

function fakeNewsletterStore(duplicate = false): NewsletterStore {
  return { consumeRateLimit: vi.fn(async () => true), subscribe: vi.fn(async () => ({ duplicate })) };
}

describe("newsletter sign-up", () => {
  it("subscribes a new address, lower-cased", async () => {
    const store = fakeNewsletterStore();
    expect(await subscribeToNewsletter(newsletterForm(" Reader@Example.com "), store, ctx)).toEqual({ status: "subscribed" });
    expect(store.subscribe).toHaveBeenCalledWith("reader@example.com", expect.any(String));
  });

  it("reports an address that is already subscribed", async () => {
    expect(await subscribeToNewsletter(newsletterForm("reader@example.com"), fakeNewsletterStore(true), ctx)).toEqual({
      status: "already",
    });
  });

  it("rejects an invalid address and ignores honeypot submissions", async () => {
    const store = fakeNewsletterStore();
    expect((await subscribeToNewsletter(newsletterForm("nope"), store, ctx)).status).toBe("invalid");
    expect(await subscribeToNewsletter(newsletterForm("a@b.co", "spam"), store, ctx)).toEqual({ status: "subscribed" });
    expect(store.subscribe).not.toHaveBeenCalled();
  });

  it("is unavailable without storage and fails safely when storage errors", async () => {
    expect(await subscribeToNewsletter(newsletterForm("a@b.co"), null, ctx)).toEqual({ status: "error", reason: "unavailable" });
    const broken: NewsletterStore = { consumeRateLimit: async () => true, subscribe: async () => Promise.reject(new Error("x")) };
    expect(await subscribeToNewsletter(newsletterForm("a@b.co"), broken, ctx)).toEqual({ status: "error", reason: "failed" });
  });
});
