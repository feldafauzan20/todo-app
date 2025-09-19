"use client";

import { useRouter } from "next/navigation";
import Image from "next/image";
import { LuCheck, LuPencil, LuListTodo, LuSmartphone } from "react-icons/lu";
import { motion } from "framer-motion";

export default function LandingPage() {
  const router = useRouter();

  const features = [
    {
      icon: <LuListTodo className="w-8 h-8" />,
      title: "Simple Task Management",
      description:
        "Easily add, edit, and organize your daily tasks in one place",
    },
    {
      icon: <LuCheck className="w-8 h-8" />,
      title: "Track Progress",
      description: "Mark tasks as complete and track your daily achievements",
    },
    {
      icon: <LuPencil className="w-8 h-8" />,
      title: "Quick Edit",
      description: "Update your tasks on the fly with our intuitive interface",
    },
    {
      icon: <LuSmartphone className="w-8 h-8" />,
      title: "Mobile Friendly",
      description: "Access your tasks from any device, anywhere, anytime",
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-50 via-pink-50 to-purple-100">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        {/* Parallax background */}
        <motion.div
          initial={{ y: -100, opacity: 0 }}
          animate={{ y: 0, opacity: 0.5 }}
          transition={{ duration: 1.5 }}
          className="absolute inset-0 bg-[url('/assets/illustrations/download.svg')] bg-cover bg-fixed"
        />
        <div className="container mx-auto px-4 py-28 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1 }}
            className="flex flex-col items-center text-center space-y-8"
          >
            <h1 className="text-4xl md:text-6xl font-extrabold text-purple-800 leading-tight drop-shadow-sm">
              Manage Tasks Better 🚀
            </h1>
            <p className="text-lg md:text-xl text-purple-700/80 max-w-2xl">
              Stay organized and boost your productivity with our simple yet
              powerful todo app
            </p>
            <motion.button
              whileHover={{ scale: 1.08 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => router.push("/login")}
              className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-10 py-3 rounded-xl text-lg font-semibold shadow-md hover:shadow-lg transition-all"
            >
              Get Started
            </motion.button>
          </motion.div>
        </div>
      </div>

      {/* Features Section */}
      <div className="container mx-auto px-4 py-20">
        <h2 className="text-3xl md:text-4xl font-bold text-center text-purple-800 mb-12">
          Why Choose Our Todo App?
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feature, index) => (
            <motion.div
              key={index}
              whileHover={{ scale: 1.05 }}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              viewport={{ once: true }}
              className="bg-white/70 backdrop-blur-md p-6 rounded-2xl shadow hover:shadow-lg border border-purple-100"
            >
              <div className="flex flex-col items-center text-center space-y-4">
                <div className="text-purple-600">{feature.icon}</div>
                <h3 className="text-xl font-semibold text-purple-800">
                  {feature.title}
                </h3>
                <p className="text-purple-700/70">{feature.description}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Benefits Section */}
      <div className="container mx-auto px-4 py-16 mb-12">
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9 }}
          viewport={{ once: true }}
          className="bg-white/60 backdrop-blur-md rounded-3xl p-10 md:p-16 border border-purple-100 shadow-lg"
        >
          <h2 className="text-3xl md:text-4xl font-bold text-center text-purple-800 mb-10">
            Boost Your Productivity
          </h2>
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <p className="text-lg text-purple-700/80">
                Our todo app helps you:
              </p>
              <ul className="space-y-4">
                {[
                  "Stay focused on important tasks",
                  "Never forget important deadlines",
                  "Track your daily progress",
                  "Organize tasks efficiently",
                ].map((text, i) => (
                  <li key={i} className="flex items-center space-x-3">
                    <LuCheck className="w-6 h-6 text-purple-600" />
                    <span className="text-purple-700">{text}</span>
                  </li>
                ))}
              </ul>
            </div>
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              whileInView={{ scale: 1, opacity: 1 }}
              transition={{ duration: 1 }}
              viewport={{ once: true }}
              className="relative h-64 md:h-96"
            >
              <Image
                src="/assets/illustrations/check-image-landing.webp"
                alt="Productivity Illustration"
                fill
                className="object-contain drop-shadow-md"
              />
            </motion.div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
