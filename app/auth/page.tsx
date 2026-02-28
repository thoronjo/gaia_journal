"use client";

import { useState, useEffect } from "react";
import { Button, Card, CardBody, CardHeader, Input } from "@heroui/react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";

export default function AuthPage() {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [name, setName] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  useEffect(() => {
    // check if already logged in
    const user = localStorage.getItem("gaia-user");
    if (user) {
      router.push("/");
    }
  }, [router]);

  const handleSubmit = () => {
    setError("");
    
    if (!email.trim() || !password.trim()) {
      setError("please fill in all fields");
      return;
    }
    
    if (isSignUp && !name.trim()) {
      setError("please enter your name");
      return;
    }
    
    if (isSignUp && password !== confirmPassword) {
      setError("passwords don't match");
      return;
    }
    
    if (password.length < 6) {
      setError("password must be at least 6 characters");
      return;
    }

    if (isSignUp) {
      // sign up
      const user = {
        email: email.trim(),
        name: name.trim(),
        isPremium: false,
        createdAt: new Date().toISOString(),
      };
      localStorage.setItem("gaia-user", JSON.stringify(user));
      router.push("/");
    } else {
      // login - just check if user exists
      const existingUser = localStorage.getItem("gaia-user");
      if (existingUser) {
        router.push("/");
      } else {
        // create account if doesn't exist
        const user = {
          email: email.trim(),
          name: email.split("@")[0],
          isPremium: false,
          createdAt: new Date().toISOString(),
        };
        localStorage.setItem("gaia-user", JSON.stringify(user));
        router.push("/");
      }
    }
  };

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,rgba(255,216,232,0.7),transparent_60%),radial-gradient(circle_at_20%_20%,rgba(255,196,220,0.7),transparent_45%),radial-gradient(circle_at_80%_10%,rgba(255,235,245,0.9),transparent_40%),linear-gradient(180deg,#ffe5f1,#ffd1e8_30%,#ffeff7_70%,#fff)] text-zinc-800">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute -top-24 -right-24 h-64 w-64 rounded-full bg-pink-200/60 blur-3xl" />
        <div className="absolute top-40 -left-24 h-72 w-72 rounded-full bg-rose-200/70 blur-3xl" />
      </div>

      <div className="relative flex min-h-screen items-center justify-center px-6 py-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="w-full max-w-md"
        >
          <div className="mb-8 text-center">
            <div className="flex justify-center mb-4">
              <svg
                width="80"
                height="80"
                viewBox="0 0 72 72"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <circle cx="36" cy="38" r="20" fill="#F7DCE7" />
                <circle cx="20" cy="26" r="10" fill="#F2CFE0" />
                <circle cx="52" cy="26" r="10" fill="#F2CFE0" />
                <circle cx="30" cy="36" r="3" fill="#5C4B57" />
                <circle cx="42" cy="36" r="3" fill="#5C4B57" />
                <ellipse cx="36" cy="44" rx="6" ry="5" fill="#5C4B57" />
                <path
                  d="M28 48C30.5 51 34 52.5 36 52.5C38 52.5 41.5 51 44 48"
                  stroke="#5C4B57"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
              </svg>
            </div>
            <h1 className="font-[family-name:var(--font-bricolage)] text-4xl font-bold text-rose-700 mb-2">
              Gaia
            </h1>
            <p className="font-[family-name:var(--font-instrument-serif)] text-lg text-rose-600">
              your daily glow journal
            </p>
          </div>

          <Card className="border-none bg-white/80 backdrop-blur">
            <CardHeader>
              <div className="w-full text-center">
                <p className="text-2xl font-semibold text-rose-700">
                  {isSignUp ? "create your account" : "welcome back"}
                </p>
              </div>
            </CardHeader>
            <CardBody className="gap-4">
              {error && (
                <div className="rounded-xl bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-600">
                  {error}
                </div>
              )}
              {isSignUp && (
                <Input
                  label="Name"
                  placeholder="what should we call you?"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  classNames={{
                    inputWrapper: "bg-rose-50/60",
                    label: "text-rose-500",
                  }}
                />
              )}
              <Input
                label="Email"
                type="email"
                placeholder="your@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                classNames={{
                  inputWrapper: "bg-rose-50/60",
                  label: "text-rose-500",
                }}
              />
              <Input
                label="Password"
                type={showPassword ? "text" : "password"}
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                classNames={{
                  inputWrapper: "bg-rose-50/60",
                  label: "text-rose-500",
                }}
                endContent={
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="text-rose-400 hover:text-rose-600 transition-colors"
                  >
                    {showPassword ? "👁️" : "👁️‍🗨️"}
                  </button>
                }
              />
              {isSignUp && (
                <Input
                  label="Confirm Password"
                  type={showConfirmPassword ? "text" : "password"}
                  placeholder="••••••••"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  classNames={{
                    inputWrapper: "bg-rose-50/60",
                    label: "text-rose-500",
                  }}
                  endContent={
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="text-rose-400 hover:text-rose-600 transition-colors"
                    >
                      {showConfirmPassword ? "👁️" : "👁️‍🗨️"}
                    </button>
                  }
                />
              )}
              <Button
                className="bg-gradient-to-r from-rose-400 via-pink-400 to-fuchsia-400 text-white"
                size="lg"
                onPress={handleSubmit}
              >
                {isSignUp ? "start journaling" : "sign in"}
              </Button>
              <button
                type="button"
                className="text-sm text-rose-500 hover:text-rose-700 transition-colors"
                onClick={() => {
                  setIsSignUp(!isSignUp);
                  setError("");
                  setConfirmPassword("");
                }}
              >
                {isSignUp
                  ? "already have an account? sign in"
                  : "need an account? sign up"}
              </button>
            </CardBody>
          </Card>

          <p className="text-center text-xs text-rose-400 mt-6">
            everything stays on this device. your words are yours.
          </p>
        </motion.div>
      </div>
    </div>
  );
}
