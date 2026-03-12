"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import AdminChallenges from "@/components/admin/AdminChallenges";

export default function AdminChallengesPage() {
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  const router = useRouter();

  useEffect(() => {
    const checkAdminStatus = async () => {
      try {
        const response = await fetch("/api/auth/me");
        if (response.ok) {
          const payload = await response.json();
          if (payload.success && payload.user) {
            if (payload.user.isAdmin) {
              setIsAdmin(true);
            } else {
              setIsAdmin(false);
              router.push("/"); // Redirect non-admins to home
            }
          } else {
            setIsAdmin(false);
            router.push("/login"); // Redirect unauthenticated users to login
          }
        } else {
          setIsAdmin(false);
          router.push("/login");
        }
      } catch (error) {
        console.error("Failed to check admin status:", error);
        setIsAdmin(false);
        router.push("/");
      }
    };

    checkAdminStatus();
  }, [router]);

  if (isAdmin === null) {
    return (
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "100vh",
          backgroundColor: "var(--challenge-bg)",
        }}
      >
        <div>Checking permissions...</div>
      </div>
    );
  }

  if (isAdmin === false) {
    return (
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "100vh",
          backgroundColor: "var(--challenge-bg)",
        }}
      >
        <div>Access denied. Redirecting...</div>
      </div>
    );
  }

  return <AdminChallenges />;
}
