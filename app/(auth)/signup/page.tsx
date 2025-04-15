"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { authClient } from "../../../lib/auth-client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import Link from "next/link"

interface User {
  name: string;
  email: string;
  avatar: string;
}

export default function SignupPage() {
  const router = useRouter()
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
  })
  const [error, setError] = useState<string | null>(null)

  // Uncomment this if you want to check for existing sessions
  // useEffect(() => {
  //   const checkSession = async () => {
  //     try {
  //       const { data, error } = await authClient.getSession()
  //       if (data && !error) {
  //         setUser({
  //           name: data.user.name || "User",
  //           email: data.user.email,
  //           avatar: data.user.image || "https://ui-avatars.com/api/?name=" + encodeURIComponent(data.user.name || "User"),
  //         })
  //         router.push("/") // Redirect to home if already logged in
  //       }
  //     } catch (err) {
  //       console.error("Error checking session:", err)
  //     } finally {
  //       setLoading(false)
  //     }
  //   }

  //   checkSession()
  // }, [router])

  // Handle input changes
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    console.log("Form data submitted:", formData)
    
    try {
      await authClient.signUp.email(
        {
          email: formData.email,
          password: formData.password,
          name: formData.username,
        },
        {
          onSuccess: () => {
            router.push("/");
          },
          onError: (ctx) => {
            setError(ctx.error.message);
          },
        }
      );
    } catch (err) {
      console.error("Error during signup:", err)
      setError("An unexpected error occurred")
    }
  }

  // Uncomment this if you want to show a loading state
  // if (loading) {
  //   return <div>Loading...</div>
  // }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen">
      <div className="w-full max-w-md p-8 space-y-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold">Create an account</h1>
          <p className="text-muted-foreground">Enter your details to get started</p>
        </div>

        {error && (
          <div className="p-3 text-sm bg-red-100 border border-red-200 text-red-600 rounded">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid gap-6">
            <div className="after:border-border relative text-center text-sm after:absolute after:inset-0 after:top-1/2 after:z-0 after:flex after:items-center after:border-t">
              <span className="bg-muted text-muted-foreground relative z-10 px-2">
                Or continue with
              </span>
            </div>
            <div className="grid gap-6">
              <div className="grid gap-3">
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="m@example.com"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  className="shadow-none"
                />
              </div>
              <div className="grid gap-3">
                <Input
                  id="username"
                  name="username"
                  type="text"
                  placeholder="Username"
                  value={formData.username}
                  onChange={handleChange}
                  required
                  className="shadow-none"
                />
              </div>
              <div className="grid gap-3">
                <div className="flex items-center">
                </div>
                <Input
                  id="password"
                  name="password"
                  type="password"
                  placeholder="Password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                  className="shadow-none"
                />
              </div>
              <Button type="submit" className="w-full">
                Sign up
              </Button>
            </div>
          </div>
        </form>

        <div className="text-center text-sm">
          Already have an account?{" "}
          <Link href="/login" className="text-blue-600 underline">
            Log in
          </Link>
        </div>
      </div>
    </div>
  )
}