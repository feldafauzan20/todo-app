"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Bell,
  BellOff,
  Volume2,
  VolumeX,
  Settings,
  TestTube,
} from "lucide-react";
import { notificationService } from "@/services/NotificationService";

type Props = {
  permission: NotificationPermission;
  isGranted: boolean;
  isSupported: boolean;
  requestPermission: () => Promise<NotificationPermission>;
};

export default function NotificationSettings({
  permission,
  isGranted,
  requestPermission,
}: Props) {
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    setSoundEnabled(notificationService.isSoundEnabled());
  }, []);

  const toggleSound = () => {
    const newSetting = notificationService.toggleSound();
    setSoundEnabled(newSetting);
  };

  const testNotification = () => {
    if (!isGranted) {
      alert("Please grant notification permission first");
      return;
    }

    notificationService.enableAudioAfterInteraction();
    notificationService.showOverdueNotification(1, {
      id: 999,
      text: "This is a test notification",
      priority: "high",
    });
  };

  return (
    <div className="relative">
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsOpen(!isOpen)}
        className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
        title="Notification Settings"
      >
        <Settings className="h-5 w-5" />
      </motion.button>

      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            className="absolute right-0 top-12 w-80 bg-white rounded-lg shadow-lg border p-4 z-50"
          >
            <h3 className="text-lg font-semibold text-gray-800 mb-4">
              Notification Settings
            </h3>

            {/* Permission Status */}
            <div className="mb-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-700">
                  Browser Notifications
                </span>
                <div className="flex items-center gap-2">
                  {isGranted ? (
                    <Bell className="h-4 w-4 text-green-500" />
                  ) : (
                    <BellOff className="h-4 w-4 text-red-500" />
                  )}
                  <span
                    className={`text-xs px-2 py-1 rounded-full ${
                      isGranted
                        ? "bg-green-100 text-green-700"
                        : "bg-red-100 text-red-700"
                    }`}
                  >
                    {permission}
                  </span>
                </div>
              </div>

              {!isGranted && permission === "default" && (
                <button
                  onClick={requestPermission}
                  className="mt-2 w-full px-3 py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700 transition-colors"
                >
                  Enable Notifications
                </button>
              )}
            </div>

            {/* Sound Toggle */}
            <div className="mb-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-700">Sound</span>
                <button
                  onClick={toggleSound}
                  className={`flex items-center gap-2 px-3 py-1 rounded-lg text-xs transition-colors ${
                    soundEnabled
                      ? "bg-green-100 text-green-700"
                      : "bg-gray-100 text-gray-700"
                  }`}
                >
                  {soundEnabled ? (
                    <Volume2 className="h-3 w-3" />
                  ) : (
                    <VolumeX className="h-3 w-3" />
                  )}
                  {soundEnabled ? "On" : "Off"}
                </button>
              </div>
            </div>

            {/* Test Button */}
            <button
              onClick={testNotification}
              disabled={!isGranted}
              className={`w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-sm transition-colors ${
                isGranted
                  ? "bg-purple-600 text-white hover:bg-purple-700"
                  : "bg-gray-200 text-gray-500 cursor-not-allowed"
              }`}
            >
              <TestTube className="h-4 w-4" />
              Test Notification
            </button>
          </motion.div>

          <div
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
          />
        </>
      )}
    </div>
  );
}
