"use client";

import Image from "next/image";
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
          // Tambahkan skipBrowserRedirect untuk menangani redirect manual
          skipBrowserRedirect: true,
          queryParams: {
            access_type: "offline",
            prompt: "consent",
          },
        },
      });

      if (error) {
        console.error("Login error:", error.message);
        throw error;
      }

      // Redirect manual ke callback URL
      if (data?.url) {
        console.log("Redirecting to:", data.url);
        window.location.href = data.url;
      }
    } catch (error) {
      console.error("Login failed:", error);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-pink-100 px-4">
      <div className="relative w-full max-w-sm pt-24 pb-32">
        {" "}
        {/* Added padding for cat images */}
        {/* Top Cat Image */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2">
          <Image
            src="/assets/illustrations/cat-edit-modal.webp"
            alt="Cat illustration"
            width={200}
            height={200}
            className="drop-shadow-lg object-contain w-auto h-auto max-w-[120px] sm:max-w-[200px]"
            priority
          />
        </div>
        {/* Main Modal */}
        <div className="bg-white backdrop-blur-md p-8 rounded-2xl shadow-xl w-full border border-white/20 space-y-8">
          <div className="text-center space-y-4">
            <h1 className="text-4xl font-bold text-blue-900">Hi there!</h1>
            <p className="text-blue-800/80">Please sign in to continue</p>
          </div>

          <button
            onClick={handleLoginWithGoogle}
            className="w-full flex items-center justify-center gap-3 bg-white hover:bg-blue-50 hover:cursor-pointer text-gray-700 px-6 py-3 rounded-lg transition-all duration-200 shadow-md hover:shadow-lg"
          >
            <svg className="w-6 h-6" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              />
            </svg>
            <span className="font-medium">Continue with Google</span>
          </button>

          <div className="text-center">
            <p className="text-blue-900/70 text-sm">
              By continuing, you agree to our Terms of Service and Privacy
              Policy
            </p>
          </div>
        </div>
        {/* Bottom Cat Image */}
        <div className="absolute bottom-2 left-1/2 -translate-x-1/2">
          <Image
            src="/assets/illustrations/cat-modal.webp"
            alt="Cat illustration reversed"
            width={250}
            height={250}
            className="drop-shadow-lg transform rotate-180 object-contain w-auto h-auto max-w-[120px] sm:max-w-[300px]"
          />
        </div>
      </div>
    </div>
  );
}
