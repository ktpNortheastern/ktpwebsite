const navigation = [
  { label: "Home", href: "/" },
  { label: "Brothers", href: "/members" },
  { label: "FAQ", href: "/faq" },
  { label: "Gallery", href: "/gallery" },
  { label: "Rush Process", href: "/rush" },
];

const socials = [
  { label: "LinkedIn", href: "#" },
  { label: "Instagram", href: "#" },
  { label: "Email", href: "#" },
  { label: "GitHub", href: "#" },
];

const products = [
  { label: "Omega Chapter Website", href: "#" },
  { label: "Omega Chapter App", href: "#" },
];

export default function Footer() {
  return (
    <footer className="bg-black px-6 py-16 text-white md:px-[38px]">
      <div className="flex flex-wrap justify-between gap-12">
        <div>
          <p className="font-serif text-3xl font-semibold">ΚΘΠ</p>
          <p className="mt-2 font-mono text-sm text-white/60">
            For the love of technology.
          </p>
        </div>
        <div className="flex flex-wrap gap-16">
          <FooterColumn title="Navigation" items={navigation} />
          <FooterColumn title="Socials" items={socials} />
          <FooterColumn title="Products" items={products} />
        </div>
      </div>
      <div className="mt-16 flex flex-wrap justify-between font-mono text-xs text-white/50">
        <p>© 2026 Kappa Theta Pi Omega Chapter. All rights reserved.</p>
        <p>Sponsored by Jane Street.</p>
      </div>
    </footer>
  );
}

function FooterColumn({
  title,
  items,
}: {
  title: string;
  items: { label: string; href: string }[];
}) {
  return (
    <div>
      <p className="font-sans font-medium">{title}</p>
      <ul className="mt-3 flex flex-col gap-2">
        {items.map((item) => (
          <li key={item.label}>
            <a href={item.href} className="font-sans text-sm text-white/70">
              {item.label}
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
}
