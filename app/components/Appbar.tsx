"use client";

import { signIn, signOut, useSession } from "next-auth/react";
import { Music, Zap, Sun, Moon } from "lucide-react";
import { useState, useEffect } from "react";

export function Appbar() {
  const session = useSession();
  const [isDark, setIsDark] = useState(true);

  useEffect(() => {
    // Check if dark mode is currently applied
    const isDarkMode = document.documentElement.classList.contains("dark");
    setIsDark(isDarkMode);
  }, []);

  const toggleTheme = () => {
    const newTheme = !isDark;
    setIsDark(newTheme);

    if (newTheme) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  };

  return (
    <div className="bg-slate-50 dark:bg-slate-900 border-b border-slate-200 dark:border-slate-700 p-4 shadow-sm transition-all duration-300">
      <div className="flex justify-between items-center">
        {/* Logo Section  */}
        <div className="flex items-center space-x-3">
          <div className="relative">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-100 to-blue-600 rounded-full flex items-center justify-center shadow-md transform rotate-12 hover:rotate-0 transition-transform duration-300">
              <Music className="w-6 h-6 text-yellow-300" />
            </div>
          </div>
          <div>
            <h1 className="text-3xl font-bold text-slate-800 dark:text-slate-100 transition-colors duration-300">
              Stream Music
            </h1>
            <p className="text-sm text-slate-500 dark:text-slate-400 -mt-1 transition-colors duration-300">
              My Personal Playground 🎧
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          {/* Theme Switcher */}
          <button
            onClick={toggleTheme}
            className="p-2 rounded-lg bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 transition-all duration-300 cursor-pointer "
            title={isDark ? "Switch to light mode" : "Switch to dark mode"}
          >
            {isDark ? (
              <Sun className="w-5 h-5 text-yellow-400 transition-all duration-300" />
            ) : (
              <Moon className="w-5 h-5 text-blue-400 transition-all duration-300" />
            )}
          </button>

          {/* Toggle between Login and Logout buttons */}
          {session.data?.user ? (
            <button
              className="bg-blue-500 text-white px-6 py-3 rounded-lg font-medium text-lg shadow-sm hover:shadow-md transform hover:scale-105 transition-all duration-300 hover:bg-blue-600 flex items-center space-x-2 cursor-pointer"
              onClick={() => signOut()}
            >
              Logout
            </button>
          ) : (
            <button
              onClick={() => {
                signIn("google");
              }}
              className="bg-blue-500 text-white px-6 py-3 rounded-lg font-medium text-lg shadow-sm hover:shadow-md transform hover:scale-105 transition-all duration-300 hover:bg-blue-600 flex items-center space-x-2 cursor-pointer"
            >
              <Zap className="w-4 h-4" />
              <span>Lets Jam!</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
