import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="bg-black border-t border-gray-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col md:flex-row justify-between items-center">
          {/* App Info */}
          <div className="flex items-center mb-4 md:mb-0">
            <span className="text-2xl">⚽</span>
            <span className="ml-2 text-lg font-bold text-white">The Match Diary</span>
          </div>

          {/* Links */}
          <div className="flex space-x-6 text-sm">
            <Link href="/matches" className="text-gray-400 hover:text-green-400 transition-colors">
              Matches
            </Link>
            <Link href="/stadiums" className="text-gray-400 hover:text-green-400 transition-colors">
              Stadiums
            </Link>
            <Link href="/stats" className="text-gray-400 hover:text-green-400 transition-colors">
              Stats
            </Link>
            <a
              href="https://github.com/DiegoRojo99/the-match-diary"
              target="_blank"
              rel="noopener noreferrer"
              className="text-gray-400 hover:text-green-400 transition-colors"
            >
              GitHub
            </a>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-6 pt-6 text-center">
          <p className="text-sm text-gray-500">
            © {new Date().getFullYear()} The Match Diary. Made for football fans.
          </p>
        </div>
      </div>
    </footer>
  );
}