"use client";

import { useRouter } from "next/navigation";
import Image from "next/image";
import { LuCheck, LuListTodo, LuPencil, LuSmartphone } from "react-icons/lu";
import { motion } from "framer-motion";

export default function LandingPage() {
  const router = useRouter();

  const features = [
    {
      icon: <LuListTodo className="w-7 h-7" />,
      title: "Organize Simply",
      description: "Add, edit, and arrange tasks effortlessly in one place.",
    },
    {
      icon: <LuCheck className="w-7 h-7" />,
      title: "Stay on Track",
      description: "Check off tasks and monitor your daily achievements.",
    },
    {
      icon: <LuPencil className="w-7 h-7" />,
      title: "Quick Updates",
      description: "Edit tasks instantly with a clean and intuitive UI.",
    },
    {
      icon: <LuSmartphone className="w-7 h-7" />,
      title: "Work Anywhere",
      description: "Access tasks seamlessly across all your devices.",
    },
  ];

  return (
    <div className="bg-gradient-to-b from-white via-purple-50/40 to-white min-h-screen">
      {/* Hero Section */}
      <div className="relative h-[90vh] flex items-center">
        <div className="absolute inset-0 bg-[url('/assets/illustrations/download.svg')] bg-cover bg-center opacity-10" />

        <div className="container mx-auto px-6 md:px-12 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1 }}
            className="max-w-3xl text-center mx-auto space-y-6"
          >
            <h1 className="text-5xl md:text-6xl font-bold tracking-tight text-gray-900 leading-tight">
              Manage Your Tasks <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-pink-500">
                Smarter & Faster
              </span>
            </h1>
            <p className="text-lg md:text-xl text-gray-600">
              Boost productivity with a modern todo app designed for simplicity,
              elegance, and focus.
            </p>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => router.push("/login")}
              className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-8 py-3 rounded-xl text-lg font-semibold shadow hover:shadow-xl transition-all"
            >
              Get Started Free
            </motion.button>
          </motion.div>
        </div>
      </div>

      {/* Features Section */}
      <div className="container mx-auto px-6 md:px-12 py-24">
        <h2 className="text-3xl md:text-4xl font-bold text-center text-gray-900 mb-16">
          Why Choose Our Todo App?
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10">
          {features.map((feature, index) => (
            <motion.div
              key={index}
              whileHover={{ y: -6 }}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              viewport={{ once: true }}
              className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100 hover:shadow-md transition-all"
            >
              <div className="flex flex-col items-center text-center space-y-4">
                <div className="p-3 rounded-full bg-gradient-to-r from-purple-600/10 to-pink-500/10 text-purple-600">
                  {feature.icon}
                </div>
                <h3 className="text-lg font-semibold text-gray-900">
                  {feature.title}
                </h3>
                <p className="text-gray-600 text-sm">{feature.description}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Benefits Section */}
      <div className="container mx-auto px-6 md:px-12 py-24">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="bg-white rounded-3xl shadow-sm border border-gray-100 p-12 md:p-16"
        >
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900">
                Designed for Productivity
              </h2>
              <p className="text-gray-600 text-lg">
                Focus on what matters most with features built to simplify your
                workflow:
              </p>
              <ul className="space-y-4">
                {[
                  "Stay focused on key priorities",
                  "Never miss important deadlines",
                  "Visualize your daily progress",
                  "Organize tasks with ease",
                ].map((text, i) => (
                  <li key={i} className="flex items-center space-x-3">
                    <LuCheck className="w-5 h-5 text-purple-600" />
                    <span className="text-gray-700">{text}</span>
                  </li>
                ))}
              </ul>
            </div>
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              whileInView={{ scale: 1, opacity: 1 }}
              transition={{ duration: 1 }}
              viewport={{ once: true }}
              className="relative h-72 md:h-96"
            >
              <Image
                src="/assets/illustrations/check-image-landing.webp"
                alt="Productivity Illustration"
                fill
                className="object-contain"
              />
            </motion.div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
