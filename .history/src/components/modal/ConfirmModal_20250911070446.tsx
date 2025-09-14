"use client";

import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";

type ConfirmModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title?: string;
  message?: string;
};

export default function ConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  title = "Hapus Todo?",
  message = "Apakah kamu yakin ingin menghapus todo ini?",
}: ConfirmModalProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 bg-black/40 flex items-center justify-center z-50"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.8, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="relative bg-white rounded-2xl shadow-xl p-6 pt-16 max-w-sm w-full text-center"
          >
            {/* Gambar kucing */}
            <div className="absolute -top-16 left-1/2 -translate-x-1/2">
              <Image
                src="/assets/illustrations/cat-modal.webp" // letakkan di public/cat-modal.webp
                alt="Cute Cat"
                width={120}
                height={120}
                className="drop-shadow-lg"
              />
            </div>

            <h2 className="text-xl font-bold text-pink-600 mb-2">{title}</h2>
            <p className="text-gray-700 mb-6">{message}</p>

            <div className="flex justify-center gap-3">
              <button
                onClick={onClose}
                className="px-4 py-2 rounded-xl bg-gray-200 hover:bg-gray-300 transition"
              >
                Batal
              </button>
              <button
                onClick={() => {
                  onConfirm();
                  onClose();
                }}
                className="px-4 py-2 rounded-xl bg-pink-500 text-white hover:bg-pink-600 transition"
              >
                Hapus
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
