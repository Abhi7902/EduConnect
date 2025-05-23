"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { FileText, Upload } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface Resource {
  id: string;
  title: string;
  description: string | null;
  fileUrl: string;
  type: string;
  createdAt: string;
  classroom: {
    name: string;
  };
}

export default function StudentResources() {
  const [resources, setResources] = useState<Resource[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchResources();
  }, []);

  const fetchResources = async () => {
    try {
      const response = await fetch("/api/student/resources");
      if (!response.ok) throw new Error("Failed to fetch resources");
      const data = await response.json();
      setResources(data);
    } catch (error) {
      console.error(error);
      toast.error("Failed to load resources");
    } finally {
      setLoading(false);
    }
  };

  const getResourceIcon = (type: string) => {
    switch (type) {
      case "PDF":
        return <FileText className="h-8 w-8 text-red-500" />;
      case "DOCUMENT":
        return <FileText className="h-8 w-8 text-blue-500" />;
      case "PRESENTATION":
        return <Upload className="h-8 w-8 text-orange-500" />;
      case "VIDEO":
        return <Upload className="h-8 w-8 text-purple-500" />;
      case "LINK":
        return <Upload className="h-8 w-8 text-green-500" />;
      default:
        return <Upload className="h-8 w-8 text-gray-500" />;
    }
  };

  if (loading) {
    return (
      <div className="space-y-8">
        <div>
          <Skeleton className="h-8 w-64" />
          <Skeleton className="h-4 w-40 mt-2" />
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <Skeleton className="h-[200px]" />
          <Skeleton className="h-[200px]" />
          <Skeleton className="h-[200px]" />
        </div>
      </div>
    );
  }

  // Group resources by classroom
  const resourcesByClassroom = resources.reduce((acc, resource) => {
    const classroomName = resource.classroom.name;
    if (!acc[classroomName]) {
      acc[classroomName] = [];
    }
    acc[classroomName].push(resource);
    return acc;
  }, {} as Record<string, Resource[]>);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Resources</h1>
        <p className="text-muted-foreground">
          Access learning materials from your classrooms
        </p>
      </div>

      {resources.length === 0 ? (
        <div className="text-center py-12 bg-muted/40 rounded-lg">
          <Upload className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
          <h3 className="text-lg font-medium">No resources available</h3>
          <p className="text-muted-foreground mt-1">
            Your teachers haven't shared any resources yet.
          </p>
        </div>
      ) : (
        <Tabs defaultValue={Object.keys(resourcesByClassroom)[0]}>
          <TabsList className="w-full max-w-md h-auto flex-wrap">
            {Object.keys(resourcesByClassroom).map((classroomName) => (
              <TabsTrigger key={classroomName} value={classroomName} className="flex-1">
                {classroomName}
              </TabsTrigger>
            ))}
          </TabsList>

          {Object.entries(resourcesByClassroom).map(([classroomName, classroomResources]) => (
            <TabsContent key={classroomName} value={classroomName} className="mt-6">
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {classroomResources.map((resource) => (
                  <Card key={resource.id} className="overflow-hidden">
                    <div className="bg-gradient-to-r from-blue-100 to-indigo-100 dark:from-blue-950 dark:to-indigo-950 h-20 flex items-center justify-center">
                      {getResourceIcon(resource.type)}
                    </div>
                    <CardHeader className="pb-2">
                      <div className="flex justify-between items-start">
                        <div>
                          <CardTitle className="text-lg">{resource.title}</CardTitle>
                          <CardDescription>
                            Added {new Date(resource.createdAt).toLocaleDateString()}
                          </CardDescription>
                        </div>
                        <Badge variant="outline">{resource.type}</Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      {resource.description && (
                        <p className="text-sm mb-4 line-clamp-2">{resource.description}</p>
                      )}
                      <Button asChild size="sm" className="w-full">
                        <a href={resource.fileUrl} target="_blank" rel="noopener noreferrer">
                          View Resource
                        </a>
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>
          ))}
        </Tabs>
      )}
    </div>
  );
}