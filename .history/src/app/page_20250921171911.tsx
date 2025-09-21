"use client";

import { useRouter } from "next/navigation";
import Image from "next/image";
import { LuCheck, LuPencil, LuListTodo, LuSmartphone } from "react-icons/lu";
import { motion, Variants } from "framer-motion";
import Navbar from "@/components/Navbar";

// Scroll animation
const scrollVariants: Variants = {
  hidden: { opacity: 0, y: 30 },
  visible: (i: number = 0) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, delay: i * 0.15, ease: "easeOut" },
  }),
};

export default function LandingPage() {
  const router = useRouter();

  const features = [
    {
      icon: <LuListTodo className="w-8 h-8" />,
      title: "Simple Task Management",
      description: "Add, edit, and organize your daily tasks seamlessly.",
    },
    {
      icon: <LuCheck className="w-8 h-8" />,
      title: "Track Progress",
      description: "Mark tasks as complete and see your growth clearly.",
    },
    {
      icon: <LuPencil className="w-8 h-8" />,
      title: "Quick Edit",
      description: "Update tasks instantly with an intuitive interface.",
    },
    {
      icon: <LuSmartphone className="w-8 h-8" />,
      title: "Mobile Ready",
      description: "Access your tasks anytime, from any device.",
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-gray-50 text-gray-900">
      <Navbar />
      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center px-6">
        {/* Soft background accent */}
        <div className="absolute inset-0 -z-10 overflow-hidden">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 0.3, scale: 1 }}
            transition={{ duration: 2 }}
            className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] rounded-full bg-purple-300 blur-3xl"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 0.3, scale: 1 }}
            transition={{ duration: 2, delay: 0.3 }}
            className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] rounded-full bg-pink-300 blur-3xl"
          />
        </div>

        <div className="container mx-auto grid md:grid-cols-2 gap-12 items-center">
          {/* Hero Content */}
          <div className="text-center md:text-left space-y-6">
            <motion.h1
              initial="hidden"
              animate="visible"
              variants={scrollVariants}
              className="text-5xl md:text-6xl font-bold tracking-tight max-w-2xl"
            >
              Manage Tasks{" "}
              <span className="bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                Smarter, Not Harder
              </span>
            </motion.h1>

            <motion.p
              variants={scrollVariants}
              initial="hidden"
              animate="visible"
              custom={1}
              className="text-lg md:text-xl text-gray-600 max-w-xl"
            >
              Boost your productivity with a minimal yet powerful todo app
              designed for modern life.
            </motion.p>

            <motion.div
              variants={scrollVariants}
              initial="hidden"
              animate="visible"
              custom={2}
              className="flex gap-4 justify-center md:justify-start"
            >
              <button
                onClick={() => router.push("/login")}
                className="px-6 py-3 rounded-full bg-gradient-to-r from-purple-600 to-pink-600 text-white font-medium hover:opacity-90 transition hover:cursor-pointer"
              >
                Get Started
              </button>
            </motion.div>
          </div>

          {/* Hero Mockup */}
          <motion.div
            variants={scrollVariants}
            initial="hidden"
            animate="visible"
            custom={3}
            className="relative h-[400px] md:h-[500px] flex justify-center"
          >
            <Image
              src="/assets/illustrations/mockup-hero.webp" // ganti dengan asset mockup kamu
              alt="App Mockup"
              fill
              priority
              sizes="(max-width: 768px) 100vw,
         (max-width: 1200px) 50vw,
         33vw"
              className="object-contain drop-shadow-2xl"
            />
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section
        id="features"
        className="container mx-auto px-6 py-24 text-center scroll-mt-20"
      >
        <h2 className="text-4xl md:text-5xl font-bold mb-16">
          Why Choose Our App?
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
          {features.map((feature, index) => (
            <motion.div
              key={index}
              variants={scrollVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              custom={index}
              className="p-8 rounded-2xl bg-white shadow-sm border border-gray-100 hover:shadow-md transition"
            >
              <div className="flex flex-col items-center space-y-4">
                <div className="text-purple-600">{feature.icon}</div>
                <h3 className="text-lg font-semibold">{feature.title}</h3>
                <p className="text-gray-600 text-sm">{feature.description}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Benefits Section */}
      <section
        id="benefits"
        className="container mx-auto px-6 py-20 scroll-mt-20"
      >
        <motion.div
          variants={scrollVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="rounded-2xl bg-white shadow-sm border border-gray-100 p-10 md:p-16"
        >
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <h2 className="text-3xl md:text-4xl font-bold">
                Boost Your Productivity
              </h2>
              <ul className="space-y-4 text-left">
                {[
                  "Stay focused on important tasks",
                  "Never miss important deadlines",
                  "Track your daily achievements",
                  "Organize tasks effortlessly",
                ].map((text, i) => (
                  <li key={i} className="flex items-center space-x-3">
                    <LuCheck className="w-5 h-5 text-purple-600" />
                    <span className="text-gray-700">{text}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="relative h-64 md:h-80">
              <Image
                src="/assets/illustrations/check-image-landing.webp"
                alt="Productivity Illustration"
                fill
                className="object-contain"
              />
            </div>
          </div>
        </motion.div>
      </section>
    </div>
  );
}
