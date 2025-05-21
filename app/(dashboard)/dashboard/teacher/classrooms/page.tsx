"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { BookOpen, Plus, Users } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

interface Classroom {
  id: string;
  name: string;
  description: string | null;
  enrollments: { id: string }[];
}

export default function TeacherClassrooms() {
  const router = useRouter();
  const [classrooms, setClassrooms] = useState<Classroom[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchClassrooms();
  }, []);

  const fetchClassrooms = async () => {
    try {
      const response = await fetch("/api/classrooms");
      if (!response.ok) throw new Error("Failed to fetch classrooms");
      const data = await response.json();
      setClassrooms(data);
    } catch (error) {
      console.error(error);
      toast.error("Failed to load classrooms");
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
          <h1 className="text-3xl font-bold">My Classrooms</h1>
          <p className="text-muted-foreground">
            Manage your virtual classrooms
          </p>
        </div>
        <Button asChild>
          <Link href="/classroom/create">
            <Plus className="mr-2 h-4 w-4" />
            Create Classroom
          </Link>
        </Button>
      </div>

      {classrooms.length === 0 ? (
        <div className="text-center py-12 bg-muted/40 rounded-lg">
          <BookOpen className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
          <h3 className="text-lg font-medium">No classrooms yet</h3>
          <p className="text-muted-foreground max-w-sm mx-auto mt-1">
            Create your first classroom to start teaching and managing your students.
          </p>
          <Button asChild className="mt-4">
            <Link href="/classroom/create">
              <Plus className="mr-2 h-4 w-4" />
              Create First Classroom
            </Link>
          </Button>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {classrooms.map((classroom) => (
            <Card key={classroom.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <CardTitle>{classroom.name}</CardTitle>
                <CardDescription>
                  {classroom.enrollments.length} student{classroom.enrollments.length !== 1 ? "s" : ""} enrolled
                </CardDescription>
              </CardHeader>
              <CardContent>
                {classroom.description && (
                  <p className="text-sm text-muted-foreground mb-4">
                    {classroom.description}
                  </p>
                )}
                <Button asChild className="w-full">
                  <Link href={`/classroom/${classroom.id}`}>View Classroom</Link>
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}