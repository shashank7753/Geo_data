
import { useEffect, useState } from "react";
import MapboxGL from "mapbox-gl";
import { Button } from "@/components/ui/button";

MapboxGL.accessToken = "pk.eyJ1Ijoic2hhc2hhbmszMzMiLCJhIjoiY201cXl5Z2ttMDRybjJrc2ZiMDg2d3Q4biJ9._rACzs_e_bFQCYc2CPsGYQ";

export default function MapPage() {
  const [map, setMap] = useState<mapboxgl.Map | null>(null);
  const [datasets, setDatasets] = useState<string[]>([]);

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
        style: "mapbox://styles/mapbox/streets-v11",
        center: [0, 0],
        zoom: 2,
      });
      setMap(mapInstance);
    }
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
          alert("TIFF support is coming soon!");
        }
      };
      reader.readAsText(file);
    });
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

  const addLayerTooltip = () => {
    if (map) {
      map.on("mousemove", (e) => {
        const features = map.queryRenderedFeatures(e.point);
        if (features.length > 0) {
          map.getCanvas().style.cursor = "pointer";
          const feature = features[0];
          const tooltip = document.createElement("div");
          tooltip.className = "tooltip";
          tooltip.innerText = JSON.stringify(feature.properties, null, 2);
          document.body.appendChild(tooltip);
        } else {
          map.getCanvas().style.cursor = "";
          document.querySelectorAll(".tooltip").forEach((tooltip) => {
            tooltip.remove();
          });
        }
      });
    }
  };

  useEffect(() => {
    if (map) {
      addLayerTooltip();
    }
  }, [map]);

  return (
    <div className="flex flex-col h-screen">
      {/* Toolbar */}
      <div className="p-4 bg-gray-100 flex justify-between">
        <input type="file" accept=".geojson,.kml,.tiff" onChange={handleFileUpload} multiple />
        <Button onClick={initializeMap}>Initialize Map</Button>
      </div>

      {/* Map Container */}
      <div id="map" className="flex-1 w-full" />

      {/* Dataset List */}
      <div className="p-4 bg-gray-100">
        <h3 className="font-bold">Datasets</h3>
        {datasets.length > 0 ? (
          datasets.map((id) => (
            <div key={id} className="flex justify-between items-center">
              <span>{id}</span>
              <Button size="sm" onClick={() => toggleDataset(id)}>
                Toggle
              </Button>
            </div>
          ))
        ) : (
          <p>No datasets added yet.</p>
        )}
      </div>
    </div>
  );
}

