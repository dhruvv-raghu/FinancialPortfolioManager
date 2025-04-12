'use client'

import React, { useState } from 'react'
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { EyeIcon, EyeOffIcon } from 'lucide-react'
import { useRouter } from 'next/navigation'

export default function LoginPage() {
  const [isCreatingAccount, setIsCreatingAccount] = useState(false)
  const [email, setEmail] = useState('')
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [confrmPassword, setConfrmPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const router = useRouter()

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

  const showAlert = (message) => {
    console.log("Alert: ", message)
    alert(message)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    console.log("Form Submitted with values:", { email, username, password, confrmPassword })

    if (isCreatingAccount) {
      console.log("Creating account...")
      if (password === "" || confrmPassword === "" || email === "" || username === "") {
        showAlert("Please fill in all fields")
        setLoading(false)
        return
      } else if (password !== confrmPassword) {
        showAlert("Passwords do not match")
        setLoading(false)
        return
      } else if (!emailRegex.test(email)) {
        showAlert("Please enter a valid email address")
        setLoading(false)
        return
      } else {
        try {
          console.log("Sending sign up request...")
          const res = await fetch("/api/signup", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ username, password, email }),
          })

          if (!res.ok) {
            console.log("Signup failed", res)
            showAlert("Failed to create account")
          } else {
            console.log("Signup successful", res)
            showAlert("Account created successfully!")
          }
        } catch (error) {
          console.error("Error during signup:", error)
          showAlert("An error occurred")
        }
        setLoading(false)
      }
    } else {
      console.log("Logging in...")
      if (email === "" || password === "") {
        showAlert("Please fill in all fields")
        setLoading(false)
        return
      }

      try {
        console.log("Sending login request...")
        const res = await fetch("/api/authenticate", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ email, password }),
        })

        const data = await res.json()
        console.log("Login response:", data)

        if (res.ok && data?.token) {
          console.log("Login successful, token:", data.token)
          localStorage.setItem("token", data.token)
          showAlert("Login successful!")
          
          // Check if the email is "gaureesh.hegde@gmail.com" and redirect to admin
          if (email === "gaureesh.hegde@gmail.com") {
            router.push("/admin")
          } else {
            router.push("/dashboard")
          }
        } else {
          console.error("Login failed", data)
          showAlert(data.message || "Login failed. Please try again.")
        }
      } catch (error) {
        console.error("Error during login:", error)
        showAlert("An error occurred. Please try again later.")
      }

      setLoading(false)
    }
  }

  return (
    <div className="flex h-screen w-full bg-gradient-to-b from-blue-900 to-black text-white">
      {/* Left Side - Form with Blue-to-Black Gradient */}
      <div className="w-full lg:w-1/2 flex items-center justify-center bg-gradient-to-b from-blue-900 to-black p-8">
        <div className="w-full max-w-md bg-black bg-opacity-50 p-8 rounded-lg shadow-2xl backdrop-blur-sm">
          <h2 className="text-3xl font-bold text-center mb-6">
            {isCreatingAccount ? "Create Account" : "Login"}
          </h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            {isCreatingAccount && (
              <div className="space-y-2">
                <Label htmlFor="username">Username</Label>
                <Input
                  type="text"
                  id="username"
                  className="bg-white/10 text-white border-white/20 focus:border-white/40 transition-all duration-200 placeholder:text-white/50"
                  placeholder="Enter your username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                />
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="email">Email Address</Label>
              <Input
                type="email"
                id="email"
                className="bg-white/10 text-white border-white/20 focus:border-white/40 transition-all duration-200 placeholder:text-white/50"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Input
                  type={showPassword ? "text" : "password"}
                  id="password"
                  className="bg-white/10 text-white border-white/20 focus:border-white/40 transition-all duration-200 placeholder:text-white/50 pr-10"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-white/50 hover:text-white"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOffIcon className="h-5 w-5" /> : <EyeIcon className="h-5 w-5" />}
                </button>
              </div>
            </div>

            {isCreatingAccount && (
              <div className="space-y-2">
                <Label htmlFor="confirm-password">Confirm Password</Label>
                <div className="relative">
                  <Input
                    type={showConfirmPassword ? "text" : "password"}
                    id="confirm-password"
                    className="bg-white/10 text-white border-white/20 focus:border-white/40 transition-all duration-200 placeholder:text-white/50 pr-10"
                    placeholder="Confirm your password"
                    value={confrmPassword}
                    onChange={(e) => setConfrmPassword(e.target.value)}
                    required
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-white/50 hover:text-white"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  >
                    {showConfirmPassword ? <EyeOffIcon className="h-5 w-5" /> : <EyeIcon className="h-5 w-5" />}
                  </button>
                </div>
              </div>
            )}

            <Button
              type="submit"
              className="w-full bg-blue-600 hover:bg-blue-700 text-white transition-colors duration-200"
              disabled={loading}
            >
              {loading ? (
                <span className="flex items-center justify-center">
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Processing...
                </span>
              ) : (
                isCreatingAccount ? "Create Account" : "Log In"
              )}
            </Button>
          </form>

          <p className="mt-6 text-center text-sm">
            {isCreatingAccount ? (
              <>
                <span>Already have an account? </span>
                <button onClick={() => setIsCreatingAccount(false)} className="text-blue-400 hover:text-blue-300 transition-colors duration-200">
                  Log In
                </button>
              </>
            ) : (
              <>
                <span>Don't have an account? </span>
                <button onClick={() => setIsCreatingAccount(true)} className="text-blue-400 hover:text-blue-300 transition-colors duration-200">
                  Sign Up
                </button>
              </>
            )}
          </p>
        </div>
      </div>

      {/* Right Side - Image */}
      <div className="hidden lg:block w-1/2 h-screen">
        <img
          src="/img2.jpg"
          alt="Investment Illustration"
          className="object-cover w-full h-full"
        />
      </div>
    </div>
  )
}
