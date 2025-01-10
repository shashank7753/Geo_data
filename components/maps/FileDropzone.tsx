import { useDropzone } from "react-dropzone";
import mapboxgl from "mapbox-gl";

interface FileDropzoneProps {
  map: mapboxgl.Map | null; // Pass the Mapbox map instance as a prop
}

export default function FileDropzone({ map }: FileDropzoneProps) {
  const onDrop = (acceptedFiles: File[]) => {
    if (!map) {
      alert("Map is not initialized!");
      return;
    }

    acceptedFiles.forEach((file) => {
      const reader = new FileReader();
      reader.onload = () => {
        const data = reader.result;
        if (file.name.endsWith(".geojson") || file.name.endsWith(".kml")) {
          try {
            const parsedData = JSON.parse(data as string);
            const sourceId = `source-${file.name}`;
            const layerId = `layer-${file.name}`;

            if (map.getSource(sourceId)) {
              alert(`${file.name} is already added.`);
              return;
            }

            map.addSource(sourceId, {
              type: "geojson",
              data: parsedData,
            });
            map.addLayer({
              id: layerId,
              type: "fill", // Change to desired type: 'line', 'circle', etc.
              source: sourceId,
              paint: {
                "fill-color": "#088",
                "fill-opacity": 0.5,
              },
            });
          } catch (error) {
            alert("Invalid GeoJSON or KML format.");
          }
        } else if (file.name.endsWith(".tiff")) {
          alert("TIFF support is coming soon!");
        } else {
          alert("Unsupported file format.");
        }
      };
      reader.readAsText(file);
    });
  };

  const { getRootProps, getInputProps } = useDropzone({ onDrop });

  return (
    <div
      {...getRootProps()}
      className="p-4 border border-dashed rounded-lg text-center cursor-pointer hover:bg-gray-100"
    >
      <input {...getInputProps()} />
      <p>Drag & drop files here, or click to select files</p>
      <p className="text-sm text-gray-500">Supported formats: GeoJSON, KML, TIFF</p>
    </div>
  );
}
