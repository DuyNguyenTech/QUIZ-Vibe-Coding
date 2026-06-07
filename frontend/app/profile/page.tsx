"use client";

import { useEffect, useState } from "react";
import { useAuthStore } from "../lib/store";
import { getProfile, updateProfile } from "../lib/api";
import { User, Settings, Save, Loader2, CheckCircle2 } from "lucide-react";
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
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8 animate-fade-in">
      <div className="mb-8 flex items-center gap-4">
        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-secondary border-2 border-primary/20 shadow-lg overflow-hidden">
          <img 
            src={lobbyAvatar && lobbyAvatar.includes("dicebear") ? lobbyAvatar : `https://api.dicebear.com/7.x/bottts/svg?seed=${user.nickname || user.email}&backgroundColor=transparent`} 
            alt="Avatar" 
            className="w-full h-full object-cover"
          />
        </div>
        <div>
          <h1 className="text-3xl font-bold text-foreground">Hồ sơ cá nhân</h1>
          <p className="text-muted-foreground">{user.email}</p>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {/* Sidebar Info */}
        <div className="col-span-1 space-y-6">
          <div className="glass-card p-6">
            <h3 className="flex items-center gap-2 font-semibold text-foreground mb-4">
              <User className="w-5 h-5 text-primary" />
              Thông tin tài khoản
            </h3>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Vai trò:</span>
                <span className="font-medium text-foreground">
                  {user.role === "Admin" ? (
                    <span className="text-danger font-bold">Quản trị viên</span>
                  ) : (
                    "Học viên"
                  )}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">ID:</span>
                <span className="font-medium text-foreground">#{user.id}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Main Settings */}
        <div className="col-span-2">
          <div className="glass-card p-6">
            <h3 className="flex items-center gap-2 font-semibold text-foreground mb-6">
              <Settings className="w-5 h-5 text-primary" />
              Cập nhật thông tin
            </h3>

            {successMsg && (
              <div className="mb-6 p-4 rounded-xl bg-success/10 border border-success/20 flex items-start gap-3 text-success">
                <CheckCircle2 className="w-5 h-5 shrink-0 mt-0.5" />
                <p className="text-sm font-medium">{successMsg}</p>
              </div>
            )}
            
            {errorMsg && (
              <div className="mb-6 p-4 rounded-xl bg-danger/10 border border-danger/20 text-danger text-sm">
                {errorMsg}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block text-sm font-medium mb-2 text-foreground">Biệt danh (Nickname)</label>
                <input
                  type="text"
                  className="w-full px-4 py-3 bg-secondary border border-border rounded-xl focus:ring-2 focus:ring-primary outline-none transition-all"
                  placeholder="Nhập biệt danh của bạn"
                  value={formData.nickname}
                  onChange={(e) => setFormData({ ...formData, nickname: e.target.value })}
                  maxLength={50}
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2 text-foreground">Giới tính</label>
                <select
                  className="w-full px-4 py-3 bg-secondary border border-border rounded-xl focus:ring-2 focus:ring-primary outline-none transition-all appearance-none"
                  value={formData.gender}
                  onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                >
                  <option value="">-- Chọn giới tính --</option>
                  <option value="Nam">Nam</option>
                  <option value="Nữ">Nữ</option>
                  <option value="Khác">Khác</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2 text-foreground">Trạng thái (Bio)</label>
                <textarea
                  className="w-full px-4 py-3 bg-secondary border border-border rounded-xl focus:ring-2 focus:ring-primary outline-none transition-all resize-none h-24"
                  placeholder="Viết một chút về bản thân..."
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                  maxLength={200}
                />
              </div>

              <div className="pt-2 flex justify-end">
                <button
                  type="submit"
                  disabled={isSaving}
                  className="btn-primary min-w-[140px] justify-center"
                >
                  {isSaving ? <Loader2 className="w-5 h-5 animate-spin" /> : (
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
