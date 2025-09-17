"use client";

import { useRouter } from "next/navigation";
import { supabase } from "../../lib/supabaseClient";

export default function LoginPage() {
  const router = useRouter();

  const handleLoginWithGoogle = async () => {
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/`,
        // After successful OAuth, Supabase will redirect back to root
      },
    });

    if (error) {
      console.error("Login failed:", error.message);
      return;
    }

    // If login is successful, manually redirect
    if (data) {
      router.push("/");
      router.refresh(); // Refresh to update auth state
    }
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-6">
      <h1 className="text-4xl font-extrabold mb-8">Welcome Back</h1>
      <button
        onClick={handleLoginWithGoogle}
        className="bg-red-600 hover:bg-red-700 text-white font-semibold px-6 py-3 rounded-lg shadow-md transition-all duration-200"
      >
        Login with Google
      </button>
      <p className="mt-4 text-gray-600">
        Don't have an account?{" "}
        <a
          href="/signup"
          className="text-red-500 hover:underline font-medium"
        >
          Sign up here
        </a>
      </p>
    </div>
  );
}
