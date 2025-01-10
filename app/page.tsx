
"use client"
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { MapIcon } from "lucide-react";
import Link from "next/link";
import { Session } from "@supabase/supabase-js";

export default function Home() {
  const [loading, setLoading] = useState(true);
  
  const [session, setSession] = useState<Session | null>(null);
  const router = useRouter();

  useEffect(() => {
    const fetchSession = async () => {
      const { data } = await supabase.auth.getSession();
      if (!data?.session) {
        router.push("/auth"); // Redirect if not logged in
      } else {
        setSession(data.session);
        setLoading(false);
      }
    };

    fetchSession();
  }, [router]);

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted">
      <div className="container mx-auto px-4 py-16">
        <div className="flex flex-col items-center justify-center text-center space-y-8">
          <div className="rounded-full bg-primary/10 p-4 dark:bg-primary/20">
            <MapIcon className="h-12 w-12 text-primary" />
          </div>
          <h1 className="text-4xl font-bold tracking-tighter sm:text-5xl md:text-6xl lg:text-7xl">
            Welcome to Geo-Data App
          </h1>
          <p className="max-w-[600px] text-muted-foreground md:text-xl">
            A powerful platform for managing and visualizing geospatial data. Upload, draw, measure, and analyze with ease.
          </p>
          <div className="flex gap-4">
            <Link href="/auth">
              <Button size="lg">Get Started</Button>
            </Link>
            <Link href="/about">
              <Button variant="outline" size="lg">Learn More</Button>
            </Link>
          </div>
          <div className="grid grid-cols-1 gap-8 md:grid-cols-3 lg:gap-12">
            <FeatureCard
              title="Data Management"
              description="Upload and manage GeoJSON/KML and TIFF files with ease. Visualize your data on interactive maps."
            />
            <FeatureCard
              title="Drawing Tools"
              description="Create and edit custom shapes. Save your work and make modifications anytime."
            />
            <FeatureCard
              title="Analysis Tools"
              description="Measure distances, add markers, and analyze your geospatial data with precision."
            />
          </div>
        </div>
      </div>
    </div>
  );
}

function FeatureCard({ title, description }: { title: string; description: string }) {
  return (
    <div className="rounded-lg border bg-card p-6 text-card-foreground shadow-sm">
      <h3 className="text-lg font-semibold mb-2">{title}</h3>
      <p className="text-sm text-muted-foreground">{description}</p>
    </div>
  );
}
