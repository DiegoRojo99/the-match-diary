export default function Home() {
  return (
    <div className="bg-gradient-to-br from-green-50 to-emerald-100 dark:from-gray-900 dark:to-gray-800">
      <div className="container mx-auto px-4 py-16">
        {/* Hero Section */}
        <div className="text-center space-y-8">
          <div className="space-y-4">
            <h1 className="text-5xl md:text-6xl font-bold text-gray-800 dark:text-white">
              ⚽ The Match Diary
            </h1>
            <p className="text-xl md:text-2xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
              Track your live football experiences - matches, stadiums, and competitions all in one place
            </p>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button className="bg-green-600 hover:bg-green-700 text-white px-8 py-3 rounded-full text-lg font-semibold transition-colors">
              Start Tracking Matches
            </button>
            <button className="border-2 border-green-600 text-green-600 hover:bg-green-600 hover:text-white px-8 py-3 rounded-full text-lg font-semibold transition-colors">
              View Your Stadium Map
            </button>
          </div>
        </div>

        {/* Features Preview */}
        <div className="mt-24 grid md:grid-cols-3 gap-8">
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg">
            <div className="text-3xl mb-4">🏟️</div>
            <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-2">Stadium Tracker</h3>
            <p className="text-gray-600 dark:text-gray-300">
              Keep a visual map of every stadium you've visited and matches you've experienced.
            </p>
          </div>
          
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg">
            <div className="text-3xl mb-4">📊</div>
            <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-2">Match Statistics</h3>
            <p className="text-gray-600 dark:text-gray-300">
              Analyze your football experiences with detailed stats and insights.
            </p>
          </div>
          
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg">
            <div className="text-3xl mb-4">🏆</div>
            <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-2">Competition Log</h3>
            <p className="text-gray-600 dark:text-gray-300">
              Track matches across different leagues, cups, and international competitions.
            </p>
          </div>
        </div>

        {/* Coming Soon */}
        <div className="mt-16 text-center">
          <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-6 max-w-2xl mx-auto">
            <h3 className="text-lg font-semibold text-yellow-800 dark:text-yellow-200 mb-2">
              🚧 Under Development
            </h3>
            <p className="text-yellow-700 dark:text-yellow-300">
              The Match Diary is currently being built. Soon you'll be able to log matches, track stadiums, and build your football experience journey!
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
