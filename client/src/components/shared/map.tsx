import { useEffect, useRef, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

interface MapProps {
  latitude?: number | null;
  longitude?: number | null;
  isActive?: boolean;
  busNumber?: string;
  className?: string;
}

export function BusMap({ latitude, longitude, isActive = true, busNumber = "B1", className = "" }: MapProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [map, setMap] = useState<google.maps.Map | null>(null);
  const [marker, setMarker] = useState<google.maps.Marker | null>(null);

  // Load Google Maps script
  useEffect(() => {
    // Only load the map if we don't already have it loaded
    if (!window.google && !document.getElementById("google-maps-script")) {
      const script = document.createElement("script");
      script.id = "google-maps-script";
      // Use the API key directly from server-side environment
      // This will be replaced with proper API key on the server side during render
      fetch('/api/config/maps-key')
        .then(response => response.json())
        .then(data => {
          script.src = `https://maps.googleapis.com/maps/api/js?key=${data.key}&callback=initMap`;
          script.async = true;
          script.defer = true;
          document.head.appendChild(script);
        })
        .catch(error => {
          console.error('Failed to load Google Maps API key:', error);
          // Fallback without key if fetch fails
          script.src = `https://maps.googleapis.com/maps/api/js?callback=initMap`;
          script.async = true;
          script.defer = true;
          document.head.appendChild(script);
        });
      
      // Define the callback function
      window.initMap = () => {
        setMapLoaded(true);
      };
    } else if (window.google) {
      // Google Maps is already loaded
      setMapLoaded(true);
    }
    
    return () => {
      // Clean up the global callback when the component unmounts
      window.initMap = undefined;
    };
  }, []);

  // Initialize map when loaded
  useEffect(() => {
    if (mapLoaded && mapContainerRef.current && !map) {
      // Default to IIT Jodhpur location if no coordinates are provided
      const defaultPosition = { lat: 26.2389, lng: 73.0193 };
      
      const newMap = new google.maps.Map(mapContainerRef.current, {
        center: defaultPosition,
        zoom: 14,
        disableDefaultUI: true,
        zoomControl: true,
        mapTypeControl: false,
        streetViewControl: false,
        fullscreenControl: true,
      });
      
      setMap(newMap);
      
      // Create initial marker
      const newMarker = new google.maps.Marker({
        position: defaultPosition,
        map: newMap,
        title: busNumber,
        icon: {
          url: isActive 
            ? 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(`
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#4CAF50" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-bus">
                  <path d="M8 6v6"/>
                  <path d="M15 6v6"/>
                  <path d="M2 12h19.6"/>
                  <path d="M18 18h3s.5-1.7.8-2.8c.1-.4.2-.8.2-1.2 0-.4-.1-.8-.2-1.2l-1.4-5C20.1 6.8 19.1 6 18 6H4c-1.1 0-2.1.8-2.4 1.8l-1.4 5c-.1.4-.2.8-.2 1.2 0 .4.1.8.2 1.2.3 1.1.8 2.8.8 2.8h3"/>
                  <path d="M9 18h6"/>
                  <path d="M5 18a2 2 0 1 0 4 0 2 2 0 1 0-4 0"/>
                  <path d="M15 18a2 2 0 1 0 4 0 2 2 0 1 0-4 0"/>
                </svg>
              `)
            : 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(`
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#F44336" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-bus">
                  <path d="M8 6v6"/>
                  <path d="M15 6v6"/>
                  <path d="M2 12h19.6"/>
                  <path d="M18 18h3s.5-1.7.8-2.8c.1-.4.2-.8.2-1.2 0-.4-.1-.8-.2-1.2l-1.4-5C20.1 6.8 19.1 6 18 6H4c-1.1 0-2.1.8-2.4 1.8l-1.4 5c-.1.4-.2.8-.2 1.2 0 .4.1.8.2 1.2.3 1.1.8 2.8.8 2.8h3"/>
                  <path d="M9 18h6"/>
                  <path d="M5 18a2 2 0 1 0 4 0 2 2 0 1 0-4 0"/>
                  <path d="M15 18a2 2 0 1 0 4 0 2 2 0 1 0-4 0"/>
                </svg>
              `),
          scaledSize: new google.maps.Size(40, 40),
        },
      });
      
      setMarker(newMarker);
    }
  }, [mapLoaded, mapContainerRef, map, isActive, busNumber]);

  // Update marker when coordinates change
  useEffect(() => {
    if (map && marker && latitude && longitude) {
      const position = { lat: latitude, lng: longitude };
      
      // Update marker position and icon
      marker.setPosition(position);
      marker.setIcon({
        url: isActive 
          ? 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(`
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#4CAF50" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-bus">
                <path d="M8 6v6"/>
                <path d="M15 6v6"/>
                <path d="M2 12h19.6"/>
                <path d="M18 18h3s.5-1.7.8-2.8c.1-.4.2-.8.2-1.2 0-.4-.1-.8-.2-1.2l-1.4-5C20.1 6.8 19.1 6 18 6H4c-1.1 0-2.1.8-2.4 1.8l-1.4 5c-.1.4-.2.8-.2 1.2 0 .4.1.8.2 1.2.3 1.1.8 2.8.8 2.8h3"/>
                <path d="M9 18h6"/>
                <path d="M5 18a2 2 0 1 0 4 0 2 2 0 1 0-4 0"/>
                <path d="M15 18a2 2 0 1 0 4 0 2 2 0 1 0-4 0"/>
              </svg>
            `)
          : 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(`
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#F44336" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-bus">
                <path d="M8 6v6"/>
                <path d="M15 6v6"/>
                <path d="M2 12h19.6"/>
                <path d="M18 18h3s.5-1.7.8-2.8c.1-.4.2-.8.2-1.2 0-.4-.1-.8-.2-1.2l-1.4-5C20.1 6.8 19.1 6 18 6H4c-1.1 0-2.1.8-2.4 1.8l-1.4 5c-.1.4-.2.8-.2 1.2 0 .4.1.8.2 1.2.3 1.1.8 2.8.8 2.8h3"/>
                <path d="M9 18h6"/>
                <path d="M5 18a2 2 0 1 0 4 0 2 2 0 1 0-4 0"/>
                <path d="M15 18a2 2 0 1 0 4 0 2 2 0 1 0-4 0"/>
              </svg>
            `),
        scaledSize: new google.maps.Size(40, 40),
      });
      
      // Center the map on the marker
      map.panTo(position);
    }
  }, [latitude, longitude, map, marker, isActive]);

  return (
    <Card className={className}>
      <CardContent className="p-0 overflow-hidden rounded-lg h-[400px] relative">
        {!mapLoaded && (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
            <div className="text-center">
              <Skeleton className="h-[400px] w-full" />
            </div>
          </div>
        )}
        <div ref={mapContainerRef} className="h-full w-full" />
        {!isActive && (
          <div className="absolute bottom-0 left-0 right-0 bg-red-500 bg-opacity-75 text-white text-sm p-2 text-center">
            This bus is currently inactive
          </div>
        )}
      </CardContent>
    </Card>
  );
}
