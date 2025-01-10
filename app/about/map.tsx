
import { useEffect, useState } from "react";
import MapboxGL from "mapbox-gl";
import { Button } from "@/components/ui/button";

MapboxGL.accessToken = "pk.eyJ1Ijoic2hhc2hhbmszMzMiLCJhIjoiY201cXl5Z2ttMDRybjJrc2ZiMDg2d3Q4biJ9._rACzs_e_bFQCYc2CPsGYQ";

export default function MapPage() {
  const [map, setMap] = useState<mapboxgl.Map | null>(null);
  const [datasets, setDatasets] = useState<string[]>([]);
  const [measuring, setMeasuring] = useState(false);
  const [distancePoints, setDistancePoints] = useState<number[][]>([]);
  const [totalDistance, setTotalDistance] = useState<string>("");

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

  const startMeasuring = () => {
    setMeasuring(true);
    setDistancePoints([]);
    setTotalDistance("");
  };

  const stopMeasuring = () => {
    setMeasuring(false);
    setDistancePoints([]);
    setTotalDistance("");
  };

  const calculateDistance = (points: number[][]) => {
    if (points.length < 2) return "";

    const toRadians = (deg: number) => (deg * Math.PI) / 180;
    const earthRadiusKm = 6371;

    let totalKm = 0;
    for (let i = 0; i < points.length - 1; i++) {
      const [lon1, lat1] = points[i];
      const [lon2, lat2] = points[i + 1];

      const dLat = toRadians(lat2 - lat1);
      const dLon = toRadians(lon2 - lon1);

      const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(toRadians(lat1)) *
          Math.cos(toRadians(lat2)) *
          Math.sin(dLon / 2) *
          Math.sin(dLon / 2);

      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
      totalKm += earthRadiusKm * c;
    }

    const totalMiles = totalKm * 0.621371;
    return `${totalKm.toFixed(2)} km / ${totalMiles.toFixed(2)} miles`;
  };

  useEffect(() => {
    if (map && measuring) {
      const handleClick = (e: mapboxgl.MapMouseEvent) => {
        const newPoint = [e.lngLat.lng, e.lngLat.lat];
        setDistancePoints((prev) => {
          const updatedPoints = [...prev, newPoint];
          setTotalDistance(calculateDistance(updatedPoints));
          return updatedPoints;
        });
      };

      map.on("click", handleClick);

      return () => {
        map.off("click", handleClick);
      };
    }
  }, [map, measuring]);

  useEffect(() => {
    if (map) {
      addLayerTooltip();
    }
  }, [map]);

  return (
    <div className="flex flex-col h-screen">
      {/* Toolbar */}
      <div className="p-4 bg-gray-100 flex justify-between">
        <input
          type="file"
          accept=".geojson,.kml,.tiff"
          onChange={handleFileUpload}
          multiple
        />
        <Button onClick={initializeMap}>Initialize Map</Button>
        <Button onClick={startMeasuring} disabled={measuring}>
          Start Measuring
        </Button>
        <Button onClick={stopMeasuring} disabled={!measuring}>
          Stop Measuring
        </Button>
      </div>

      {/* Map Container */}
      <div id="map" className="flex-1 w-full relative">
        {measuring && (
          <div className="absolute top-4 left-4 bg-white p-2 shadow-md rounded">
            <p>Total Distance: {totalDistance || "Click to start measuring"}</p>
          </div>
        )}
      </div>

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
