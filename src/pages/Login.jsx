
import React, { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Link } from "react-router-dom";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [remember, setRemember] = useState(false);

  return (
    <div className="flex items-center justify-center min-h-screen bg-slate-50">
      <form
        action="/login"
        method="POST"
        className="w-full max-w-md space-y-6 bg-white p-8 rounded-lg shadow"
      >
        <h1 className="text-2xl font-bold text-center">Log In</h1>
        <p className="text-sm text-center text-slate-600">
          Welcome back! Please enter your details below.
        </p>
        <div className="text-center">
          <a href="/auth/google" className="inline-block w-full mb-4">
            <Button type="button" variant="outline" className="w-full">
              Continue with Google
            </Button>
          </a>
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-700" htmlFor="email">
            Email
          </label>
          <Input
            id="email"
            name="email"
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-700" htmlFor="password">
            Password
          </label>
          <Input
            id="password"
            name="password"
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>
        <div className="flex items-center justify-between">
          <label htmlFor="remember" className="flex items-center gap-2 text-sm">
            <Checkbox id="remember" checked={remember} onCheckedChange={setRemember} />
            Remember me
          </label>
          <a href="#" className="text-sm text-blue-600 hover:underline">
            Forgot password?
          </a>
        </div>
        <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700">
          Log In
        </Button>
        <p className="text-sm text-center text-slate-600">
          Don't have an account?{' '}
          <Link to="/Signup" className="text-blue-600 hover:underline">
            Sign up
          </Link>
        </p>
      </form>
    </div>
  );
}
