"use client";

import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import { FaExclamationTriangle } from "react-icons/fa";

type ConfirmModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title?: string;
  message?: string;
  itemName?: string;
};

export default function ConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  title = "Delete Confirmation",
  message = "Are you sure you want to permanently delete this item? This action cannot be undone.",
  itemName,
}: ConfirmModalProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.8, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="relative bg-white rounded-2xl shadow-xl p-6 pt-12 max-w-sm md:max-w-lg w-full text-center"
          >
            {/* Gambar kucing */}
            <div className="absolute -top-23 md:-top-30 left-1/2 -translate-x-1/2">
              <Image
                src="/assets/illustrations/cat-modal.webp"
                alt="cat image"
                width={600}
                height={600}
                className="drop-shadow-lg"
              />
            </div>

            {/* Icon Warning */}
            <motion.div
              className="flex justify-center mb-3"
              animate={{ rotate: [0, -5, 5, -5, 5, 0] }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            >
              <FaExclamationTriangle className="text-red-600 text-5xl" />
            </motion.div>

            <h2 className="text-xl font-bold text-red-600 mb-2">{title}</h2>
            <p className="text-gray-700 mb-6">{message}</p>

            {itemName && (
              <p className="text-red-600 font-semibold mb-6">
                Item:{" "}
                <span className="bg-red-100 px-2 py-1 rounded">{itemName}</span>
              </p>
            )}

            <div className="flex justify-center gap-3">
              <button
                onClick={onClose}
                className="px-4 py-2 rounded-xl text-red-700 bg-gray-200 hover:bg-gray-300 transition hover:cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  onConfirm();
                  onClose();
                }}
                className="px-4 py-2 rounded-xl bg-red-500 text-white hover:bg-red-600 transition hover:cursor-pointer"
              >
                Delete
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
