"use client";

import { useRouter } from "next/navigation";
import Image from "next/image";
import { LuCheck, LuPencil, LuListTodo, LuSmartphone } from "react-icons/lu";
import { motion, useMotionValue, useSpring, Variants } from "framer-motion";
import { useEffect } from "react";

// Reusable scroll animation variants
const scrollVariants: Variants = {
  hidden: { opacity: 0, y: 50 },
  visible: (i: number = 0) => ({
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.8,
      delay: i * 0.15,
      ease: "easeOut",
    },
  }),
};

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
      {/* Hero Content - Glassmorphism Card */}
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1 }}
        className="relative z-10 max-w-3xl mx-auto px-8 py-12 rounded-3xl 
  backdrop-blur-lg bg-white/10 border border-white/20 shadow-2xl text-center"
      >
        <motion.h1
          variants={scrollVariants}
          initial="hidden"
          animate="visible"
          className="text-5xl md:text-7xl font-extrabold leading-tight tracking-tight 
    bg-gradient-to-r from-purple-700 via-pink-600 to-purple-800 bg-clip-text text-transparent"
        >
          Manage Tasks <br /> Smarter, Not Harder
        </motion.h1>

        <motion.p
          variants={scrollVariants}
          initial="hidden"
          animate="visible"
          custom={1}
          className="mt-6 text-lg md:text-xl text-gray-200 max-w-xl mx-auto"
        >
          Boost your productivity with a minimal yet powerful todo app designed
          for modern life.
        </motion.p>

        <div className="mt-10 flex justify-center gap-4">
          <motion.button
            whileHover={{
              scale: 1.05,
              boxShadow: "0px 0px 25px rgba(236,72,153,0.6)",
            }}
            whileTap={{ scale: 0.95 }}
            variants={scrollVariants}
            initial="hidden"
            animate="visible"
            custom={2}
            onClick={() => router.push("/login")}
            className="relative px-8 py-4 rounded-full text-lg font-semibold 
      bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg"
          >
            Get Started
          </motion.button>
          <motion.a
            whileHover={{ scale: 1.05 }}
            variants={scrollVariants}
            initial="hidden"
            animate="visible"
            custom={3}
            href="#features"
            className="px-8 py-4 rounded-full border border-white/30 text-white font-medium 
      backdrop-blur-sm hover:bg-white/10"
          >
            Learn More
          </motion.a>
        </div>
      </motion.div>

      {/* Features Section */}
      <motion.div
        className="container mx-auto px-6 py-24"
        variants={scrollVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
      >
        <h2 className="text-4xl md:text-5xl font-bold text-center text-purple-900 tracking-tight mb-16">
          Why Choose Our App?
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
          {features.map((feature, index) => (
            <motion.div
              key={index}
              variants={scrollVariants}
              custom={index}
              initial="hidden"
              whileInView="visible"
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
      </motion.div>

      {/* Benefits Section */}
      <motion.div
        className="container mx-auto px-6 py-20"
        variants={scrollVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
      >
        <motion.div
          variants={scrollVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="bg-white/60 backdrop-blur-xl rounded-3xl p-10 md:p-16 border border-purple-100 shadow-xl"
        >
          <div className="grid md:grid-cols-2 gap-16 items-center">
            <motion.div
              variants={scrollVariants}
              custom={0}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              className="space-y-6"
            >
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
            </motion.div>
            <motion.div
              variants={scrollVariants}
              custom={1}
              initial="hidden"
              whileInView="visible"
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
      </motion.div>
    </div>
  );
}
