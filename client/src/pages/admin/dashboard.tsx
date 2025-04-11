import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { insertUserSchema } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";
import { queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

import { Header } from "@/components/shared/header";
import { 
  Card, 
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription 
} from "@/components/ui/card";
import { 
  Form, 
  FormControl, 
  FormField, 
  FormItem, 
  FormLabel, 
  FormMessage 
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, UserPlus, Users } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

// Extended schema for creating a driver
const createDriverSchema = insertUserSchema.extend({
  password: z.string().min(6, "Password must be at least 6 characters"),
  busId: z.number().min(1, "Bus ID must be specified").max(2, "Bus ID must be 1 or 2"),
}).omit({ role: true });

type CreateDriverFormValues = z.infer<typeof createDriverSchema>;

export default function AdminDashboard() {
  const { toast } = useToast();
  const [error, setError] = useState<string | null>(null);

  // Fetch users
  const { data: users, isLoading: isLoadingUsers } = useQuery({
    queryKey: ["/api/users"],
  });

  // Create driver mutation
  const createDriverMutation = useMutation({
    mutationFn: async (data: CreateDriverFormValues) => {
      const res = await apiRequest("POST", "/api/admin/create-driver", data);
      return await res.json();
    },
    onSuccess: () => {
      toast({
        title: "Driver account created",
        description: "The driver account has been created successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/users"] });
      form.reset({
        name: "",
        email: "",
        username: "",
        password: "",
        busId: undefined,
      });
    },
    onError: (error: any) => {
      setError(error.message || "Failed to create driver account");
      toast({
        title: "Error",
        description: error.message || "Failed to create driver account",
        variant: "destructive",
      });
    },
  });

  // Form setup
  const form = useForm<CreateDriverFormValues>({
    resolver: zodResolver(createDriverSchema),
    defaultValues: {
      name: "",
      email: "",
      username: "",
      password: "",
      busId: undefined,
    }
  });

  const onSubmit = async (data: CreateDriverFormValues) => {
    setError(null);
    await createDriverMutation.mutateAsync(data);
  };

  return (
    <div className="flex flex-col min-h-screen bg-neutral-lighter">
      <Header title="Admin Panel" />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Users className="h-5 w-5 mr-2" />
              Registered Users
            </CardTitle>
            <CardDescription>
              Manage all registered users on the platform
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoadingUsers ? (
              <UsersTableSkeleton />
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-neutral-light">
                  <thead>
                    <tr>
                      <th className="px-6 py-3 bg-neutral-lighter text-left text-xs font-medium text-neutral-dark uppercase tracking-wider">Name</th>
                      <th className="px-6 py-3 bg-neutral-lighter text-left text-xs font-medium text-neutral-dark uppercase tracking-wider">Email</th>
                      <th className="px-6 py-3 bg-neutral-lighter text-left text-xs font-medium text-neutral-dark uppercase tracking-wider">Role</th>
                      <th className="px-6 py-3 bg-neutral-lighter text-left text-xs font-medium text-neutral-dark uppercase tracking-wider">Status</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-neutral-light">
                    {users && users.map((user: any) => (
                      <tr key={user.id}>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-neutral-darkest">{user.name}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-neutral-dark">{user.email}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-neutral-dark">
                            {user.role === "driver" ? `Driver (Bus ${user.busId === 1 ? "B1" : "B2"})` : user.role}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                            Active
                          </span>
                        </td>
                      </tr>
                    ))}
                    
                    {users && users.length === 0 && (
                      <tr>
                        <td colSpan={4} className="px-6 py-4 text-center text-neutral-dark">
                          No users registered yet
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <UserPlus className="h-5 w-5 mr-2" />
              Create Driver Account
            </CardTitle>
            <CardDescription>
              Create new driver accounts for Bus B1 or B2
            </CardDescription>
          </CardHeader>
          <CardContent>
            {error && (
              <div className="bg-red-50 text-red-500 p-3 rounded-md mb-6 text-sm">
                {error}
              </div>
            )}
            
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Driver Name</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="Enter driver's name" 
                          {...field} 
                          disabled={createDriverMutation.isPending}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <Input 
                          type="email" 
                          placeholder="Enter email" 
                          {...field} 
                          disabled={createDriverMutation.isPending}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="username"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Username</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="Create a username" 
                          {...field} 
                          disabled={createDriverMutation.isPending}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Password</FormLabel>
                      <FormControl>
                        <Input 
                          type="password" 
                          placeholder="Create a password" 
                          {...field} 
                          disabled={createDriverMutation.isPending}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="busId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Assign Bus</FormLabel>
                      <Select 
                        onValueChange={(value) => field.onChange(parseInt(value))} 
                        defaultValue={field.value?.toString()} 
                        disabled={createDriverMutation.isPending}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select Bus" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="1">Bus B1</SelectItem>
                          <SelectItem value="2">Bus B2</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <div className="md:col-span-2">
                  <Button 
                    type="submit" 
                    className="bg-primary hover:bg-primary-dark"
                    disabled={createDriverMutation.isPending}
                  >
                    {createDriverMutation.isPending ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Creating Account...
                      </>
                    ) : "Create Account"}
                  </Button>
                </div>
              </form>
            </Form>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}

function UsersTableSkeleton() {
  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-neutral-light">
        <thead>
          <tr>
            <th className="px-6 py-3 bg-neutral-lighter text-left text-xs font-medium text-neutral-dark uppercase tracking-wider">Name</th>
            <th className="px-6 py-3 bg-neutral-lighter text-left text-xs font-medium text-neutral-dark uppercase tracking-wider">Email</th>
            <th className="px-6 py-3 bg-neutral-lighter text-left text-xs font-medium text-neutral-dark uppercase tracking-wider">Role</th>
            <th className="px-6 py-3 bg-neutral-lighter text-left text-xs font-medium text-neutral-dark uppercase tracking-wider">Status</th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-neutral-light">
          {[1, 2, 3].map((i) => (
            <tr key={i}>
              <td className="px-6 py-4 whitespace-nowrap">
                <Skeleton className="h-5 w-32" />
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <Skeleton className="h-5 w-40" />
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <Skeleton className="h-5 w-24" />
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <Skeleton className="h-5 w-20" />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
