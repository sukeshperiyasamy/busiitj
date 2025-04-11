import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Header } from "@/components/shared/header";
import { BusMap } from "@/components/shared/map";
import { BusStatus, BusRouteInfo } from "@/components/shared/bus-status";
import { BusSchedule } from "@/components/shared/bus-schedule";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { 
  MapPin, 
  Bus, 
  CalendarDays 
} from "lucide-react";

export default function StudentDashboard() {
  const [activeTab, setActiveTab] = useState("bus1");
  
  // Get buses data
  const { data: buses, isLoading: isLoadingBuses } = useQuery({
    queryKey: ["/api/buses"],
    refetchInterval: 30000, // Refresh every 30 seconds
  });
  
  // Extract bus data
  const bus1 = buses?.find(bus => bus.busNumber === "B1");
  const bus2 = buses?.find(bus => bus.busNumber === "B2");
  
  // Parse location data
  const getBusLocation = (bus: any) => {
    if (!bus || !bus.lastLocation) return { latitude: null, longitude: null };
    try {
      const location = JSON.parse(bus.lastLocation);
      return {
        latitude: parseFloat(location.latitude),
        longitude: parseFloat(location.longitude)
      };
    } catch (error) {
      console.error("Error parsing location data:", error);
      return { latitude: null, longitude: null };
    }
  };
  
  const bus1Location = getBusLocation(bus1);
  const bus2Location = getBusLocation(bus2);
  
  return (
    <div className="flex flex-col min-h-screen bg-neutral-lighter">
      <Header title="Student Dashboard" />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Tabs 
          defaultValue="bus1" 
          value={activeTab}
          onValueChange={setActiveTab}
          className="w-full"
        >
          <div className="mb-6">
            <TabsList className="w-full">
              <TabsTrigger value="bus1" className="flex-1 flex items-center justify-center">
                <Bus className="h-4 w-4 mr-1" />
                Bus 1 Status
              </TabsTrigger>
              <TabsTrigger value="bus2" className="flex-1 flex items-center justify-center">
                <Bus className="h-4 w-4 mr-1" />
                Bus 2 Status
              </TabsTrigger>
              <TabsTrigger value="schedule" className="flex-1 flex items-center justify-center">
                <CalendarDays className="h-4 w-4 mr-1" />
                Bus Schedule
              </TabsTrigger>
            </TabsList>
          </div>
          
          <TabsContent value="bus1">
            <Card>
              <CardContent className="p-6">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
                  <h2 className="text-xl font-bold text-neutral-darkest flex items-center">
                    <Bus className="h-5 w-5 mr-2" />
                    Bus 1 Live Status
                  </h2>
                  
                  <div className="mt-4 md:mt-0">
                    <BusStatus 
                      isActive={bus1?.isActive || false} 
                      lastUpdated={bus1?.lastUpdated ? new Date(bus1.lastUpdated) : null} 
                    />
                  </div>
                </div>
                
                <BusMap 
                  latitude={bus1Location.latitude}
                  longitude={bus1Location.longitude}
                  isActive={bus1?.isActive || false}
                  busNumber="B1"
                  className="mb-6"
                />
                
                <Card className="bg-neutral-lighter">
                  <CardContent className="p-4">
                    <h3 className="font-medium text-neutral-darkest mb-2">Current Trip Details</h3>
                    <BusRouteInfo 
                      currentLocation={bus1?.isActive ? "Near Paota" : "Not available"}
                      destination={bus1?.isActive ? "AIIMS Jodhpur" : "Not in service"}
                      estimatedArrival={bus1?.isActive ? "11:00 AM" : "N/A"}
                      returnTime={bus1?.isActive ? "12:30 PM" : "N/A"}
                    />
                  </CardContent>
                </Card>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="bus2">
            <Card>
              <CardContent className="p-6">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
                  <h2 className="text-xl font-bold text-neutral-darkest flex items-center">
                    <Bus className="h-5 w-5 mr-2" />
                    Bus 2 Live Status
                  </h2>
                  
                  <div className="mt-4 md:mt-0">
                    <BusStatus 
                      isActive={bus2?.isActive || false} 
                      lastUpdated={bus2?.lastUpdated ? new Date(bus2.lastUpdated) : null} 
                    />
                  </div>
                </div>
                
                <BusMap 
                  latitude={bus2Location.latitude}
                  longitude={bus2Location.longitude}
                  isActive={bus2?.isActive || false}
                  busNumber="B2"
                  className="mb-6"
                />
                
                <Card className="bg-neutral-lighter">
                  <CardContent className="p-4">
                    <h3 className="font-medium text-neutral-darkest mb-2">Current Trip Details</h3>
                    <BusRouteInfo 
                      currentLocation={bus2?.isActive ? "Near MBM College" : "Not available"}
                      destination={bus2?.isActive ? "Campus" : "Not in service"}
                      estimatedArrival={bus2?.isActive ? "4:30 PM" : "N/A"}
                      returnTime={bus2?.isActive ? "5:30 PM" : "N/A"}
                    />
                  </CardContent>
                </Card>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="schedule">
            <Card>
              <CardContent className="p-6">
                <BusSchedule />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
