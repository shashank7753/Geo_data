import { useEffect, useState } from "react";
import FileDropzone from "./FileDropzone";
import mapboxgl from "mapbox-gl";

export default function MapPage() {
  const [map, setMap] = useState<mapboxgl.Map | null>(null);

  useEffect(() => {
    const mapInstance = new mapboxgl.Map({
      container: "map",
      style: "mapbox://styles/mapbox/streets-v11",
      center: [0, 0],
      zoom: 2,
    });
    setMap(mapInstance);

    return () => mapInstance.remove();
  }, []);

  return (
    <div className="flex flex-col h-screen">
      <div className="p-4 bg-gray-100">
        <FileDropzone map={map} />
      </div>
      <div id="map" className="flex-1" />
    </div>
  );
}
