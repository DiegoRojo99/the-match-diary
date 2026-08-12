import Link from 'next/link';

const featureCards = [
  {
    icon: '🏟️',
    title: 'Your stadium archive',
    description:
      'Every ground becomes part of your football story. Keep a living record of the venues you have seen live and the cities that shaped your journey.',
    tags: ['Visited venues', 'City memories', 'Ground history'],
  },
  {
    icon: '📔',
    title: 'Your match diary',
    description:
      'Log the games you attended with notes, ratings, and the feeling of the day. Turn fixtures into personal memories instead of just data points.',
    tags: ['Ratings', 'Notes', 'Match journal'],
  },
  {
    icon: '🏆',
    title: 'The football life you have lived',
    description:
      'Track clubs, competitions, and stadiums together so your diary tells the full story of how you followed the game.',
    tags: ['Clubs', 'Leagues', 'Travel'],
  },
];

const steps = [
  { label: '01', title: 'Discover', copy: 'Browse teams, fixtures, and stadiums to find the next place you want to tick off.' },
  { label: '02', title: 'Log it', copy: 'Save the match, the rating, and the memory while it is still fresh in your head.' },
  { label: '03', title: 'Relive it', copy: 'Return to your football archive and remember exactly why that day mattered.' },
];

export default function Home() {
  return (
    <div className="relative overflow-hidden">
      <div className="absolute inset-x-0 top-[-220px] h-[520px] bg-[radial-gradient(circle,_rgba(56,211,159,0.22),_transparent_55%)] blur-3xl" />

      <div className="mx-auto max-w-7xl px-4 pb-24 pt-10 sm:px-6 lg:px-8 lg:pt-16">
        <section className="relative overflow-hidden rounded-[32px] border border-emerald-400/20 bg-[linear-gradient(135deg,_rgba(12,27,22,0.9),_rgba(8,17,13,0.94))] px-6 py-10 shadow-[0_30px_100px_rgba(2,6,4,0.6)] sm:px-8 lg:px-12 lg:py-16">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(56,211,159,0.16),_transparent_30%),radial-gradient(circle_at_bottom_right,_rgba(247,215,122,0.12),_transparent_25%)]" />

          <div className="relative z-10">
            <div className="inline-flex items-center gap-2 rounded-full border border-emerald-400/30 bg-emerald-500/10 px-4 py-2 text-[10px] font-bold uppercase tracking-[0.28em] text-emerald-300">
              <span className="h-2 w-2 rounded-full bg-emerald-400" />
              Match diary
            </div>

            <div className="mt-8 grid gap-10 lg:grid-cols-[1.3fr_0.7fr] lg:items-end">
              <div>
                <h1 className="max-w-3xl text-4xl font-black tracking-[-0.06em] text-white sm:text-5xl lg:text-7xl">
                  Your football life,
                  <span className="block text-emerald-400">logged in one place.</span>
                </h1>

                <p className="mt-6 max-w-2xl text-base leading-8 text-slate-300 sm:text-lg">
                  Save the matches you attended, the stadiums you have seen, and the stories that made the day unforgettable. This is more than fixtures — it is your football memory archive.
                </p>

                <div className="mt-8 flex flex-col gap-4 sm:flex-row">
                  <Link
                    href="/my-matches"
                    className="inline-flex items-center justify-center rounded-full bg-gradient-to-r from-emerald-400 to-emerald-500 px-7 py-3.5 text-base font-bold text-[#052814] shadow-[0_14px_40px_rgba(56,211,159,0.35)] transition hover:brightness-110"
                  >
                    View my diary
                  </Link>
                  <Link
                    href="/venues"
                    className="inline-flex items-center justify-center rounded-full border border-white/15 bg-white/5 px-7 py-3.5 text-base font-bold text-white transition hover:border-emerald-400/40 hover:text-emerald-300"
                  >
                    Explore stadiums
                  </Link>
                </div>
              </div>

              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-1">
                <StatCard value="Diary" label="Your archive" />
                <StatCard value="Stadiums" label="You have seen" />
                <StatCard value="Memories" label="Saved forever" />
              </div>
            </div>
          </div>
        </section>

        <section className="mt-20">
          <div className="mb-8 flex items-end justify-between gap-4">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.28em] text-emerald-300">Purpose</p>
              <h2 className="mt-2 text-3xl font-black tracking-[-0.05em] text-white sm:text-4xl">A football diary built around the moments that matter.</h2>
            </div>
          </div>

          <div className="grid gap-6 md:grid-cols-3">
            {featureCards.map((feature) => (
              <div
                key={feature.title}
                className="group rounded-[28px] border border-white/10 bg-white/5 p-6 shadow-[0_16px_50px_rgba(3,10,7,0.34)] transition duration-300 hover:-translate-y-1 hover:border-emerald-400/30 hover:bg-emerald-500/5"
              >
                <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-500/20 to-amber-300/15 text-3xl shadow-inner shadow-emerald-500/10">
                  {feature.icon}
                </div>
                <h3 className="text-2xl font-bold text-white">{feature.title}</h3>
                <p className="mt-4 text-sm leading-7 text-slate-300">{feature.description}</p>
                <div className="mt-5 flex flex-wrap gap-2">
                  {feature.tags.map((tag) => (
                    <span key={tag} className="rounded-full border border-white/10 bg-[#0a1e18] px-2.5 py-1 text-[11px] font-medium uppercase tracking-[0.14em] text-slate-300">
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="mt-20 rounded-[32px] border border-white/10 bg-[#0c1d18] p-6 sm:p-8 lg:p-10">
          <div className="mb-10 text-center">
            <p className="text-[10px] font-bold uppercase tracking-[0.28em] text-amber-300">How it works</p>
            <h2 className="mt-3 text-3xl font-black tracking-[-0.05em] text-white sm:text-4xl">The football story in three steps.</h2>
          </div>

          <div className="grid gap-5 md:grid-cols-3">
            {steps.map((step) => (
              <div key={step.label} className="rounded-[24px] border border-white/10 bg-white/5 p-6">
                <div className="mb-5 text-sm font-black uppercase tracking-[0.28em] text-emerald-400">{step.label}</div>
                <h3 className="text-2xl font-bold text-white">{step.title}</h3>
                <p className="mt-3 text-sm leading-7 text-slate-300">{step.copy}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="mt-20 text-center">
          <div className="mx-auto max-w-4xl rounded-[32px] border border-emerald-400/20 bg-[linear-gradient(135deg,_rgba(11,28,23,0.9),_rgba(13,22,19,0.96))] p-8 shadow-[0_30px_80px_rgba(9,18,15,0.7)] sm:p-12">
            <div className="inline-flex items-center gap-2 rounded-full border border-amber-300/30 bg-amber-400/10 px-4 py-2 text-[10px] font-bold uppercase tracking-[0.24em] text-amber-300">
              <span className="h-2 w-2 rounded-full bg-amber-300" />
              Product focus
            </div>
            <h2 className="mt-6 text-3xl font-black tracking-[-0.05em] text-white sm:text-5xl">The app is becoming a personal archive of the football life you have lived.</h2>
            <p className="mx-auto mt-4 max-w-2xl text-base leading-8 text-slate-300">
              We are moving away from a generic football database and toward something more valuable: a diary of matches, stadiums, and memories that make the game personal.
            </p>
          </div>
        </section>
      </div>
    </div>
  );
}

function StatCard({ value, label }: { value: string; label: string }) {
  return (
    <div className="rounded-[24px] border border-white/10 bg-white/5 p-4 backdrop-blur-sm">
      <div className="text-3xl font-black tracking-[-0.06em] text-emerald-400">{value}</div>
      <div className="mt-2 text-xs font-semibold uppercase tracking-[0.22em] text-slate-400">{label}</div>
    </div>
  );
}
