import { Clock, Mail, MapPin, Phone } from "lucide-react";
import Link from "next/link";
import { Logo } from "@/components/shared/Logo";
import { FacebookIcon, InstagramIcon, XIcon, YoutubeIcon } from "@/components/shared/SocialIcons";

const socials = [
  { href: "https://facebook.com", label: "Facebook", icon: FacebookIcon },
  { href: "https://instagram.com", label: "Instagram", icon: InstagramIcon },
  { href: "https://x.com", label: "X", icon: XIcon },
  { href: "https://youtube.com", label: "YouTube", icon: YoutubeIcon },
];

export function Footer() {
  return (
    <footer className="mt-auto bg-sidebar text-sidebar-foreground">
      <div className="h-2 bg-[repeating-linear-gradient(90deg,var(--primary)_0_24px,var(--background)_24px_48px)] opacity-90" />
      <div className="container-px grid gap-10 py-14 sm:grid-cols-2 lg:grid-cols-4">
        <div className="space-y-4">
          <Logo light />
          <p className="text-sm leading-relaxed text-sidebar-foreground/70">
            Hot, hand-tossed pizza from the best local pizzerias, delivered to your door. Discover, order and track, all in one place.
          </p>
          <div className="flex gap-2">
            {socials.map(({ href, label, icon: Icon }) => (
              <a
                key={label}
                href={href}
                target="_blank"
                rel="noreferrer"
                aria-label={label}
                className="grid size-9 place-items-center rounded-full bg-white/10 transition hover:bg-primary"
              >
                <Icon className="size-4" />
              </a>
            ))}
          </div>
        </div>

        <div>
          <h4 className="mb-4 font-sans text-sm font-bold tracking-wider uppercase">Explore</h4>
          <ul className="space-y-2.5 text-sm text-sidebar-foreground/70">
            <li><Link className="hover:text-accent" href="/">Home</Link></li>
            <li><Link className="hover:text-accent" href="/menu">Browse Menu</Link></li>
            <li><Link className="hover:text-accent" href="/#categories">Categories</Link></li>
            <li><Link className="hover:text-accent" href="/#how-it-works">How It Works</Link></li>
          </ul>
        </div>

        <div>
          <h4 className="mb-4 font-sans text-sm font-bold tracking-wider uppercase">For Partners</h4>
          <ul className="space-y-2.5 text-sm text-sidebar-foreground/70">
            <li><Link className="hover:text-accent" href="/signup">Become a Vendor</Link></li>
            <li><Link className="hover:text-accent" href="/dashboard">Dashboard</Link></li>
            <li><Link className="hover:text-accent" href="/dashboard/vendor/subscription">Premium Plan</Link></li>
            <li><Link className="hover:text-accent" href="/signin">Sign In</Link></li>
          </ul>
        </div>

        <div>
          <h4 className="mb-4 font-sans text-sm font-bold tracking-wider uppercase">Contact</h4>
          <ul className="space-y-3 text-sm text-sidebar-foreground/70">
            <li className="flex gap-2"><MapPin className="size-4 shrink-0 text-accent" /> 12 Oven Street, Dhaka 1212</li>
            <li className="flex gap-2"><Phone className="size-4 shrink-0 text-accent" /> +880 1700-000000</li>
            <li className="flex gap-2"><Mail className="size-4 shrink-0 text-accent" /> hello@pizzahub.app</li>
            <li className="flex gap-2"><Clock className="size-4 shrink-0 text-accent" /> Daily 10:00 AM to 11:00 PM</li>
          </ul>
        </div>
      </div>
      <div className="border-t border-white/10">
        <p className="container-px py-5 text-center text-xs text-sidebar-foreground/60">
          © {new Date().getFullYear()} PizzaHub. All rights reserved. Made with 🍅 and extra cheese.
        </p>
      </div>
    </footer>
  );
}
