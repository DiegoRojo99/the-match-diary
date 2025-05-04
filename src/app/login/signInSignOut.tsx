'use client';
import { signIn, signOut, useSession } from "next-auth/react";

export default function SignInSignOut() {
  const { data: session } = useSession();

  if (session) {
    return (
      <div>
        <h2>Welcome, {session.user?.name}!</h2>
        <button onClick={() => signOut()}>Sign Out</button>
      </div>
    );
  }

  return (
    <div>
      <h2>Please sign in</h2>
      <button onClick={() => signIn("google")}>Sign In with Google</button>
    </div>
  );
}