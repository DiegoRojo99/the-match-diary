import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="border-t border-emerald-400/15 bg-[#05150f] text-slate-200">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full border border-emerald-400/30 bg-emerald-500/10 text-lg shadow-[0_0_24px_rgba(16,185,129,0.25)]">
              ⚽
            </div>
            <div>
              <div className="text-lg font-black tracking-tight text-white">The Match Diary</div>
              <div className="text-[10px] font-semibold uppercase tracking-[0.22em] text-emerald-300/80">
                Your football life
              </div>
            </div>
          </div>

          <nav className="flex flex-wrap items-center gap-2 text-sm text-slate-300">
            <FooterLink href="/dashboard">Dashboard</FooterLink>
            <FooterLink href="/my-matches">My Matches</FooterLink>
            <FooterLink href="/my-stadiums">My Stadiums</FooterLink>
            <FooterLink href="/teams">Teams</FooterLink>
            <FooterLink href="/venues">Venues</FooterLink>
            <a
              href="https://github.com/DiegoRojo99/the-match-diary"
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-slate-300 transition hover:border-emerald-400/30 hover:text-emerald-200"
            >
              GitHub
            </a>
          </nav>
        </div>

        <div className="mt-6 border-t border-white/10 pt-6 text-center">
          <p className="text-sm text-slate-400">
            © {new Date().getFullYear()} The Match Diary. Built for fans who keep the story of every visit.
          </p>
        </div>
      </div>
    </footer>
  );
}

function FooterLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link
      href={href}
      className="rounded-full border border-white/10 bg-white/5 px-3 py-1.5 transition hover:border-emerald-400/30 hover:text-emerald-200"
    >
      {children}
    </Link>
  );
}