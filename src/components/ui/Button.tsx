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
      className={`inline-flex items-center gap-[2px] font-mono text-base ${className}`}
    >
      <span className={`px-3 py-1.5 ${colors}`}>{children}</span>
      <span className={`flex items-center justify-center px-1 py-1.5 ${colors}`}>
        →
      </span>
    </Link>
  );
}
