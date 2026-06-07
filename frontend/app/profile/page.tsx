"use client";

import { useEffect, useState } from "react";
import { useAuthStore } from "../lib/store";
import { getProfile, updateProfile } from "../lib/api";
import { User, Settings, Save, Loader2, CheckCircle2, Shield, Hash, Activity, Sparkles, Edit3 } from "lucide-react";
import { useRouter } from "next/navigation";

export default function ProfilePage() {
  const { token, user, updateUser, lobbyAvatar } = useAuthStore();
  const router = useRouter();

  const [formData, setFormData] = useState({
    nickname: "",
    gender: "",
    status: "",
  });

  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    if (!token) {
      router.push("/auth/login");
      return;
    }

    const fetchProfile = async () => {
      setIsLoading(true);
      try {
        const data = await getProfile();
        updateUser(data);
        setFormData({
          nickname: data.nickname || "",
          gender: data.gender || "",
          status: data.status || "",
        });
      } catch (err: any) {
        console.error("Failed to load profile", err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchProfile();
  }, [token, router, updateUser]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setSuccessMsg("");
    setErrorMsg("");

    try {
      const data = await updateProfile(formData);
      updateUser(data);
      setSuccessMsg("Cập nhật thông tin thành công!");
      setTimeout(() => setSuccessMsg(""), 3000);
    } catch (err: any) {
      setErrorMsg(err.message || "Cập nhật thất bại.");
    } finally {
      setIsSaving(false);
    }
  };

  if (!user || isLoading) {
    return (
      <div className="flex h-[calc(100vh-4rem)] items-center justify-center">
        <div className="relative">
          <div className="absolute inset-0 bg-primary/20 blur-xl rounded-full"></div>
          <Loader2 className="w-10 h-10 animate-spin text-primary relative z-10" />
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8 animate-fade-in pb-20">

      {/* Premium Header/Banner */}
      <div
        className="mb-8 w-full rounded-3xl bg-gradient-to-br from-primary via-accent to-blue-600 animate-gradient overflow-hidden shadow-xl border border-white/10"
      >
        {/* Top decorative area */}
        <div style={{ height: "120px", position: "relative" }}>
          <div style={{ position: "absolute", top: "-60px", right: "-60px", width: "200px", height: "200px", background: "rgba(255,255,255,0.15)", borderRadius: "50%", filter: "blur(40px)" }}></div>
          <div style={{ position: "absolute", bottom: "-60px", left: "-60px", width: "200px", height: "200px", background: "rgba(255,255,255,0.08)", borderRadius: "50%", filter: "blur(40px)" }}></div>
        </div>

        {/* Bottom content area with avatar + info */}
        <div
          style={{
            padding: "0 32px 24px 32px",
            display: "flex",
            alignItems: "center",
            gap: "20px",
            background: "linear-gradient(to top, rgba(0,0,0,0.4), transparent)",
          }}
        >
          {/* Avatar */}
          <div style={{ width: "72px", height: "72px", borderRadius: "50%", border: "3px solid rgba(255,255,255,0.4)", overflow: "hidden", flexShrink: 0 }}>
            <img
              src={lobbyAvatar && lobbyAvatar.includes("dicebear") ? lobbyAvatar : `https://api.dicebear.com/7.x/bottts/svg?seed=${user.nickname || user.email}&backgroundColor=transparent`}
              alt="Avatar"
              style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
            />
          </div>

          {/* Name + email */}
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ display: "flex", alignItems: "center", gap: "10px", flexWrap: "wrap", marginBottom: "4px" }}>
              <h1 style={{ fontSize: "1.5rem", fontWeight: 800, color: "white", margin: 0, lineHeight: 1.3 }}>
                {formData.nickname || "Người dùng"}
              </h1>
              {user.role === "Admin" && (
                <span style={{ display: "inline-flex", alignItems: "center", gap: "4px", padding: "2px 10px", borderRadius: "999px", background: "rgba(255,255,255,0.2)", border: "1px solid rgba(255,255,255,0.3)", color: "white", fontSize: "11px", fontWeight: 700 }}>
                  <Shield className="w-3 h-3" /> Quản trị viên
                </span>
              )}
            </div>
            <p style={{ color: "rgba(255,255,255,0.7)", fontSize: "13px", fontWeight: 500, margin: 0, display: "flex", alignItems: "center", gap: "6px" }}>
              <span style={{ width: "6px", height: "6px", borderRadius: "50%", background: "#00e676", display: "inline-block", boxShadow: "0 0 6px #00e676" }}></span>
              {user.email}
            </p>
          </div>
        </div>
      </div>

      <div className="grid gap-8 md:grid-cols-12 animate-slide-up" style={{ animationDelay: '0.1s' }}>
        {/* Sidebar Info */}
        <div className="md:col-span-4 space-y-6">
          <div className="glass-card p-6 overflow-hidden relative group">
            <div className="absolute -right-10 -top-10 w-32 h-32 bg-primary/5 rounded-full blur-2xl group-hover:bg-primary/10 transition-colors"></div>

            <h3 className="flex items-center gap-2 font-bold text-foreground mb-6 text-lg relative z-10">
              <Activity className="w-5 h-5 text-primary" />
              Tổng quan
            </h3>

            <div className="space-y-4 text-sm relative z-10">
              <div className="flex items-center justify-between p-3 rounded-xl bg-secondary/50 border border-border/50 hover:border-primary/30 transition-colors">
                <div className="flex items-center gap-3 text-muted-foreground">
                  <div className="p-2 rounded-lg bg-primary/10 text-primary">
                    <Shield className="w-4 h-4" />
                  </div>
                  <span className="font-medium">Vai trò</span>
                </div>
                <span className="font-bold text-foreground">
                  {user.role === "Admin" ? "Quản trị viên" : "Học viên"}
                </span>
              </div>

              <div className="flex items-center justify-between p-3 rounded-xl bg-secondary/50 border border-border/50 hover:border-primary/30 transition-colors">
                <div className="flex items-center gap-3 text-muted-foreground">
                  <div className="p-2 rounded-lg bg-accent/10 text-accent">
                    <Hash className="w-4 h-4" />
                  </div>
                  <span className="font-medium">ID Tài khoản</span>
                </div>
                <span className="font-bold font-mono text-foreground bg-background px-2 py-1 rounded-md border border-border">
                  #{user.id}
                </span>
              </div>

              <div className="mt-6 pt-6 border-t border-border/50">
                <div className="flex items-start gap-3">
                  <Sparkles className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
                  <div>
                    <p className="font-medium text-foreground mb-1">Tham gia cộng đồng</p>
                    <p className="text-xs text-muted-foreground leading-relaxed">
                      Bạn đã là một phần của hệ thống. Hãy hoàn thiện hồ sơ để mọi người hiểu hơn về bạn nhé.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Main Settings */}
        <div className="md:col-span-8">
          <div className="glass-card p-6 sm:p-8 relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-64 h-64 bg-accent/5 rounded-full blur-3xl group-hover:bg-accent/10 transition-colors"></div>

            <div className="flex items-center justify-between mb-8 relative z-10">
              <h3 className="flex items-center gap-2 font-bold text-foreground text-xl">
                <Settings className="w-6 h-6 text-primary" />
                Cập nhật thông tin
              </h3>
            </div>

            {successMsg && (
              <div className="mb-8 p-4 rounded-xl bg-success/10 border border-success/20 flex items-center gap-3 text-success animate-fade-in shadow-sm">
                <CheckCircle2 className="w-5 h-5 shrink-0" />
                <p className="text-sm font-semibold">{successMsg}</p>
              </div>
            )}

            {errorMsg && (
              <div className="mb-8 p-4 rounded-xl bg-danger/10 border border-danger/20 flex items-center gap-3 text-danger animate-fade-in shadow-sm">
                <div className="w-5 h-5 rounded-full bg-danger text-white flex items-center justify-center font-bold text-xs shrink-0">!</div>
                <p className="text-sm font-semibold">{errorMsg}</p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6 relative z-10">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-foreground flex items-center gap-2">
                    Biệt danh
                  </label>
                  <input
                    type="text"
                    className="w-full px-4 py-3.5 bg-background border border-border rounded-xl focus:ring-2 focus:ring-primary/50 focus:border-primary outline-none transition-all shadow-sm font-medium"
                    placeholder="Nhập biệt danh của bạn"
                    value={formData.nickname}
                    onChange={(e) => setFormData({ ...formData, nickname: e.target.value })}
                    maxLength={50}
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-semibold text-foreground flex items-center gap-2">
                    Giới tính
                  </label>
                  <div className="relative">
                    <select
                      className="w-full px-4 py-3.5 bg-background border border-border rounded-xl focus:ring-2 focus:ring-primary/50 focus:border-primary outline-none transition-all appearance-none shadow-sm font-medium cursor-pointer"
                      value={formData.gender}
                      onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                    >
                      <option value="">-- Chọn giới tính --</option>
                      <option value="Nam">Nam</option>
                      <option value="Nữ">Nữ</option>
                      <option value="Khác">Khác</option>
                    </select>
                    <div className="absolute inset-y-0 right-4 flex items-center pointer-events-none text-muted-foreground">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold text-foreground flex items-center gap-2">
                  Trạng thái
                </label>
                <textarea
                  className="w-full px-4 py-4 bg-background border border-border rounded-xl focus:ring-2 focus:ring-primary/50 focus:border-primary outline-none transition-all resize-none h-32 shadow-sm font-medium leading-relaxed"
                  placeholder="Viết một chút về bản thân bạn..."
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                  maxLength={200}
                />
                <div className="text-right text-xs text-muted-foreground mt-1 font-medium">
                  {formData.status.length}/200
                </div>
              </div>

              <div className="pt-6 border-t border-border/50 flex justify-end">
                <button
                  type="submit"
                  disabled={isSaving}
                  className="btn-primary min-w-[160px] justify-center py-3.5 shadow-lg shadow-primary/20"
                >
                  {isSaving ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <>
                      <Save className="w-5 h-5" />
                      Lưu thay đổi
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
