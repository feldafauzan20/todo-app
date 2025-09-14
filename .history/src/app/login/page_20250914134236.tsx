"use client";

import { supabase } from "../../lib/supabaseClient";

export default function LoginPage() {
  const handleLoginWithGoogle = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
    });
    if (error) console.error("Login failed:", error.message);
  };

  return (
    <div className="p-6 text-center">
      <h1 className="text-2xl font-bold mb-4">Login Page</h1>
      <button
        onClick={handleLoginWithGoogle}
        className="bg-red-500 text-white px-4 py-2 rounded"
      >
        Login with Google
      </button>
    </div>
  );
}
