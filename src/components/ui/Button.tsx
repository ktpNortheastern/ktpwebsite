import Link from "next/link";
import type { ReactNode } from "react";

type ButtonProps = {
  href: string;
  children: ReactNode;
  variant?: "light" | "dark";
  className?: string;
};

export default function Button({
  href,
  children,
  variant = "light",
  className = "",
}: ButtonProps) {
  const colors =
    variant === "light"
      ? "bg-white text-black"
      : "bg-navy text-white";

  return (
    <Link
      href={href}
      className={`group inline-flex items-center gap-[2px] font-mono text-base ${className}`}
    >
      <span className={`relative overflow-hidden px-3 py-1.5 ${colors}`}>
        <span className="block transition-transform duration-300 ease-out group-hover:-translate-y-full">
          {children}
        </span>
        <span className="absolute inset-0 flex translate-y-full items-center justify-center transition-transform duration-300 ease-out group-hover:translate-y-0">
          {children}
        </span>
      </span>
      <span className={`relative flex items-center justify-center overflow-hidden px-1 py-1.5 ${colors}`}>
        <span className="block transition-transform duration-300 ease-out group-hover:-translate-y-full">
          →
        </span>
        <span className="absolute inset-0 flex translate-y-full items-center justify-center transition-transform duration-300 ease-out group-hover:translate-y-0">
          →
        </span>
      </span>
    </Link>
  );
}
