'use client';

import { useEffect, useState } from "react";
import MapboxGL from "mapbox-gl";
import { Button } from "@/components/ui/button";
import MapboxDraw from "@mapbox/mapbox-gl-draw";
import { Layers, Ruler, MapPin, Upload, Map } from "lucide-react";
import { cn } from "@/lib/utils";

MapboxGL.accessToken = "pk.eyJ1Ijoic2hhc2hhbmszMzMiLCJhIjoiY201cXl5Z2ttMDRybjJrc2ZiMDg2d3Q4biJ9._rACzs_e_bFQCYc2CPsGYQ";

export default function MapPage() {
  const [map, setMap] = useState<mapboxgl.Map | null>(null);
  const [datasets, setDatasets] = useState<string[]>([]);
  const [draw, setDraw] = useState<MapboxDraw | null>(null);
  const [measurementMode, setMeasurementMode] = useState(false);
  const [markers, setMarkers] = useState<mapboxgl.Marker[]>([]);
  const [sidebarOpen, setSidebarOpen] = useState(true);

  useEffect(() => {
    return () => {
      if (map) {
        map.remove();
      }
    };
  }, [map]);

  const initializeMap = () => {
    if (!map) {
      const mapInstance = new MapboxGL.Map({
        container: "map",
        style: "mapbox://styles/mapbox/light-v11",
        center: [0, 0],
        zoom: 2,
      });

      const drawInstance = new MapboxDraw({
        displayControlsDefault: false,
        controls: {
          polygon: true,
          line_string: true,
          trash: true,
        },
      });

      mapInstance.addControl(drawInstance);
      mapInstance.addControl(new MapboxGL.NavigationControl(), 'top-right');

      setMap(mapInstance);
      setDraw(drawInstance);
    }
  };

  const addMarker = (e: mapboxgl.MapMouseEvent) => {
    const newMarker = new MapboxGL.Marker({ draggable: true })
      .setLngLat(e.lngLat)
      .addTo(map!);
    setMarkers((prev) => [...prev, newMarker]);
  };

  const deleteMarker = (markerToDelete: mapboxgl.Marker) => {
    markerToDelete.remove();
    setMarkers((prev) => prev.filter((m) => m !== markerToDelete));
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    Array.from(files).forEach((file) => {
      if (!file.name.match(/\.(geojson|kml|tiff)$/)) {
        alert(`Unsupported file format: ${file.name}`);
        return;
      }

      const reader = new FileReader();
      reader.onload = () => {
        if (file.name.endsWith(".geojson") || file.name.endsWith(".kml")) {
          const data = JSON.parse(reader.result as string);
          const layerId = `layer-${Date.now()}-${file.name}`;
          if (map) {
            if (map.getSource(layerId)) {
              alert(`Layer ${layerId} already exists!`);
              return;
            }
            map.addSource(layerId, {
              type: "geojson",
              data,
            });
            map.addLayer({
              id: layerId,
              type: "line",
              source: layerId,
              paint: {
                "line-color": "#ff0000",
                "line-width": 2,
              },
            });
            setDatasets((prev) => [...prev, layerId]);
          }
        } else if (file.name.endsWith(".tiff")) {
          // Handle TIFF rendering (assuming raster data)
          const layerId = `raster-layer-${Date.now()}`;
          if (map) {
            if (map.getSource(layerId)) {
              alert(`Layer ${layerId} already exists!`);
              return;
            }
            map.addSource(layerId, {
              type: "raster",
              url: URL.createObjectURL(file),
              tileSize: 256,
            });
            map.addLayer({
              id: layerId,
              type: "raster",
              source: layerId,
            });
            setDatasets((prev) => [...prev, layerId]);
          }
        }
      };
      reader.readAsText(file);
    });
  };

  const handleMeasureDistance = (e: mapboxgl.MapMouseEvent) => {
    if (measurementMode && map) {
      // Implement logic for measuring distance here
      // Use the coordinates of `e.lngLat` and calculate distance
    }
  };

  const toggleDataset = (layerId: string) => {
    if (map) {
      const visibility = map.getLayoutProperty(layerId, "visibility");
      map.setLayoutProperty(
        layerId,
        "visibility",
        visibility === "none" ? "visible" : "none"
      );
    }
  };

  // ... (keep all the existing handler functions)

  useEffect(() => {
    if (map) {
      map.on("click", addMarker);
      if (measurementMode) {
        map.on("mousemove", handleMeasureDistance);
      }
    }
  }, [map, measurementMode]);

  return (
    <div className="flex h-screen bg-background">
      {/* Sidebar */}
      <div
        className={cn(
          "w-80 bg-card border-r transition-all duration-300 flex flex-col",
          !sidebarOpen && "w-0 overflow-hidden"
        )}
      >
        <div className="p-4 border-b">
          <h1 className="text-2xl font-semibold flex items-center gap-2">
            <Map className="h-6 w-6" />
            GeoMapper
          </h1>
        </div>

        <div className="flex-1 overflow-auto">
          {/* File Upload Section */}
          <div className="p-4 border-b">
            <h2 className="text-sm font-semibold mb-3 flex items-center gap-2">
              <Upload className="h-4 w-4" /> Import Data
            </h2>
            <div className="relative">
              <input
                type="file"
                accept=".geojson,.kml,.tiff"
                onChange={handleFileUpload}
                multiple
                className="block w-full text-sm text-muted-foreground
                  file:mr-4 file:py-2 file:px-4
                  file:rounded-md file:border-0
                  file:text-sm file:font-semibold
                  file:bg-primary file:text-primary-foreground
                  hover:file:bg-primary/90"
              />
            </div>
          </div>

          {/* Datasets Section */}
          <div className="p-4 border-b">
            <h2 className="text-sm font-semibold mb-3 flex items-center gap-2">
              <Layers className="h-4 w-4" /> Datasets
            </h2>
            {datasets.length > 0 ? (
              <div className="space-y-2">
                {datasets.map((id) => (
                  <div key={id} className="flex items-center justify-between bg-muted/50 p-2 rounded-md">
                    <span className="text-sm truncate flex-1">{id.split('-').slice(2).join('-')}</span>
                    <Button variant="ghost" size="sm" onClick={() => toggleDataset(id)}>
                      Toggle
                    </Button>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">No datasets added yet.</p>
            )}
          </div>

          {/* Markers Section */}
          <div className="p-4">
            <h2 className="text-sm font-semibold mb-3 flex items-center gap-2">
              <MapPin className="h-4 w-4" /> Markers
            </h2>
            {markers.length > 0 ? (
              <div className="space-y-2">
                {markers.map((marker, index) => (
                  <div key={index} className="flex items-center justify-between bg-muted/50 p-2 rounded-md">
                    <span className="text-sm">Marker {index + 1}</span>
                    <Button variant="ghost" size="sm" onClick={() => deleteMarker(marker)}>
                      Delete
                    </Button>
                  </div>
                ))}
              </div>
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
          >
            <Layers className="h-4 w-4" />
          </Button>
          
          <div className="flex items-center gap-2">
            <Button
              variant={map ? "secondary" : "default"}
              size="sm"
              onClick={initializeMap}
              disabled={!!map}
            >
              {map ? "Map Initialized" : "Initialize Map"}
            </Button>
            
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

        {/* Map Container */}
        <div id="map" className="flex-1 w-full relative">
          {!map && (
            <div className="absolute inset-0 flex items-center justify-center bg-muted/10">
              <div className="text-center">
                <Map className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                <p className="text-muted-foreground">Click "Initialize Map" to begin</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}