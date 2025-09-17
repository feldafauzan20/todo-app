"use client";

import { useRouter } from "next/navigation";
import { supabase } from "../../lib/supabaseClient";

export default function LoginPage() {
  const router = useRouter();

  const handleLoginWithGoogle = async () => {
    try {
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
          queryParams: {
            access_type: 'offline',
            prompt: 'consent',
          },
        },
      });

      if (error) throw error;

      // Success case is handled by middleware after OAuth callback
    } catch (error) {
      console.error("Login failed:", error);
    }
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
