export default function Home() {
  return (
    <div className="items-center justify-center flex flex-col min-h-screen">  
      <h1 className="text-4xl md:text-5xl font-bold text-gray-800 mb-6">
        Welcome to <span className="text-(--color-mountain-meadow-500)">The Match Diary</span>
      </h1>
      <p className="text-lg md:text-xl text-gray-600 mb-8 max-w-xl">
        Track your football adventures, review stadiums, unlock achievements, and plan your next match day experience!
      </p>
      <a
        href="/login"
        className="px-6 py-3 bg-(--color-mountain-meadow-500) text-white rounded-full hover:bg-(--color-mountain-meadow-600) transition text-lg font-medium"
      >
        Get Started
      </a>
    </div>
  );
}