"use client"

import type React from "react"
import { useState } from "react"
import { useSelector } from "react-redux"
import { Link } from "react-router-dom"
import { Button } from "../components/common/Button"
import { Input } from "../components/common/Input"
import { ThemeToggle } from "../components/common/ThemeToggle"
import { SocialLogin } from "../components/auth/SocialLogin"
import { Mail, Lock, Printer, EyeOff, Eye } from "lucide-react"

interface SignInFormData {
  email: string
  password: string
  rememberMe: boolean
}

const SignInPage: React.FC = () => {
  const isDarkTheme = useSelector((state: { theme: { isDarkMode: boolean } }) => state.theme.isDarkMode)
  const [formData, setFormData] = useState<SignInFormData>({
    email: "",
    password: "",
    rememberMe: false,
  })
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1500))
      console.log("Form submitted:", formData)
      // Navigate to dashboard or home page after successful login
    } catch (err) {
      setError("Invalid credentials. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  const handleSocialLogin = async (provider: "google" | "facebook") => {
    try {
      console.log(`Logging in with ${provider}`)
      // Implement social login logic here
    } catch (err) {
      setError(`${provider} login failed. Please try again.`)
    }
  }

  const themeClass = isDarkTheme ? "bg-gray-900 text-white" : "bg-gradient-to-br from-blue-50 to-indigo-50"

  return (
    <div className={`min-h-screen ${themeClass} transition-colors duration-300`}>
      {/* Header */}
      <header className="py-6 px-8">
        <div className="max-w-7xl mx-auto w-full flex justify-between items-center">
          <Link to="/" className="flex items-center gap-3">
            <Printer className={`h-8 w-8 ${isDarkTheme ? "text-blue-400" : "text-blue-600"}`} />
            <h1 className="text-2xl font-bold tracking-tight">PrintService</h1>
          </Link>
          <ThemeToggle />
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-md">
          <div
            className={`relative overflow-hidden rounded-2xl shadow-xl ${isDarkTheme ? "bg-gray-800" : "bg-white"} p-8`}
          >
            {/* Decorative Elements */}
            <div className="absolute -top-24 -right-24 w-64 h-64 rounded-full bg-blue-500 opacity-10"></div>
            <div className="absolute -bottom-16 -left-16 w-48 h-48 rounded-full bg-purple-500 opacity-10"></div>

            {/* Form Content */}
            <div className="relative">
              {/* Logo and Title */}
              <div className="text-center mb-8">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 mb-4">
                  <Printer className="h-8 w-8 text-white" />
                </div>
                <h2 className={`text-2xl font-bold ${isDarkTheme ? "text-white" : "text-gray-900"}`}>Welcome Back</h2>
                <p className={isDarkTheme ? "text-gray-400" : "text-gray-600"}>Sign in to your PrintService account</p>
              </div>

              {error && (
                <div className="mb-6 p-3 bg-red-100 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-lg text-red-600 dark:text-red-400 text-sm">
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-5">
                <Input
                  label="Email Address"
                  type="email"
                  icon={<Mail className="h-5 w-5 text-gray-400" />}
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="Enter your email"
                  isDarkTheme={isDarkTheme}
                  required
                />

                <div className="relative">
                  <Input
                    label="Password"
                    type={showPassword ? "text" : "password"}
                    icon={<Lock className="h-5 w-5 text-gray-400" />}
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    placeholder="Enter your password"
                    isDarkTheme={isDarkTheme}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-9 text-sm text-blue-600 hover:text-blue-500"
                  >
                    {showPassword ? <EyeOff className="h-5 w-5 text-gray-400" /> : <Eye className="h-5 w-5 text-gray-400" />}
                  </button>
                </div>

                <div className="flex items-center">
                  <input
                    type="checkbox"
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    checked={formData.rememberMe}
                    onChange={(e) => setFormData({ ...formData, rememberMe: e.target.checked })}
                  />
                  <span className="ml-2 text-sm text-gray-600 dark:text-gray-400">Remember me</span>
                </div>

                <div className="flex items-center justify-between">
                  <Link
                    to="/forgot-password"
                    className="text-sm text-blue-600 hover:text-blue-500 dark:text-blue-400 dark:hover:text-blue-300"
                  >
                    Forgot password?
                  </Link>
                </div>

                <Button type="submit" fullWidth isLoading={isLoading}>
                  Sign In
                </Button>
              </form>

              <div className="relative my-8">
                <div className="absolute inset-0 flex items-center">
                  <div className={`w-full border-t ${isDarkTheme ? "border-gray-700" : "border-gray-300"}`}></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className={`px-2 ${isDarkTheme ? "bg-gray-800 text-gray-400" : "bg-white text-gray-500"}`}>
                    Or continue with
                  </span>
                </div>
              </div>

              <SocialLogin
                onGoogleLogin={() => handleSocialLogin("google")} isDarkTheme={false}              />

              <p className={`mt-8 text-center text-sm ${isDarkTheme ? "text-gray-400" : "text-gray-600"}`}>
                Don't have an account?{" "}
                <Link
                  to="/signup"
                  className="font-medium text-blue-600 hover:text-blue-500 dark:text-blue-400 dark:hover:text-blue-300"
                >
                  Create an account
                </Link>
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}

export default SignInPage;