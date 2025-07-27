import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Link } from "react-router-dom";
import { signIn, signOut, useSession } from "next-auth/react";

export default function Signup() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [agree, setAgree] = useState(false);
  const { data: session } = useSession();

  return (
    <div className="flex items-center justify-center min-h-screen bg-slate-50">
      <form className="w-full max-w-md space-y-6 bg-white p-8 rounded-lg shadow">
        <h1 className="text-2xl font-bold text-center">Sign Up</h1>
        <p className="text-sm text-center text-slate-600">
          Create your account or continue with Google.
        </p>
        <div className="text-center">
          {session ? (
            <>
              <p className="mb-2">Signed in as {session.user.name}</p>
              <Button
                type="button"
                variant="outline"
                className="w-full mb-4"
                onClick={() => signOut()}
              >
                Sign Out
              </Button>
            </>
          ) : (
            <Button
              type="button"
              variant="outline"
              className="w-full mb-4"
              onClick={() => signIn("google")}
            >
              Continue with Google
            </Button>
          )}
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
        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-700" htmlFor="confirm">
            Confirm Password
          </label>
          <Input
            id="confirm"
            name="confirm"
            type="password"
            required
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
          />
        </div>
        <div className="flex items-center">
          <Checkbox id="terms" checked={agree} onCheckedChange={setAgree} />
          <label htmlFor="terms" className="ml-2 text-sm">
            I agree to the{' '}
            <a href="#" className="underline">
              Terms
            </a>{' '}and{' '}
            <a href="#" className="underline">
              Privacy Policy
            </a>
          </label>
        </div>
        <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700" disabled={!agree}>
          Sign Up
        </Button>
        <p className="text-sm text-center text-slate-600">
          Already have an account?{' '}
          <Link to="/Login" className="text-blue-600 hover:underline">
            Log in
          </Link>
        </p>
      </form>
    </div>
  );
}
