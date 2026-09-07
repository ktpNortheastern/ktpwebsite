"use client";

import { useState, type FormEvent, type ReactNode } from "react";
import GridBackground from "@/components/ui/GridBackground";

// Matches most real addresses without being a full RFC-5322 validator —
// good enough to catch "forgot the @" / "forgot the domain" typos, which is
// all this form needs to flag.
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function getEmailError(value: string): string | null {
  const trimmed = value.trim();
  if (!trimmed.includes("@")) return "Please include an “@” in your email address.";
  if (!EMAIL_PATTERN.test(trimmed)) {
    return "Please enter a complete email address (e.g. name@example.com).";
  }
  return null;
}

export default function ContactSection() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const canSubmit = name.trim() !== "" && email.trim() !== "" && message.trim() !== "";

  // Editing any field after a submit attempt clears whatever that attempt
  // left behind, so a fixed typo doesn't keep showing a stale error (or an
  // edit after a success doesn't leave the old "thank you" line sitting
  // there next to a half-changed message).
  function updateField(setter: (value: string) => void) {
    return (value: string) => {
      setError(null);
      setSubmitted(false);
      setter(value);
    };
  }

  // No backend wired up yet (visuals only, per design feedback) — this just
  // confirms the interaction locally rather than actually sending anything.
  // `noValidate` on the form (below) suppresses the browser's own native
  // validation bubble for type="email" so this custom message is the only
  // one that ever shows.
  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!canSubmit) return;

    const emailError = getEmailError(email);
    if (emailError) {
      setSubmitted(false);
      setError(emailError);
      return;
    }

    setError(null);
    setSubmitted(true);
  }

  return (
    // pt/pb matched (not pt-20/pb-16 like before) so justify-center's leftover
    // space splits evenly on top of an already-equal base, landing the whole
    // block dead center with equal breathing room above and below — rather
    // than top-anchored right under the nav with all the slack stranded at
    // the bottom.
    <section className="relative isolate flex min-h-screen flex-col justify-center bg-[#fafafa] px-6 pt-20 pb-20 md:h-screen md:px-[130px] md:pt-[110px] md:pb-[110px]">
      {/* Much lighter than the default — this page's own frosted form
          container (see below) already carries the visual weight, so
          the grid only needs to read as a faint texture behind it. */}
      <GridBackground maxAlpha={0.035} />
      <div className="flex w-full flex-col gap-10 md:flex-row md:items-start md:justify-between">
        <div className="flex flex-col gap-7 text-black md:w-[455px]">
          <p className="font-sans text-2xl font-bold whitespace-pre md:text-[30px]">
            (&nbsp;&nbsp;&nbsp;&nbsp;CONTACT&nbsp;&nbsp;&nbsp;&nbsp;)
          </p>
          <p className="font-sans text-base font-medium leading-snug">
            Want to get in touch with us? Look no further. Below are our social media platforms.
            Feel free to reach out on any platform or even send an email inquiry right here.
          </p>
          <p className="font-sans text-base font-medium leading-snug">
            Let&apos;s start a conversation.
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          noValidate
          className="relative flex flex-col items-end gap-8 p-6 md:w-[520px]"
        >
          {/* Frosted fill for the whole form now, not each field
              individually (see Field below) — bg-white/60 + a light
              backdrop-blur-sm, masked to feather toward the edges (an
              ellipse, not the form's hard rectangle) so it blends into
              the grid instead of cutting off sharply. Solid enough
              through the middle (60%) that the fields/button/status
              text all stay fully readable regardless of exactly where
              they land inside the form. */}
          <span
            aria-hidden
            className="pointer-events-none absolute inset-0 bg-white/60 backdrop-blur-sm [mask-image:radial-gradient(ellipse_at_center,black_60%,transparent_100%)] [-webkit-mask-image:radial-gradient(ellipse_at_center,black_60%,transparent_100%)]"
          />
          <Field label="[ YOUR NAME ]">
            <input
              type="text"
              value={name}
              onChange={(e) => updateField(setName)(e.target.value)}
              className="w-full bg-transparent pb-2 font-sans text-lg text-black focus:outline-none"
            />
          </Field>

          <Field label="[ YOUR EMAIL ]">
            <input
              type="email"
              value={email}
              onChange={(e) => updateField(setEmail)(e.target.value)}
              className="w-full bg-transparent pb-2 font-sans text-lg text-black focus:outline-none"
            />
          </Field>

          <Field label="[ YOUR MSG ]">
            <textarea
              value={message}
              onChange={(e) => updateField(setMessage)(e.target.value)}
              rows={2}
              className="w-full resize-none bg-transparent pb-2 font-sans text-lg text-black focus:outline-none"
            />
          </Field>

          {/* Same flip-up hover + arrow treatment as ui/Button, but a real
              <button type="submit"> — Button is Link-only, and this one
              needs to be disabled until every field has content. */}
          <button
            type="submit"
            disabled={!canSubmit}
            className="group relative z-10 inline-flex items-center gap-[2px] font-mono text-base disabled:pointer-events-none disabled:opacity-40"
          >
            <span className="relative overflow-hidden bg-navy px-3 py-1.5 text-white">
              <span className="block transition-transform duration-300 ease-out group-hover:-translate-y-full">
                Send
              </span>
              <span className="absolute inset-0 flex translate-y-full items-center justify-center transition-transform duration-300 ease-out group-hover:translate-y-0">
                Send
              </span>
            </span>
            <span className="relative flex items-center justify-center overflow-hidden bg-navy px-1 py-1.5 text-white">
              <span className="block transition-transform duration-300 ease-out group-hover:-translate-y-full">
                →
              </span>
              <span className="absolute inset-0 flex translate-y-full items-center justify-center transition-transform duration-300 ease-out group-hover:translate-y-0">
                →
              </span>
            </span>
          </button>

          {/* Always mounted (min-h-5 reserves its line-height) rather than
              conditionally rendered — this section is vertically centered
              (justify-center) on the page, so a message that only appears
              after submitting would change the block's total height and
              shift the whole thing (title included) upward to stay
              centered. Reserving the space up front means nothing above
              ever moves. */}
          <p
            className={`relative z-10 min-h-5 w-full text-right font-mono text-sm ${
              error ? "text-red-600" : "text-black/60"
            }`}
          >
            {error ??
              (submitted
                ? "Thank you for reaching out — your message has been received, and we will be in touch shortly."
                : "")}
          </p>
        </form>
      </div>
    </section>
  );
}

// Two distinct states, not one blended together: HOVER is the same
// left-to-right gray wipe FaqRow uses (bg only, never touches color) —
// SELECTED (focus-within, i.e. the user has actually clicked into the
// field) swaps the underline from black to light blue via its own
// left-to-right fill, and turns the caption label blue too, so "hovering
// past" and "actively editing" read as clearly different states.
function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    // The frosted fill (and its own padding) moved to the <form> itself
    // — one soft panel behind the whole form instead of three separate
    // ones stacked with gaps between them.
    <label className="group relative flex w-full flex-col gap-1">
      <span
        aria-hidden
        className="pointer-events-none absolute inset-0 origin-left scale-x-0 bg-black/[0.04] transition-transform duration-300 ease-out group-hover:scale-x-100"
      />
      <span className="relative z-10 font-mono text-xs text-black transition-colors duration-300 group-focus-within:text-[#2e5b99]">
        {label}
      </span>
      <div className="relative z-10">
        {children}
        <span aria-hidden className="pointer-events-none absolute inset-x-0 bottom-0 h-[2px] bg-black" />
        <span
          aria-hidden
          className="pointer-events-none absolute inset-x-0 bottom-0 h-[2px] origin-left scale-x-0 bg-[#2e5b99] transition-transform duration-300 ease-out group-focus-within:scale-x-100"
        />
      </div>
    </label>
  );
}
