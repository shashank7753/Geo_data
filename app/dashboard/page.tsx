"use client"

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

export default function DashboardPage() {
  const router = useRouter();

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        router.push("/auth");
      }
    };

    checkAuth();
  }, [router]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted p-8">
      <h1 className="text-4xl font-bold mb-8">Dashboard</h1>
      <p className="text-muted-foreground">Welcome to your dashboard! More features coming soon.</p>
    </div>
  );
}