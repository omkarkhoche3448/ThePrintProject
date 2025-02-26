"use client"

import type React from "react"
import { useState } from "react"
import { useSelector } from "react-redux"
import { Link } from "react-router-dom"
import { Button } from "../components/common/Button"
import { Input } from "../components/common/Input"
import { ThemeToggle } from "../components/common/ThemeToggle"
import { Mail, ArrowLeft, Printer, CheckCircle } from "lucide-react"

interface ForgotPasswordFormData {
  email: string
}

const ForgotPasswordPage: React.FC = () => {
  const isDarkTheme = useSelector((state: { theme: { isDarkMode: boolean } }) => state.theme.isDarkMode)
  const [formData, setFormData] = useState<ForgotPasswordFormData>({
    email: "",
  })
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isSubmitted, setIsSubmitted] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1500))
      console.log("Password reset requested for:", formData.email)
      setIsSubmitted(true)
    } catch (err) {
      setError("Failed to process your request. Please try again.")
    } finally {
      setIsLoading(false)
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
                <h2 className={`text-2xl font-bold ${isDarkTheme ? "text-white" : "text-gray-900"}`}>Reset Password</h2>
                <p className={isDarkTheme ? "text-gray-400" : "text-gray-600"}>
                  {isSubmitted ? "Check your email for reset instructions" : "Enter your email to receive reset instructions"}
                </p>
              </div>

              {error && (
                <div className="mb-6 p-3 bg-red-100 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-lg text-red-600 dark:text-red-400 text-sm">
                  {error}
                </div>
              )}

              {isSubmitted ? (
                <div className="space-y-6">
                  <div className="flex flex-col items-center justify-center gap-3 py-4">
                    <CheckCircle className="h-16 w-16 text-green-500" />
                    <p className={`text-center ${isDarkTheme ? "text-gray-300" : "text-gray-700"}`}>
                      We've sent password reset instructions to <span className="font-medium">{formData.email}</span>
                    </p>
                    <p className={`text-sm text-center ${isDarkTheme ? "text-gray-400" : "text-gray-600"}`}>
                      If you don't see the email, please check your spam folder
                    </p>
                  </div>
                  <div className="flex flex-col gap-5">
                    <Button
                      type="button"
                      variant="outline"
                      fullWidth
                      className="${isDarkTheme ? 'bg-gray-800 text-white border-gray-600' : ' text-white border-gray-300'} transition-colors duration-300"
                      onClick={() => setIsSubmitted(false)}
                    >
                      Try another email
                    </Button>
                    <Link to="/signin">
                      <Button type="button" fullWidth>
                        Return to Sign In
                      </Button>
                    </Link>
                  </div>
                </div>
              ) : (
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

                  <Button type="submit" fullWidth isLoading={isLoading}>
                    Send Reset Link
                  </Button>

                  <Link
                    to="/signin"
                    className="mt-2 flex items-center justify-center gap-2 text-sm text-blue-600 hover:text-blue-500 dark:text-blue-400 dark:hover:text-blue-300"
                  >
                    <ArrowLeft className="h-4 w-4" />
                    Back to Sign In
                  </Link>
                </form>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}

export default ForgotPasswordPage;