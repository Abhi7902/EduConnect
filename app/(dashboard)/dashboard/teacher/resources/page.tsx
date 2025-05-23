"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { FileText, Plus, Upload } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";

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

export default function TeacherResources() {
  const router = useRouter();
  const [resources, setResources] = useState<Resource[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchResources();
  }, []);

  const fetchResources = async () => {
    try {
      const response = await fetch("/api/teacher/resources");
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

  if (loading) {
    return (
      <div className="space-y-8">
        <div className="flex items-center justify-between">
          <div>
            <Skeleton className="h-8 w-64" />
            <Skeleton className="h-4 w-40 mt-2" />
          </div>
          <Skeleton className="h-10 w-32" />
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <Skeleton className="h-[200px]" />
          <Skeleton className="h-[200px]" />
          <Skeleton className="h-[200px]" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Resources</h1>
          <p className="text-muted-foreground">
            Manage your learning materials
          </p>
        </div>
        <Button asChild>
          <a href="/dashboard/teacher/resources/create">
            <Plus className="mr-2 h-4 w-4" /> Upload Resource
          </a>
        </Button>
      </div>

      {resources.length === 0 ? (
        <div className="text-center py-12 bg-muted/40 rounded-lg">
          <Upload className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
          <h3 className="text-lg font-medium">No resources yet</h3>
          <p className="text-muted-foreground max-w-sm mx-auto mt-1">
            Upload learning materials for your students by clicking the 'Upload Resource' button.
          </p>
          <Button asChild className="mt-4">
            <a href="/dashboard/teacher/resources/create">
              <Plus className="mr-2 h-4 w-4" /> Upload First Resource
            </a>
          </Button>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {resources.map((resource) => (
            <Card key={resource.id} className="overflow-hidden">
              <div className="bg-gradient-to-r from-blue-100 to-indigo-100 dark:from-blue-950 dark:to-indigo-950 h-20 flex items-center justify-center">
                <FileText className="h-8 w-8 text-blue-500" />
              </div>
              <CardHeader className="pb-2">
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-lg">{resource.title}</CardTitle>
                    <CardDescription>
                      {resource.classroom.name} · Added {new Date(resource.createdAt).toLocaleDateString()}
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
      )}
    </div>
  );
}