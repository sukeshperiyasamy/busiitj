import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Schedule } from "@shared/schema";
import { Skeleton } from "@/components/ui/skeleton";
import { Calendar, Clock, MapPin, Route } from "lucide-react";

export function BusSchedule() {
  const [day, setDay] = useState<"weekday" | "sunday">("weekday");

  const { data: schedules, isLoading } = useQuery<Schedule[]>({
    queryKey: [`/api/schedules?day=${day}`],
  });

  const departureSchedules = schedules?.filter(s => !s.isArrival) || [];
  const arrivalSchedules = schedules?.filter(s => s.isArrival) || [];

  return (
    <div>
      <h2 className="text-xl font-bold text-neutral-darkest mb-6 flex items-center">
        <Calendar className="mr-2 h-5 w-5" />
        Bus Schedule
      </h2>

      <Tabs defaultValue="weekday" onValueChange={(value) => setDay(value as "weekday" | "sunday")}>
        <TabsList className="mb-6">
          <TabsTrigger value="weekday">Monday-Saturday</TabsTrigger>
          <TabsTrigger value="sunday">Sunday</TabsTrigger>
        </TabsList>

        <TabsContent value="weekday">
          <ScheduleContent 
            departureSchedules={departureSchedules} 
            arrivalSchedules={arrivalSchedules} 
            isLoading={isLoading} 
          />
        </TabsContent>

        <TabsContent value="sunday">
          <ScheduleContent 
            departureSchedules={departureSchedules} 
            arrivalSchedules={arrivalSchedules} 
            isLoading={isLoading} 
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}

interface ScheduleContentProps {
  departureSchedules: Schedule[];
  arrivalSchedules: Schedule[];
  isLoading: boolean;
}

function ScheduleContent({ departureSchedules, arrivalSchedules, isLoading }: ScheduleContentProps) {
  if (isLoading) {
    return <ScheduleLoadingSkeleton />;
  }

  return (
    <div>
      <div className="mb-8">
        <h3 className="text-lg font-medium text-neutral-darkest mb-4">Departure from Campus</h3>
        
        <div className="space-y-4">
          {departureSchedules.length === 0 ? (
            <p className="text-neutral-darker">No departures scheduled for this day.</p>
          ) : (
            departureSchedules.map((schedule) => (
              <ScheduleItem key={schedule.id} schedule={schedule} />
            ))
          )}
        </div>
      </div>
      
      <div>
        <h3 className="text-lg font-medium text-neutral-darkest mb-4">Arrival at Campus</h3>
        
        <div className="space-y-4">
          {arrivalSchedules.length === 0 ? (
            <p className="text-neutral-darker">No arrivals scheduled for this day.</p>
          ) : (
            arrivalSchedules.map((schedule) => (
              <ScheduleItem key={schedule.id} schedule={schedule} />
            ))
          )}
        </div>
      </div>
    </div>
  );
}

function ScheduleItem({ schedule }: { schedule: Schedule }) {
  return (
    <div className="bg-neutral-lighter rounded-lg p-4">
      <div className="flex flex-col md:flex-row justify-between">
        <div>
          <h4 className="font-medium text-neutral-darkest flex items-center">
            <Clock className="h-4 w-4 mr-1" />
            Bus {schedule.busId === 1 ? "B1" : "B2"} - {schedule.departureTime}
          </h4>
          <p className="text-neutral-darker flex items-center mt-1">
            <MapPin className="h-4 w-4 mr-1" />
            {schedule.startLocation} to {schedule.endLocation}
          </p>
          {schedule.route && (
            <p className="text-neutral-dark text-sm flex items-center mt-1">
              <Route className="h-4 w-4 mr-1" />
              {schedule.route}
            </p>
          )}
          <p className="text-neutral-dark text-sm mt-1">
            Arrival: {schedule.arrivalTime}
          </p>
        </div>
      </div>
    </div>
  );
}

function ScheduleLoadingSkeleton() {
  return (
    <div>
      <div className="mb-8">
        <h3 className="text-lg font-medium text-neutral-darkest mb-4">Departure from Campus</h3>
        
        <div className="space-y-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="bg-neutral-lighter rounded-lg p-4">
              <Skeleton className="h-5 w-40 mb-2" />
              <Skeleton className="h-4 w-60 mb-2" />
              <Skeleton className="h-3 w-32" />
            </div>
          ))}
        </div>
      </div>
      
      <div>
        <h3 className="text-lg font-medium text-neutral-darkest mb-4">Arrival at Campus</h3>
        
        <div className="space-y-4">
          {Array.from({ length: 2 }).map((_, i) => (
            <div key={i} className="bg-neutral-lighter rounded-lg p-4">
              <Skeleton className="h-5 w-40 mb-2" />
              <Skeleton className="h-4 w-60 mb-2" />
              <Skeleton className="h-3 w-32" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
