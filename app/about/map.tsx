'use client';

import { useEffect, useState } from "react";
import MapboxGL from "mapbox-gl";
import MapboxDraw from "@mapbox/mapbox-gl-draw";

MapboxGL.accessToken = "pk.eyJ1Ijoic2hhc2hhbmszMzMiLCJhIjoiY201cXl5Z2ttMDRybjJrc2ZiMDg2d3Q4biJ9._rACzs_e_bFQCYc2CPsGYQ";

interface MapProps {
  onAddMarker: (marker: mapboxgl.Marker) => void;
  measurementMode: boolean;
}

export default function Map({ onAddMarker, measurementMode }: MapProps) {
  const [map, setMap] = useState<mapboxgl.Map | null>(null);
  const [draw, setDraw] = useState<MapboxDraw | null>(null);
  const [distancePopup, setDistancePopup] = useState<mapboxgl.Popup | null>(null);

  useEffect(() => {
    const initializeMap = () => {
      const mapInstance = new MapboxGL.Map({
        container: "map",
        style: "mapbox://styles/mapbox/streets-v12", // Updated to a colorful style
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
      mapInstance.addControl(new MapboxGL.NavigationControl(), "top-right");

      setMap(mapInstance);
      setDraw(drawInstance);

      mapInstance.on("click", (e) => {
        const newMarker = new MapboxGL.Marker({ draggable: true })
          .setLngLat(e.lngLat)
          .addTo(mapInstance);

        onAddMarker(newMarker);
      });
    };

    initializeMap();

    return () => {
      if (map) {
        map.remove();
      }
    };
  }, []);

  useEffect(() => {
    if (map && measurementMode) {
      let previousPoint: mapboxgl.LngLat | null = null;
      let currentPopup: mapboxgl.Popup | null = null;

      const handleMeasureDistance = (e: mapboxgl.MapMouseEvent) => {
        if (previousPoint) {
          const currentPoint = e.lngLat;

          // Calculate distance between previous and current point in meters
          const distance = previousPoint.distanceTo(currentPoint);
          const distanceText = `${distance.toFixed(2)} meters`;

          // Remove previous popup
          if (currentPopup) {
            currentPopup.remove();
          }

          // Add new popup at the current point
          currentPopup = new MapboxGL.Popup({ closeOnClick: false })
            .setLngLat(currentPoint)
            .setHTML(`<p>${distanceText}</p>`)
            .addTo(map);

          setDistancePopup(currentPopup);

          previousPoint = currentPoint;
        } else {
          previousPoint = e.lngLat;
        }
      };

      // Reset measurement when mouse leaves the map
      const resetMeasurement = () => {
        previousPoint = null;
        if (currentPopup) {
          currentPopup.remove();
          setDistancePopup(null);
        }
      };

      map.on("mousemove", handleMeasureDistance);
      map.on("mouseout", resetMeasurement);

      return () => {
        map.off("mousemove", handleMeasureDistance);
        map.off("mouseout", resetMeasurement);
      };
    }
  }, [map, measurementMode]);

  return <div id="map" className="flex-1 w-full relative"></div>;
}
