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
  const [role, setRole] = useState<"admin" | "auditor">("admin");
  const [formError, setFormError] = useState<string | null>(null);
  const { login, error } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setFormError(null);

    try {
      const normalizedEmail = email.trim().toLowerCase();
      if (role === "admin" && normalizedEmail === "audit@buagroup.com") {
        setFormError("Audit account cannot sign in as Admin. Please choose Auditor.");
        return;
      }

      await login(email, password);
      const targetPath = role === "auditor" ? "/audit" : "/";
      if (window.location.pathname !== targetPath) {
        window.history.replaceState({}, "", targetPath);
      }
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
        {(error || formError) && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md flex items-center space-x-2">
            <AlertCircle className="h-4 w-4 text-red-500" />
            <p className="text-sm text-red-700">{formError || error}</p>
          </div>
        )}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label className="text-sm font-medium">Sign in as</Label>
            <div className="flex items-center space-x-2">
              <Button
                type="button"
                onClick={() => setRole("admin")}
                className={`h-9 px-3 ${role === "admin" ? "bg-bua-red text-white" : "bg-gray-100 text-gray-700 hover:bg-gray-200"}`}
              >
                Admin
              </Button>
              <Button
                type="button"
                onClick={() => setRole("auditor")}
                className={`h-9 px-3 ${role === "auditor" ? "bg-bua-red text-white" : "bg-gray-100 text-gray-700 hover:bg-gray-200"}`}
              >
                Auditor
              </Button>
            </div>
          </div>

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
                className="pl-10 h-11 transition-smooth focus:outline-none focus:ring-2 focus:ring-[#C41E3A] focus:border-[#C41E3A]"
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
                className="pl-10 h-11 transition-smooth focus:outline-none focus:ring-2 focus:ring-[#C41E3A] focus:border-[#C41E3A]"
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
            className="w-full h-11 bg-[#C41E3A] text-white font-medium disabled:opacity-50 focus:outline-none focus:ring-2 focus:ring-[#C41E3A] transition-colors transition-transform duration-150 active:scale-95 hover:bg-[#A01729]"
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
