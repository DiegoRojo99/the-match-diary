export default function Home() {
  return (
    <div className="bg-black text-white min-h-screen">
      <div className="container mx-auto px-4 py-16">
        {/* Stadium-style Hero Section */}
        <div className="text-center space-y-8 relative">
          {/* Stadium Floodlight Effect */}
          <div className="absolute inset-0 pointer-events-none" />
          
          <div className="space-y-6 relative z-10">
            <div className="inline-block px-4 py-2 bg-green-500/20 border border-green-400/30 rounded-full mb-4">
              <span className="text-green-400 text-sm font-semibold tracking-wide">LIVE FROM THE STADIUM</span>
            </div>
            
            <h1 className="text-6xl md:text-7xl font-bold text-white drop-shadow-2xl">
              <span className="text-green-400">⚽</span> THE MATCH DIARY
            </h1>
            
            <p className="text-xl md:text-2xl text-gray-300 max-w-4xl mx-auto leading-relaxed">
              Your personal stadium experience tracker.<br/>
              <span className="text-green-400 font-semibold">Every match. Every stadium. Every moment.</span>
            </p>
          </div>
          
          {/* Stadium Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-6 justify-center relative z-10 mt-12">
            <button className="bg-green-500 hover:bg-green-400 text-black px-8 py-4 rounded-lg text-lg font-bold transition-all duration-300 transform hover:scale-105 shadow-lg shadow-green-500/25">
              START TRACKING ⟶
            </button>
            <button className="border-2 border-green-400 text-green-400 hover:bg-green-400 hover:text-black px-8 py-4 rounded-lg text-lg font-bold transition-all duration-300 transform hover:scale-105">
              EXPLORE STADIUMS 🏟️
            </button>
          </div>
        </div>

        {/* Stadium Features Grid */}
        <div className="mt-24 grid md:grid-cols-3 gap-8">
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-8 hover:border-green-400/30 transition-all duration-300 transform hover:scale-105 group">
            <div className="text-4xl mb-6 group-hover:scale-110 transition-transform">🏟️</div>
            <h3 className="text-2xl font-bold text-white mb-4 group-hover:text-green-400 transition-colors">Stadium Tracker</h3>
            <p className="text-gray-400 leading-relaxed">
              Build your personal stadium map. Track every ground you've visited, 
              from iconic Wembley to your local team's home.
            </p>
            <div className="mt-4 text-green-400 font-semibold text-sm">
              ✓ GPS Integration • ✓ Stadium Photos • ✓ Capacity Data
            </div>
          </div>
          
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-8 hover:border-green-400/30 transition-all duration-300 transform hover:scale-105 group">
            <div className="text-4xl mb-6 group-hover:scale-110 transition-transform">📊</div>
            <h3 className="text-2xl font-bold text-white mb-4 group-hover:text-green-400 transition-colors">Match Analytics</h3>
            <p className="text-gray-400 leading-relaxed">
              Deep dive into your football journey. Analyze attendance patterns, 
              favorite competitions, and memorable moments.
            </p>
            <div className="mt-4 text-green-400 font-semibold text-sm">
              ✓ Personal Stats • ✓ Attendance Trends • ✓ Export Reports
            </div>
          </div>
          
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-8 hover:border-green-400/30 transition-all duration-300 transform hover:scale-105 group">
            <div className="text-4xl mb-6 group-hover:scale-110 transition-transform">🏆</div>
            <h3 className="text-2xl font-bold text-white mb-4 group-hover:text-green-400 transition-colors">Competition Hub</h3>
            <p className="text-gray-400 leading-relaxed">
              Follow your journey across leagues, cups, and tournaments. 
              From Premier League to local derbies.
            </p>
            <div className="mt-4 text-green-400 font-semibold text-sm">
              ✓ Live Data • ✓ Season Progress • ✓ Competition Badges
            </div>
          </div>
        </div>

        {/* Stadium Atmosphere Section */}
        <div className="mt-24 text-center">
          <div className="bg-gradient-to-r from-gray-900 via-black to-gray-900 border border-gray-800 rounded-2xl p-8 max-w-4xl mx-auto relative overflow-hidden">
            {/* Stadium Light Effects */}
            <div className="absolute top-0 left-1/4 w-2 h-2 bg-green-400 rounded-full animate-pulse" />
            <div className="absolute top-0 right-1/4 w-2 h-2 bg-green-400 rounded-full animate-pulse delay-1000" />
            
            <div className="relative z-10">
              <div className="inline-flex items-center gap-2 bg-yellow-500/20 border border-yellow-400/30 rounded-full px-4 py-2 mb-6">
                <span className="w-2 h-2 bg-yellow-400 rounded-full animate-pulse" />
                <span className="text-yellow-400 font-semibold text-sm tracking-wide">UNDER CONSTRUCTION</span>
              </div>
              
              <h3 className="text-3xl font-bold text-white mb-4">
                Building Your Ultimate Football Experience
              </h3>
              
              <p className="text-gray-300 text-lg leading-relaxed max-w-2xl mx-auto">
                The Match Diary is being crafted with the passion of true football fans. 
                Soon you'll have the most comprehensive tool to document your stadium adventures, 
                match memories, and football journey.
              </p>
              
              <div className="mt-8 grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                <div className="bg-gray-800/50 rounded-lg p-3">
                  <div className="text-2xl font-bold text-green-400">50+</div>
                  <div className="text-xs text-gray-400">Countries</div>
                </div>
                <div className="bg-gray-800/50 rounded-lg p-3">
                  <div className="text-2xl font-bold text-green-400">1000+</div>
                  <div className="text-xs text-gray-400">Stadiums</div>
                </div>
                <div className="bg-gray-800/50 rounded-lg p-3">
                  <div className="text-2xl font-bold text-green-400">100+</div>
                  <div className="text-xs text-gray-400">Leagues</div>
                </div>
                <div className="bg-gray-800/50 rounded-lg p-3">
                  <div className="text-2xl font-bold text-green-400">∞</div>
                  <div className="text-xs text-gray-400">Memories</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
