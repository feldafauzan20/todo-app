"use client";

import { useRouter } from "next/navigation";
import Image from "next/image";

export default function LandingPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-pink-50">
      <div className="container mx-auto px-4 py-20">
        <div className="flex flex-col items-center text-center space-y-8">
          {/* Logo atau ilustrasi */}
          <div className="w-32 h-32 relative mb-8">
            <Image
              src="/assets/illustrations/cat-modal.webp"
              alt="Todo App Logo"
              fill
              className="object-contain"
              priority
            />
          </div>

          <h1 className="text-5xl md:text-6xl font-bold text-blue-900">
            Manage Tasks Better
          </h1>
          
          <p className="text-xl text-blue-800/80 max-w-2xl">
            Stay organized and boost your productivity with our simple yet powerful todo app
          </p>

          <button
            onClick={() => router.push('/login')}
            className="bg-blue-600 text-white px-8 py-3 rounded-lg text-lg font-medium hover:bg-blue-700 transition-colors"
          >
            Get Started
          </button>
        </div>
      </div>
    </div>
  );
}