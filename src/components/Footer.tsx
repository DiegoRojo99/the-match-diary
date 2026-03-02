import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* App Info */}
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center mb-4">
              <span className="text-2xl">⚽</span>
              <span className="ml-2 text-xl font-semibold">The Match Diary</span>
            </div>
            <p className="text-gray-300 mb-4 max-w-md">
              Track your live football experiences, build your stadium map, and create lasting memories 
              of every match you attend.
            </p>
            <p className="text-sm text-gray-400">
              Data powered by{' '}
              <a 
                href="https://www.api-football.com/" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-green-400 hover:text-green-300"
              >
                API-Football
              </a>
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Quick Links</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/matches" className="text-gray-300 hover:text-green-400 transition-colors">
                  My Matches
                </Link>
              </li>
              <li>
                <Link href="/stadiums" className="text-gray-300 hover:text-green-400 transition-colors">
                  Stadium Map
                </Link>
              </li>
              <li>
                <Link href="/competitions" className="text-gray-300 hover:text-green-400 transition-colors">
                  Competitions
                </Link>
              </li>
              <li>
                <Link href="/stats" className="text-gray-300 hover:text-green-400 transition-colors">
                  Statistics
                </Link>
              </li>
            </ul>
          </div>

          {/* Features */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Features</h3>
            <ul className="space-y-2 text-sm">
              <li className="text-gray-300">✓ Match tracking</li>
              <li className="text-gray-300">✓ Stadium visits</li>
              <li className="text-gray-300">✓ Competition logs</li>
              <li className="text-gray-300">✓ Personal statistics</li>
              <li className="text-gray-300">✓ Mobile responsive</li>
              <li className="text-gray-300">✓ PWA installable</li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-8 pt-8 flex flex-col sm:flex-row justify-between items-center">
          <p className="text-sm text-gray-400">
            © {new Date().getFullYear()} The Match Diary. Built with Next.js and ❤️ for football fans.
          </p>
          <div className="flex space-x-6 mt-4 sm:mt-0">
            <Link href="/privacy" className="text-sm text-gray-400 hover:text-green-400">
              Privacy Policy
            </Link>
            <Link href="/terms" className="text-sm text-gray-400 hover:text-green-400">
              Terms of Service
            </Link>
            <a
              href="https://github.com/DiegoRojo99/the-match-diary"
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-gray-400 hover:text-green-400"
            >
              GitHub
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}