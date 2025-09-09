import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Lock, Mail, AlertCircle } from "lucide-react";
import buaLogo from "@/assets/bua-logo.jpg";
import { useAuth } from "@/contexts/AuthContext";

export default function LoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { login, error } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      await login(email, password);
    } catch (error) {
      console.error("Login failed:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-md shadow-card border-0 bg-card/95 backdrop-blur-sm">
      <CardHeader className="space-y-4 pb-6">
        <div className="flex items-center justify-center">
          <div className="flex items-center space-x-3">
            <img
              src={buaLogo}
              alt="BUAGroup Logo"
              className="h-12 w-12 object-contain"
            />
            <div>
              <h1 className="text-xl font-semibold text-foreground">
                BUAGroup
              </h1>
              <p className="text-xs text-muted-foreground">
                IT Asset Management
              </p>
            </div>
          </div>
        </div>
        <div className="text-center space-y-1">
          <CardTitle className="text-2xl font-semibold">Welcome back</CardTitle>
          <CardDescription>Sign in to your account to continue</CardDescription>
        </div>
      </CardHeader>
      <CardContent>
        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md flex items-center space-x-2">
            <AlertCircle className="h-4 w-4 text-red-500" />
            <p className="text-sm text-red-700">{error}</p>
          </div>
        )}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email" className="text-sm font-medium">
              Email address
            </Label>
            <div className="relative">
              <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                id="email"
                type="email"
                placeholder="you@company.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="pl-10 h-11 transition-smooth focus:shadow-button"
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="password" className="text-sm font-medium">
              Password
            </Label>
            <div className="relative">
              <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                id="password"
                type="password"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="pl-10 h-11 transition-smooth focus:shadow-button"
                required
              />
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="remember"
                checked={rememberMe}
                onCheckedChange={(checked) => setRememberMe(checked as boolean)}
              />
              <Label
                htmlFor="remember"
                className="text-sm font-medium cursor-pointer"
              >
                Remember me
              </Label>
            </div>
            <a
              href="#"
              className="text-sm font-medium text-accent-foreground hover:text-primary transition-smooth"
            >
              Forgot password?
            </a>
          </div>

          <Button
            type="submit"
            disabled={isLoading}
            className="w-full h-11 bg-bua-red text-white shadow-button hover:shadow-lg transition-smooth font-medium disabled:opacity-50"
          >
            {isLoading ? "Signing in..." : "Sign in"}
          </Button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-sm text-muted-foreground">
            Need access?{" "}
            <a
              href="#"
              className="font-medium text-accent-foreground hover:text-primary transition-smooth"
            >
              Contact your administrator
            </a>
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
