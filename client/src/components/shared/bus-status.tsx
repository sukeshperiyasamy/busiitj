import { useEffect, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { formatDistanceToNow } from "date-fns";

interface BusStatusProps {
  isActive: boolean;
  lastUpdated: Date | null;
  className?: string;
}

export function BusStatus({ isActive, lastUpdated, className = "" }: BusStatusProps) {
  const [timeAgo, setTimeAgo] = useState<string>("never");

  // Update the "time ago" text
  useEffect(() => {
    if (!lastUpdated) {
      setTimeAgo("never");
      return;
    }

    // Initial update
    setTimeAgo(formatDistanceToNow(new Date(lastUpdated), { addSuffix: true }));

    // Setup interval to update every minute
    const interval = setInterval(() => {
      setTimeAgo(formatDistanceToNow(new Date(lastUpdated), { addSuffix: true }));
    }, 60000);

    return () => clearInterval(interval);
  }, [lastUpdated]);

  return (
    <div className={`flex items-center ${className}`}>
      <div className={`w-3 h-3 rounded-full mr-2 ${isActive ? "bg-green-500" : "bg-red-500"}`} />
      <span className="text-neutral-darker">
        {isActive ? "Active" : "Inactive"} (Last updated: {timeAgo})
      </span>
    </div>
  );
}

interface BusRouteInfoProps {
  currentLocation?: string;
  destination?: string;
  estimatedArrival?: string;
  returnTime?: string;
}

export function BusRouteInfo({
  currentLocation = "Not available",
  destination = "Not available",
  estimatedArrival = "N/A",
  returnTime = "N/A",
}: BusRouteInfoProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-neutral-darker">
      <div>
        <p><strong>Current Location:</strong> {currentLocation}</p>
        <p><strong>Heading To:</strong> {destination}</p>
      </div>
      <div>
        <p><strong>Estimated Arrival:</strong> {estimatedArrival}</p>
        <p><strong>Return to Campus:</strong> {returnTime}</p>
      </div>
    </div>
  );
}
