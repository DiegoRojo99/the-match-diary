import Link from 'next/link';

const featureCards = [
  {
    icon: '🏟️',
    title: 'Stadium tracker',
    description:
      'Log every ground you visit and build a personal map of the stadiums that shaped your football life.',
    tags: ['Visited venues', 'City history', 'Match memory'],
  },
  {
    icon: '📊',
    title: 'Match analytics',
    description:
      'Keep a clear view of the games you have attended, your ratings, notes, and your favourite moments.',
    tags: ['Attendance stats', 'Ratings', 'Notes'],
  },
  {
    icon: '🏆',
    title: 'Competition journey',
    description:
      'Follow your path through leagues, cups, and international fixtures with a cleaner football overview.',
    tags: ['Leagues', 'Tournaments', 'Progress'],
  },
];

const steps = [
  { label: '01', title: 'Discover', copy: 'Browse venues and teams across the football world.' },
  { label: '02', title: 'Track', copy: 'Log games, notes, ratings, and your own match history.' },
  { label: '03', title: 'Relive', copy: 'Return to each stadium and game with a personal timeline.' },
];

export default function Home() {
  return (
    <div className="relative overflow-hidden">
      <div className="absolute inset-x-0 top-[-220px] h-[520px] bg-[radial-gradient(circle,_rgba(56,211,159,0.22),_transparent_55%)] blur-3xl" />

      <div className="mx-auto max-w-7xl px-4 pb-24 pt-10 sm:px-6 lg:px-8 lg:pt-16">
        <section className="relative overflow-hidden rounded-[32px] border border-emerald-400/20 bg-[linear-gradient(135deg,_rgba(12,27,22,0.88),_rgba(8,17,13,0.92))] px-6 py-10 shadow-[0_30px_100px_rgba(2,6,4,0.6)] sm:px-8 lg:px-12 lg:py-16">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(56,211,159,0.14),_transparent_30%),radial-gradient(circle_at_bottom_right,_rgba(247,215,122,0.12),_transparent_25%)]" />

          <div className="relative z-10">
            <div className="inline-flex items-center gap-2 rounded-full border border-emerald-400/30 bg-emerald-500/10 px-4 py-2 text-[10px] font-bold uppercase tracking-[0.28em] text-emerald-300">
              <span className="h-2 w-2 rounded-full bg-emerald-400" />
              Live from the stadium
            </div>

            <div className="mt-8 grid gap-10 lg:grid-cols-[1.3fr_0.7fr] lg:items-end">
              <div>
                <h1 className="max-w-3xl text-4xl font-black tracking-[-0.06em] text-white sm:text-5xl lg:text-7xl">
                  Track every match.
                  <span className="block text-emerald-400">Every stadium.</span>
                  <span className="block text-slate-200">Every memory.</span>
                </h1>

                <p className="mt-6 max-w-2xl text-base leading-8 text-slate-300 sm:text-lg">
                  A cleaner, more personal way to keep your football story. Follow the venues you have visited, the matches you have attended, and the moments that made the day unforgettable.
                </p>

                <div className="mt-8 flex flex-col gap-4 sm:flex-row">
                  <Link
                    href="/venues"
                    className="inline-flex items-center justify-center rounded-full bg-gradient-to-r from-emerald-400 to-emerald-500 px-7 py-3.5 text-base font-bold text-[#052814] shadow-[0_14px_40px_rgba(56,211,159,0.35)] transition hover:brightness-110"
                  >
                    Explore venues
                  </Link>
                  <Link
                    href="/teams"
                    className="inline-flex items-center justify-center rounded-full border border-white/15 bg-white/5 px-7 py-3.5 text-base font-bold text-white transition hover:border-emerald-400/40 hover:text-emerald-300"
                  >
                    Browse teams
                  </Link>
                </div>
              </div>

              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-1">
                <StatCard value="50+" label="Countries" />
                <StatCard value="1,000+" label="Stadiums" />
                <StatCard value="∞" label="Memories" />
              </div>
            </div>
          </div>
        </section>

        <section className="mt-20">
          <div className="mb-8 flex items-end justify-between gap-4">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.28em] text-emerald-300">Why it matters</p>
              <h2 className="mt-2 text-3xl font-black tracking-[-0.05em] text-white sm:text-4xl">Built for football fans who keep score.</h2>
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
            <h2 className="mt-3 text-3xl font-black tracking-[-0.05em] text-white sm:text-4xl">Your football diary in three steps.</h2>
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
              Under construction
            </div>
            <h2 className="mt-6 text-3xl font-black tracking-[-0.05em] text-white sm:text-5xl">The experience is being shaped around your football life.</h2>
            <p className="mx-auto mt-4 max-w-2xl text-base leading-8 text-slate-300">
              We are building a more premium, more personal way to track your visits, results, and the stadiums that become part of your story.
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
