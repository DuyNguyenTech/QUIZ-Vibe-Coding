"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { register } from "../../lib/api";
import { useAuthStore } from "../../lib/store";
import { Mail, Lock, AlertCircle, Loader2, CheckCircle2 } from "lucide-react";

export default function RegisterPage() {
  const router = useRouter();
  const setAuth = useAuthStore((state) => state.setAuth);
  
  const [formData, setFormData] = useState({ email: "", password: "", confirmPassword: "" });
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // Password validation rules
  const hasMinLength = formData.password.length >= 8;
  const hasUpper = /[A-Z]/.test(formData.password);
  const hasLower = /[a-z]/.test(formData.password);
  const hasNumber = /[0-9]/.test(formData.password);
  const hasSpecial = /[^A-Za-z0-9]/.test(formData.password);
  const isValidPassword = hasMinLength && hasUpper && hasLower && hasNumber && hasSpecial;
  const passwordsMatch = formData.password === formData.confirmPassword && formData.password !== "";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!isValidPassword) {
      setError("Vui lòng đáp ứng tất cả yêu cầu về mật khẩu.");
      return;
    }

    if (!passwordsMatch) {
      setError("Mật khẩu xác nhận không khớp.");
      return;
    }

    setIsLoading(true);

    try {
      const data = await register({ email: formData.email, password: formData.password });
      setAuth(data.token, data.user);
      router.push("/");
      router.refresh();
    } catch (err: any) {
      setError(err.message || "Đăng ký thất bại");
    } finally {
      setIsLoading(false);
    }
  };

  const RequirementItem = ({ met, text }: { met: boolean; text: string }) => (
    <div className={`flex items-center gap-2 text-xs ${met ? "text-success" : "text-muted-foreground"}`}>
      {met ? <CheckCircle2 className="w-3.5 h-3.5" /> : <div className="w-3.5 h-3.5 rounded-full border border-current opacity-50" />}
      <span>{text}</span>
    </div>
  );

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center p-4 py-8">
      <div className="glass-card w-full max-w-md p-8 animate-fade-in">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold gradient-text mb-2">Tạo tài khoản</h1>
          <p className="text-muted-foreground">Tham gia cùng chúng tôi ngay hôm nay</p>
        </div>

        {error && (
          <div className="mb-6 p-4 rounded-xl bg-danger/10 border border-danger/20 flex items-start gap-3 text-danger">
            <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
            <p className="text-sm">{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-medium mb-2 text-foreground">Email</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Mail className="h-5 w-5 text-muted-foreground" />
              </div>
              <input
                type="email"
                required
                className="w-full pl-10 pr-4 py-3 bg-secondary border border-border rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent transition-all outline-none"
                placeholder="you@example.com"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2 text-foreground">Mật khẩu</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Lock className="h-5 w-5 text-muted-foreground" />
              </div>
              <input
                type="password"
                required
                className="w-full pl-10 pr-4 py-3 bg-secondary border border-border rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent transition-all outline-none"
                placeholder="••••••••"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              />
            </div>
            
            {/* Password Requirements */}
            <div className="mt-3 grid grid-cols-2 gap-2 bg-secondary/50 p-3 rounded-lg border border-border">
              <RequirementItem met={hasMinLength} text="Tối thiểu 8 ký tự" />
              <RequirementItem met={hasUpper} text="Có chữ in hoa" />
              <RequirementItem met={hasLower} text="Có chữ thường" />
              <RequirementItem met={hasNumber} text="Có chữ số" />
              <RequirementItem met={hasSpecial} text="Ký tự đặc biệt" />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2 text-foreground">Xác nhận mật khẩu</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Lock className="h-5 w-5 text-muted-foreground" />
              </div>
              <input
                type="password"
                required
                className="w-full pl-10 pr-4 py-3 bg-secondary border border-border rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent transition-all outline-none"
                placeholder="••••••••"
                value={formData.confirmPassword}
                onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
              />
            </div>
            {formData.confirmPassword && !passwordsMatch && (
              <p className="text-xs text-danger mt-2">Mật khẩu không khớp.</p>
            )}
          </div>

          <button
            type="submit"
            disabled={isLoading || !isValidPassword || !passwordsMatch}
            className={`w-full btn-primary justify-center mt-6 ${(!isValidPassword || !passwordsMatch) ? "opacity-50 cursor-not-allowed" : ""}`}
          >
            {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Đăng ký"}
          </button>
        </form>

        <p className="text-center mt-8 text-sm text-muted-foreground">
          Đã có tài khoản?{" "}
          <Link href="/auth/login" className="text-primary hover:underline font-medium">
            Đăng nhập
          </Link>
        </p>
      </div>
    </div>
  );
}
