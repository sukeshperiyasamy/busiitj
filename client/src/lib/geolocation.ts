import { useState, useEffect } from "react";
import { apiRequest } from "./queryClient";
import { queryClient } from "./queryClient";
import { useToast } from "@/hooks/use-toast";

interface GeolocationState {
  position: {
    latitude: number | null;
    longitude: number | null;
  };
  error: GeolocationPositionError | null;
  isTracking: boolean;
  startTracking: () => void;
  stopTracking: () => void;
  isUpdating: boolean;
}

export function useGeolocation(): GeolocationState {
  const [position, setPosition] = useState<{
    latitude: number | null;
    longitude: number | null;
  }>({
    latitude: null,
    longitude: null,
  });
  const [error, setError] = useState<GeolocationPositionError | null>(null);
  const [isTracking, setIsTracking] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const { toast } = useToast();

  // Watch position and update server
  useEffect(() => {
    let watchId: number | null = null;

    const updatePosition = async (position: GeolocationPosition) => {
      const { latitude, longitude } = position.coords;
      
      setPosition({ latitude, longitude });
      setError(null);

      try {
        setIsUpdating(true);
        await apiRequest("POST", "/api/driver/update-location", {
          latitude: latitude.toString(),
          longitude: longitude.toString(),
        });
        
        // Invalidate relevant queries after location update
        queryClient.invalidateQueries({ queryKey: ["/api/buses"] });
      } catch (error) {
        toast({
          title: "Location update failed",
          description: "Failed to update your location",
          variant: "destructive",
        });
        console.error("Failed to update location:", error);
      } finally {
        setIsUpdating(false);
      }
    };

    const handleError = (error: GeolocationPositionError) => {
      setError(error);
      toast({
        title: "Geolocation error",
        description: getErrorMessage(error),
        variant: "destructive",
      });
    };

    // Start or stop tracking based on isTracking state
    if (isTracking && navigator.geolocation) {
      // Update bus status to active when starting tracking
      apiRequest("POST", "/api/driver/toggle-status", { isActive: true })
        .then(() => {
          queryClient.invalidateQueries({ queryKey: ["/api/buses"] });
          toast({
            title: "Trip started",
            description: "Your location is now being shared with students",
          });
        })
        .catch((error) => {
          toast({
            title: "Failed to start trip",
            description: "Could not update bus status",
            variant: "destructive",
          });
        });

      // Start watching position
      watchId = navigator.geolocation.watchPosition(
        updatePosition,
        handleError,
        {
          enableHighAccuracy: true,
          maximumAge: 0,
          timeout: 10000,
        }
      );
    } else if (watchId !== null) {
      // Update bus status to inactive when stopping tracking
      apiRequest("POST", "/api/driver/toggle-status", { isActive: false })
        .then(() => {
          queryClient.invalidateQueries({ queryKey: ["/api/buses"] });
          toast({
            title: "Trip ended",
            description: "Your location is no longer being shared",
          });
        })
        .catch((error) => {
          toast({
            title: "Failed to end trip",
            description: "Could not update bus status",
            variant: "destructive",
          });
        });

      // Stop watching position
      navigator.geolocation.clearWatch(watchId);
    }

    // Cleanup
    return () => {
      if (watchId !== null) {
        navigator.geolocation.clearWatch(watchId);
      }
    };
  }, [isTracking, toast]);

  const startTracking = () => {
    setIsTracking(true);
  };

  const stopTracking = () => {
    setIsTracking(false);
  };

  return {
    position,
    error,
    isTracking,
    startTracking,
    stopTracking,
    isUpdating,
  };
}

// Helper to get a user-friendly error message
function getErrorMessage(error: GeolocationPositionError): string {
  switch (error.code) {
    case error.PERMISSION_DENIED:
      return "Location permission denied. Please enable location services in your browser settings.";
    case error.POSITION_UNAVAILABLE:
      return "Location information is unavailable. Please try again later.";
    case error.TIMEOUT:
      return "Location request timed out. Please try again.";
    default:
      return "An unknown error occurred while getting your location.";
  }
}
