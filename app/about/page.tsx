import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { MapIcon, Upload, Pencil, Ruler } from "lucide-react";
import Link from "next/link";

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted">
      <div className="container mx-auto px-4 py-16">
        <div className="flex flex-col items-center justify-center text-center space-y-8">
          <div className="rounded-full bg-primary/10 p-4 dark:bg-primary/20">
            <MapIcon className="h-12 w-12 text-primary" />
          </div>
          <h1 className="text-4xl font-bold tracking-tighter sm:text-5xl">
            About Geo-Data App
          </h1>
          <p className="max-w-[800px] text-muted-foreground text-lg">
            A comprehensive platform for geospatial data management and visualization. Built with modern technologies to provide a seamless experience for mapping professionals.
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 w-full max-w-5xl">
            <FeatureCard
              icon={<Upload className="h-8 w-8" />}
              title="File Support"
              description="Upload and manage GeoJSON, KML, and TIFF files with ease"
            />
            <FeatureCard
              icon={<Pencil className="h-8 w-8" />}
              title="Drawing Tools"
              description="Create, edit, and save custom shapes on your maps"
            />
            <FeatureCard
              icon={<Ruler className="h-8 w-8" />}
              title="Measurement"
              description="Precise distance measurement in kilometers and miles"
            />
          </div>

          <div className="pt-8">
            <Link href="/auth">
              <Button size="lg">
                Get Started Now
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

function FeatureCard({ icon, title, description }: { icon: React.ReactNode; title: string; description: string }) {
  return (
    <Card className="p-6">
      <div className="flex flex-col items-center space-y-4">
        <div className="text-primary">{icon}</div>
        <h3 className="text-xl font-semibold">{title}</h3>
        <p className="text-muted-foreground text-sm">{description}</p>
      </div>
    </Card>
  );
}