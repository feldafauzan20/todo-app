"use client";

import { useRouter } from "next/navigation";
import Image from "next/image";
import { LuCheck, LuPencil, LuListTodo, LuSmartphone } from "react-icons/lu";
import { motion, useMotionValue, useSpring } from "framer-motion";
import { useEffect } from "react";

export default function LandingPage() {
  const router = useRouter();

  // Motion values untuk cursor (blobs)
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  const springX = useSpring(mouseX, { stiffness: 50, damping: 20 });
  const springY = useSpring(mouseY, { stiffness: 50, damping: 20 });

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      const { innerWidth, innerHeight } = window;
      const x = e.clientX / innerWidth - 0.5;
      const y = e.clientY / innerHeight - 0.5;
      mouseX.set(x * 100);
      mouseY.set(y * 100);
    };
    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, [mouseX, mouseY]);

  const features = [
    {
      icon: <LuListTodo className="w-8 h-8" />,
      title: "Simple Task Management",
      description: "Add, edit, and organize your daily tasks seamlessly",
    },
    {
      icon: <LuCheck className="w-8 h-8" />,
      title: "Track Progress",
      description: "Mark tasks as complete and see your growth clearly",
    },
    {
      icon: <LuPencil className="w-8 h-8" />,
      title: "Quick Edit",
      description: "Update tasks instantly with an intuitive interface",
    },
    {
      icon: <LuSmartphone className="w-8 h-8" />,
      title: "Mobile Ready",
      description: "Access your tasks anytime, from any device",
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-50 via-pink-50 to-purple-100">
      {/* Hero Section */}
      <div className="relative h-screen overflow-hidden flex items-center justify-center text-center">
        {/* Parallax background */}
        <motion.div
          initial={{ y: -100, opacity: 0 }}
          animate={{ y: 0, opacity: 0.6 }}
          transition={{ duration: 1.5 }}
          className="absolute inset-0 bg-[url('/assets/bg/mesh-gradient.svg')] bg-cover bg-fixed"
        />

        {/* Floating blobs */}
        <motion.div
          style={{ x: springX, y: springY }}
          className="absolute top-20 left-20 w-96 h-96 bg-purple-300/40 rounded-full blur-3xl mix-blend-multiply"
        />
        <motion.div
          style={{ x: springX, y: springY }}
          className="absolute bottom-20 right-32 w-[28rem] h-[28rem] bg-pink-300/40 rounded-full blur-3xl mix-blend-multiply"
        />

        {/* Hero Content */}
        <div className="relative z-10 px-6 max-w-3xl mx-auto">
          <motion.h1
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1 }}
            className="text-5xl md:text-7xl font-extrabold bg-gradient-to-r from-purple-700 via-pink-600 to-purple-800 bg-clip-text text-transparent tracking-tight leading-tight"
          >
            Manage Tasks <br /> Smarter, Not Harder
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1.2 }}
            className="mt-6 text-lg md:text-xl text-purple-800/80 max-w-xl mx-auto"
          >
            Boost your productivity with a minimal yet powerful todo app
            designed for modern life.
          </motion.p>
          <motion.button
            whileHover={{ scale: 1.08 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => router.push("/login")}
            className="mt-10 bg-gradient-to-r from-purple-600 to-pink-600 text-white px-10 py-4 rounded-2xl text-lg font-semibold shadow-lg hover:shadow-xl transition-all relative"
          >
            Get Started
            <span className="absolute inset-0 rounded-2xl bg-gradient-to-r from-purple-400/30 to-pink-400/30 blur-lg -z-10" />
          </motion.button>
        </div>
      </div>

      {/* Features Section */}
      <div className="container mx-auto px-6 py-24">
        <h2 className="text-4xl md:text-5xl font-bold text-center text-purple-900 tracking-tight mb-16">
          Why Choose Our App?
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
          {features.map((feature, index) => (
            <motion.div
              key={index}
              whileHover={{ scale: 1.05 }}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              viewport={{ once: true }}
              className="bg-white/50 backdrop-blur-xl p-8 rounded-3xl shadow-lg border border-purple-100 hover:shadow-2xl transition-all"
            >
              <div className="flex flex-col items-center text-center space-y-5">
                <div className="text-purple-600">{feature.icon}</div>
                <h3 className="text-xl font-semibold text-purple-900 tracking-tight">
                  {feature.title}
                </h3>
                <p className="text-purple-700/70 text-sm md:text-base leading-relaxed">
                  {feature.description}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Benefits Section */}
      <div className="container mx-auto px-6 py-20">
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9 }}
          viewport={{ once: true }}
          className="bg-white/60 backdrop-blur-xl rounded-3xl p-10 md:p-16 border border-purple-100 shadow-xl"
        >
          <div className="grid md:grid-cols-2 gap-16 items-center">
            <div className="space-y-6">
              <h2 className="text-4xl font-bold bg-gradient-to-r from-purple-700 to-pink-600 bg-clip-text text-transparent tracking-tight">
                Boost Your Productivity
              </h2>
              <ul className="space-y-4">
                {[
                  "Stay focused on important tasks",
                  "Never miss important deadlines",
                  "Track your daily achievements",
                  "Organize tasks effortlessly",
                ].map((text, i) => (
                  <li key={i} className="flex items-center space-x-3">
                    <LuCheck className="w-6 h-6 text-purple-600" />
                    <span className="text-purple-800/90 text-lg">{text}</span>
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
                className="object-contain drop-shadow-2xl"
              />
            </motion.div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
