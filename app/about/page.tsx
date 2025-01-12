'use client';
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Layers, Ruler, MapPin, Upload, Map as LucideMap } from "lucide-react";
import { cn } from "@/lib/utils";
import Map from "../about/map"; // Import the Map component

// Reusable Components
const MarkersList = ({ markers, onDelete }: { markers: mapboxgl.Marker[]; onDelete: (marker: mapboxgl.Marker) => void }) => (
  <div className="space-y-2">
    {markers.map((marker, index) => (
      <div key={index} className="flex items-center justify-between bg-muted/50 p-2 rounded-md">
        <span className="text-sm">Marker {index + 1}</span>
        <Button variant="ghost" size="sm" onClick={() => onDelete(marker)}>
          Delete
        </Button>
      </div>
    ))}
  </div>
);

const FileUploadSection = ({ onFileUpload }: { onFileUpload: (e: React.ChangeEvent<HTMLInputElement>) => void }) => (
  <div className="p-4 border-b">
    <h2 className="text-sm font-semibold mb-3 flex items-center gap-2">
      <Upload className="h-4 w-4" /> Import Data
    </h2>
    <div className="relative">
      <input
        type="file"
        accept=".geojson,.kml,.tiff"
        onChange={onFileUpload}
        multiple
        aria-label="Upload geo-spatial data files"
        className="block w-full text-sm text-muted-foreground
          file:mr-4 file:py-2 file:px-4
          file:rounded-md file:border-0
          file:text-sm file:font-semibold
          file:bg-primary file:text-primary-foreground
          hover:file:bg-primary/90"
      />
    </div>
  </div>
);

export default function MapPage() {
  const [markers, setMarkers] = useState<mapboxgl.Marker[]>([]);
  const [measurementMode, setMeasurementMode] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const handleAddMarker = (marker: mapboxgl.Marker) => {
    setMarkers((prev) => [...prev, marker]);
  };

  const deleteMarker = (markerToDelete: mapboxgl.Marker) => {
    if (confirm("Are you sure you want to delete this marker?")) {
      markerToDelete.remove();
      setMarkers((prev) => prev.filter((m) => m !== markerToDelete));
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    Array.from(files).forEach((file) => {
      if (!["application/json", "application/vnd.google-earth.kml+xml", "image/tiff"].includes(file.type)) {
        console.error(`Unsupported file type: ${file.name}`);
        return;
      }
      console.log(`File uploaded: ${file.name}`);
    });
  };

  return (
    <div className="flex flex-col md:flex-row h-screen bg-background">
      {/* Sidebar */}
      <div
        className={cn(
          "bg-card border-r transition-all duration-300 flex flex-col",
          sidebarOpen ? "w-full md:w-80" : "w-0"
        )}
      >
        <div className="p-4 border-b">
          <h1 className="text-2xl font-semibold flex items-center gap-2">
            <LucideMap className="h-6 w-6" /> Map Manager
          </h1>
        </div>

        <div className="flex-1 overflow-auto">
          {/* File Upload Section */}
          <FileUploadSection onFileUpload={handleFileUpload} />

          {/* Markers Section */}
          <div className="p-4">
            <h2 className="text-sm font-semibold mb-3 flex items-center gap-2">
              <MapPin className="h-4 w-4" /> Markers
            </h2>
            {markers.length > 0 ? (
              <MarkersList markers={markers} onDelete={deleteMarker} />
            ) : (
              <p className="text-sm text-muted-foreground">No markers added yet.</p>
            )}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Toolbar */}
        <div className="border-b bg-card p-2 flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="shrink-0"
            aria-label="Toggle Sidebar"
          >
            <Layers className="h-4 w-4" />
          </Button>

          <div className="flex items-center gap-2">
            <Button
              variant={measurementMode ? "destructive" : "secondary"}
              size="sm"
              onClick={() => setMeasurementMode(!measurementMode)}
            >
              <Ruler className="h-4 w-4 mr-2" />
              {measurementMode ? "Stop Measuring" : "Measure Distance"}
            </Button>
          </div>
        </div>

        {/* Map Component */}
        <Map onAddMarker={handleAddMarker} measurementMode={measurementMode} />
      </div>
    </div>
  );
}
