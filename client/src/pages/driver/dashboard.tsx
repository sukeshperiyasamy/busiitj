import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/lib/auth";
import { useGeolocation } from "@/lib/geolocation";
import { Header } from "@/components/shared/header";
import { BusMap } from "@/components/shared/map";
import { BusStatus, BusRouteInfo } from "@/components/shared/bus-status";
import { BusSchedule } from "@/components/shared/bus-schedule";
import { formatDistanceToNow } from "date-fns";

import { 
  Card, 
  CardContent,
  CardHeader,
  CardTitle
} from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  MapPin, 
  Clock, 
  AlertCircle,
  Map,
  CalendarDays 
} from "lucide-react";

export default function DriverDashboard() {
  const { user } = useAuth();
  const [busNumber, setBusNumber] = useState("B1");
  
  // Get user's bus information
  useEffect(() => {
    if (user?.busId) {
      setBusNumber(user.busId === 1 ? "B1" : "B2");
    }
  }, [user]);
  
  // Geolocation tracking
  const { 
    position, 
    error: geoError, 
    isTracking, 
    startTracking, 
    stopTracking, 
    isUpdating 
  } = useGeolocation();
  
  // Get current bus status
  const { data: buses } = useQuery({
    queryKey: ["/api/buses"],
  });
  
  const currentBus = buses?.find(bus => bus.busNumber === busNumber);
  const isActive = currentBus?.isActive || false;
  
  // Format last update time
  const lastUpdateTime = currentBus?.lastUpdated 
    ? formatDistanceToNow(new Date(currentBus.lastUpdated), { addSuffix: true })
    : "never";
  
  return (
    <div className="flex flex-col min-h-screen bg-neutral-lighter">
      <Header busNumber={busNumber} />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
            <div>
              <h2 className="text-xl font-bold text-neutral-darkest mb-2 flex items-center">
                <MapPin className="mr-2 h-5 w-5" />
                Driver Dashboard
              </h2>
              <p className="text-neutral-dark">
                You are logged in as driver for <span className="font-medium text-primary">{busNumber}</span>
              </p>
            </div>
            
            <div className="mt-4 md:mt-0">
              <div className="flex items-center">
                <span className="mr-3 font-medium text-neutral-darker">Trip Status:</span>
                <div className="flex items-center space-x-2">
                  <Switch 
                    id="trip-toggle"
                    checked={isTracking}
                    onCheckedChange={(checked) => {
                      if (checked) {
                        startTracking();
                      } else {
                        stopTracking();
                      }
                    }}
                  />
                  <Label htmlFor="trip-toggle">
                    {isTracking ? "End Trip" : "Start Trip"}
                  </Label>
                </div>
              </div>
            </div>
          </div>
          
          <Tabs defaultValue="location" className="space-y-6">
            <TabsList>
              <TabsTrigger value="location" className="flex items-center">
                <Map className="h-4 w-4 mr-1" />
                Location
              </TabsTrigger>
              <TabsTrigger value="schedule" className="flex items-center">
                <CalendarDays className="h-4 w-4 mr-1" />
                Schedule
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="location" className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base flex items-center">
                      <MapPin className="h-4 w-4 mr-1" />
                      GPS Status
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center">
                      <div className={`w-3 h-3 rounded-full mr-2 ${isTracking && !geoError ? "bg-green-500" : "bg-red-500"}`} />
                      <span className="text-neutral-darker">
                        {isTracking && !geoError 
                          ? "GPS is active and sharing location" 
                          : geoError
                            ? "GPS error: Enable location services"
                            : "GPS is inactive"}
                      </span>
                    </div>
                    
                    {position.latitude && position.longitude && (
                      <div className="mt-2 text-sm text-neutral-dark">
                        Current position: {position.latitude.toFixed(6)}, {position.longitude.toFixed(6)}
                      </div>
                    )}
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base flex items-center">
                      <Clock className="h-4 w-4 mr-1" />
                      Last Update
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-neutral-darker">
                      {isUpdating ? "Updating location..." : lastUpdateTime}
                    </p>
                  </CardContent>
                </Card>
              </div>
              
              <BusMap 
                latitude={position.latitude}
                longitude={position.longitude}
                isActive={isTracking && !geoError}
                busNumber={busNumber}
                className="mb-6"
              />
              
              {isTracking && (
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base flex items-center">
                      <AlertCircle className="h-4 w-4 mr-1" />
                      Important
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-neutral-darker">
                      Your current location is being shared with students. Make sure to end your trip when you're done.
                    </p>
                  </CardContent>
                </Card>
              )}
            </TabsContent>
            
            <TabsContent value="schedule">
              <BusSchedule />
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </div>
  );
}
