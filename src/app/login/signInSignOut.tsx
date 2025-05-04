'use client';
import { signIn, signOut, useSession } from "next-auth/react";
import { FaGoogle } from "react-icons/fa";

export default function SignInSignOut() {
  const { data: session } = useSession();

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 px-4">
      {session ? (
        <div className="bg-white p-6 rounded-xl shadow-md text-center">
          <h2 className="text-2xl font-semibold mb-4 text-black">
            Welcome, {session.user?.name}!
          </h2>
          <button
            onClick={() => signOut()}
            className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white font-medium rounded-lg transition cursor-pointer"
          >
            Sign Out
          </button>
        </div>
      ) : (
        <div className="bg-white p-6 rounded-xl shadow-md text-center">
          <h2 className="text-xl font-semibold mb-4 text-black">Please sign in</h2>
          <button
            onClick={() => signIn("google")}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition cursor-pointer"
          >
            <FaGoogle className="text-white" />
            Sign In with Google
          </button>
        </div>
      )}
    </div>
  );
}