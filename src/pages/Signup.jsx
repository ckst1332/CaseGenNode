import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export default function Signup() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  return (
    <div className="flex items-center justify-center min-h-screen bg-slate-50">
      <form
        action="/signup"
        method="POST"
        className="w-full max-w-md space-y-6 bg-white p-8 rounded-lg shadow"
      >
        <h1 className="text-2xl font-bold text-center">Sign Up</h1>
        <div className="text-center">
          <a href="/auth/google" className="inline-block w-full mb-4">
            <Button type="button" variant="outline" className="w-full">
              Sign Up with Google
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
        <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700">
          Sign Up
        </Button>
      </form>
    </div>
  );
}
