"use client";

import { supabase } from "../../lib/supabaseClient";

export default function Login() {
  const handleLoginWithGoogle = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
    });
    if (error) console.error("Login failed:", error.message);
  };

  return (
    <button
      onClick={handleLoginWithGoogle}
      className="bg-red-500 text-white px-4 py-2 rounded"
    >
      Login with Google
    </button>
  );
}
