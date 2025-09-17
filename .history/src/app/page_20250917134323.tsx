"use client";

import { useRouter } from "next/navigation";
import Image from "next/image";
import { LuCheck, LuPencil, LuListTodo, LuSmartphone } from "react-icons/lu";

export default function LandingPage() {
  const router = useRouter();

  const features = [
    {
      icon: <LuListTodo className="w-8 h-8 text-blue-600" />,
      title: "Simple Task Management",
      description:
        "Easily add, edit, and organize your daily tasks in one place",
    },
    {
      icon: <LuCheck className="w-8 h-8 text-blue-600" />,
      title: "Track Progress",
      description: "Mark tasks as complete and track your daily achievements",
    },
    {
      icon: <LuPencil className="w-8 h-8 text-blue-600" />,
      title: "Quick Edit",
      description: "Update your tasks on the fly with our intuitive interface",
    },
    {
      icon: <LuSmartphone className="w-8 h-8 text-blue-600" />,
      title: "Mobile Friendly",
      description: "Access your tasks from any device, anywhere, anytime",
    },
  ];

  return (
    <div className="min-h-screen bg-pink-100">
      {/* Hero Section */}
      <div className="container mx-auto px-4 py-20">
        <div className="flex flex-col items-center text-center space-y-8">
          {/* Logo */}
          <div className="w-32 h-32 relative mb-8">
            <Image
              src="/assets/illustrations/cat-modal.webp"
              alt="Todo App Logo"
              fill
              className="object-contain"
              priority
            />
          </div>

          <h1 className="text-4xl md:text-6xl font-bold text-blue-900 leading-tight">
            Manage Tasks Better
          </h1>

          <p className="text-lg md:text-xl text-blue-800/80 max-w-2xl">
            Stay organized and boost your productivity with our simple yet
            powerful todo app
          </p>

          <button
            onClick={() => router.push("/login")}
            className="bg-blue-600 text-white px-8 py-3 rounded-lg text-lg font-medium hover:bg-blue-700 transition-colors"
          >
            Get Started
          </button>
        </div>
      </div>

      {/* Features Section */}
      <div className="container mx-auto px-4 py-16">
        <h2 className="text-3xl md:text-4xl font-bold text-center text-blue-900 mb-12">
          Why Choose Our Todo App?
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feature, index) => (
            <div
              key={index}
              className="bg-white/50 backdrop-blur-sm p-6 rounded-xl shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="flex flex-col items-center text-center space-y-4">
                {feature.icon}
                <h3 className="text-xl font-semibold text-blue-900">
                  {feature.title}
                </h3>
                <p className="text-blue-800/70">{feature.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Benefits Section */}
      <div className="container mx-auto px-4 py-16 mb-8">
        <div className="bg-white/30 backdrop-blur-sm rounded-2xl p-8 md:p-12">
          <h2 className="text-3xl md:text-4xl font-bold text-center text-blue-900 mb-8">
            Boost Your Productivity
          </h2>
          <div className="grid md:grid-cols-2 gap-8 items-center">
            <div className="space-y-6">
              <p className="text-lg text-blue-800/80">
                Our todo app helps you:
              </p>
              <ul className="space-y-4">
                <li className="flex items-center space-x-3">
                  <LuCheck className="w-6 h-6 text-blue-600" />
                  <span>Stay focused on important tasks</span>
                </li>
                <li className="flex items-center space-x-3">
                  <LuCheck className="w-6 h-6 text-blue-600" />
                  <span>Never forget important deadlines</span>
                </li>
                <li className="flex items-center space-x-3">
                  <LuCheck className="w-6 h-6 text-blue-600" />
                  <span>Track your daily progress</span>
                </li>
                <li className="flex items-center space-x-3">
                  <LuCheck className="w-6 h-6 text-blue-600" />
                  <span>Organize tasks efficiently</span>
                </li>
              </ul>
            </div>
            <div className="relative h-64 md:h-96">
              <Image
                src="/assets/illustrations/cat-modal-reverse.webp"
                alt="Productivity Illustration"
                fill
                className="object-contain"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
