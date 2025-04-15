"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { NavUser } from "@/components/nav-user"
import { authClient } from "../../../lib/auth-client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

interface User {
  name: string;
  email: string;
  avatar: string;
}

export default function LoginPage() {
  const router = useRouter()
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  })
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const checkSession = async () => {
      try {
        const { data, error } = await authClient.getSession()
        if (data && !error) {
          setUser({
            name: data.user.name || "User",
            email: data.user.email,
            avatar: data.user.image || "https://ui-avatars.com/api/?name=" + encodeURIComponent(data.user.name || "User"),
          })
          router.push("/") // Redirect to home if already logged in
        }
      } catch (err) {
        console.error("Error checking session:", err)
      } finally {
        setLoading(false)
      }
    }

    checkSession()
  }, [router])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    try {
      const { data, error } = await authClient.signIn.email({
        email: formData.email,
        password: formData.password,
        callbackURL: "/",
        rememberMe: true,
      })

      if (error) {
        setError(error.message || "An error occurred during login")
        return
      }

      if (data) {
        router.push("/") // Redirect to home after successful login
      }
    } catch (err) {
      setError("An unexpected error occurred. Please try again.")
      console.error("Login error:", err)
    }
  }

  if (loading) {
    return <div>Loading...</div>
  }

  return (
    <div className="flex min-h-screen">
      
      <main className="flex-1 flex items-center justify-center">
        <div className="w-full max-w-md p-8 space-y-8">
          <div className="text-center">
            <h1 className="text-2xl font-bold">Welcome back</h1>
            <p className="text-muted-foreground">Sign in to your account</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <label htmlFor="email" className="text-sm font-medium">Email</label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                required
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="password" className="text-sm font-medium">Password</label>
              <Input
                id="password"
                type="password"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                required
              />
            </div>

            {error && (
              <div className="text-sm text-red-500">
                {error}
              </div>
            )}

            <Button type="submit" className="w-full">
              Sign In
            </Button>
          </form>

          <div className="text-center text-sm">
            Don't have an account?{" "}
            <Button
              variant="link"
              className="p-0"
              onClick={() => router.push("/signup")}
            >
              Sign up
            </Button>
          </div>
        </div>
      </main>
    </div>
  )
}